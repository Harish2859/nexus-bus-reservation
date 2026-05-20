const pool = require('../config/db');

const searchSchedules = async (req, res) => {
    try {
        const { origin, destination, date } = req.query;

        if (!origin || !destination || !date) {
            return res.status(400).json({ 
                error: 'Missing required parameters: origin, destination, and date are required.' 
            });
        }

        const searchQuery = `
            SELECT 
                s.schedule_id,
                s.origin,
                s.destination,
                s.departure_time,
                s.arrival_time,
                s.base_price_seater,
                s.base_price_sleeper,
                b.bus_number,
                b.bus_type,
                b.total_seats
            FROM schedules s
            JOIN buses b ON s.bus_id = b.id
            WHERE s.origin ILIKE $1 
              AND s.destination ILIKE $2 
              AND s.departure_time::DATE = $3::DATE
            ORDER BY s.departure_time ASC;
        `;

        const { rows } = await pool.query(searchQuery, [origin.trim(), destination.trim(), date]);

        return res.status(200).json({
            success: true,
            results_count: rows.length,
            schedules: rows
        });

    } catch (error) {
        console.error('Error executing search query:', error);
        return res.status(500).json({ error: 'Internal server error while searching schedules.' });
    }
};

const getBookedSeats = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid schedule ID format.' });
        }

        const { rows } = await pool.query(
            'SELECT seat_number FROM passenger_seats WHERE schedule_id = $1;',
            [id]
        );

        return res.status(200).json({
            success: true,
            schedule_id: parseInt(id),
            booked_seats: rows.map(row => row.seat_number)
        });

    } catch (error) {
        console.error('Error fetching booked seats:', error);
        return res.status(500).json({ error: 'Internal server error while retrieving seat layouts.' });
    }
};

module.exports = { searchSchedules, getBookedSeats };
