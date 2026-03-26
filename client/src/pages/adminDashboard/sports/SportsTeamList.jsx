import { useEffect, useState } from 'react';
import SportsTeamForm from './SportsTeamForm';

const SportsTeamList = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [managing, setManaging] = useState(null); // team being managed
    const [members, setMembers] = useState([]);
    const [formerMembers, setFormerMembers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [showAllMembers, setShowAllMembers] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [allMembersError, setAllMembersError] = useState('');

    const loadTeams = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const resAdmin = await fetch('/api/sports/admin/all-teams', { headers: { Authorization: `Bearer ${token}` } });
                if (resAdmin.ok) {
                    const data = await resAdmin.json();
                    setTeams(data);
                    setLoading(false);
                    return;
                }
                // fallback to calling /api/sports with token (optionalProtect will attach user)
                if (resAdmin.status === 401 || resAdmin.status === 403) {
                    try {
                        const resAuth = await fetch('/api/sports', { headers: { Authorization: `Bearer ${token}` } });
                        if (resAuth.ok) {
                            const data = await resAuth.json();
                            setTeams(data);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {}
                }
            }

            const res = await fetch('/api/sports');
            const data = await res.json();
            setTeams(data);
        } catch (err) {
            console.error('Error loading teams', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllMembers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/sports/admin/all-members', { headers: { Authorization: `Bearer ${token}` } });
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                let errMsg = `Failed to load members (${res.status})`;
                if (contentType.includes('application/json')) {
                    const body = await res.json().catch(() => null);
                    if (body && body.message) errMsg = body.message;
                } else {
                    const text = await res.text().catch(() => null);
                    if (text) errMsg = text;
                }
                setAllMembers([]);
                setAllMembersError(errMsg);
                setShowAllMembers(true);
                return;
            }

            let data = [];
            if (contentType.includes('application/json')) {
                data = await res.json().catch(() => []);
            } else {
                setAllMembersError('Unexpected response from server');
                setAllMembers([]);
                setShowAllMembers(true);
                return;
            }

            setAllMembers(data || []);
            setAllMembersError('');
            setShowAllMembers(true);
        } catch (err) {
            setAllMembers([]);
            setAllMembersError(err.message || 'Could not load members');
            setShowAllMembers(true);
        }
    };

    useEffect(() => { loadTeams(); }, []);

    const handleCreate = () => { setEditing(null); setShowForm(true); };

    const handleEdit = (team) => { setEditing(team); setShowForm(true); };

    const handleSaved = (saved) => {
        setShowForm(false);
        setEditing(null);
        loadTeams();
    };

    const handleDeactivate = async (team) => {
        if (!confirm('Deactivate this team?')) return;
        const token = localStorage.getItem('token');
        try {
            const id = team._id || team.id;
            const res = await fetch(`/api/sports/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ isActive: false }) });
            if (!res.ok) throw new Error('Failed');
            alert('Deactivated');
            loadTeams();
        } catch (err) { alert(err.message || 'Failed'); }
    };

    const openManage = async (team) => {
        setManaging(team);
        const id = team._id || team.id;
        try {
            const res1 = await fetch(`/api/sports/${id}`);
            const t = await res1.json();
            setMembers(t.members || []);
            setFormerMembers(t.formerMembers || []);
        } catch (e) { setMembers([]); }

        try {
            const token = localStorage.getItem('token');
            const res2 = await fetch(`/api/sports/${id}/requests`, { headers: { Authorization: `Bearer ${token}` } });
            if (res2.ok) {
                const reqs = await res2.json();
                setRequests(reqs || []);
            } else {
                setRequests([]);
            }
        } catch (e) { setRequests([]); }
    };

    const activateMember = async (memberId) => {
        if (!confirm('Activate this member in the team?')) return;
        const id = managing._id || managing.id;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/sports/${id}/members/${memberId}/activate`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Activate failed');
            alert(body.message || 'Activated');
            openManage(managing);
        } catch (err) { alert(err.message || 'Activate failed'); }
    };

    const activateTeam = async (team) => {
        if (!confirm('Activate this team?')) return;
        const token = localStorage.getItem('token');
        const id = team._id || team.id;
        try {
            const res = await fetch(`/api/sports/${id}/activate`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Activate failed');
            alert(body.message || 'Team activated');
            loadTeams();
        } catch (err) { alert(err.message || 'Activate failed'); }
    };

    const approve = async (reqId) => {
        const id = managing._id || managing.id;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/sports/${id}/requests/${reqId}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Approve failed');
            alert(body.message || 'Approved');
            openManage(managing);
        } catch (err) { alert(err.message || 'Approve failed'); }
    };

    const reject = async (reqId) => {
        const id = managing._id || managing.id;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/sports/${id}/requests/${reqId}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Reject failed');
            alert(body.message || 'Rejected');
            openManage(managing);
        } catch (err) { alert(err.message || 'Reject failed'); }
    };

    const removeMember = async (memberId) => {
        if (!confirm('Remove this member?')) return;
        const id = managing._id || managing.id;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/sports/${id}/members/${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Remove failed');
            alert(body.message || 'Removed');
            openManage(managing);
        } catch (err) { alert(err.message || 'Remove failed'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Sports Management</h2>
                <div>
                    <button onClick={handleCreate} className="btn-primary">Create Team</button>
                    <button onClick={loadAllMembers} className="btn-outline ml-2">All Members</button>
                </div>
            </div>

            {showForm && (
                <div className="mb-6">
                    <SportsTeamForm team={editing} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
                </div>
            )}

            {loading ? (
                <div>Loading teams...</div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {teams.map((t) => (
                        <div key={t._id || t.id} className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">{t.name}</h3>
                                    <p className="text-sm text-text-secondary">Coach: {t.coach || '—'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(t)} className="text-sm btn-outline">Edit</button>
                                    <button onClick={() => openManage(t)} className="text-sm btn-primary">Manage Members</button>
                                </div>
                            </div>
                            <p className="mt-3 text-text-secondary">{t.description}</p>
                            <div className="mt-3 flex gap-2 justify-end items-center">
                                {!t.isActive ? (
                                    <>
                                        <span className="text-xs text-text-secondary mr-2">Inactive</span>
                                        <button onClick={() => activateTeam(t)} className="text-sm btn-primary">Activate</button>
                                    </>
                                ) : (
                                    <button onClick={() => handleDeactivate(t)} className="text-sm text-error">Deactivate</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {managing && (
                <div className="mt-6 bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold">Manage Members — {managing.name}</h4>
                        <button onClick={() => { setManaging(null); setMembers([]); setRequests([]); }} className="btn-outline">Close</button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <h5 className="font-semibold">Current Members</h5>
                            {members.length === 0 ? <p className="text-text-secondary">No members</p> : (
                                <ul className="mt-2 space-y-2">
                                    {members.map(m => (
                                        <li key={m._id} className="flex items-center justify-between">
                                            <div>
                                                <strong>{m.name}</strong>
                                                <div className="text-xs text-text-secondary">{m.email}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => removeMember(m._id)} className="text-sm text-error">Remove</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h5 className="font-semibold">Deactivated Members</h5>
                            {formerMembers.length === 0 ? <p className="text-text-secondary">No deactivated members</p> : (
                                <ul className="mt-2 space-y-2">
                                    {formerMembers.map(m => (
                                        <li key={m._id} className="flex items-center justify-between">
                                            <div>
                                                <strong>{m.name}</strong>
                                                <div className="text-xs text-text-secondary">{m.email}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => activateMember(m._id)} className="text-sm btn-primary">Activate</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h5 className="font-semibold">Pending Requests</h5>
                            {requests.length === 0 ? <p className="text-text-secondary">No pending requests (or you may not have permission)</p> : (
                                <ul className="mt-2 space-y-2">
                                    {requests.map(r => (
                                        <li key={r._id} className="flex items-center justify-between">
                                            <div>
                                                <strong>{r.user.name}</strong>
                                                <div className="text-xs text-text-secondary">{r.user.email}</div>
                                                {r.message && <div className="text-xs mt-1">"{r.message}"</div>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => approve(r._id)} className="btn-primary text-sm">Approve</button>
                                                <button onClick={() => reject(r._id)} className="btn-outline text-sm">Reject</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAllMembers && (
                <div className="mt-6 bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold">All Team Members</h4>
                        <button onClick={() => setShowAllMembers(false)} className="btn-outline">Close</button>
                    </div>
                    <div className="mt-4">
                        {allMembersError ? (
                            <p className="text-error">{allMembersError}</p>
                        ) : allMembers.length === 0 ? (
                            <p className="text-text-secondary">No members found.</p>
                        ) : (
                            <ul className="space-y-3">
                                {allMembers.map((entry) => (
                                    <li key={entry.user._id} className="flex items-start justify-between bg-gray-50 p-3 rounded">
                                        <div>
                                            <strong>{entry.user.name}</strong>
                                            <div className="text-xs text-text-secondary">{entry.user.email}</div>
                                            <div className="text-xs mt-1">Teams: {entry.sports.map(s => s.name).join(', ')}</div>
                                        </div>
                                        <div />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SportsTeamList;
