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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Attempt to fetch clubs from backend if available. If endpoint is missing,
        // fallback to demo data so UI can function without backend changes.
        const fetchClubs = async () => {
            try {
                const res = await fetch('/api/clubs');
                if (!res.ok) throw new Error('no-clubs-endpoint');
                const data = await res.json();
                setClubs(data);
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
    }, []);

    return (
        <div className="clubs-page">
            <header className="clubs-hero">
                <div className="container mx-auto px-6 py-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Clubs & Societies Management</h1>
                    <p className="text-text-secondary max-w-3xl mx-auto mb-8">Discover, join and manage campus organizations — clubs and societies. Students can explore opportunities, attend events and lead initiatives with integrated admin controls.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="#club-list" className="btn-primary">Explore Clubs</Link>
                        <button onClick={() => navigate('/admin/clubs')} className="btn-outline">Admin: Manage</button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 grid gap-8 lg:grid-cols-2 items-start">
                <section className="panel">
                    <h2 className="panel-title">What Students Can Do?</h2>
                    <ul className="panel-list">
                        {sampleFeaturesLeft.map((f, i) => (
                            <li key={i} className="panel-item">{f}</li>
                        ))}
                    </ul>
                </section>

                <section className="panel">
                    <h2 className="panel-title">Key Features?</h2>
                    <ul className="panel-list">
                        {sampleFeaturesRight.map((f, i) => (
                            <li key={i} className="panel-item">{f}</li>
                        ))}
                    </ul>
                </section>

                <section className="col-span-full mt-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100" id="club-list">
                    <h3 className="text-2xl font-bold mb-3">Available Clubs</h3>
                    {loading ? (
                        <p className="text-text-secondary">Loading clubs...</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {clubs.map((c) => {
                                const clubId = c._id || c.id;
                                return (
                                    <article key={clubId} className="club-card">
                                        <h4 className="club-name">{c.name}</h4>
                                        <p className="club-desc">{c.description}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                className="btn-sm btn-primary"
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
                                                    } catch (err) {
                                                        alert(err.message || 'Join failed');
                                                    }
                                                }}
                                            >
                                                Apply / Join
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

export default Clubs;
