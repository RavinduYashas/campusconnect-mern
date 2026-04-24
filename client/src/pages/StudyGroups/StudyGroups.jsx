import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CreateGroupModal from '../../components/StudyGroups/CreateStudyGroups';
import GroupCard from '../../components/StudyGroups/GroupCard';
import PendingRequestsModal from '../../components/StudyGroups/PendingRequest';

const StudyGroups = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('myGroups');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const Faculties = [
    'all', 'Computing', 'Engineering', 'Humanities and Sciences', 'Business', 
    'Architecture', 'Other'
  ];

  const AcademicYears = [
    'all', 'Year 1', 'Year 2', 'Year 3', 'Year 4'
  ];

  useEffect(() => {
    fetchData();
  }, [selectedFaculty, selectedType, selectedAcademicYear, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      if (!token) {
        toast.error('Please login to view study groups');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (selectedFaculty !== 'all') params.append('faculty', selectedFaculty);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedAcademicYear !== 'all') params.append('academicYear', selectedAcademicYear);
      if (searchQuery.trim() !== '') params.append('search', searchQuery);

      const [myGroupsRes, availableRes, pendingRes] = await Promise.all([
        axios.get('/api/study-groups/my-groups', config),
        axios.get(`/api/study-groups${params.toString() ? '?' + params.toString() : ''}`, config),
        axios.get('/api/study-groups/pending-requests', config)
      ]);

      setMyGroups(myGroupsRes.data);
      setAvailableGroups(availableRes.data);
      setPendingRequests(pendingRes.data);
      
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch study groups');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchInput);
  const handleKeyPress = (e) => e.key === 'Enter' && handleSearch();

  const handleFilterChange = (filterType, value) => {
    switch(filterType) {
      case 'faculty': setSelectedFaculty(value); break;
      case 'type': setSelectedType(value); break;
      case 'academicYear': setSelectedAcademicYear(value); break;
      default: break;
    }
  };

  const handleJoinGroup = async (groupId, groupType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to join groups');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/study-groups/${groupId}/request`, {}, config);
      toast.success(groupType === 'open' ? 'Successfully joined the group!' : 'Join request sent to group owner');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/study-groups/${groupId}/leave`, config);
      toast.success('Left the group successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/study-groups/${groupId}`, config);
      toast.success('Group deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const resetFilters = () => {
    setSelectedFaculty('all');
    setSelectedType('all');
    setSelectedAcademicYear('all');
    setSearchInput('');
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const hasActiveFilters = () => selectedFaculty !== 'all' || selectedType !== 'all' || selectedAcademicYear !== 'all' || searchQuery !== '';
  const getActiveFiltersCount = () => [selectedFaculty !== 'all', selectedType !== 'all', selectedAcademicYear !== 'all', searchQuery !== ''].filter(Boolean).length;

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
        {/* Hero Section */}
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
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                  <p className="text-white/80 font-medium tracking-wide">COLLABORATIVE LEARNING</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Study Groups</h1>
                <p className="text-white/80 max-w-2xl">Connect, collaborate, and learn together with peers who share your academic interests</p>
              </div>
              <div className="flex gap-3">
                {pendingRequests.length > 0 && (
                  <button
                    onClick={() => setShowRequestsModal(true)}
                    className="relative bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <span>📋</span> Pending
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-primary hover:bg-gray-100 px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>✨</span> Create Group
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{myGroups.length}</div>
            <div className="text-xs text-blue-100">My Groups</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{availableGroups.length}</div>
            <div className="text-xs text-green-100">Available Groups</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{myGroups.reduce((sum, g) => sum + g.memberCount, 0)}</div>
            <div className="text-xs text-purple-100">Total Connections</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <div className="text-xs text-orange-100">Pending Requests</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {[
            { key: 'myGroups', label: 'My Groups', icon: '👥', count: myGroups.length },
            { key: 'available', label: 'Available Groups', icon: '🔍', count: availableGroups.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-5 font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search groups by name or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-5 py-3.5 pl-14 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm group-hover:shadow-md"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { value: selectedFaculty, onChange: (e) => handleFilterChange('faculty', e.target.value), options: Faculties, label: 'Faculty' },
            { value: selectedAcademicYear, onChange: (e) => handleFilterChange('academicYear', e.target.value), options: AcademicYears, label: 'Year' },
            { value: selectedType, onChange: (e) => handleFilterChange('type', e.target.value), options: ['all', 'open', 'private'], label: 'Type' }
          ].map((filter, idx) => (
            <select
              key={idx}
              value={filter.value}
              onChange={filter.onChange}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white shadow-sm"
            >
              {filter.options.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? `📋 All ${filter.label}s` : opt === 'open' ? '🔓 Open Groups' : opt === 'private' ? '🔒 Private Groups' : opt}
                </option>
              ))}
            </select>
          ))}
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all flex items-center gap-2"
            >
              <span>🗑️</span> Clear ({getActiveFiltersCount()})
            </button>
          )}
        </div>

        {/* Groups Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(activeTab === 'myGroups' ? myGroups : availableGroups).length > 0 ? (
              (activeTab === 'myGroups' ? myGroups : availableGroups).map((group, index) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  isMember={activeTab === 'myGroups' || group.userStatus === 'approved'}
                  isOwner={group.isOwner}
                  hasPendingRequest={group.userStatus === 'pending'}
                  onJoin={() => handleJoinGroup(group._id, group.type)}
                  onLeave={() => handleLeaveGroup(group._id)}
                  onDelete={() => handleDeleteGroup(group._id)}
                  onClick={() => navigate(`/study-groups/${group._id}`)}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-7xl mb-4">{activeTab === 'myGroups' ? '📚' : '🔍'}</div>
                <h3 className="text-xl font-semibold text-text-main mb-2">
                  {activeTab === 'myGroups' ? 'No Groups Yet' : 'No Groups Found'}
                </h3>
                <p className="text-text-secondary">
                  {activeTab === 'myGroups' 
                    ? "You haven't joined any study groups yet" 
                    : hasActiveFilters() 
                      ? "Try adjusting your filters" 
                      : "No study groups available at the moment"}
                </p>
                {activeTab === 'myGroups' && (
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Browse available groups →
                  </button>
                )}
                {activeTab === 'available' && hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Clear all filters →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchData(); }} />
        <PendingRequestsModal isOpen={showRequestsModal} onClose={() => setShowRequestsModal(false)} requests={pendingRequests} onUpdate={() => { setShowRequestsModal(false); fetchData(); }} />
      </div>
    </div>
  );
};

export default StudyGroups;