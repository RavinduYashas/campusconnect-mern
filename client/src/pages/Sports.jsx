import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sports.css';

const Sports = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/sports');
                if (!res.ok) throw new Error('no-sports-endpoint');
                const data = await res.json();
                setTeams(data);
            } catch (err) {
                setTeams([
                    { id: 1, name: 'Football Team', sportType: 'Football', description: 'Inter-college fixtures and training.' },
                    { id: 2, name: 'Basketball Team', sportType: 'Basketball', description: 'Practice and tournaments.' },
                    { id: 3, name: 'Badminton Club', sportType: 'Badminton', description: 'Friendly matches and coaching.' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const handleViewMembers = async (teamId) => {
        setLoadingMembers(teamId);
        try {
            const res = await fetch(`/api/sports/${teamId}`);
            if (!res.ok) throw new Error('Failed to fetch team details');
            const data = await res.json();
            setSelectedTeam(data);
        } catch (err) {
            console.error(err);
            alert('Could not load team members');
        } finally {
            setLoadingMembers(false);
        }
    };

    const uniqueTypes = ['All', ...new Set(teams.map(t => t.sportType || 'General'))];
    const filteredTeams = teams.filter(t => selectedType === 'All' || (t.sportType || 'General') === selectedType);

    return (
        <div className="sports-page">
            <header className="sports-hero relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] to-[#172554] rounded-3xl mx-4 mt-4 mb-8 shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                
                <div className="relative container mx-auto px-6 py-10 md:py-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-4">
                        <span>🏆</span> Campus Athletics
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
                        Sports Teams <span className="text-blue-300">&</span> Activities
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                        Join athletic teams, view fixtures and participate in campus sports activities managed by student leaders and administrators.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="#teams" className="bg-white hover:bg-gray-100 text-[#1E3A8A] px-6 py-2.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            Explore Teams ↓
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-6 border-t border-white/10">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white drop-shadow-md">12+</span>
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-2">Active Teams</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white drop-shadow-md">500+</span>
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-2">Athletes</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white drop-shadow-md">30+</span>
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-2">Events / Year</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white drop-shadow-md">8</span>
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-2">Sport Venues</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 grid gap-8 lg:grid-cols-2 items-start">
                <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🎯</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-heading">What Students Can Do</h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-orange-500 mt-1 flex-shrink-0">✦</span> Discover and join sports teams.</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-orange-500 mt-1 flex-shrink-0">✦</span> View fixture schedules and training times.</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-orange-500 mt-1 flex-shrink-0">✦</span> Apply to be a team captain or coach assistant.</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-orange-500 mt-1 flex-shrink-0">✦</span> Manage team events if an executive.</li>
                    </ul>
                </section>

                <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">⚡</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-heading">Key Features</h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-blue-500 mt-1 flex-shrink-0">✦</span> Team profiles and member lists</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-blue-500 mt-1 flex-shrink-0">✦</span> Register for tryouts and matches</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-blue-500 mt-1 flex-shrink-0">✦</span> Manage schedules and announcements</li>
                        <li className="flex items-start gap-3 text-gray-600"><span className="text-blue-500 mt-1 flex-shrink-0">✦</span> Admin controls for teams and events</li>
                    </ul>
                </section>

                <section className="col-span-full mt-6 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50" id="teams">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-extrabold text-gray-800 font-heading tracking-tight">Available Teams</h3>
                            {!loading && <span className="px-4 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-sm border border-blue-100 shadow-sm">{filteredTeams.length}</span>}
                        </div>
                        
                        {!loading && uniqueTypes.length > 1 && (
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 text-[#1E3A8A] py-2 pl-5 pr-10 rounded-full font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent cursor-pointer hover:border-[#1E3A8A] transition-colors"
                                >
                                    {uniqueTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type === 'All' ? 'All Sports' : type}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#1E3A8A]">
                                    <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                </div>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                            {[1, 2, 3].map(n => <div key={n} className="h-48 bg-gray-100 rounded-2xl"></div>)}
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
                            <div className="text-4xl mb-4">👻</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No teams found</h3>
                            <p className="text-gray-500">There are no teams matching the selected sport type.</p>
                            <button onClick={() => setSelectedType('All')} className="mt-4 text-[#1E3A8A] font-bold hover:underline">View all teams</button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredTeams.map((t) => {
                                const teamId = t._id || t.id;
                                return (
                                    <article key={teamId} className="group flex flex-col items-start bg-gradient-to-b from-white to-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                {t.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg">{t.sportType || 'General'}</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-800 mb-2 font-heading">{t.name}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{t.description}</p>
                                        <div className="flex gap-3 w-full mt-auto">
                                            <button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    if (!token) return navigate('/login');
                                                    try {
                                                        const res = await fetch(`/api/sports/${teamId}/join`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                        });
                                                        const body = await res.json();
                                                        if (!res.ok) throw new Error(body.message || 'Could not join');
                                                        alert(body.message || 'Joined team');
                                                    } catch (err) {
                                                        alert(err.message || 'Join failed');
                                                    }
                                                }}
                                            >
                                                <span>✚</span> Join
                                            </button>
                                            <button 
                                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-3 rounded-lg text-sm border border-gray-200 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
                                                onClick={() => handleViewMembers(teamId)}
                                                disabled={loadingMembers === teamId}
                                            >
                                                <span>👥</span> {loadingMembers === teamId ? 'Loading...' : 'Members'}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {selectedTeam && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name} Members</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedTeam.members?.length || 0} active members</p>
                            </div>
                            <button 
                                onClick={() => setSelectedTeam(null)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedTeam.members.map(member => (
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
                                    <p className="text-gray-500 text-sm mt-2">There are currently no users in this team.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sports;
