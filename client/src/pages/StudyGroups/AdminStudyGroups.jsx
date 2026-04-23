import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminStudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    private: 0,
    members: 0,
    active: 0
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get('/api/study-groups/admin/all', config);
      const groupsData = res.data.groups || [];
      setGroups(groupsData);
      
      setStats({
        total: groupsData.length,
        open: groupsData.filter(g => g.type === 'open').length,
        private: groupsData.filter(g => g.type === 'private').length,
        members: groupsData.reduce((sum, g) => sum + (g.memberCount || 0), 0),
        active: groupsData.filter(g => g.isActive).length
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`/api/study-groups/${groupId}`, config);
      toast.success('Study group deleted successfully');
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleToggleActive = async (groupId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/study-groups/admin/${groupId}/toggle-status`, {}, config);
      toast.success(`Group ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update group status');
    }
  };

  const filteredGroups = filter === 'all' 
    ? groups 
    : groups.filter(g => g.type === filter);

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
          <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-light rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="20" cy="20" r="2" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                <p className="text-white/80 font-medium tracking-wide">ADMIN CONTROL</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Groups Management</h1>
              <p className="text-white/80 max-w-2xl">
                Oversee and moderate all study groups on the platform. Monitor activity, manage members, and ensure quality learning environments.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-blue-100">Total Groups</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="text-2xl font-bold">{stats.open}</div>
            <div className="text-xs text-green-100">Open Groups</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="text-2xl font-bold">{stats.private}</div>
            <div className="text-xs text-orange-100">Private Groups</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="text-2xl font-bold">{stats.members}</div>
            <div className="text-xs text-purple-100">Total Members</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-xs text-teal-100">Active Groups</div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: 'all', label: 'All Groups', icon: '📊' },
            { key: 'open', label: 'Open Groups', icon: '🔓' },
            { key: 'private', label: 'Private Groups', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === tab.key 
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md' 
                  : 'bg-white text-text-secondary hover:bg-gray-50 hover:text-primary border border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {filter === tab.key && stats[tab.key] !== undefined && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {tab.key === 'all' ? stats.total : stats[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        <AnimatePresence>
          <div className="grid gap-5">
            {filteredGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl shadow-sm"
              >
                <div className="text-7xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-text-main mb-2">No Study Groups Found</h3>
                <p className="text-text-secondary">No {filter !== 'all' ? filter : ''} groups available at the moment</p>
              </motion.div>
            ) : (
              filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className={`h-1 ${group.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`} />
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            group.type === 'open' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {group.type === 'open' ? '🔓 Open' : '🔒 Private'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            group.isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {group.isActive ? '✅ Active' : '⛔ Inactive'}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            🏛️ {group.faculty}
                          </span>
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                            📚 {group.academicYear}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-text-main mb-2">{group.name}</h3>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{group.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span>👥</span>
                            <span className="text-text-secondary">{group.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>👑</span>
                            <span className="text-text-secondary truncate">{group.owner}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>⏰</span>
                            <span className="text-text-secondary">{new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>⏳</span>
                            <span className="text-text-secondary">{group.pendingMembers || 0} pending</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(group.id, group.isActive)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                            group.isActive 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {group.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-all duration-200 flex items-center gap-1"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminStudyGroups;