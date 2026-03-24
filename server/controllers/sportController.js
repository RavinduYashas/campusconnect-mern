const Sport = require('../models/Sport');
const SportRequest = require('../models/SportRequest');
const User = require('../models/User');

// Create sport/team
const createSport = async (req, res) => {
    try {
        const { name, description, coach } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const sport = await Sport.create({ name, description, coach, createdBy: req.user ? req.user._id : undefined });
        res.status(201).json(sport);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all sports
const getSports = async (req, res) => {
    try {
        const sports = await Sport.find({ isActive: true }).populate('createdBy', 'name email avatar');
        res.json(sports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single sport
const getSport = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id).populate('members', 'name email avatar').populate('formerMembers', 'name email avatar');
        if (!sport) return res.status(404).json({ message: 'Not found' });
        res.json(sport);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update sport
const updateSport = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        sport.name = req.body.name || sport.name;
        sport.description = req.body.description || sport.description;
        sport.coach = req.body.coach || sport.coach;
        if (typeof req.body.isActive === 'boolean') sport.isActive = req.body.isActive;
        const updated = await sport.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Deactivate sport
const deleteSport = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        sport.isActive = false;
        await sport.save();
        res.json({ message: 'Deactivated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Join sport
const joinSport = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        const userId = req.user._id;
        if (sport.members.map(m => m.toString()).includes(userId.toString())) return res.status(400).json({ message: 'Already a member' });
        sport.members.push(userId);
        await sport.save();
        res.json({ message: 'Joined sport' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Request to join (creates a pending request instead of auto-join)
const requestToJoin = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        const userId = req.user._id;

        // check already member
        if (sport.members.map(m => m.toString()).includes(userId.toString())) return res.status(400).json({ message: 'Already a member' });

        // check existing pending request
        const existing = await SportRequest.findOne({ sport: sport._id, user: userId, status: 'pending' });
        if (existing) return res.status(400).json({ message: 'Join request already pending' });

        const reqDoc = await SportRequest.create({ sport: sport._id, user: userId, message: req.body.message || '' });
        res.status(201).json({ message: 'Request submitted', request: reqDoc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: get pending requests for a sport
const getRequests = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });

        // only admin or creator
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const requests = await SportRequest.find({ sport: sport._id, status: 'pending' }).populate('user', 'name email avatar');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Approve a request (admin/creator)
const approveRequest = async (req, res) => {
    try {
        const { id: sportId, reqId } = req.params;
        const sport = await Sport.findById(sportId);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const request = await SportRequest.findById(reqId);
        if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Request not found or already handled' });

        // add member
        const userId = request.user;
        if (!sport.members.map(m => m.toString()).includes(userId.toString())) {
            sport.members.push(userId);
            await sport.save();
        }

        request.status = 'approved';
        await request.save();

        res.json({ message: 'Request approved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject a request (admin/creator)
const rejectRequest = async (req, res) => {
    try {
        const { id: sportId, reqId } = req.params;
        const sport = await Sport.findById(sportId);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const request = await SportRequest.findById(reqId);
        if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Request not found or already handled' });

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: remove a member from team
const removeMember = async (req, res) => {
    try {
        const { id: sportId, memberId } = req.params;
        const sport = await Sport.findById(sportId);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Move to formerMembers for potential reactivation
        const wasMember = sport.members.some(m => m.toString() === memberId.toString());
        sport.members = sport.members.filter(m => m.toString() !== memberId.toString());
        if (wasMember && !sport.formerMembers.map(f => f.toString()).includes(memberId.toString())) {
            sport.formerMembers.push(memberId);
        }
        await sport.save();
        res.json({ message: 'Member removed (deactivated in team)' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: reactivate a former member into the team
const activateMember = async (req, res) => {
    try {
        const { id: sportId, memberId } = req.params;
        const sport = await Sport.findById(sportId);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (sport.members.map(m => m.toString()).includes(memberId.toString())) return res.status(400).json({ message: 'Already a member' });

        sport.formerMembers = (sport.formerMembers || []).filter(f => f.toString() !== memberId.toString());
        sport.members.push(memberId);
        await sport.save();
        res.json({ message: 'Member re-activated in team' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: list all sports including inactive
const getAllSports = async (req, res) => {
    try {
        // support filtering, search, pagination for admin listing
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = (req.query.search || '').trim();
        const isActive = req.query.isActive;
        const minMembers = req.query.minMembers ? parseInt(req.query.minMembers) : null;

        const filter = {};
        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive === 'true' || isActive === '1' || isActive === true;
        }

        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [ { name: rx }, { description: rx } ];
        }

        // base query
        let query = Sport.find(filter).populate('createdBy', 'name email avatar');

        // apply minMembers by aggregation-like filtering after count
        if (minMembers) {
            // fetch all then filter by members length (acceptable for admin lists)
            const all = await Sport.find(filter).populate('createdBy', 'name email avatar');
            const filtered = all.filter(s => (s.members || []).length >= minMembers);
            const total = filtered.length;
            const totalPages = Math.ceil(total / limit) || 1;
            const start = (page - 1) * limit;
            const data = filtered.slice(start, start + limit);
            return res.json({ data, meta: { page, limit, total, totalPages } });
        }

        const total = await Sport.countDocuments(filter);
        const totalPages = Math.ceil(total / limit) || 1;
        const data = await query.skip((page - 1) * limit).limit(limit).exec();
        res.json({ data, meta: { page, limit, total, totalPages } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: activate a sport
const activateSport = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        sport.isActive = true;
        await sport.save();
        res.json({ message: 'Sport activated', sport });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: get all members across sports (aggregated)
const getAllMembers = async (req, res) => {
    try {
        // include inactive teams
        const sports = await Sport.find({}).populate('members', 'name email avatar');

        const map = new Map();
        sports.forEach((sport) => {
            const sportName = sport.name;
            const sportId = sport._id;
            (sport.members || []).forEach((m) => {
                const id = m._id.toString();
                if (!map.has(id)) {
                    map.set(id, { user: m, sports: [{ id: sportId, name: sportName }] });
                } else {
                    map.get(id).sports.push({ id: sportId, name: sportName });
                }
            });
        });

        const result = Array.from(map.values());
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: bulk activate/deactivate sports
const bulkUpdateSports = async (req, res) => {
    try {
        const { ids, action } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'ids required' });
        if (!['activate', 'deactivate'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

        const isActive = action === 'activate';
        const result = await Sport.updateMany({ _id: { $in: ids } }, { $set: { isActive } });
        res.json({ message: 'Bulk update completed', modifiedCount: result.nModified || result.modifiedCount || 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: bulk add members to a specific sport by email list
const bulkAddMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { members } = req.body; // expect [{ email }, ...]
        if (!Array.isArray(members) || !members.length) return res.status(400).json({ message: 'members array required' });

        const sport = await Sport.findById(id);
        if (!sport) return res.status(404).json({ message: 'Sport not found' });
        if (req.user.role !== 'admin' && (!sport.createdBy || sport.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const report = { added: [], missing: [], already: [] };
        for (const m of members) {
            const email = (m.email || '').toLowerCase().trim();
            if (!email) continue;
            const user = await User.findOne({ email });
            if (!user) {
                report.missing.push(email);
                continue;
            }
            const uid = user._id.toString();
            if (sport.members.map(x => x.toString()).includes(uid)) {
                report.already.push(email);
                continue;
            }
            sport.members.push(user._id);
            report.added.push(email);
        }

        await sport.save();
        res.json({ message: 'Bulk add completed', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createSport, getSports, getSport, updateSport, deleteSport, joinSport, requestToJoin, getRequests, approveRequest, rejectRequest, removeMember, activateMember, getAllSports, activateSport, getAllMembers, bulkUpdateSports, bulkAddMembers };
