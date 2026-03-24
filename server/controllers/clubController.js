const Club = require('../models/Club');
const ClubRequest = require('../models/ClubRequest');

// @desc    Create a club
// @route   POST /api/clubs
// @access  Private
const createClub = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Club name is required' });

        const club = await Club.create({
            name,
            description,
            createdBy: req.user ? req.user._id : undefined,
        });

        res.status(201).json(club);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
    try {
        // If the requester is an admin, return all clubs; otherwise return only active ones
        if (req.user && req.user.role === 'admin') {
            const clubs = await Club.find({}).populate('createdBy', 'name email avatar');
            return res.json(clubs);
        }

        const clubs = await Club.find({ isActive: true }).populate('createdBy', 'name email avatar');
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: get all clubs including inactive
const getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.find({}).populate('createdBy', 'name email avatar');
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
const getClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id).populate('members', 'name email avatar').populate('formerMembers', 'name email avatar');
        if (!club) return res.status(404).json({ message: 'Club not found' });
        res.json(club);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private/Admin or creator
const updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        // Allow admin or creator to update
        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to update this club' });
        }

        club.name = req.body.name || club.name;
        club.description = req.body.description || club.description;
        if (typeof req.body.isActive === 'boolean') club.isActive = req.body.isActive;

        const updated = await club.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete (deactivate) a club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin or creator
const deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to delete this club' });
        }

        club.isActive = false;
        await club.save();
        res.json({ message: 'Club deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a club (adds current user to members)
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        const userId = req.user._id;
        if (club.members.map(m => m.toString()).includes(userId.toString())) {
            return res.status(400).json({ message: 'Already a member' });
        }

        club.members.push(userId);
        await club.save();
        res.json({ message: 'Joined club' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request to join (creates a pending request)
const requestToJoin = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });
        const userId = req.user._id;

        if (club.members.map(m => m.toString()).includes(userId.toString())) return res.status(400).json({ message: 'Already a member' });

        const existing = await ClubRequest.findOne({ club: club._id, user: userId, status: 'pending' });
        if (existing) return res.status(400).json({ message: 'Join request already pending' });

        const reqDoc = await ClubRequest.create({ club: club._id, user: userId, message: req.body.message || '' });
        res.status(201).json({ message: 'Request submitted', request: reqDoc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: list pending requests for a club
const getRequests = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const requests = await ClubRequest.find({ club: club._id, status: 'pending' }).populate('user', 'name email avatar');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve request
const approveRequest = async (req, res) => {
    try {
        const { id: clubId, reqId } = req.params;
        const club = await Club.findById(clubId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const request = await ClubRequest.findById(reqId);
        if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Request not found or already handled' });

        const userId = request.user;
        if (!club.members.map(m => m.toString()).includes(userId.toString())) {
            club.members.push(userId);
            await club.save();
        }

        request.status = 'approved';
        await request.save();
        res.json({ message: 'Request approved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject request
const rejectRequest = async (req, res) => {
    try {
        const { id: clubId, reqId } = req.params;
        const club = await Club.findById(clubId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const request = await ClubRequest.findById(reqId);
        if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Request not found or already handled' });

        request.status = 'rejected';
        await request.save();
        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: remove member
const removeMember = async (req, res) => {
    try {
        const { id: clubId, memberId } = req.params;
        const club = await Club.findById(clubId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Move the member to formerMembers so we can reactivate later
        const wasMember = club.members.some(m => m.toString() === memberId.toString());
        club.members = club.members.filter(m => m.toString() !== memberId.toString());
        if (wasMember && !club.formerMembers.map(f => f.toString()).includes(memberId.toString())) {
            club.formerMembers.push(memberId);
        }
        await club.save();
        res.json({ message: 'Member removed (deactivated in club)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: reactivate a former member (move from formerMembers back to members)
const activateMember = async (req, res) => {
    try {
        const { id: clubId, memberId } = req.params;
        const club = await Club.findById(clubId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If already a member, nothing to do
        if (club.members.map(m => m.toString()).includes(memberId.toString())) {
            return res.status(400).json({ message: 'User already an active member' });
        }

        // Remove from formerMembers and add back to members
        club.formerMembers = (club.formerMembers || []).filter(f => f.toString() !== memberId.toString());
        club.members.push(memberId);
        await club.save();
        res.json({ message: 'Member re-activated in club' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin or creator: activate/reactivate a club
const activateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        if (req.user.role !== 'admin' && (!club.createdBy || club.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to activate this club' });
        }

        club.isActive = true;
        await club.save();
        res.json({ message: 'Club activated', club });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: get all members across clubs (aggregated)
const getAllMembers = async (req, res) => {
    try {
        // Only admins should call this; route should enforce authorization
        // Include inactive clubs as requested so admin can see members across all clubs
        const clubs = await Club.find({}).populate('members', 'name email avatar');

        const map = new Map();
        clubs.forEach((club) => {
            const clubName = club.name;
            const clubId = club._id;
            (club.members || []).forEach((m) => {
                const id = m._id.toString();
                if (!map.has(id)) {
                    map.set(id, { user: m, clubs: [{ id: clubId, name: clubName }] });
                } else {
                    map.get(id).clubs.push({ id: clubId, name: clubName });
                }
            });
        });

        const result = Array.from(map.values());
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClub,
    getClubs,
    getClub,
    updateClub,
    deleteClub,
    joinClub,
    requestToJoin,
    getRequests,
    approveRequest,
    rejectRequest,
    removeMember,
    // admin helper
    activateMember,
    activateClub,
    getAllMembers,
    getAllClubs,
};
