import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SkillList = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));
    
    // 'requests' or 'offers'
    const [activeTab, setActiveTab] = useState('requests'); 
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [currentUser, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [reqRes, offRes] = await Promise.all([
                axios.get('/api/skills/requests', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/skills/offers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRequests(reqRes.data);
            setOffers(offRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch skill data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (window.confirm(`Are you sure you want to forcibly delete this ${type === 'requests' ? 'student request' : 'expert offer'}?`)) {
            try {
                const token = localStorage.getItem('token');
                if (type === 'requests') {
                    await axios.delete(`/api/skills/requests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    setRequests(requests.filter(item => item._id !== id));
                } else {
                    await axios.delete(`/api/skills/offers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    setOffers(offers.filter(item => item._id !== id));
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete record');
            }
        }
    };

    // Derived State
    const currentData = activeTab === 'requests' ? requests : offers;
    const filteredData = currentData.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (activeTab === 'requests' ? item.requestedBy?.name : item.publishedBy?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- 1. Header Section ---
        doc.setFillColor(37, 99, 235); // Primary Blue
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text("CampusConnect", 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Official Platform Management Report", 14, 32);

        doc.setTextColor(255, 255, 255);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 70, 25);

        // --- 2. Report Details ---
        doc.setTextColor(100, 116, 139); // Gray-500
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`SKILL EXCHANGE MODERATION: ${activeTab === 'requests' ? 'STUDENT REQUESTS' : 'EXPERT OFFERS'}`, 14, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Records: ${filteredData.length}`, 14, 62);

        if (searchTerm) {
            doc.text(`Filter Active: "${searchTerm}"`, 14, 67);
        }

        // --- 3. Table Data ---
        const tableColumn = ["#", "Title", "Owner", "Role", "Date", "Items Count"];
        
        const tableRows = filteredData.map((item, index) => {
            const ownerObj = activeTab === 'requests' ? item.requestedBy : item.publishedBy;
            const itemsCount = activeTab === 'requests' ? item.skillsNeeded?.length : item.skillsOffered?.length;
            return [
                index + 1,
                item.title,
                ownerObj?.name || 'Deleted User',
                (ownerObj?.role || 'N/A').toUpperCase(),
                new Date(item.createdAt).toLocaleDateString(),
                itemsCount || 0
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 70 },
                2: { cellWidth: 40 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 15, halign: 'center' }
            },
            styles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 75 },
            didDrawPage: (data) => {
                const str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(str, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                doc.text("© 2026 CampusConnect Platform - Internal Use Only", 14, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`CampusConnect_Skill_${activeTab}_Report_${Date.now()}.pdf`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <div className="font-bold text-primary animate-pulse">Loading Modular Data...</div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-text-main font-heading tracking-tight mb-2">Skill Exchange Moderation</h1>
                    <p className="text-text-secondary text-sm font-medium">Review and strictly manage all student requests and expert offers.</p>
                </div>
                <div className="flex items-center gap-4">
                    {error && <span className="text-error text-sm font-bold bg-red-50 px-4 py-2 rounded-xl border border-red-100 italic">{error}</span>}
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[22px] w-fit">
                    <button
                        onClick={() => { setActiveTab('requests'); setSearchTerm(''); }}
                        className={`px-8 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-text-secondary hover:text-text-main hover:bg-gray-100'}`}
                    >
                        Student Requests
                        <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'requests' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>{requests.length}</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('offers'); setSearchTerm(''); }}
                        className={`px-8 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeTab === 'offers' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-text-secondary hover:text-text-main hover:bg-gray-100'}`}
                    >
                        Expert Offers
                        <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'offers' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>{offers.length}</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search by title or author name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportPDF}
                        disabled={filteredData.length === 0}
                        className="bg-white border border-gray-100 text-text-main hover:bg-gray-50 px-6 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Report
                    </button>
                </div>
            </div>

            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">Listing Details</th>
                                <th className="px-8 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">Description Preview</th>
                                <th className="px-8 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">{activeTab === 'requests' ? 'Needed' : 'Offered'} Skills</th>
                                <th className="px-8 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-xs font-black text-text-secondary uppercase tracking-widest text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode='popLayout'>
                                {filteredData.map((item) => {
                                    const ownerDetails = activeTab === 'requests' ? item.requestedBy : item.publishedBy;
                                    const userInitials = ownerDetails?.name ? ownerDetails.name.charAt(0) : '?';
                                    const targetSkills = activeTab === 'requests' ? item.skillsNeeded : item.skillsOffered;

                                    return (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={item._id}
                                            className="hover:bg-gray-50/80 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-primary/10 text-primary">
                                                        {userInitials}
                                                    </div>
                                                    <div className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
                                                        {ownerDetails?.name || 'Unknown User'} • <span className="text-gray-400">{ownerDetails?.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-medium text-text-secondary max-w-xs truncate">{item.description}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                 <div className="flex flex-wrap gap-1">
                                                    {targetSkills?.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{s}</span>
                                                    ))}
                                                    {targetSkills?.length > 3 && <span className="text-xs text-gray-400 font-bold">+{targetSkills.length - 3}</span>}
                                                 </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(item._id, activeTab)}
                                                    className="bg-red-50 text-error hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors inline-block"
                                                >
                                                    Force Delete
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="text-gray-300 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-text-secondary font-bold text-lg">No records found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default SkillList;
