import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sports.css';

const Sports = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/sports');
                if (!res.ok) throw new Error('no-sports-endpoint');
                const data = await res.json();
                setTeams(data);
            } catch (err) {
                setTeams([
                    { id: 1, name: 'Football Team', description: 'Inter-college fixtures and training.' },
                    { id: 2, name: 'Basketball Team', description: 'Practice and tournaments.' },
                    { id: 3, name: 'Badminton Club', description: 'Friendly matches and coaching.' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    return (
        <div className="sports-page">
            <header className="sports-hero">
                <div className="container mx-auto px-6 py-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Sports Teams & Activities</h1>
                    <p className="text-text-secondary max-w-3xl mx-auto mb-8">Join athletic teams, view fixtures and participate in campus sports activities managed by student leaders and administrators.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="#teams" className="btn-primary">Explore Teams</Link>
                        <button onClick={() => navigate('/admin/sports')} className="btn-outline">Admin: Manage</button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 grid gap-8 lg:grid-cols-2 items-start">
                <section className="panel">
                    <h2 className="panel-title">What Students Can Do?</h2>
                    <ul className="panel-list">
                        <li className="panel-item">Discover and join sports teams.</li>
                        <li className="panel-item">View fixture schedules and training times.</li>
                        <li className="panel-item">Apply to be a team captain or coach assistant.</li>
                        <li className="panel-item">Manage team events if an executive.</li>
                    </ul>
                </section>

                <section className="panel">
                    <h2 className="panel-title">Key Features</h2>
                    <ul className="panel-list">
                        <li className="panel-item">Team profiles and member lists</li>
                        <li className="panel-item">Register for tryouts and matches</li>
                        <li className="panel-item">Manage schedules and announcements</li>
                        <li className="panel-item">Admin controls for teams and events</li>
                    </ul>
                </section>

                <section className="col-span-full mt-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100" id="teams">
                    <h3 className="text-2xl font-bold mb-3">Available Teams</h3>
                    {loading ? (
                        <p className="text-text-secondary">Loading teams...</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {teams.map((t) => {
                                const teamId = t._id || t.id;
                                return (
                                    <article key={teamId} className="team-card">
                                        <h4 className="team-name">{t.name}</h4>
                                        <p className="team-desc">{t.description}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                className="btn-sm btn-primary"
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
                                                Join Team
                                            </button>
                                            <Link to={`/profiles`} className="btn-sm btn-outline">View Members</Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Sports;
