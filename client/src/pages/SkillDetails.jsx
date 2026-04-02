import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const generatePDF = () => {
        if (!skill) return;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(33, 150, 243); // primary color matching scheme
        doc.text("Skill Exchange Profile Overview", 14, 22);
        
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(`${skill.title}`, 14, 32);

        // Body section
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text("Expert Information:", 14, 45);
        
        autoTable(doc, {
            startY: 50,
            head: [['Expert Name', 'Role', 'Email', 'Verification']],
            body: [
                [
                    skill.publishedBy?.name || 'N/A', 
                    (skill.publishedBy?.role || 'N/A').toUpperCase(), 
                    skill.publishedBy?.email || 'Restricted', 
                    'Verified Mentor'
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
        });

        const finalY = doc.lastAutoTable?.finalY || 65;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text("Skill Description:", 14, finalY + 15);
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        
        const splitDesc = doc.splitTextToSize(skill.description, 180);
        doc.text(splitDesc, 14, finalY + 25);
        
        const descHeight = doc.getTextDimensions(splitDesc).h;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text("Technologies & Topics:", 14, finalY + descHeight + 40);
        
        autoTable(doc, {
            startY: finalY + descHeight + 45,
            head: [['Tag Name']],
            body: skill.skillsOffered.map(s => [s]),
            theme: 'striped',
            headStyles: { fillColor: [6, 182, 212] }
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Downloaded from CampusConnect - Peer Skill Exchange Module", 14, doc.internal.pageSize.height - 10);

        doc.save(`${skill.title.replace(/\s+/g, '_')}_Details.pdf`);
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

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                {!enrolled ? (
                                    <button onClick={handleConfirmInterest} className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                        Confirm Interest & Enroll
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                ) : (
                                    <button disabled className="w-full sm:w-auto bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Interest Confirmed
                                    </button>
                                )}
                                
                                <button onClick={generatePDF} className="w-full sm:w-auto bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 px-8 py-4 rounded-2xl font-black text-lg shadow-sm transition-all flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SkillDetails;
