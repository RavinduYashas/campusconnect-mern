import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import WorkshopCard from '../../components/Workshops/WorkshopCard';
import CreateWorkshopModal from '../../components/Workshops/CreateWorkshopModal';
import RequestWorkshopModal from '../../components/Workshops/RequestWorkshopModal';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ upcoming: 0, ongoing: 0, ended: 0 });

  const categories = ['all', 'Technical', 'Soft Skills', 'Career Development', 'Research', 'Other'];
  const workshopTypes = ['all', 'upcoming', 'ongoing', 'ended'];
  const faculties = ['all', 'Computing', 'Engineering', 'Humanities and Sciences', 'Business', 'Architecture', 'Other'];
  const academicYears = [
    'all', 'Year 1 Sem 1', 'Year 1 Sem 2', 'Year 2 Sem 1', 'Year 2 Sem 2',
    'Year 3 Sem 1', 'Year 3 Sem 2', 'Year 4 Sem 1', 'Year 4 Sem 2'
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchWorkshops();
  }, [selectedType, selectedCategory, selectedFaculty, selectedAcademicYear, searchQuery]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedFaculty !== 'all') params.append('faculty', selectedFaculty);
      if (selectedAcademicYear !== 'all') params.append('academicYear', selectedAcademicYear);
      if (searchQuery.trim() !== '') params.append('search', searchQuery);

      const response = await axios.get(`/api/workshops?${params.toString()}`, config);
      setWorkshops(response.data);
      
      // Calculate stats
      const workshopsData = response.data;
      setStats({
        upcoming: workshopsData.filter(w => w.workshopType === 'upcoming').length,
        ongoing: workshopsData.filter(w => w.workshopType === 'ongoing').length,
        ended: workshopsData.filter(w => w.workshopType === 'ended').length
      });
    } catch (error) {
      toast.error('Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`/api/workshops/${workshopId}/register`, {}, config);
      toast.success(response.data.message);
      fetchWorkshops();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancelRegistration = async (workshopId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/workshops/${workshopId}/cancel`, config);
      toast.success('Registration cancelled successfully');
      fetchWorkshops();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const canCreateWorkshop = () => {
    if (!user) return false;
    const isBatchRep = user.isBatchRep === true;
    const isLecturer = user.email && user.email.match(/^ept\d{3}@sliitplatform\.com$/);
    return isBatchRep || isLecturer || user.role === 'admin';
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
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-light rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="20" cy="20" r="2" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                  <p className="text-white/80 font-medium tracking-wide">EXPERT-LED SESSIONS</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Workshops</h1>
                <p className="text-white/80 max-w-2xl text-lg">
                  Enhance your skills with our expert-led workshops and hands-on learning experiences
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-white/20 backdrop-blur hover:bg-white/30 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request Workshop
                </button>
                {canCreateWorkshop() && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-primary hover:bg-gray-100 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Workshop
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Upcoming Workshops</p>
                <p className="text-3xl font-bold mt-1">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">⏰</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Ongoing Workshops</p>
                <p className="text-3xl font-bold mt-1">{stats.ongoing}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🔄</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Completed Workshops</p>
                <p className="text-3xl font-bold mt-1">{stats.ended}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">✅</div>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <div className="relative group">
            <input
              type="text"
              placeholder="Search workshops by title, description, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm group-hover:shadow-md"
            />
            <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white shadow-sm"
          >
            {workshopTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? '📋 All Types' : type === 'upcoming' ? '⏰ Upcoming' : type === 'ongoing' ? '🔄 Ongoing' : '✅ Ended'}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white shadow-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '📂 All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white shadow-sm"
          >
            {faculties.map(f => (
              <option key={f} value={f}>
                {f === 'all' ? '🏛️ All Faculties' : f}
              </option>
            ))}
          </select>

          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white shadow-sm"
          >
            {academicYears.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? '📚 All Years' : year}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Workshops Grid */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {workshops.length > 0 ? (
              workshops.map((workshop, index) => (
                <WorkshopCard
                  key={workshop._id}
                  workshop={workshop}
                  user={user}
                  onRegister={handleRegister}
                  onCancel={handleCancelRegistration}
                  onRefresh={fetchWorkshops}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-7xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-text-main mb-2">No Workshops Found</h3>
                <p className="text-text-secondary">Try adjusting your filters or search criteria</p>
                {canCreateWorkshop() && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Create the first workshop
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        <CreateWorkshopModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchWorkshops}
        />

        <RequestWorkshopModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchWorkshops}
        />
      </div>
    </div>
  );
};

export default Workshops;