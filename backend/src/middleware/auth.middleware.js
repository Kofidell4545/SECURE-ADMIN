const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, jwtConfig.secret);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Role-based access control
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
