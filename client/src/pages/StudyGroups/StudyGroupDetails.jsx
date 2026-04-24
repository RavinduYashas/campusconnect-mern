// pages/StudyGroups/StudyGroupDetails.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const StudyGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Study Materials States
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Study Sessions States
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    resources: ['']
  });
  
  // Chat States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchGroupDetails();
    if (activeTab === 'chat') {
      fetchMessages();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`/api/study-groups/${id}`, config);
      setGroup(response.data);
    } catch (error) {
      toast.error('Failed to load group details');
      console.error('Error:', error);
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/study-groups/${id}/messages`, config);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`/api/study-groups/${id}/messages`, 
        { text: newMessage }, 
        config
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newMaterial.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', newMaterial.file);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      
      const uploadRes = await axios.post('/api/upload', formData, config);
      
      const materialData = {
        title: newMaterial.title,
        description: newMaterial.description,
        fileUrl: uploadRes.data.fileUrl,
        fileName: uploadRes.data.fileName,
        fileType: uploadRes.data.fileType,
        fileSize: uploadRes.data.fileSize
      };
      
      const response = await axios.post(`/api/study-groups/${id}/materials`, materialData, config);
      
      toast.success('Study material added successfully');
      setGroup({
        ...group,
        studyMaterials: [...(group.studyMaterials || []), response.data.material]
      });
      setShowAddMaterial(false);
      setNewMaterial({ title: '', description: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/materials/${materialId}`, config);
      
      setGroup({
        ...group,
        studyMaterials: group.studyMaterials.filter(m => m._id !== materialId)
      });
      toast.success('Material deleted successfully');
    } catch (error) {
      toast.error('Failed to delete material');
      console.error('Error:', error);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    
    const sessionData = {
      title: newSession.title,
      description: newSession.description,
      date: new Date(`${newSession.date}T${newSession.time}`),
      duration: parseInt(newSession.duration),
      location: newSession.location,
      resources: newSession.resources.filter(r => r.trim() !== '')
    };

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`/api/study-groups/${id}/sessions`, sessionData, config);
      
      toast.success('Study session added successfully');
      setGroup({
        ...group,
        studySessions: [...(group.studySessions || []), response.data.session]
      });
      setShowAddSession(false);
      setNewSession({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        location: '',
        resources: ['']
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add session');
      console.error('Error:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${id}/sessions/${sessionId}`, config);
      
      setGroup({
        ...group,
        studySessions: group.studySessions.filter(s => s._id !== sessionId)
      });
      toast.success('Session deleted successfully');
    } catch (error) {
      toast.error('Failed to delete session');
      console.error('Error:', error);
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section - Fixed colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{group.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                  {group.type === 'open' ? '🔓 Open Group' : '🔒 Private Group'}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                  📚 {group.faculty}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                  📅 {group.academicYear}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {group.isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                >
                  Delete Group
                </button>
              )}
              {!group.isOwner && group.userStatus === 'approved' && (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                >
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description and Stats Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-2">Description</h2>
          <p className="text-text-secondary">{group.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 font-semibold transition-all ${
            activeTab === 'members'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Members ({group.memberCount})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 px-4 font-semibold transition-all ${
            activeTab === 'materials'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Study Materials ({group.studyMaterials?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 font-semibold transition-all ${
            activeTab === 'sessions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Study Sessions ({group.studySessions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 font-semibold transition-all ${
            activeTab === 'chat'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Group Chat ({messages.length})
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
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{group.owner.name}</p>
                        <p className="text-xs text-blue-600">Group Owner</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {group.members
                  ?.filter(m => m.status === 'approved' && m.user._id !== group.owner?._id)
                  .map(member => (
                    <div key={member.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                {group.userStatus === 'approved' || group.isOwner ? (
                  <button
                    onClick={() => setShowAddMaterial(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    + Add Material
                  </button>
                ) : null}
              </div>

              {group.studyMaterials && group.studyMaterials.length > 0 ? (
                <div className="grid gap-3">
                  {group.studyMaterials.map((material, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getFileIcon(material.fileType)}</span>
                            <h3 className="font-semibold text-gray-800">{material.title}</h3>
                          </div>
                          {material.description && (
                            <p className="text-text-secondary text-sm mb-2">{material.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                            <span>📄 {material.fileName}</span>
                            <span>📦 {formatFileSize(material.fileSize)}</span>
                            <span>👤 Uploaded by {material.uploadedBy?.name || 'Unknown'}</span>
                            <span>📅 {new Date(material.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-all"
                          >
                            Download
                          </a>
                          {(material.uploadedBy?._id === group.userId || group.isOwner) && (
                            <button
                              onClick={() => handleDeleteMaterial(material._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-text-secondary py-8">
                  No study materials yet. {group.userStatus === 'approved' || group.isOwner ? 'Be the first to add one!' : ''}
                </p>
              )}

              {/* Add Material Modal */}
              {showAddMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold text-primary mb-4">Add Study Material</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Title</label>
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          placeholder="e.g., Lecture Notes - Week 1"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Description (Optional)</label>
                        <textarea
                          value={newMaterial.description}
                          onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          placeholder="Brief description of the material..."
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">File</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                        />
                        <p className="text-xs text-text-secondary mt-1">Accepted formats: PDF, DOC, PPT, Images, Text files (Max 10MB)</p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowAddMaterial(false)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFileUpload}
                          disabled={uploading || !newMaterial.title || !newMaterial.file}
                          className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Study Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Study Sessions</h2>
                {group.userStatus === 'approved' || group.isOwner ? (
                  <button
                    onClick={() => setShowAddSession(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    + Schedule Session
                  </button>
                ) : null}
              </div>

              {/* Upcoming Sessions */}
              {group.studySessions && group.studySessions.filter(s => new Date(s.date) >= new Date()).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">Upcoming Sessions</h3>
                  <div className="grid gap-3">
                    {group.studySessions
                      .filter(s => new Date(s.date) >= new Date())
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((session, index) => (
                        <div key={index} className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                              <p className="text-text-secondary text-sm mb-3">{session.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                                <span>⏰ {new Date(session.date).toLocaleTimeString()}</span>
                                <span>⌛ {session.duration} minutes</span>
                                {session.location && <span>📍 {session.location}</span>}
                              </div>
                              {session.resources && session.resources.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-semibold text-primary mb-1">Resources:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {session.resources.map((resource, idx) => (
                                      <a
                                        key={idx}
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        🔗 Resource {idx + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {(session.createdBy?._id === group.userId || group.isOwner) && (
                              <button
                                onClick={() => handleDeleteSession(session._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Past Sessions */}
              {group.studySessions && group.studySessions.filter(s => new Date(s.date) < new Date()).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Past Sessions</h3>
                  <div className="grid gap-3">
                    {group.studySessions
                      .filter(s => new Date(s.date) < new Date())
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((session, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 opacity-75">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                              <p className="text-text-secondary text-sm mb-3">{session.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                                <span>⏰ {new Date(session.date).toLocaleTimeString()}</span>
                                <span>⌛ {session.duration} minutes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {(!group.studySessions || group.studySessions.length === 0) && (
                <p className="text-center text-text-secondary py-8">
                  No study sessions scheduled yet. {group.userStatus === 'approved' || group.isOwner ? 'Schedule one now!' : ''}
                </p>
              )}

              {/* Add Session Modal */}
              {showAddSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-8">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-primary mb-4">Schedule Study Session</h3>
                    <form onSubmit={handleAddSession} className="space-y-4">
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Title</label>
                        <input
                          type="text"
                          value={newSession.title}
                          onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          placeholder="e.g., JavaScript Study Group - Week 1"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Description</label>
                        <textarea
                          value={newSession.description}
                          onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          placeholder="What will we cover?"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-text-secondary text-sm font-bold mb-2">Date</label>
                          <input
                            type="date"
                            value={newSession.date}
                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm font-bold mb-2">Time</label>
                          <input
                            type="time"
                            value={newSession.time}
                            onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={newSession.duration}
                          onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                          required
                          min={15}
                          step={15}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Location/Meeting Link</label>
                        <input
                          type="text"
                          value={newSession.location}
                          onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                          placeholder="Zoom link, Google Meet, or physical location"
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Resources (Optional)</label>
                        {newSession.resources.map((resource, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input
                              type="url"
                              value={resource}
                              onChange={(e) => {
                                const updated = [...newSession.resources];
                                updated[idx] = e.target.value;
                                setNewSession({ ...newSession, resources: updated });
                              }}
                              placeholder="https://..."
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                            />
                            {idx === newSession.resources.length - 1 && (
                              <button
                                type="button"
                                onClick={() => setNewSession({ ...newSession, resources: [...newSession.resources, ''] })}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg"
                              >
                                +
                              </button>
                            )}
                            {idx !== newSession.resources.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = newSession.resources.filter((_, i) => i !== idx);
                                  setNewSession({ ...newSession, resources: updated });
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg"
                              >
                                -
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddSession(false)}
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
            </div>
          )}

          {/* Group Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-[600px] flex flex-col">
              <h2 className="text-xl font-bold text-primary mb-4">Group Chat</h2>
              
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg"
              >
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.user?._id === group.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.user?._id === group.userId
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {msg.user?._id !== group.userId && (
                          <p className="text-xs font-semibold text-primary mb-1">
                            {msg.userName || msg.user?.name || 'Unknown'}
                          </p>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
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
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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