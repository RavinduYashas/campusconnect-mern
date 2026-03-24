import { useState, useEffect } from 'react';

const ClubForm = ({ club = null, onSaved, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (club) {
            setName(club.name || '');
            setDescription(club.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [club]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const payload = {};
            if (!club || name !== (club.name || '')) payload.name = name;
            if (!club || description !== (club.description || '')) payload.description = description;

            let res;
            if (club && (club._1 || club.id)) {
                // Defensive: accept both _id and id
            }
            if (club && (club._id || club.id)) {
                const id = club._id || club.id;
                if (Object.keys(payload).length === 0) {
                    alert('No changes to save');
                    setLoading(false);
                    return;
                }
                // Try PATCH first; if server doesn't support PATCH, fall back to PUT
                res = await fetch(`/api/clubs/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });

                if (res.status === 404) {
                    // fallback to PUT for servers that don't support PATCH
                    res = await fetch(`/api/clubs/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(Object.assign({}, club, payload)),
                    });
                }
            } else {
                const createPayload = { name, description };
                res = await fetch(`/api/clubs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(createPayload),
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
            <h2 className="text-xl font-bold mb-4">{club ? 'Edit Club' : 'Create Club'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required />
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

export default ClubForm;
