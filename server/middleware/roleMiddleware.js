const roleAuthorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user?.role || 'none'}' not authorized.`
            });
        }
        next();
    };
};

module.exports = { roleAuthorize };
