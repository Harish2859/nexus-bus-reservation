import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [searchCriteria, setSearchCriteria] = useState({ origin: '', destination: '', date: '' });
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const updateSearch = (origin, destination, date) => {
        setSearchCriteria({ origin, destination, date });
        setSelectedSchedule(null);
        setSelectedSeats([]);
    };

    const toggleSeatSelection = (seatNumber) => {
        setSelectedSeats(prev =>
            prev.includes(seatNumber)
                ? prev.filter(s => s !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    const clearBookingState = () => {
        setSelectedSeats([]);
        setSelectedSchedule(null);
    };

    return (
        <BookingContext.Provider value={{
            searchCriteria,
            selectedSchedule,
            selectedSeats,
            setSelectedSchedule,
            updateSearch,
            toggleSeatSelection,
            clearBookingState,
            setSelectedSeats
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error('useBooking must be wrapped within a BookingProvider.');
    return context;
};
