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
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-black">N</span>
                </div>
                <span className="text-gray-900 font-bold text-base tracking-tight">
                    Nexus<span className="text-blue-600">Bus</span>
                </span>
            </div>
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.role === 'OPERATOR'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                            {user.role === 'OPERATOR' ? 'Operator' : 'Passenger'}
                        </span>
                        <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
                        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onAuthClick('login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            Sign in
                        </button>
                        <button onClick={() => onAuthClick('register')} className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors">
                            Get started
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

const POPULAR_ROUTES = [
    { from: 'Chennai', to: 'Bangalore', duration: '6h', price: '₹350' },
    { from: 'Mumbai', to: 'Pune', duration: '3h', price: '₹250' },
    { from: 'Delhi', to: 'Agra', duration: '4h', price: '₹300' },
    { from: 'Hyderabad', to: 'Vijayawada', duration: '5h', price: '₹280' },
    { from: 'Bangalore', to: 'Goa', duration: '9h', price: '₹650' },
    { from: 'Kolkata', to: 'Bhubaneswar', duration: '7h', price: '₹420' },
];

const FEATURES = [
    { icon: '🎫', title: 'Instant Booking', desc: 'Confirm your seat in under 60 seconds' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Bank-grade encryption on every transaction' },
    { icon: '🚌', title: '500+ Routes', desc: 'Covering major cities across India' },
    { icon: '📱', title: 'Live Seat Map', desc: 'See real-time availability before you book' },
];

function LandingContent({ onSearchExecute, onRouteClick }) {
    return (
        <>
            {/* Hero */}
            <div className="bg-blue-600 px-6 pt-16 pb-24 text-center">
                <span className="inline-block bg-blue-500 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    🇮🇳 India's smartest bus booking platform
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
                    Travel smarter,<br />book faster.
                </h1>
                <p className="text-blue-200 text-sm sm:text-base max-w-md mx-auto">
                    Search hundreds of routes, pick your exact seat, and confirm your ticket in seconds.
                </p>
            </div>

            {/* Search card — overlaps hero */}
            <div className="max-w-4xl mx-auto px-4 -mt-10">
                <SearchDashboard onSearchExecute={onSearchExecute} />
            </div>

            {/* Features strip */}
            <div className="max-w-4xl mx-auto px-4 mt-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-2xl mb-2">{f.icon}</div>
                            <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular routes */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <h2 className="text-base font-bold text-gray-900 mb-4">Popular routes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {POPULAR_ROUTES.map((route) => (
                        <button
                            key={`${route.from}-${route.to}`}
                            onClick={() => onRouteClick(route.from, route.to)}
                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <span>{route.from}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{route.to}</span>
                                </div>
                                <span className="text-xs text-blue-600 font-semibold group-hover:underline">Book</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>🕐 {route.duration}</span>
                                <span>·</span>
                                <span>from {route.price}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Why NexusBus */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="bg-gray-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-2">Are you a bus operator?</h2>
                        <p className="text-gray-400 text-sm">Register your fleet, create schedules, and manage passenger bookings — all from one dashboard.</p>
                    </div>
                    <div className="shrink-0">
                        <button className="bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                            Join as Operator →
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                <span className="text-white text-xs font-black">N</span>
                            </div>
                            <span className="font-bold text-sm text-gray-900">NexusBus</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            India's modern bus booking platform. Fast, reliable, secure.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Product</p>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="hover:text-gray-700 cursor-pointer">Search Routes</li>
                            <li className="hover:text-gray-700 cursor-pointer">Seat Selection</li>
                            <li className="hover:text-gray-700 cursor-pointer">Operator Dashboard</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Company</p>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="hover:text-gray-700 cursor-pointer">About</li>
                            <li className="hover:text-gray-700 cursor-pointer">Careers</li>
                            <li className="hover:text-gray-700 cursor-pointer">Contact</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Legal</p>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="hover:text-gray-700 cursor-pointer">Privacy Policy</li>
                            <li className="hover:text-gray-700 cursor-pointer">Terms of Service</li>
                            <li className="hover:text-gray-700 cursor-pointer">Refund Policy</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">© 2026 NexusBus. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Built with React + Node.js + PostgreSQL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function PassengerWorkspace({ onAuthClick }) {
    const { selectedSchedule, setSelectedSchedule } = useBooking();
    const { showToast } = useToast();
    const [schedulesList, setSchedulesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDest, setSearchDest] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL || '';

    const executeSchedulesFetch = async (criteria) => {
        setLoading(true);
        setSearched(true);
        setSearchOrigin(criteria.origin);
        setSearchDest(criteria.destination);
        setSelectedSchedule(null);
        try {
            const response = await fetch(
                `${API_BASE}/api/schedules/search?origin=${criteria.origin}&destination=${criteria.destination}&date=${criteria.date}`
            );
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const data = await response.json();
            setSchedulesList(data.success ? data.schedules : []);
        } catch (error) {
            console.error('API error:', error);
            setSchedulesList([]);
            showToast('Could not fetch schedules. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleRouteClick = (from, to) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {!searched ? (
                <>
                    <LandingContent onSearchExecute={executeSchedulesFetch} onRouteClick={handleRouteClick} />
                    <Footer />
                </>
            ) : (
                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Search bar stays visible */}
                    <SearchDashboard onSearchExecute={executeSchedulesFetch} />

                    {/* Back link */}
                    <button
                        onClick={() => { setSearched(false); setSchedulesList([]); }}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        ← Back to home
                    </button>

                    <div className="mt-5">
                        {loading && (
                            <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
                                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Searching available buses...
                            </div>
                        )}

                        {!loading && searched && schedulesList.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-400 text-sm">No buses found for this route and date.</p>
                                <p className="text-gray-400 text-xs mt-1">Try a different date or check the city names.</p>
                            </div>
                        )}

                        {!loading && schedulesList.length > 0 && (
                            <p className="text-sm text-gray-500 mb-4">
                                {schedulesList.length} bus{schedulesList.length > 1 ? 'es' : ''} found · {searchOrigin} → {searchDest}
                            </p>
                        )}

                        {!loading && schedulesList.map((schedule) => (
                            <div key={schedule.schedule_id}>
                                <BusResultCard
                                    schedule={schedule}
                                    isSelected={selectedSchedule?.schedule_id === schedule.schedule_id}
                                    onSelectToggle={() => setSelectedSchedule(
                                        selectedSchedule?.schedule_id === schedule.schedule_id ? null : schedule
                                    )}
                                />
                                {selectedSchedule?.schedule_id === schedule.schedule_id && (
                                    <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl px-6 pb-6 mb-4">
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
            )}
        </div>
    );
}

function AppShell() {
    const { user } = useAuth();
    const [authModal, setAuthModal] = useState(null);
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'error') => setToast({ message, type });

    return (
        <ToastContext.Provider value={{ showToast }}>
            <BookingProvider>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
                    <Header onAuthClick={(tab) => setAuthModal(tab)} />

                    {user?.role === 'OPERATOR' ? (
                        <main className="max-w-4xl mx-auto px-4 py-8">
                            <OperatorDashboard />
                        </main>
                    ) : (
                        <PassengerWorkspace onAuthClick={(tab) => setAuthModal(tab)} />
                    )}

                    {authModal && <AuthModal onClose={() => setAuthModal(null)} />}
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
