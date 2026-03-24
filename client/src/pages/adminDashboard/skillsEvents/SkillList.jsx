import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SkillList = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/peer-skills');
            setSkills(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching skills:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill listing?')) return;
        
        setIsDeleting(id);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };
            await axios.delete(`http://localhost:5000/api/peer-skills/${id}`, config);
            setSkills(skills.filter(skill => skill._id !== id));
            setIsDeleting(null);
        } catch (error) {
            console.error('Error deleting skill:', error);
            setIsDeleting(null);
            alert('Failed to delete skill. Check permissions.');
        }
    };

    const filteredSkills = skills.filter(skill => 
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-20 text-text-secondary">Loading skill repository...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Peer Skill Exchange</h2>
                    <p className="text-sm text-text-secondary">Manage student skill offers and requests across the platform.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/skills-events/new')}
                    className="bg-[#EA580C] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#C2410C] transition-colors shadow-lg shadow-[#EA580C]/20"
                >
                    + Create New Listing
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by title, category, or student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-none rounded-xl text-sm focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-main/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Skill Listing</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Created By</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filteredSkills.length > 0 ? (
                                    filteredSkills.map((skill) => (
                                        <motion.tr 
                                            key={skill._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="hover:bg-bg-main/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-text-main text-sm">{skill.title}</div>
                                                    <div className="text-[10px] text-text-muted line-clamp-1 max-w-[200px]">{skill.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    skill.type === 'offer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {skill.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold text-text-main bg-gray-100 px-2 py-1 rounded">
                                                    {skill.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <img 
                                                        src={skill.createdBy?.avatar || '/avatars/avatar1.png'} 
                                                        alt="" 
                                                        className="w-6 h-6 rounded-full border border-gray-100"
                                                    />
                                                    <div className="text-xs font-bold text-text-main">{skill.createdBy?.name || 'Unknown'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => navigate(`/admin/skills-events/edit/${skill._id}`)}
                                                        className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(skill._id)}
                                                        disabled={isDeleting === skill._id}
                                                        className={`p-1.5 text-text-secondary hover:text-red-500 transition-colors ${isDeleting === skill._id ? 'opacity-50' : ''}`}
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4h.01" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-text-muted text-sm italic">
                                            No skill listings found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SkillList;
