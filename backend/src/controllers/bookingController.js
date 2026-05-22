const pool = require('../config/db');

const generatePNR = () => 'NXS' + Math.random().toString(36).substring(2, 8).toUpperCase();

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
            `INSERT INTO bookings (user_id, schedule_id, total_amount, ticket_status, pnr_number)
             VALUES ($1, $2, $3, 'CONFIRMED', $4) RETURNING booking_id, pnr_number;`,
            [req.user.id, schedule_id, total_amount, generatePNR()]
        );
        const { booking_id: bookingId, pnr_number } = bookingResult.rows[0];

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
            pnr_number,
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

const cancelBooking = async (req, res) => {
    const { bookingId } = req.body;
    const client = await pool.connect();

    try {
        const verify = await client.query(
            `SELECT ticket_status FROM bookings WHERE booking_id = $1 AND user_id = $2`,
            [bookingId, req.user.id]
        );

        if (verify.rows.length === 0)
            return res.status(404).json({ success: false, message: 'Booking not found.' });

        if (verify.rows[0].ticket_status === 'CANCELLED')
            return res.status(400).json({ success: false, message: 'Ticket already cancelled.' });

        await client.query('BEGIN');
        await client.query(`UPDATE bookings SET ticket_status = 'CANCELLED' WHERE booking_id = $1`, [bookingId]);
        await client.query('COMMIT');

        return res.status(200).json({ success: true, message: 'Ticket cancelled.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancellation error:', error);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { createBooking, cancelBooking };
