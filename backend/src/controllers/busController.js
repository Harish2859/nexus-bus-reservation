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

const getScheduleManifest = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: 'Invalid schedule ID.' });
        }

        const { rows } = await pool.query(
            `SELECT ps.seat_number, ps.passenger_name, ps.passenger_age, ps.passenger_gender,
                    b.pnr_number, u.email AS booked_by_email
             FROM passenger_seats ps
             JOIN bookings b ON ps.booking_id = b.booking_id
             JOIN users u ON b.user_id = u.id
             WHERE ps.schedule_id = $1
             ORDER BY ps.seat_number ASC;`,
            [scheduleId]
        );

        return res.status(200).json({ success: true, manifest: rows });
    } catch (error) {
        console.error('Manifest fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
};

const getOperatorStats = async (req, res) => {
    try {
        const operatorId = req.user.id;

        const { rows } = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM buses) AS buses,
                (SELECT COUNT(*) FROM schedules) AS schedules,
                (SELECT COUNT(*) FROM bookings WHERE ticket_status = 'CONFIRMED') AS bookings,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE ticket_status = 'CONFIRMED') AS revenue;`
        );

        const s = rows[0];
        return res.status(200).json({
            success: true,
            stats: {
                buses: parseInt(s.buses),
                schedules: parseInt(s.schedules),
                bookings: parseInt(s.bookings),
                revenue: parseFloat(s.revenue)
            }
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
};

const getOperatorBuses = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT bus_id, bus_number, bus_type, total_seats FROM buses ORDER BY bus_id ASC;`
        );
        return res.status(200).json({ success: true, buses: rows });
    } catch (error) {
        console.error('Fleet fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
};

const getActiveSchedules = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT s.schedule_id, s.origin, s.destination, s.departure_time,
                    b.bus_number, b.bus_type, b.total_seats,
                    COUNT(ps.seat_number) AS booked_seats
             FROM schedules s
             JOIN buses b ON s.bus_id = b.bus_id
             LEFT JOIN passenger_seats ps ON ps.schedule_id = s.schedule_id
             WHERE s.departure_time >= NOW()
             GROUP BY s.schedule_id, b.bus_number, b.bus_type, b.total_seats
             ORDER BY s.departure_time ASC;`
        );
        return res.status(200).json({ success: true, schedules: rows });
    } catch (error) {
        console.error('Active schedules fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { addBus, createSchedule, getScheduleManifest, getOperatorStats, getOperatorBuses, getActiveSchedules };
