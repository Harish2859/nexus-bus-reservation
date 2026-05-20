const pool = require('../config/db');

const createBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const { schedule_id, passengers, total_amount } = req.body;

        if (!schedule_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ error: 'Invalid booking data payload.' });
        }

        await client.query('BEGIN');

        const requestedSeats = passengers.map(p => p.seat_number);

        const existingSeatsResult = await client.query(
            `SELECT seat_number FROM passenger_seats 
             WHERE schedule_id = $1 AND seat_number = ANY($2) FOR UPDATE;`,
            [schedule_id, requestedSeats]
        );

        if (existingSeatsResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
                error: 'Seat conflict detected. One or more selected seats have already been reserved.' 
            });
        }

        const bookingResult = await client.query(
            `INSERT INTO bookings (schedule_id, total_amount, ticket_status)
             VALUES ($1, $2, 'CONFIRMED') RETURNING id;`,
            [schedule_id, total_amount]
        );
        const bookingId = bookingResult.rows[0].id;

        for (const passenger of passengers) {
            await client.query(
                `INSERT INTO passenger_seats (booking_id, schedule_id, seat_number, passenger_name, passenger_age, passenger_gender)
                 VALUES ($1, $2, $3, $4, $5, $6);`,
                [bookingId, schedule_id, passenger.seat_number, passenger.passenger_name, passenger.passenger_age, passenger.passenger_gender]
            );
        }

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Booking completed successfully!',
            booking_id: bookingId,
            seats_booked: requestedSeats
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Booking transaction aborted:', error);
        return res.status(500).json({ error: 'Internal server error processing your reservation.' });
    } finally {
        client.release();
    }
};

module.exports = { createBooking };
