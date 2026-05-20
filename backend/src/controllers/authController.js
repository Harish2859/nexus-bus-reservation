const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing registration credentials.' });
        }

        const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const assignedRole = role === 'OPERATOR' ? 'OPERATOR' : 'PASSENGER';

        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role;`,
            [name.trim(), email.toLowerCase().trim(), passwordHash, assignedRole]
        );
        const user = rows[0];

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.status(201).json({ success: true, token, user });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal error during registration.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password credentials.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password credentials.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.status(200).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal error during login.' });
    }
};

module.exports = { registerUser, loginUser };
