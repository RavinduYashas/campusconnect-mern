import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); 
    const [isDeleting, setIsDeleting] = useState(null);
    
    // Handle both 'user' and 'userInfo' local storage formats
    const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/peer-skills');
            setSkills(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.details || err.response?.data?.message || err.message;
            setError(`Server Connection Problem: ${msg}. If you are on a mobile hotspot, please turn on a VPN.`);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        setIsDeleting(id);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };
            await axios.delete(`http://localhost:5000/api/peer-skills/${id}`, config);
            setSkills(skills.filter(s => s._id !== id));
            setIsDeleting(null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete. ' + (err.response?.data?.message || ''));
            setIsDeleting(null);
        }
    };

    const filteredSkills = skills.filter(skill => {
        if (filter === 'all') return true;
        return skill.type === filter;
    });

    if (loading) return <div className="text-center py-20 text-text-secondary italic">Loading skills...</div>;
    if (error) return <div className="text-center py-20 text-error bg-error-light/10 rounded-xl p-4">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4">
            <header className="mb-10 text-center relative">
                <h1 className="text-4xl font-bold text-primary mb-2">Peer Skill Exchange</h1>
                <p className="text-text-secondary">Empower yourself by teaching others or learning something new from your peers.</p>
                <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link to="/create-skill" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md inline-block">
                        + Post a Skill
                    </Link>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="mb-8 flex justify-center gap-2">
                {['all', 'offer', 'request'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                            filter === f 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white text-text-secondary border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        {f === 'all' ? 'All' : f === 'offer' ? 'Teaching Offers' : 'Learning Requests'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                        <div key={skill._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative group">
                            {/* Owner Actions */}
                            {user && skill.createdBy?._id === user._id && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Link 
                                        to={`/edit-skill/${skill._id}`}
                                        className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-text-secondary hover:text-primary transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(skill._id)}
                                        disabled={isDeleting === skill._id}
                                        className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-text-secondary hover:text-error transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4h.01" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    skill.type === 'offer' ? 'bg-success-light/20 text-success' : 'bg-warning-light/20 text-warning'
                                }`}>
                                    {skill.type === 'offer' ? 'Teach' : 'Learn'}
                                </span>
                                <span className="text-[10px] text-text-muted bg-bg-main px-2 py-1 rounded font-black uppercase tracking-tighter mr-8">
                                    {skill.category}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-primary">{skill.title}</h2>
                            <p className="text-text-secondary text-sm mb-6 line-clamp-3">{skill.description}</p>
                            
                            <div className="flex items-center mt-auto border-t border-gray-50 pt-4">
                                <div className="flex items-center">
                                    <img 
                                        src={skill.createdBy?.avatar || '/avatars/avatar1.png'} 
                                        alt={skill.createdBy?.name || 'User'} 
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm mr-3"
                                    />
                                    <div className="text-xs">
                                        <p className="font-bold text-text-main">{skill.createdBy?.name || skill.createdBy?.firstName || 'Anonymous'}</p>
                                        <p className="text-text-secondary">{new Date(skill.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button className="ml-auto text-primary text-sm font-bold hover:underline">
                                    Contact
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-bg-main rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-text-secondary mb-4 italic">No listings found for this category.</p>
                        <Link to="/create-skill" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors">
                            Post First Skill
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skills;
