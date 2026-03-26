const Sport = require('../models/Sport');
const SportRequest = require('../models/SportRequest');

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
        const sports = await Sport.find({}).populate('createdBy', 'name email avatar');
        res.json(sports);
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

module.exports = { createSport, getSports, getSport, updateSport, deleteSport, joinSport, requestToJoin, getRequests, approveRequest, rejectRequest, removeMember, activateMember, getAllSports, activateSport, getAllMembers };
