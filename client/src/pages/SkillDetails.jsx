import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const SkillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        const fetchSkill = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/skills/offers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSkill(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching skill details:", error);
                setMessage(error.response?.data?.message || "Failed to load skill details.");
                setLoading(false);
            }
        };
        fetchSkill();
    }, [id]);

    const handleConfirmInterest = () => {
        setEnrolled(true);
        setMessage("Success! You've expressed active interest in this skill. The expert will be notified.");
    };

    if (loading) return <div className="flex justify-center items-center h-screen font-bold text-primary text-xl">Loading Preview...</div>;

    if (!skill && !loading) return (
        <div className="flex flex-col justify-center items-center h-screen font-bold text-red-500">
            <p className="text-2xl mb-4">{message || "Skill not found."}</p>
            <button onClick={() => navigate('/skills')} className="bg-primary text-white px-6 py-2 rounded-xl">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/skills')} className="text-text-secondary hover:text-primary font-bold mb-6 flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Skills
                </button>

                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl font-bold flex items-center justify-between shadow-sm ${enrolled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {message}
                        {enrolled && (
                             <button onClick={() => navigate('/skills')} className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 shadow-md transform hover:scale-105 transition-all">
                                Return strictly to Dashboard
                             </button>
                        )}
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-10">
                        {/* Left Column: Expert Info */}
                        <div className="md:w-1/3 flex flex-col items-centertext-center border-r border-gray-100 pr-0 md:pr-10">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg mb-6 mx-auto">
                                <img src={`/${skill.publishedBy?.avatar || 'avatars/avatar1.png'}`} alt="Expert Avatar" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-black text-text-main text-center">{skill.publishedBy?.name}</h2>
                            <p className="text-sm text-accent uppercase font-black tracking-widest text-center mb-6">{skill.publishedBy?.role}</p>
                            
                            <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Expert Details</h4>
                                <div className="space-y-3 text-sm font-medium text-text-main">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        <span className="truncate">{skill.publishedBy?.email || "Email hidden"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span>Active Mentor</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span>Verified Expert</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Skill Info */}
                        <div className="md:w-2/3 flex flex-col justify-center">
                            <h1 className="text-4xl font-black text-primary mb-6 leading-tight">{skill.title}</h1>
                            <div className="prose prose-lg text-text-secondary mb-10 max-w-none">
                                <p className="leading-relaxed">{skill.description}</p>
                            </div>
                            
                            <div className="mb-10">
                                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-4">Skills Offered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skill.skillsOffered?.map((s, idx) => (
                                        <span key={idx} className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold border border-accent/20 shadow-sm">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {!enrolled ? (
                                <button onClick={handleConfirmInterest} className="w-full md:w-auto self-start bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transform hover:-translate-y-1 transition-all flex items-center gap-3">
                                    Confirm Interest & Enroll
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            ) : (
                                <button disabled className="w-full md:w-auto self-start bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 cursor-not-allowed border border-gray-200">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Interest Confirmed
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SkillDetails;
