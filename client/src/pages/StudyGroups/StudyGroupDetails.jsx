import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MainStudyBuddyWidget from '../../components/StudyGroups/MainStudyBuddyWidget';

const StudyGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Study Materials state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Study Sessions state
  const [showSessionRequestModal, setShowSessionRequestModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60,
    location: '',
    resources: []
  });
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    preferredDate: '',
    preferredDuration: 60,
    topic: ''
  });
  const [resourceInput, setResourceInput] = useState('');

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (window.messageInterval) {
        clearInterval(window.messageInterval);
      }
    };
  }, []);

  // Fetch data when ID changes
  useEffect(() => {
    // Reset all state when ID changes
    setGroup(null);
    setLoading(true);
    setMessages([]);
    setActiveTab('members');
    setSessionRequests([]);
    
    // Clear any existing intervals
    if (window.messageInterval) {
      clearInterval(window.messageInterval);
    }
    
    // Fetch new group details
    fetchGroupDetails();
    
  }, [id]);

  // Fetch messages when chat tab is active and group exists
  useEffect(() => {
    if (activeTab === 'chat' && group && group._id === id) {
      fetchMessages();
      setupAutoRefresh();
    } else if (activeTab !== 'chat' && window.messageInterval) {
      clearInterval(window.messageInterval);
    }
  }, [activeTab, group, id]);

  // Fetch session requests when sessions tab is active and user is owner
  useEffect(() => {
    if (activeTab === 'sessions' && group && group.isOwner && group._id === id) {
      fetchSessionRequests();
    }
  }, [activeTab, group, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupAutoRefresh = () => {
    if (window.messageInterval) clearInterval(window.messageInterval);
    window.messageInterval = setInterval(() => {
      if (activeTab === 'chat' && group && group._id === id) {
        fetchMessages(false);
      }
    }, 5000);
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log('🔍 Fetching group details for ID:', id);
      const response = await axios.get(`/api/study-groups/${id}`, config);
      console.log('✅ Group details received:', response.data.name);
      
      // Verify we got the correct group
      if (response.data._id !== id) {
        console.error('Group ID mismatch:', response.data._id, id);
        toast.error('Error loading group data');
        navigate('/groups');
        return;
      }
      
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to load group details');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (showToast = false) => {
    if (!group || group._id !== id) return;
    
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`/api/study-groups/${id}/messages`, config);
      const oldCount = messages.length;
      setMessages(response.data);
      if (showToast && response.data.length > oldCount) {
        toast.success('New messages!');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchSessionRequests = async () => {
    if (!group || group._id !== id) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/study-groups/${id}/session-requests`, config);
      setSessionRequests(response.data);
    } catch (error) {
      console.error('Error fetching session requests:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !group || group._id !== id) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `/api/study-groups/${id}/messages`,
        { text: newMessage },
        config
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !materialTitle) {
      toast.error('Please provide a title and select a file');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', materialTitle);
    formData.append('description', materialDescription);

    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      await axios.post(`/api/study-groups/${id}/materials`, formData, config);
      toast.success('Study material uploaded successfully!');
      fetchGroupDetails();
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setMaterialTitle('');
    setMaterialDescription('');
    setSelectedFile(null);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/materials/${materialId}`, config);
      toast.success('Study material deleted successfully');
      fetchGroupDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleRequestSession = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`/api/study-groups/${id}/session-requests`, requestForm, config);
      toast.success('Study session request submitted!');
      setShowSessionRequestModal(false);
      setRequestForm({
        title: '',
        description: '',
        preferredDate: '',
        preferredDuration: 60,
        topic: ''
      });
      fetchSessionRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleAddResource = () => {
    if (resourceInput.trim()) {
      setSessionForm({
        ...sessionForm,
        resources: [...sessionForm.resources, resourceInput.trim()]
      });
      setResourceInput('');
    }
  };

  const handleRemoveResource = (index) => {
    setSessionForm({
      ...sessionForm,
      resources: sessionForm.resources.filter((_, i) => i !== index)
    });
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title || !sessionForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`/api/study-groups/${id}/sessions`, sessionForm, config);
      toast.success('Study session scheduled successfully!');
      setShowScheduleModal(false);
      setSessionForm({
        title: '',
        description: '',
        date: '',
        duration: 60,
        location: '',
        resources: []
      });
      fetchGroupDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    }
  };

  const handleApproveSessionRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/study-groups/${id}/session-requests/${requestId}/approve`, {}, config);
      toast.success('Session request approved!');
      fetchSessionRequests();
      fetchGroupDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectSessionRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/session-requests/${requestId}`, config);
      toast.success('Session request rejected');
      fetchSessionRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this study session?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/sessions/${sessionId}`, config);
      toast.success('Study session deleted successfully');
      fetchGroupDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete session');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/leave`, config);
      toast.success('Left the group successfully');
      navigate('/groups');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}`, config);
      toast.success('Group deleted successfully');
      navigate('/groups');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not found state
  if (!group) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Group not found</p>
        <button onClick={() => navigate('/groups')} className="mt-4 text-primary">
          Back to Groups
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
      >
        {/* Gradient Header with Visible Badges */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{group.name}</h1>
              <div className="flex flex-wrap gap-2">
                {/* Group Type Badge - Now visible with colored background */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  group.type === 'open' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {group.type === 'open' ? '🔓 Open Group' : '🔒 Private Group'}
                </span>
                
                {/* Faculty Badge */}
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  📚 {group.faculty}
                </span>
                
                {/* Academic Year Badge */}
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  📅 {group.academicYear}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {group.isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Delete Group
                </button>
              )}
              {!group.isOwner && group.userStatus === 'approved' && (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-2">Description</h2>
            <p className="text-text-secondary">{group.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">{group.memberCount}</div>
              <div className="text-text-secondary text-sm">Total Members</div>
              {group.participantLimit && (
                <div className="text-xs text-text-secondary mt-1">
                  Limit: {group.participantLimit} members
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">
                {new Date(group.createdAt).toLocaleDateString()}
              </div>
              <div className="text-text-secondary text-sm">Created On</div>
              <div className="text-xs text-text-secondary mt-1">
                by {group.owner?.name}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Study Buddy Assistant */}
      <MainStudyBuddyWidget groupId={group._id} />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'members'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Members ({group.memberCount})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 px-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Study Materials ({group.studyMaterials?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Study Sessions ({group.studySessions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'chat'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Chat 💬
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">Group Members</h2>
              <div className="grid gap-3">
                {group.owner && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={group.owner.avatar || '/avatars/avatar1.png'}
                        alt={group.owner.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{group.owner.name}</p>
                        <p className="text-xs text-blue-600">Group Owner</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {group.members
                  ?.filter(m => m.status === 'approved' && m.user?._id !== group.owner?._id)
                  .map(member => (
                    <div key={member.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.user.avatar || '/avatars/avatar1.png'}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{member.user.name}</p>
                          <p className="text-xs text-text-secondary">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {group.members?.filter(m => m.status === 'approved').length === 0 && (
                  <p className="text-center text-text-secondary py-8">No members yet</p>
                )}
              </div>
            </div>
          )}

          {/* Study Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Study Materials</h2>
                {group.userStatus === 'approved' && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    + Upload PDF
                  </button>
                )}
              </div>
              
              {group.studyMaterials && group.studyMaterials.length > 0 ? (
                <div className="grid gap-4">
                  {group.studyMaterials.map((material) => (
                    <div key={material._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{material.title}</h3>
                          {material.description && (
                            <p className="text-text-secondary text-sm mb-3">{material.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <span>📄 PDF Document</span>
                            <span>📅 Uploaded {new Date(material.uploadedAt).toLocaleDateString()}</span>
                            {material.fileSize && (
                              <span>📊 {(material.fileSize / 1024).toFixed(2)} KB</span>
                            )}
                          </div>
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                          >
                            📖 View PDF
                          </a>
                        </div>
                        {group.isOwner && (
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="text-red-500 hover:text-red-700 transition-all ml-4"
                            title="Delete material"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-text-secondary text-lg mb-2">No study materials uploaded yet</p>
                  {group.userStatus === 'approved' && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-2 text-primary font-semibold hover:underline"
                    >
                      Upload the first study material →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Study Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Study Sessions</h2>
                {group.userStatus === 'approved' && !group.isOwner && (
                  <button
                    onClick={() => setShowSessionRequestModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    + Request Session
                  </button>
                )}
                {group.isOwner && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    + Schedule Session
                  </button>
                )}
              </div>

              {/* Session Requests (for owner) */}
              {group.isOwner && sessionRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">Pending Session Requests</h3>
                  <div className="grid gap-3">
                    {sessionRequests.map((request) => (
                      <div key={request._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{request.title}</h4>
                            <p className="text-sm text-text-secondary mt-1">{request.description}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-text-secondary mt-2">
                              <span>👤 Requested by: {request.requestedBy?.name}</span>
                              <span>📅 Preferred: {new Date(request.preferredDate).toLocaleDateString()}</span>
                              <span>⏱️ Duration: {request.preferredDuration} min</span>
                              <span>📚 Topic: {request.topic}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleApproveSessionRequest(request._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectSessionRequest(request._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Sessions */}
              {group.studySessions && group.studySessions.length > 0 ? (
                <div className="grid gap-4">
                  {group.studySessions.map((session) => (
                    <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                          <p className="text-text-secondary text-sm mb-3">{session.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                            <span>⏰ {new Date(session.date).toLocaleTimeString()}</span>
                            {session.duration && <span>⌛ {session.duration} minutes</span>}
                            {session.location && <span>📍 {session.location}</span>}
                          </div>
                          {session.resources && session.resources.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-primary mb-2">Resources:</p>
                              <div className="flex flex-wrap gap-2">
                                {session.resources.map((resource, idx) => (
                                  <a
                                    key={idx}
                                    href={resource}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    📎 Resource {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {group.isOwner && (
                          <button
                            onClick={() => handleDeleteSession(session._id)}
                            className="text-red-500 hover:text-red-700 transition-all ml-4"
                            title="Delete session"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-text-secondary text-lg mb-2">No study sessions scheduled yet</p>
                  {group.userStatus === 'approved' && (
                    <p className="text-text-secondary text-sm">
                      {group.isOwner 
                        ? "Click 'Schedule Session' to create one" 
                        : "Click 'Request Session' to suggest a study session"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-[600px] flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-primary">Group Chat</h2>
                <p className="text-text-secondary text-sm">Chat with your group members</p>
              </div>
              
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg"
              >
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex ${message.user?._id === group.owner?._id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${message.user?._id === group.owner?._id ? 'bg-white' : 'bg-primary'} rounded-lg p-3 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={message.userAvatar || '/avatars/avatar1.png'}
                            alt={message.userName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className={`text-xs font-semibold ${message.user?._id === group.owner?._id ? 'text-gray-600' : 'text-white'}`}>
                            {message.userName}
                          </span>
                          <span className={`text-xs ${message.user?._id === group.owner?._id ? 'text-gray-400' : 'text-white/80'}`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={`text-sm ${message.user?._id === group.owner?._id ? 'text-gray-800' : 'text-white'}`}>
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-text-secondary">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Upload Study Material</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Description</label>
                <textarea
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">PDF File *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-text-secondary mt-1">Max file size: 10MB, only PDF files</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Request Modal */}
      {showSessionRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Request Study Session</h3>
            <form onSubmit={handleRequestSession} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Topic/Subject *</label>
                <input
                  type="text"
                  value={requestForm.topic}
                  onChange={(e) => setRequestForm({...requestForm, topic: e.target.value})}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Description</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Preferred Date & Time *</label>
                <input
                  type="datetime-local"
                  value={requestForm.preferredDate}
                  onChange={(e) => setRequestForm({...requestForm, preferredDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Preferred Duration (minutes)</label>
                <input
                  type="number"
                  value={requestForm.preferredDuration}
                  onChange={(e) => setRequestForm({...requestForm, preferredDuration: parseInt(e.target.value)})}
                  min={15}
                  max={240}
                  step={15}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionRequestModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-primary mb-4">Schedule Study Session</h3>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Description</label>
                <textarea
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={sessionForm.duration}
                  onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                  min={15}
                  max={240}
                  step={15}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Location</label>
                <input
                  type="text"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})}
                  placeholder="e.g., Google Meet, Zoom, Room 101"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-bold mb-2">Resources (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={resourceInput}
                    onChange={(e) => setResourceInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                {sessionForm.resources.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {sessionForm.resources.map((resource, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate flex-1">{resource}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveResource(idx)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Leave Group</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to leave "{group.name}"? You can always rejoin later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">Delete Group</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{group.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetails;