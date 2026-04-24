import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [uploading, setUploading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', platform: 'youtube' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', fileUrl: '', fileName: '' });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchWorkshop();
  }, [id]);

  const fetchWorkshop = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/workshops/${id}`, config);
      setWorkshop(response.data);
    } catch (error) {
      toast.error('Failed to load workshop');
      navigate('/workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`/api/workshops/${id}/register`, {}, config);
      toast.success(response.data.message);
      fetchWorkshop();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/workshops/${id}/cancel`, config);
      toast.success('Registration cancelled');
      fetchWorkshop();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const isLecturerOrBatchRep = () => {
    if (!user) return false;
    const isBatchRep = user.isBatchRep === true;
    const isLecturer = user.email && user.email.match(/^ept\d{3}@sliitplatform\.com$/);
    return isBatchRep || isLecturer || user.role === 'admin';
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/workshops/${id}/videos`, videoForm, config);
      toast.success('Video added successfully!');
      setShowVideoModal(false);
      setVideoForm({ title: '', description: '', videoUrl: '', platform: 'youtube' });
      fetchWorkshop();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add video');
    } finally {
      setUploading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/workshops/${id}/materials`, materialForm, config);
      toast.success('Material added successfully!');
      setShowMaterialModal(false);
      setMaterialForm({ title: '', description: '', fileUrl: '', fileName: '' });
      fetchWorkshop();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getWorkshopTypeColor = (type) => {
    switch(type) {
      case 'upcoming': return 'from-green-500 to-emerald-600';
      case 'ongoing': return 'from-yellow-500 to-orange-600';
      case 'ended': return 'from-gray-500 to-gray-600';
      default: return 'from-primary to-primary-dark';
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

  if (!workshop) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col items-center justify-center">
        <div className="text-8xl mb-4">🔍</div>
        <p className="text-text-secondary text-lg mb-4">Workshop not found</p>
        <button onClick={() => navigate('/workshops')} className="text-primary hover:underline inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workshops
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/workshops" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workshops
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Hero Header */}
          <div className={`bg-gradient-to-r ${getWorkshopTypeColor(workshop.workshopType)} p-8 md:p-10 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" patternUnits="userSpaceOnUse" width="60" height="60">
                <circle cx="30" cy="30" r="3" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur`}>
                  {workshop.workshopType === 'upcoming' ? '⏰ UPCOMING' : workshop.workshopType === 'ongoing' ? '🔄 ONGOING' : '✅ ENDED'}
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm">{workshop.category}</span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm">{workshop.faculty}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{workshop.title}</h1>
              <p className="text-white/90 text-lg max-w-2xl">{workshop.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-xs text-text-secondary">Date & Time</p>
                <p className="font-semibold text-text-main text-sm">{formatDate(workshop.date)}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="text-2xl mb-2">⏱️</div>
                <p className="text-xs text-text-secondary">Duration</p>
                <p className="font-semibold text-text-main">{workshop.duration} minutes</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="text-2xl mb-2">📍</div>
                <p className="text-xs text-text-secondary">Location</p>
                <a href={workshop.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold text-sm break-all">{workshop.location}</a>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-xs text-text-secondary">Capacity</p>
                <p className="font-semibold text-text-main">{workshop.registrationCount || 0} / {workshop.capacity}</p>
              </div>
            </div>

            {/* Registration Button */}
            {workshop.workshopType !== 'ended' && (
              <div className="mb-8">
                {workshop.isRegistered ? (
                  <button onClick={handleCancel} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    Cancel Registration
                  </button>
                ) : workshop.isOnWaitlist ? (
                  <div>
                    <button onClick={handleCancel} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg">
                      Remove from Waitlist
                    </button>
                    <p className="text-sm text-text-secondary text-center mt-3">You're on the waitlist. You'll be notified if a spot opens up.</p>
                  </div>
                ) : (
                  <button onClick={handleRegister} className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    Register for Workshop
                  </button>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              {['details', 'materials', 'videos'].map(tab => {
                if (tab === 'materials' && (!workshop.materials?.length || workshop.materials.length === 0)) return null;
                if (tab === 'videos' && (!workshop.videos?.length || workshop.videos.length === 0)) return null;
                
                const icons = { details: '📖', materials: '📚', videos: '🎥' };
                const labels = { details: 'Workshop Details', materials: `Materials (${workshop.materials?.length || 0})`, videos: `Videos (${workshop.videos?.length || 0})` };
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 pb-3 px-4 font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    <span>{icons[tab]}</span>
                    <span>{labels[tab]}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span>📖</span> About This Workshop
                    </h2>
                    <p className="text-text-secondary leading-relaxed">{workshop.description}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span>ℹ️</span> Additional Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-secondary">Created by</p>
                        <p className="font-semibold text-text-main">{workshop.createdBy?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Created on</p>
                        <p className="font-semibold text-text-main">{new Date(workshop.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Academic Year</p>
                        <p className="font-semibold text-text-main">{workshop.academicYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Workshop ID</p>
                        <p className="font-semibold text-text-main text-sm">{workshop._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'materials' && workshop.materials?.length > 0 && (
                <motion.div
                  key="materials"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {workshop.materials.map((material, idx) => (
                    <a
                      key={idx}
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        📄
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors">{material.title || material.fileName}</h3>
                        {material.description && <p className="text-sm text-text-secondary">{material.description}</p>}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </motion.div>
              )}

              {activeTab === 'videos' && workshop.videos?.length > 0 && (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {workshop.videos.map((video, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden">
                      <div className="p-5">
                        <h3 className="font-semibold text-text-main text-lg mb-2">{video.title}</h3>
                        {video.description && <p className="text-text-secondary text-sm">{video.description}</p>}
                      </div>
                      <div className="aspect-video bg-black">
                        <iframe src={getYouTubeEmbedUrl(video.videoUrl)} title={video.title} className="w-full h-full" allowFullScreen />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Content Buttons */}
            {isLecturerOrBatchRep() && workshop.workshopType !== 'ended' && (
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowVideoModal(true)} className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md">
                  + Add Video Recording
                </button>
                <button onClick={() => setShowMaterialModal(true)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md">
                  + Add Study Material
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white">Add Video Recording</h2>
                <p className="text-white/80">Share workshop recordings with participants</p>
              </div>
              <form onSubmit={handleAddVideo} className="p-6 space-y-4">
                <input type="text" value={videoForm.title} onChange={(e) => setVideoForm({...videoForm, title: e.target.value})} placeholder="Video Title *" required className="w-full px-4 py-3 rounded-xl border focus:border-purple-500 focus:outline-none" />
                <textarea value={videoForm.description} onChange={(e) => setVideoForm({...videoForm, description: e.target.value})} rows={3} placeholder="Video Description" className="w-full px-4 py-3 rounded-xl border focus:border-purple-500 focus:outline-none" />
                <input type="url" value={videoForm.videoUrl} onChange={(e) => setVideoForm({...videoForm, videoUrl: e.target.value})} placeholder="YouTube URL *" required className="w-full px-4 py-3 rounded-xl border focus:border-purple-500 focus:outline-none" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowVideoModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition disabled:opacity-50">{uploading ? 'Adding...' : 'Add Video'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Material Modal */}
      <AnimatePresence>
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white">Add Study Material</h2>
                <p className="text-white/80">Share resources and learning materials</p>
              </div>
              <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
                <input type="text" value={materialForm.title} onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})} placeholder="Material Title *" required className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:outline-none" />
                <textarea value={materialForm.description} onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})} rows={3} placeholder="Material Description" className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:outline-none" />
                <input type="url" value={materialForm.fileUrl} onChange={(e) => setMaterialForm({...materialForm, fileUrl: e.target.value})} placeholder="File URL (Google Drive, etc.) *" required className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:outline-none" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowMaterialModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50">{uploading ? 'Adding...' : 'Add Material'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkshopDetails;