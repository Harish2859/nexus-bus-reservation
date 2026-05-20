const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects: Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

const requireOperator = (req, res, next) => {
    if (req.user?.role !== 'OPERATOR') {
        return res.status(403).json({ error: 'Access denied. Operator privileges required.' });
    }
    next();
};

module.exports = { authenticateToken, requireOperator };
