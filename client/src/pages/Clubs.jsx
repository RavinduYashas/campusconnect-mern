import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Clubs.css';

const sampleFeaturesLeft = [
    'Explore available clubs and societies & Apply / Join for them.',
    'View event schedules and upcoming activities of clubs',
    'Create new clubs (with admin approval) and manage existing ones',
    'Manage events if they are executives or team leaders',
];


const sampleFeaturesRight = [
    'Create / update organization profiles',
    'Member registrations',
    'Add / update events and announcements',
    'Centralized announcements and updates',
    'Admin control for deactivating organizations',
];

const Clubs = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        // Attempt to fetch clubs from backend if available. If endpoint is missing,
        // fallback to demo data so UI can function without backend changes.
        const fetchClubs = async () => {
            try {
                const res = await fetch('/api/clubs');
                if (!res.ok) throw new Error('no-clubs-endpoint');
                const data = await res.json();
                // API may return { data, meta } for paginated admin endpoints
                if (data && data.data) setClubs(data.data);
                else setClubs(Array.isArray(data) ? data : []);
                } catch (err) {
                // fallback demo data
                setClubs([
                    { id: 1, name: 'Programming Club', description: 'Coding sessions, hackathons and workshops.' },
                    { id: 2, name: 'Debate Society', description: 'Public speaking and debate practice.' },
                    { id: 3, name: 'Photography Club', description: 'Workshops, photo-walks and exhibitions.' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
        // fetch user's pending/waitlisted requests if logged in
        const fetchMyRequests = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            setLoadingRequests(true);
            try {
                const res = await fetch('/api/clubs/requests/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('no-requests');
                const data = await res.json();
                setUserRequests(Array.isArray(data) ? data : []);
            } catch (err) {
                setUserRequests([]);
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchMyRequests();
    }, []);

    const handleViewMembers = async (clubId) => {
        setLoadingMembers(clubId);
        try {
            const res = await fetch(`/api/clubs/${clubId}`);
            if (!res.ok) throw new Error('Failed to fetch club details');
            const data = await res.json();
            setSelectedClub(data);
        } catch (err) {
            console.error(err);
            alert('Could not load club members');
        } finally {
            setLoadingMembers(false);
        }
    };

    return (
        <div className="clubs-page">
            <header className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] to-[#1e4fc2] rounded-3xl mx-4 mt-4 mb-8 shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                
                <div className="relative container mx-auto px-6 py-10 md:py-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-4">
                        <span>🏛️</span> Campus Organisations
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
                        Clubs & <span className="text-blue-300">Societies</span>
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                        Discover, join and lead campus organizations. Students can explore opportunities, attend events and drive initiatives with integrated admin controls.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="#club-list" className="bg-white hover:bg-gray-100 text-[#1E3A8A] px-6 py-2.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            Explore Clubs ↓
                        </a>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 grid gap-8 lg:grid-cols-2 items-start">
                <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🎓</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-heading">What Students Can Do</h2>
                    <ul className="space-y-4">
                        {sampleFeaturesLeft.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600"><span className="text-orange-500 mt-1 flex-shrink-0">✦</span> {f}</li>
                        ))}
                    </ul>
                </section>

                <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">⚙️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-heading">Key Features</h2>
                    <ul className="space-y-4">
                        {sampleFeaturesRight.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600"><span className="text-blue-500 mt-1 flex-shrink-0">✦</span> {f}</li>
                        ))}
                    </ul>
                </section>

                <section className="col-span-full mt-6 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50" id="club-list">
                    {userRequests && userRequests.length > 0 && (
                        <div className="mb-8 bg-orange-50/50 p-6 rounded-2xl border border-orange-200/60 shadow-inner">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-900"><span>⏳</span> Your Pending Requests</h3>
                            <div className="space-y-3">
                                {userRequests.map((r) => (
                                    <div key={r._id || r.id} className="p-4 bg-white border border-orange-100 rounded-xl flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="font-bold text-gray-800">{r.club?.name || 'Unknown Club'}</div>
                                            <div className="text-xs font-semibold px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full inline-block mt-2 capitalize">{r.status}</div>
                                        </div>
                                        <div>
                                            <button
                                                className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    if (!token) return alert('Please login');
                                                    try {
                                                        const res = await fetch(`/api/clubs/requests/${r._id}`, {
                                                            method: 'DELETE',
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        });
                                                        const body = await res.json();
                                                        if (!res.ok) throw new Error(body.message || 'Could not cancel');
                                                        // remove from local list
                                                        setUserRequests(prev => prev.filter(x => (x._id || x.id) !== (r._id || r.id)));
                                                        alert(body.message || 'Request cancelled');
                                                    } catch (err) {
                                                        alert(err.message || 'Cancel failed');
                                                    }
                                                }}
                                            >
                                                Cancel Request
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <h3 className="text-3xl font-extrabold text-gray-800 font-heading tracking-tight">Available Clubs</h3>
                        {!loading && <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-full text-sm border border-blue-100 shadow-sm">{clubs.length} clubs</span>}
                    </div>
                    {loading ? (
                        <p className="text-text-secondary">Loading clubs...</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {clubs.map((c) => {
                                const clubId = c._id || c.id;
                                return (
                                    <article key={clubId} className="group flex flex-col items-start bg-gradient-to-b from-white to-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                            {c.name.charAt(0)}
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-800 mb-2 font-heading">{c.name}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{c.description}</p>
                                        <div className="flex gap-3 w-full mt-auto">
                                            <button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"

                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    if (!token) return navigate('/login');
                                                    try {
                                                        const res = await fetch(`/api/clubs/${clubId}/join`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                        });
                                                        const body = await res.json();
                                                        if (!res.ok) throw new Error(body.message || 'Could not join');
                                                        alert(body.message || 'Joined club');
                                                        // refresh user's requests if any
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            if (token) {
                                                                const rres = await fetch('/api/clubs/requests/my', { headers: { Authorization: `Bearer ${token}` } });
                                                                if (rres.ok) {
                                                                    const rdata = await rres.json();
                                                                    setUserRequests(Array.isArray(rdata) ? rdata : []);
                                                                }
                                                            }
                                                        } catch (e) { /* ignore */ }
                                                    } catch (err) {
                                                        alert(err.message || 'Join failed');
                                                    }
                                                }}
                                            >
                                                <span>✚</span> Apply
                                            </button>
                                            <button 
                                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-3 rounded-lg text-sm border border-gray-200 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
                                                onClick={() => handleViewMembers(clubId)}
                                                disabled={loadingMembers === clubId}
                                            >
                                                <span>👥</span> {loadingMembers === clubId ? 'Loading...' : 'Members'}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {selectedClub && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedClub.name} Members</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedClub.members?.length || 0} active members</p>
                            </div>
                            <button 
                                onClick={() => setSelectedClub(null)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            {selectedClub.members && selectedClub.members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedClub.members.map(member => (
                                        <div key={member._id} className="flex flex-col items-center gap-3 p-5 border border-gray-100 rounded-2xl hover:border-[#1E3A8A]/30 transition-colors bg-white shadow-sm hover:shadow-md text-center">
                                            <img src={member.avatar ? `/${member.avatar}` : '/avatars/avatar1.png'} alt={member.name} className="w-16 h-16 rounded-full border-2 border-[#1E3A8A]/10 object-cover shadow-sm" />
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm w-full truncate px-2">{member.name}</h4>
                                                <p className="text-xs text-gray-500 w-full truncate px-2 mt-1">{member.email}</p>
                                            </div>
                                            <Link to={`/profile/${member._id}`} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg w-full">View Profile</Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl mx-4 my-2">
                                    <div className="text-4xl mb-4">📭</div>
                                    <h3 className="text-lg font-bold text-gray-700">No Members Yet</h3>
                                    <p className="text-gray-500 text-sm mt-2">There are currently no users in this club.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;
