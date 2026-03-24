import { useEffect, useState } from 'react';

const AllMembers = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [minClubs, setMinClubs] = useState('');
    const [minSports, setMinSports] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const load = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [clubsRes, sportsRes] = await Promise.all([
                fetch('/api/clubs/all-members', { headers }),
                fetch('/api/sports/admin/all-members', { headers })
            ]);

            const clubs = clubsRes.ok ? await clubsRes.json() : [];
            const sports = sportsRes.ok ? await sportsRes.json() : [];

            // merge by user id
            const map = new Map();
            (clubs || []).forEach(e => {
                const id = e.user._id || e.user.id;
                if (!map.has(id)) map.set(id, { user: e.user, clubs: e.clubs || [], sports: [] });
                else map.get(id).clubs = (map.get(id).clubs || []).concat(e.clubs || []);
            });
            (sports || []).forEach(e => {
                const id = e.user._id || e.user.id;
                if (!map.has(id)) map.set(id, { user: e.user, clubs: [], sports: e.sports || [] });
                else map.get(id).sports = (map.get(id).sports || []).concat(e.sports || []);
            });

            const list = Array.from(map.values()).map(item => ({
                user: item.user,
                clubs: (item.clubs || []).map(c => c.name),
                sports: (item.sports || []).map(s => s.name),
            }));

            setEntries(list);
        } catch (err) {
            console.error('AllMembers load error', err);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = entries.filter(e => {
        if (search) {
            const q = search.toLowerCase();
            if (!(e.user.name?.toLowerCase().includes(q) || e.user.email?.toLowerCase().includes(q))) return false;
        }
        if (minClubs && (e.clubs?.length || 0) < Number(minClubs)) return false;
        if (minSports && (e.sports?.length || 0) < Number(minSports)) return false;
        return true;
    });

    const sorted = filtered.sort((a, b) => {
        if (sortBy === 'name') return a.user.name.localeCompare(b.user.name);
        if (sortBy === 'clubs') return (b.clubs?.length || 0) - (a.clubs?.length || 0);
        if (sortBy === 'sports') return (b.sports?.length || 0) - (a.sports?.length || 0);
        return 0;
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageData = sorted.slice((page - 1) * limit, (page - 1) * limit + limit);

    const exportCsv = () => {
        const rows = [ ['name','email','clubs','sports','clubsCount','sportsCount'] ];
        for (const e of sorted) {
            rows.push([
                e.user.name || '',
                e.user.email || '',
                (e.clubs || []).join(';'),
                (e.sports || []).join(';'),
                (e.clubs?.length || 0).toString(),
                (e.sports?.length || 0).toString(),
            ]);
        }
        const csv = rows.map(r => r.map(cell => '"' + ('' + (cell || '')).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-members-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">All Members</h2>
                <div className="flex items-center gap-2">
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email" className="input" />
                    <input type="number" min="0" value={minClubs} onChange={e => { setMinClubs(e.target.value); setPage(1); }} placeholder="Min clubs" className="input w-32" />
                    <input type="number" min="0" value={minSports} onChange={e => { setMinSports(e.target.value); setPage(1); }} placeholder="Min teams" className="input w-32" />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-40">
                        <option value="name">Sort by name</option>
                        <option value="clubs">Sort by clubs count</option>
                        <option value="sports">Sort by teams count</option>
                    </select>
                    <button onClick={exportCsv} className="btn-primary">Export CSV</button>
                </div>
            </div>

            {loading ? <div>Loading...</div> : (
                <>
                    <div className="text-sm text-text-secondary mb-3">Showing {pageData.length} of {total} members</div>
                    <div className="grid gap-3">
                        {pageData.map(e => (
                            <div key={e.user._id || e.user.id} className="bg-white p-3 rounded border flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{e.user.name}</div>
                                    <div className="text-xs text-text-secondary">{e.user.email}</div>
                                </div>
                                <div className="text-sm text-text-secondary">
                                    <div>Clubs: {(e.clubs || []).join(', ') || '—'}</div>
                                    <div>Teams: {(e.sports || []).join(', ') || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-outline">Prev</button>
                        <div className="text-sm">Page {page} / {totalPages}</div>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="btn-outline">Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AllMembers;
