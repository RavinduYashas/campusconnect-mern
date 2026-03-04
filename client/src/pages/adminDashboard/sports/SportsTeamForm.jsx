import { useState, useEffect } from 'react';

const SportsTeamForm = ({ team = null, onSaved, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coach, setCoach] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (team) {
            setName(team.name || '');
            setDescription(team.description || '');
            setCoach(team.coach || '');
        } else {
            setName('');
            setDescription('');
            setCoach('');
        }
    }, [team]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const payload = { name, description, coach };
            let res;
            if (team && (team._id || team.id)) {
                const id = team._id || team.id;
                res = await fetch(`/api/sports/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`/api/sports`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
            }
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Save failed');
            onSaved && onSaved(body);
        } catch (err) {
            alert(err.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{team ? 'Edit Team' : 'Create Team'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Coach</label>
                    <input value={coach} onChange={(e) => setCoach(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border rounded-md p-2" rows={4} />
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};

export default SportsTeamForm;
