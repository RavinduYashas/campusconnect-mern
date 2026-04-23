import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [workshopRequests, setWorkshopRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workshops');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [experts, setExperts] = useState([]);
  const [stats, setStats] = useState({
    totalWorkshops: 0,
    pendingRequests: 0,
    totalRegistrations: 0,
    completedWorkshops: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [workshopsRes, requestsRes, expertsRes] = await Promise.all([
        axios.get('/api/workshops/admin/all', config),
        axios.get('/api/workshops/admin/requests', config),
        axios.get('/api/users/expert-count', config)
      ]);

      const workshopsData = workshopsRes.data || [];
      const requestsData = requestsRes.data || [];
      
      setWorkshops(workshopsData);
      setWorkshopRequests(requestsData);
      setExperts(expertsRes.data?.experts || []);
      
      // Calculate stats
      const totalRegistrations = workshopsData.reduce((sum, w) => sum + (w.registeredStudents?.length || 0), 0);
      const completedWorkshops = workshopsData.filter(w => w.workshopType === 'ended').length;
      
      setStats({
        totalWorkshops: workshopsData.length,
        pendingRequests: requestsData.filter(r => r.status === 'pending').length,
        totalRegistrations,
        completedWorkshops
      });
    } catch (error) {
      console.error('Error fetching workshop data:', error);
      toast.error('Failed to load workshop data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId, expertId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/workshops/admin/requests/${requestId}/approve`, 
        { assignedTo: expertId }, 
        config
      );
      
      toast.success('Workshop request approved!');
      fetchData();
      setShowAssignModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/workshops/admin/requests/${requestId}/reject`, 
        { reason }, 
        config
      );
      
      toast.success('Workshop request rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleDeleteWorkshop = async (workshopId) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/workshops/admin/${workshopId}`, config);
      toast.success('Workshop deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete workshop');
    }
  };

  const getWorkshopTypeIcon = (type) => {
    switch(type) {
      case 'upcoming': return '⏰';
      case 'ongoing': return '🔄';
      case 'ended': return '✅';
      default: return '🎓';
    }
  };

  const getWorkshopTypeColor = (type) => {
    switch(type) {
      case 'upcoming': return 'from-green-500 to-emerald-600';
      case 'ongoing': return 'from-yellow-500 to-orange-600';
      case 'ended': return 'from-gray-500 to-gray-600';
      default: return 'from-blue-500 to-indigo-600';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                  <p className="text-white/80 font-medium">Admin Control</p>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Workshops Management</h1>
                <p className="text-white/80 max-w-2xl">
                  Manage workshops, review requests from students, and track participation across all workshops
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <div className="text-2xl font-bold">{stats.totalWorkshops}</div>
                  <div className="text-xs text-white/80">Total Workshops</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                  <div className="text-xs text-white/80">Pending Requests</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                  <div className="text-xs text-white/80">Registrations</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs with Animation */}
        <div className="flex gap-3 mb-8 border-b border-gray-200 pb-0">
          <button
            onClick={() => setActiveTab('workshops')}
            className={`relative px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
              activeTab === 'workshops'
                ? 'text-primary bg-white shadow-sm'
                : 'text-text-secondary hover:text-primary hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
              All Workshops
            </span>
            {activeTab === 'workshops' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`relative px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
              activeTab === 'requests'
                ? 'text-primary bg-white shadow-sm'
                : 'text-text-secondary hover:text-primary hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Requests
              {stats.pendingRequests > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingRequests}</span>
              )}
            </span>
            {activeTab === 'requests' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Workshops Grid */}
        <AnimatePresence mode="wait">
          {activeTab === 'workshops' ? (
            <motion.div
              key="workshops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {workshops.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="text-7xl mb-4">🎓</div>
                  <h3 className="text-xl font-semibold text-text-main mb-2">No Workshops Yet</h3>
                  <p className="text-text-secondary">Workshops will appear here once created</p>
                </div>
              ) : (
                workshops.map((workshop, index) => (
                  <motion.div
                    key={workshop._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-r ${getWorkshopTypeColor(workshop.workshopType)} h-1`} />
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              workshop.workshopType === 'upcoming' ? 'bg-green-100 text-green-700' :
                              workshop.workshopType === 'ongoing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              <span>{getWorkshopTypeIcon(workshop.workshopType)}</span>
                              <span>{workshop.workshopType?.toUpperCase()}</span>
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                              {workshop.category}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                              {workshop.faculty}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                            {workshop.title}
                          </h3>
                          <p className="text-text-secondary text-sm mb-4 line-clamp-2">{workshop.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">📅</span>
                              <span className="text-text-secondary">{new Date(workshop.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">📍</span>
                              <span className="text-text-secondary truncate">{workshop.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">👥</span>
                              <span className="text-text-secondary">{workshop.registeredStudents?.length || 0} / {workshop.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">📚</span>
                              <span className="text-text-secondary">{workshop.academicYear}</span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-text-secondary mb-1">
                              <span>Capacity Utilization</span>
                              <span>{Math.round(((workshop.registeredStudents?.length || 0) / workshop.capacity) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.round(((workshop.registeredStudents?.length || 0) / workshop.capacity) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteWorkshop(workshop._id)}
                          className="ml-4 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {workshopRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="text-7xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-text-main mb-2">All Clear!</h3>
                  <p className="text-text-secondary">No pending workshop requests to review</p>
                </div>
              ) : (
                workshopRequests.filter(req => req.status === 'pending').map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 h-1" />
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              ⏳ PENDING REVIEW
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                              {request.category}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                              {request.faculty}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-text-main mb-2">{request.topic}</h3>
                          <p className="text-text-secondary text-sm mb-4">{request.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">👤</span>
                              <div>
                                <p className="font-semibold text-text-main">{request.requestedByName || 'Unknown'}</p>
                                <p className="text-xs text-text-secondary">{request.requestedByEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">👍</span>
                              <div>
                                <p className="font-semibold text-text-main">{request.voteCount || 0} Votes</p>
                                <p className="text-xs text-text-secondary">Community Support</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-lg">📚</span>
                              <div>
                                <p className="font-semibold text-text-main">{request.academicYear}</p>
                                <p className="text-xs text-text-secondary">Target Audience</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedWorkshop(request);
                              setShowAssignModal(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) handleRejectRequest(request._id, reason);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assign Expert Modal */}
        <AnimatePresence>
          {showAssignModal && selectedWorkshop && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
                  <h2 className="text-2xl font-bold text-white">Assign Expert</h2>
                  <p className="text-white/80 mt-1">Assign an expert to handle this workshop request</p>
                </div>
                
                <div className="p-6">
                  <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Workshop Topic</p>
                    <p className="text-text-main font-medium">{selectedWorkshop.topic}</p>
                  </div>
                  
                  <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
                    <p className="text-sm font-semibold text-text-secondary mb-2">Select an Expert:</p>
                    {experts.length === 0 ? (
                      <div className="text-center py-8 text-text-secondary">No experts available</div>
                    ) : (
                      experts.map(expert => (
                        <motion.button
                          key={expert._id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleApproveRequest(selectedWorkshop._id, expert._id)}
                          className="w-full text-left p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                          <div className="font-semibold text-text-main">{expert.name}</div>
                          <div className="text-sm text-text-secondary">{expert.email}</div>
                        </motion.button>
                      ))
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminWorkshops;