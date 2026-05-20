const pool = require('../config/db');

const addBus = async (req, res) => {
    try {
        const { bus_number, bus_type, total_seats } = req.body;

        if (!bus_number || !bus_type || !total_seats) {
            return res.status(400).json({ error: 'Missing bus configuration fields.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO buses (bus_number, bus_type, total_seats)
             VALUES ($1, $2, $3) RETURNING *;`,
            [bus_number.trim().toUpperCase(), bus_type, parseInt(total_seats)]
        );

        return res.status(201).json({
            success: true,
            message: 'Vehicle registered successfully to operator fleet.',
            bus: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'A vehicle with this bus number is already registered.' });
        }
        console.error('Bus registration error:', error);
        return res.status(500).json({ error: 'Internal error while registering vehicle.' });
    }
};

const createSchedule = async (req, res) => {
    try {
        const { bus_id, origin, destination, departure_time, arrival_time, base_price_seater, base_price_sleeper } = req.body;

        if (!bus_id || !origin || !destination || !departure_time || !arrival_time || !base_price_seater) {
            return res.status(400).json({ error: 'Missing required schedule parameters.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO schedules (bus_id, origin, destination, departure_time, arrival_time, base_price_seater, base_price_sleeper)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
            [bus_id, origin.trim(), destination.trim(), departure_time, arrival_time,
             parseFloat(base_price_seater), base_price_sleeper ? parseFloat(base_price_sleeper) : 0.00]
        );

        return res.status(201).json({
            success: true,
            message: 'Schedule deployed successfully.',
            schedule: rows[0]
        });
    } catch (error) {
        console.error('Schedule creation error:', error);
        return res.status(500).json({ error: 'Internal error while creating schedule.' });
    }
};

module.exports = { addBus, createSchedule };
