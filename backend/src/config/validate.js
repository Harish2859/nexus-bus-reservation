const validateBookingPayload = (req, res, next) => {
    const { schedule_id, total_amount, passengers } = req.body;

    if (!schedule_id || isNaN(schedule_id) || parseInt(schedule_id) <= 0) {
        return res.status(400).json({ error: 'Validation Failed: A valid Schedule ID is required.' });
    }

    if (!total_amount || isNaN(total_amount) || parseFloat(total_amount) <= 0) {
        return res.status(400).json({ error: 'Validation Failed: Total amount must be a positive numeric value.' });
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
        return res.status(400).json({ error: 'Validation Failed: Passenger manifest array cannot be empty.' });
    }

    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const validGenders = ['Male', 'Female', 'Other'];

    for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];

        if (!p.seat_number || !p.passenger_name || !p.passenger_age || !p.passenger_gender) {
            return res.status(400).json({ error: `Validation Failed: Missing required fields at passenger row ${i + 1}.` });
        }

        p.passenger_name = p.passenger_name.trim();
        if (!nameRegex.test(p.passenger_name)) {
            return res.status(400).json({ error: `Validation Failed: Name "${p.passenger_name}" is invalid. Letters only, 2-50 characters.` });
        }

        const age = parseInt(p.passenger_age);
        if (isNaN(age) || age < 1 || age > 115) {
            return res.status(400).json({ error: 'Validation Failed: Age must be an integer between 1 and 115.' });
        }

        if (!validGenders.includes(p.passenger_gender)) {
            return res.status(400).json({ error: 'Validation Failed: Gender must be Male, Female, or Other.' });
        }

        p.seat_number = p.seat_number.trim().toUpperCase();
        if (!/^[A-Z0-9]{2,5}$/.test(p.seat_number)) {
            return res.status(400).json({ error: 'Validation Failed: Seat number format is invalid.' });
        }
    }

    next();
};

module.exports = { validateBookingPayload };
