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

  useEffect(() => {
    return () => {
      if (window.messageInterval) {
        clearInterval(window.messageInterval);
      }
    };
  }, []);

  useEffect(() => {
    setGroup(null);
    setLoading(true);
    setMessages([]);
    setActiveTab('members');
    setSessionRequests([]);
    if (window.messageInterval) {
      clearInterval(window.messageInterval);
    }
    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && group && group._id === id) {
      fetchMessages();
      setupAutoRefresh();
    } else if (activeTab !== 'chat' && window.messageInterval) {
      clearInterval(window.messageInterval);
    }
  }, [activeTab, group, id]);

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
      
      const response = await axios.get(`/api/study-groups/${id}`, config);
      
      if (response.data._id !== id) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col items-center justify-center">
        <div className="text-8xl mb-4">🔍</div>
        <p className="text-text-secondary text-lg mb-4">Group not found</p>
        <button onClick={() => navigate('/groups')} className="text-primary hover:underline inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Groups
        </button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-light p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="20" cy="20" r="2" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                    <p className="text-white/80 font-medium tracking-wide">STUDY GROUP</p>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">{group.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                      group.type === 'open' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {group.type === 'open' ? '🔓 Open Group' : '🔒 Private Group'}
                    </span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold">
                      📚 {group.faculty}
                    </span>
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold">
                      📅 {group.academicYear}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                      group.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {group.isActive ? '✅ Active' : '⛔ Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {group.isOwner && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Group
                    </button>
                  )}
                  {!group.isOwner && group.userStatus === 'approved' && (
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Leave Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">📖</span> About This Group
              </h2>
              <p className="text-text-secondary leading-relaxed">{group.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-xs text-text-secondary">Total Members</p>
                <p className="text-2xl font-bold text-primary">{group.memberCount}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-xs text-text-secondary">Created On</p>
                <p className="text-sm font-semibold text-text-main">{new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="text-2xl mb-2">👑</div>
                <p className="text-xs text-text-secondary">Group Owner</p>
                <p className="text-sm font-semibold text-text-main truncate">{group.owner?.name}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="text-2xl mb-2">📚</div>
                <p className="text-xs text-text-secondary">Study Materials</p>
                <p className="text-2xl font-bold text-primary">{group.studyMaterials?.length || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Study Buddy Assistant */}
        <MainStudyBuddyWidget groupId={group._id} />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-0">
          {[
            { key: 'members', label: 'Members', icon: '👥', count: group.memberCount },
            { key: 'materials', label: 'Study Materials', icon: '📚', count: group.studyMaterials?.length || 0 },
            { key: 'sessions', label: 'Study Sessions', icon: '📅', count: group.studySessions?.length || 0 },
            { key: 'chat', label: 'Group Chat', icon: '💬', count: null }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-5 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary">Group Members</h2>
                  <div className="text-sm text-text-secondary">{group.memberCount} members total</div>
                </div>
                <div className="grid gap-3">
                  {group.owner && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img
                          src={group.owner.avatar || '/avatars/avatar1.png'}
                          alt={group.owner.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{group.owner.name}</p>
                          <p className="text-xs text-primary">👑 Group Owner</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {group.members
                    ?.filter(m => m.status === 'approved' && m.user?._id !== group.owner?._id)
                    .map((member, idx) => (
                      <motion.div
                        key={member.user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={member.user.avatar || '/avatars/avatar1.png'}
                            alt={member.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{member.user.name}</p>
                            <p className="text-xs text-text-secondary">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  
                  {group.members?.filter(m => m.status === 'approved').length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-text-secondary">No members yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Study Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-primary">Study Materials</h2>
                  {group.userStatus === 'approved' && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload PDF
                    </button>
                  )}
                </div>
                
                {group.studyMaterials && group.studyMaterials.length > 0 ? (
                  <div className="grid gap-4">
                    {group.studyMaterials.map((material, idx) => (
                      <motion.div
                        key={material._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-primary/30"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">📄</span>
                              <h3 className="font-semibold text-gray-800 text-lg">{material.title}</h3>
                            </div>
                            {material.description && (
                              <p className="text-text-secondary text-sm mb-3">{material.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                              <span>📅 Uploaded {new Date(material.uploadedAt).toLocaleDateString()}</span>
                              {material.fileSize && (
                                <span>📊 {(material.fileSize / 1024).toFixed(2)} KB</span>
                              )}
                            </div>
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                            >
                              <span>📖</span> View PDF
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                          {group.isOwner && (
                            <button
                              onClick={() => handleDeleteMaterial(material._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all ml-4"
                              title="Delete material"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="text-7xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-text-main mb-2">No Study Materials Yet</h3>
                    <p className="text-text-secondary">Be the first to share study materials with your group</p>
                    {group.userStatus === 'approved' && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Upload the first material →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Study Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-primary">Study Sessions</h2>
                  <div className="flex gap-3">
                    {group.userStatus === 'approved' && !group.isOwner && (
                      <button
                        onClick={() => setShowSessionRequestModal(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Request Session
                      </button>
                    )}
                    {group.isOwner && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Schedule Session
                      </button>
                    )}
                  </div>
                </div>

                {/* Session Requests */}
                {group.isOwner && sessionRequests.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <span>⏳</span> Pending Session Requests ({sessionRequests.length})
                    </h3>
                    <div className="grid gap-4">
                      {sessionRequests.map((request, idx) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-lg">{request.title}</h4>
                              <p className="text-sm text-text-secondary mt-1">{request.description}</p>
                              <div className="flex flex-wrap gap-4 text-xs text-text-secondary mt-3">
                                <span>👤 Requested by: {request.requestedBy?.name}</span>
                                <span>📅 Preferred: {new Date(request.preferredDate).toLocaleDateString()}</span>
                                <span>⏱️ Duration: {request.preferredDuration} min</span>
                                <span>📚 Topic: {request.topic}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveSessionRequest(request._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectSessionRequest(request._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Sessions */}
                {group.studySessions && group.studySessions.length > 0 ? (
                  <div className="grid gap-4">
                    {group.studySessions.map((session, idx) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">📅</span>
                              <h3 className="font-semibold text-gray-800 text-lg">{session.title}</h3>
                            </div>
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
                                  {session.resources.map((resource, ridx) => (
                                    <a
                                      key={ridx}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                    >
                                      <span>📎</span> Resource {ridx + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {group.isOwner && (
                            <button
                              onClick={() => handleDeleteSession(session._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all ml-4"
                              title="Delete session"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="text-7xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-text-main mb-2">No Study Sessions Yet</h3>
                    <p className="text-text-secondary">
                      {group.isOwner 
                        ? "Schedule a study session to help your group collaborate" 
                        : "Request a study session to suggest a meeting time"}
                    </p>
                    {group.userStatus === 'approved' && !group.isOwner && (
                      <button
                        onClick={() => setShowSessionRequestModal(true)}
                        className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Request a session →
                      </button>
                    )}
                    {group.isOwner && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Schedule a session →
                      </button>
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
                  <p className="text-text-secondary text-sm">Chat with your group members in real-time</p>
                </div>
                
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl"
                >
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isOwner = message.user?._id === group.owner?._id;
                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${!isOwner ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${!isOwner ? 'bg-gradient-to-r from-primary to-primary-dark text-white' : 'bg-white'} rounded-2xl p-3 shadow-sm`}>
                            <div className="flex items-center gap-2 mb-1">
                              {isOwner && (
                                <img
                                  src={message.userAvatar || '/avatars/avatar1.png'}
                                  alt={message.userName}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className={`text-xs font-semibold ${!isOwner ? 'text-white/90' : 'text-gray-600'}`}>
                                {message.userName}
                              </span>
                              <span className={`text-xs ${!isOwner ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className={`text-sm ${!isOwner ? 'text-white' : 'text-gray-800'}`}>
                              {message.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-text-secondary">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals - Upload, Session Request, Schedule, Confirmation */}
        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
                  <h2 className="text-2xl font-bold text-white">Upload Study Material</h2>
                  <p className="text-white/80 mt-1">Share PDF resources with your group</p>
                </div>
                <form onSubmit={handleFileUpload} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Title *</label>
                    <input
                      type="text"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="e.g., Lecture Notes - Week 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Description</label>
                    <textarea
                      value={materialDescription}
                      onChange={(e) => setMaterialDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="Brief description of the material..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">PDF File *</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-text-secondary mt-1">Max file size: 10MB, only PDF files</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Session Request Modal */}
        <AnimatePresence>
          {showSessionRequestModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                  <h2 className="text-2xl font-bold text-white">Request Study Session</h2>
                  <p className="text-white/80 mt-1">Suggest a study session for your group</p>
                </div>
                <form onSubmit={handleRequestSession} className="p-6 space-y-4">
                  <input type="text" value={requestForm.title} onChange={(e) => setRequestForm({...requestForm, title: e.target.value})} placeholder="Session Title *" required className="w-full px-4 py-3 rounded-xl border" />
                  <input type="text" value={requestForm.topic} onChange={(e) => setRequestForm({...requestForm, topic: e.target.value})} placeholder="Topic/Subject *" required className="w-full px-4 py-3 rounded-xl border" />
                  <textarea value={requestForm.description} onChange={(e) => setRequestForm({...requestForm, description: e.target.value})} rows={3} placeholder="Description" className="w-full px-4 py-3 rounded-xl border" />
                  <input type="datetime-local" value={requestForm.preferredDate} onChange={(e) => setRequestForm({...requestForm, preferredDate: e.target.value})} required className="w-full px-4 py-3 rounded-xl border" />
                  <input type="number" value={requestForm.preferredDuration} onChange={(e) => setRequestForm({...requestForm, preferredDuration: parseInt(e.target.value)})} min={15} max={240} step={15} placeholder="Duration (minutes)" className="w-full px-4 py-3 rounded-xl border" />
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowSessionRequestModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold">Cancel</button>
                    <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold">Submit Request</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Schedule Session Modal */}
        <AnimatePresence>
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 sticky top-0">
                  <h2 className="text-2xl font-bold text-white">Schedule Study Session</h2>
                  <p className="text-white/80 mt-1">Create a study session for your group</p>
                </div>
                <form onSubmit={handleScheduleSession} className="p-6 space-y-4">
                  <input type="text" value={sessionForm.title} onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})} placeholder="Session Title *" required className="w-full px-4 py-3 rounded-xl border" />
                  <textarea value={sessionForm.description} onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})} rows={3} placeholder="Description" className="w-full px-4 py-3 rounded-xl border" />
                  <input type="datetime-local" value={sessionForm.date} onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})} required className="w-full px-4 py-3 rounded-xl border" />
                  <input type="number" value={sessionForm.duration} onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})} min={15} max={240} step={15} placeholder="Duration (minutes)" className="w-full px-4 py-3 rounded-xl border" />
                  <input type="text" value={sessionForm.location} onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})} placeholder="Location (Google Meet, Zoom, Room 101)" className="w-full px-4 py-3 rounded-xl border" />
                  <div>
                    <label className="block text-sm font-semibold mb-2">Resources (URLs)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="url" value={resourceInput} onChange={(e) => setResourceInput(e.target.value)} placeholder="https://..." className="flex-1 px-4 py-3 rounded-xl border" />
                      <button type="button" onClick={handleAddResource} className="bg-gray-500 text-white px-4 rounded-xl hover:bg-gray-600 transition">Add</button>
                    </div>
                    {sessionForm.resources.length > 0 && (
                      <div className="space-y-1">
                        {sessionForm.resources.map((resource, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm truncate flex-1">{resource}</span>
                            <button type="button" onClick={() => handleRemoveResource(idx)} className="text-red-500 hover:text-red-700 ml-2">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold">Cancel</button>
                    <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold">Schedule Session</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Leave Confirmation Modal */}
        <AnimatePresence>
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                  <h2 className="text-2xl font-bold text-white">Leave Group</h2>
                  <p className="text-white/80 mt-1">Are you sure you want to leave?</p>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-6 text-center">
                    You are about to leave <span className="font-semibold text-text-main">"{group.name}"</span>. You can always rejoin later if it's an open group.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={handleLeaveGroup} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">Leave Group</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                  <h2 className="text-2xl font-bold text-white">Delete Group</h2>
                  <p className="text-white/80 mt-1">This action cannot be undone</p>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-6 text-center">
                    Are you sure you want to delete <span className="font-semibold text-text-main">"{group.name}"</span>? All group data, materials, and conversations will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={handleDeleteGroup} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">Delete Permanently</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyGroupDetails;