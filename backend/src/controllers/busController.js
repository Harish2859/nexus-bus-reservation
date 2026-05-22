const pool = require('../config/db');

const addBus = async (req, res) => {
    try {
        const { bus_number, bus_type, total_seats } = req.body;

        if (!bus_number || !bus_type || !total_seats) {
            return res.status(400).json({ error: 'Missing bus configuration fields.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO buses (bus_number, bus_type, total_seats, operator_id)
             VALUES ($1, $2, $3, $4) RETURNING *;`,
            [bus_number.trim().toUpperCase(), bus_type, parseInt(total_seats), req.user.id]
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

        // Verify the bus belongs to the requesting operator before scheduling
        const ownerCheck = await pool.query(
            `SELECT bus_id FROM buses WHERE bus_id = $1 AND operator_id = $2;`,
            [bus_id, req.user.id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Bus not found in your fleet.' });
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

        // Verify the schedule belongs to a bus owned by the requesting operator
        const ownerCheck = await pool.query(
            `SELECT s.schedule_id FROM schedules s
             JOIN buses b ON s.bus_id = b.bus_id
             WHERE s.schedule_id = $1 AND b.operator_id = $2;`,
            [scheduleId, req.user.id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Schedule not found in your fleet.' });
        }

        const { rows } = await pool.query(
            `SELECT b.ticket_status, b.pnr_number,
                    ps.seat_number, ps.passenger_name, ps.passenger_age, ps.passenger_gender
             FROM bookings b
             LEFT JOIN passenger_seats ps ON ps.booking_id = b.booking_id
             WHERE b.schedule_id = $1
             ORDER BY b.ticket_status ASC, ps.seat_number ASC;`,
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
                (SELECT COUNT(*) FROM buses WHERE operator_id = $1) AS buses,
                (SELECT COUNT(*) FROM schedules s JOIN buses b ON s.bus_id = b.bus_id WHERE b.operator_id = $1) AS schedules,
                (SELECT COUNT(*) FROM bookings bk JOIN schedules s ON bk.schedule_id = s.schedule_id JOIN buses b ON s.bus_id = b.bus_id WHERE b.operator_id = $1 AND bk.ticket_status = 'CONFIRMED') AS bookings,
                (SELECT COALESCE(SUM(bk.total_amount), 0) FROM bookings bk JOIN schedules s ON bk.schedule_id = s.schedule_id JOIN buses b ON s.bus_id = b.bus_id WHERE b.operator_id = $1 AND bk.ticket_status = 'CONFIRMED') AS revenue;`,
            [operatorId]
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
            `SELECT bus_id, bus_number, bus_type, total_seats FROM buses WHERE operator_id = $1 ORDER BY bus_id ASC;`,
            [req.user.id]
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
             WHERE s.departure_time >= NOW() AND b.operator_id = $1
             GROUP BY s.schedule_id, b.bus_number, b.bus_type, b.total_seats
             ORDER BY s.departure_time ASC;`,
            [req.user.id]
        );
        return res.status(200).json({ success: true, schedules: rows });
    } catch (error) {
        console.error('Active schedules fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { addBus, createSchedule, getScheduleManifest, getOperatorStats, getOperatorBuses, getActiveSchedules };
