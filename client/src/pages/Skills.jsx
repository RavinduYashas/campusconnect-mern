import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Skills = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'offers'
    const [requests, setRequests] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Modals state
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(null); // stores the request object to reply to
    
    // Edit state
    const [editingRequest, setEditingRequest] = useState(null);
    const [editingSkill, setEditingSkill] = useState(null);

    // Form data
    const [requestForm, setRequestForm] = useState({ title: '', description: '', skillsNeeded: '' });
    const [skillForm, setSkillForm] = useState({ title: '', description: '', skillsOffered: '' });
    const [replyForm, setReplyForm] = useState({ message: '' });

    useEffect(() => {
        fetchRequests();
        fetchSkills();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/skills/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setLoading(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/skills/offers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSkills(res.data);
        } catch (error) {
            console.error("Error fetching skills:", error);
        }
    };

    const handleCreateOrUpdateRequest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const skillsArray = requestForm.skillsNeeded.split(',').map(s => s.trim());
            
            if (editingRequest) {
                await axios.put(`/api/skills/requests/${editingRequest._id}`, {
                    ...requestForm,
                    skillsNeeded: skillsArray
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Skill request updated!");
            } else {
                await axios.post('/api/skills/requests', {
                    ...requestForm,
                    skillsNeeded: skillsArray
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Skill request created!");
            }
            
            setShowRequestModal(false);
            setEditingRequest(null);
            setRequestForm({ title: '', description: '', skillsNeeded: '' });
            fetchRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to process request");
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/skills/requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
            setMessage("Request deleted");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to delete request");
        }
    };

    const handleCreateOrUpdateSkill = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const skillsArray = skillForm.skillsOffered.split(',').map(s => s.trim());
            
            if (editingSkill) {
                await axios.put(`/api/skills/offers/${editingSkill._id}`, {
                    ...skillForm,
                    skillsOffered: skillsArray
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Skill structure updated!");
            } else {
                await axios.post('/api/skills/offers', {
                    ...skillForm,
                    skillsOffered: skillsArray
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Skill published!");
            }
            
            setShowSkillModal(false);
            setEditingSkill(null);
            setSkillForm({ title: '', description: '', skillsOffered: '' });
            fetchSkills();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to process skill");
        }
    };

    const handleDeleteSkill = async (id) => {
        if (!window.confirm("Are you sure you want to delete this skill?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/skills/offers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSkills();
            setMessage("Skill deleted");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to delete skill");
        }
    };

    const handleReplyToRequest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/skills/requests/${showReplyModal._id}/reply`, replyForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowReplyModal(null);
            setReplyForm({ message: '' });
            fetchRequests(); // To reflect updated replies (if you chose to show them)
            setMessage("Reply sent successfully via Email!");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to send reply");
        }
    };

    const openEditRequest = (req) => {
        setEditingRequest(req);
        setRequestForm({
            title: req.title,
            description: req.description,
            skillsNeeded: req.skillsNeeded.join(', ')
        });
        setShowRequestModal(true);
    };

    const openEditSkill = (skill) => {
        setEditingSkill(skill);
        setSkillForm({
            title: skill.title,
            description: skill.description,
            skillsOffered: skill.skillsOffered.join(', ')
        });
        setShowSkillModal(true);
    };

    const handleStudyClick = (skill) => {
        setMessage(`You have expressed interest in studying "${skill.title}"!`);
        setTimeout(() => setMessage(''), 3000);
        // You can expand this later to save it to the DB if needed
    };

    if (loading) return <div className="flex justify-center items-center h-screen font-bold text-primary">Loading Skill Exchange...</div>;

    const isStudent = user?.role === 'student';
    const isExpert = user?.role === 'expert';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">Peer Skill Exchange</h1>
                <p className="text-text-secondary max-w-2xl mx-auto font-medium">
                    {isStudent ? "Request skills from experts or view available experts." : "Publish your skills and help students achieve their goals."}
                </p>
                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-primary/10 text-primary rounded-xl font-bold border border-primary/20 inline-block">
                        {message}
                    </motion.div>
                )}
            </div>

            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-8 py-4 font-bold transition-colors ${activeTab === 'requests' ? 'text-primary border-b-4 border-primary' : 'text-text-secondary hover:text-text-main'}`}
                    >
                        Skill Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('offers')}
                        className={`px-8 py-4 font-bold transition-colors ${activeTab === 'offers' ? 'text-primary border-b-4 border-primary' : 'text-text-secondary hover:text-text-main'}`}
                    >
                        Expert Skills
                    </button>
                </div>

                {/* Content: Skill Requests */}
                {activeTab === 'requests' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Student Requests</h2>
                            {isStudent && (
                                <button
                                    onClick={() => { setEditingRequest(null); setRequestForm({ title: '', description: '', skillsNeeded: '' }); setShowRequestModal(true); }}
                                    className="bg-primary text-white px-6 py-2 rounded-2xl font-bold shadow-lg shadow-primary/20 transform hover:-translate-y-1 transition-all"
                                >
                                    + Create Request
                                </button>
                            )}
                        </div>

                        {requests.length === 0 ? (
                            <p className="text-center text-text-secondary py-10">No skill requests found.</p>
                        ) : (
                            <div className="grid gap-6">
                                {requests.map(req => (
                                    <div key={req._id} className="border border-gray-100 p-6 rounded-2xl bg-gray-50/50 hover:bg-white transition-all shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={`/${req.requestedBy?.avatar || 'avatars/avatar1.png'}`} alt="" className="w-10 h-10 rounded-full bg-white border border-gray-200" />
                                                <div>
                                                    <p className="font-bold text-text-main leading-tight">{req.requestedBy?.name}</p>
                                                    <p className="text-xs text-text-muted uppercase tracking-widest">{req.requestedBy?.role}</p>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-primary mb-2">{req.title}</h3>
                                            <p className="text-text-secondary mb-4">{req.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {req.skillsNeeded.map((skill, idx) => (
                                                    <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            {req.replies && req.replies.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <p className="text-sm font-bold text-text-main mb-2">Expert Replies ({req.replies.length}):</p>
                                                    {req.replies.map((reply, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 text-sm">
                                                            <div className="font-bold text-accent min-w-max">{reply.expert?.name}:</div>
                                                            <div className="text-text-secondary">{reply.message}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            {isStudent && user._id === req.requestedBy?._id && (
                                                <>
                                                    <button onClick={() => openEditRequest(req)} className="bg-gray-100 text-text-main px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Edit</button>
                                                    <button onClick={() => handleDeleteRequest(req._id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">Delete</button>
                                                </>
                                            )}
                                            {isExpert && (
                                                <button onClick={() => setShowReplyModal(req)} className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-600 shadow-md transition-colors">
                                                    Reply via Email
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Content: Expert Skills */}
                {activeTab === 'offers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Expert Skills</h2>
                            {isExpert && (
                                <button
                                    onClick={() => { setEditingSkill(null); setSkillForm({ title: '', description: '', skillsOffered: '' }); setShowSkillModal(true); }}
                                    className="bg-accent text-white px-6 py-2 rounded-2xl font-bold shadow-lg shadow-accent/20 transform hover:-translate-y-1 transition-all"
                                >
                                    + Publish Skill
                                </button>
                            )}
                        </div>

                        {skills.length === 0 ? (
                            <p className="text-center text-text-secondary py-10">No skills published yet.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {skills.map(skill => (
                                    <div key={skill._id} className="border border-gray-100 p-6 rounded-2xl bg-white hover:shadow-lg transition-all shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                                <img src={`/${skill.publishedBy?.avatar || 'avatars/avatar1.png'}`} alt="" className="w-12 h-12 rounded-full border border-gray-200" />
                                                <div>
                                                    <p className="font-bold text-text-main text-lg leading-tight">{skill.publishedBy?.name}</p>
                                                    <p className="text-xs text-accent uppercase font-black tracking-widest">{skill.publishedBy?.role}</p>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-primary mb-2">{skill.title}</h3>
                                            <p className="text-text-secondary mb-4 min-h-[60px]">{skill.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {skill.skillsOffered.map((s, idx) => (
                                                    <span key={idx} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {isExpert && user._id === skill.publishedBy?._id && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <button onClick={() => openEditSkill(skill)} className="flex-1 bg-gray-100 text-text-main px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteSkill(skill._id)} className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">Delete</button>
                                            </div>
                                        )}
                                        {isStudent && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <button onClick={() => handleStudyClick(skill)} className="w-full bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-cyan-600 transition-colors">
                                                    Study
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Request Form */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-6">{editingRequest ? 'Edit Request' : 'Create Skill Request'}</h2>
                        <form onSubmit={handleCreateOrUpdateRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" required value={requestForm.title} onChange={e => setRequestForm({...requestForm, title: e.target.value})} placeholder="e.g. Need help with React hooks" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32" required value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} placeholder="Describe what you want to learn..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Skills Needed (comma separated)</label>
                                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" required value={requestForm.skillsNeeded} onChange={e => setRequestForm({...requestForm, skillsNeeded: e.target.value})} placeholder="React, JavaScript, CSS" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">{editingRequest ? 'Save Changes' : 'Submit Request'}</button>
                                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal: Skill Form */}
            {showSkillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-6 text-accent">{editingSkill ? 'Edit Skill' : 'Publish Skill'}</h2>
                        <form onSubmit={handleCreateOrUpdateSkill} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" required value={skillForm.title} onChange={e => setSkillForm({...skillForm, title: e.target.value})} placeholder="e.g. Advanced Node.js Mentorship" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32" required value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} placeholder="Describe what you can teach..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Skills Offered (comma separated)</label>
                                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" required value={skillForm.skillsOffered} onChange={e => setSkillForm({...skillForm, skillsOffered: e.target.value})} placeholder="Node.js, Express, MongoDB" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-accent text-white py-3 rounded-xl font-bold">{editingSkill ? 'Save Changes' : 'Publish Skill'}</button>
                                <button type="button" onClick={() => setShowSkillModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal: Reply Form */}
            {showReplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-2 text-primary">Reply to {showReplyModal.requestedBy?.name}</h2>
                        <p className="text-sm text-text-secondary mb-6">Your reply will be sent via email to the student and logged below their request.</p>
                        <form onSubmit={handleReplyToRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Message</label>
                                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32" required value={replyForm.message} onChange={e => setReplyForm({ message: e.target.value })} placeholder="Type your formal response here..." />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    Send Email
                                </button>
                                <button type="button" onClick={() => setShowReplyModal(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Skills;
