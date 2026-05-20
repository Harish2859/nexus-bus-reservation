import React, { useState, createContext, useContext } from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import SearchDashboard from './components/SearchDashboard';
import BusResultCard from './components/BusResultCard';
import SeatSelector from './components/SeatSelector';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/AuthModal';
import OperatorDashboard from './components/OperatorDashboard';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

function Header({ onAuthClick }) {
    const { user, logout } = useAuth();

    return (
        <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">
                    Nexus<span className="text-cyan-400">Bus</span>
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        {/* Role badge */}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            user.role === 'OPERATOR'
                                ? 'text-violet-300 bg-violet-500/10 border-violet-500/30'
                                : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
                        }`}>
                            {user.role === 'OPERATOR' ? '🚌 Operator' : '🧳 Passenger'}
                        </span>

                        {/* User name */}
                        <span className="text-sm text-slate-300 font-medium hidden sm:block">
                            {user.name}
                        </span>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 hover:border-red-900/50 px-3 py-1.5 rounded-xl transition-all"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full hidden sm:block">
                            v1.0.0-beta
                        </span>
                        <button
                            onClick={() => onAuthClick('login')}
                            className="text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition-all"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => onAuthClick('register')}
                            className="text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                        >
                            Get Started
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

function PassengerWorkspace() {
    const { selectedSchedule, setSelectedSchedule } = useBooking();
    const { showToast } = useToast();
    const [schedulesList, setSchedulesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const executeSchedulesFetch = async (criteria) => {
        setLoading(true);
        setSearched(true);
        setSelectedSchedule(null);

        try {
            const response = await fetch(
                `/api/schedules/search?origin=${criteria.origin}&destination=${criteria.destination}&date=${criteria.date}`
            );
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const data = await response.json();
            setSchedulesList(data.success ? data.schedules : []);
        } catch (error) {
            console.error('API error fetching schedules:', error);
            setSchedulesList([]);
            showToast('Failed to fetch schedules. Please check your network connection or backend status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-6xl mx-auto p-6">
            <SearchDashboard onSearchExecute={executeSchedulesFetch} />

            <div className="mt-8">
                {loading && (
                    <div className="w-full text-center py-12 text-slate-400 flex items-center justify-center gap-2 font-medium">
                        <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        Scanning active schedule manifests...
                    </div>
                )}

                {!loading && searched && schedulesList.length === 0 && (
                    <div className="w-full text-center py-12 px-6 rounded-2xl border border-slate-900 bg-slate-900/10 text-slate-500 font-medium">
                        No active bus schedules matched your criteria for this date.
                    </div>
                )}

                {!loading && schedulesList.map((schedule) => (
                    <div key={schedule.schedule_id}>
                        <BusResultCard
                            schedule={schedule}
                            isSelected={selectedSchedule?.schedule_id === schedule.schedule_id}
                            onSelectToggle={() => {
                                setSelectedSchedule(
                                    selectedSchedule?.schedule_id === schedule.schedule_id ? null : schedule
                                );
                            }}
                        />
                        {selectedSchedule?.schedule_id === schedule.schedule_id && (
                            <div className="w-full bg-slate-900/20 border-x border-b border-cyan-950/40 rounded-b-2xl p-6 mb-6 -mt-5">
                                <SeatSelector
                                    scheduleId={schedule.schedule_id}
                                    busType={schedule.bus_type}
                                    totalSeats={schedule.total_seats}
                                    basePrice={schedule.base_price_seater}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}

function AppShell() {
    const { user } = useAuth();
    const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'error') => setToast({ message, type });

    return (
        <ToastContext.Provider value={{ showToast }}>
            <BookingProvider>
                <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">

                    <Header onAuthClick={(tab) => setAuthModal(tab)} />

                    {/* Role-based view */}
                    {user?.role === 'OPERATOR' ? (
                        <main className="max-w-6xl mx-auto p-6">
                            <OperatorDashboard />
                        </main>
                    ) : (
                        <PassengerWorkspace />
                    )}

                    {/* Auth Modal */}
                    {authModal && <AuthModal onClose={() => setAuthModal(null)} />}

                    {/* Toast */}
                    {toast && (
                        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                    )}
                </div>
            </BookingProvider>
        </ToastContext.Provider>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppShell />
            </AuthProvider>
        </ErrorBoundary>
    );
}
