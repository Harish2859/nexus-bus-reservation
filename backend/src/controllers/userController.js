const pool = require('../config/db');

const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const userRes = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [userId]
        );

        const bookingsRes = await pool.query(
            `SELECT b.booking_id, b.pnr_number, b.total_amount, b.ticket_status, b.booking_date,
                    s.origin, s.destination, s.departure_time, s.arrival_time,
                    bu.bus_number, bu.bus_type,
                    ARRAY_REMOVE(ARRAY_AGG(ps.seat_number ORDER BY ps.seat_number), NULL) AS seats
             FROM bookings b
             JOIN schedules s ON b.schedule_id = s.schedule_id
             JOIN buses bu ON s.bus_id = bu.bus_id
             LEFT JOIN passenger_seats ps ON ps.booking_id = b.booking_id
             WHERE b.user_id = $1
             GROUP BY b.booking_id, b.pnr_number, b.total_amount, b.ticket_status, b.booking_date,
                      s.origin, s.destination, s.departure_time, s.arrival_time,
                      bu.bus_number, bu.bus_type
             ORDER BY b.booking_date DESC;`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            profile: userRes.rows[0],
            bookings: bookingsRes.rows
        });
    } catch (error) {
        console.error('User dashboard error:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserDashboard };
