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
import UserProfile from './components/UserProfile';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

function Header({ onAuthClick, onProfileClick, onSearchClick, onLogout }) {
    const { user, logout } = useAuth();
    const handleLogout = () => { logout(); onLogout?.(); };
    return (
        <header className="sticky top-0 z-40 glass border-b border-white/60 shadow-sm shadow-slate-200/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <button onClick={onSearchClick} className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
                        <span className="text-white text-sm font-black">N</span>
                    </div>
                    <span className="font-extrabold text-slate-900 tracking-tight">
                        Nexus<span className="text-blue-600">Bus</span>
                    </span>
                </button>

                {/* Nav */}
                <div className="flex items-center gap-1.5">
                    {user ? (
                        <>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                user.role === 'OPERATOR'
                                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {user.role === 'OPERATOR' ? '⚙️ Operator' : '🎫 Passenger'}
                            </span>
                            <span className="text-sm text-slate-600 hidden sm:block font-medium px-1">{user.name}</span>
                            {user.role === 'PASSENGER' && (
                                <button onClick={onProfileClick} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                                    My Bookings
                                </button>
                            )}
                            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onAuthClick('login')} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                Sign in
                            </button>
                            <button onClick={() => onAuthClick('register')} className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-1.5 rounded-lg transition-all shadow-sm shadow-blue-200 hover:shadow-blue-300">
                                Get started
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

const POPULAR_ROUTES = [
    { from: 'Chennai', to: 'Bangalore', duration: '6h', price: '₹350', emoji: '🌆' },
    { from: 'Mumbai', to: 'Pune', duration: '3h', price: '₹250', emoji: '🏙️' },
    { from: 'Delhi', to: 'Agra', duration: '4h', price: '₹300', emoji: '🕌' },
    { from: 'Hyderabad', to: 'Vijayawada', duration: '5h', price: '₹280', emoji: '🌉' },
    { from: 'Bangalore', to: 'Goa', duration: '9h', price: '₹650', emoji: '🏖️' },
    { from: 'Kolkata', to: 'Bhubaneswar', duration: '7h', price: '₹420', emoji: '🏛️' },
];

const FEATURES = [
    { icon: '⚡', title: 'Instant Booking', desc: 'Confirm your seat in under 60 seconds', color: 'from-amber-400 to-orange-500' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Bank-grade encryption on every transaction', color: 'from-emerald-400 to-teal-500' },
    { icon: '🚌', title: '500+ Routes', desc: 'Covering major cities across India', color: 'from-blue-400 to-indigo-500' },
    { icon: '🗺️', title: 'Live Seat Map', desc: 'See real-time availability before you book', color: 'from-violet-400 to-purple-500' },
];

function LandingContent({ onSearchExecute, onRouteClick }) {
    return (
        <>
            {/* Hero */}
            <div className="hero-mesh relative overflow-hidden px-6 pt-20 pb-32">
                {/* Decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
                </div>

                <div className="relative z-10 text-center max-w-2xl mx-auto animate-fade-up">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-blue-100 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        🇮🇳 India's smartest bus booking platform
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                        Travel smarter,<br />
                        <span className="text-blue-200">book faster.</span>
                    </h1>
                    <p className="text-blue-200/80 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                        Search hundreds of routes, pick your exact seat, and confirm your ticket in seconds.
                    </p>
                </div>
            </div>

            {/* Search card — overlaps hero */}
            <div className="max-w-4xl mx-auto px-4 -mt-14 relative z-10 animate-fade-up-delay">
                <SearchDashboard onSearchExecute={onSearchExecute} />
            </div>

            {/* Features strip */}
            <div className="max-w-4xl mx-auto px-4 mt-10 animate-fade-up-delay-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-lg mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <p className="text-sm font-bold text-slate-900">{f.title}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular routes */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Popular routes</h2>
                    <span className="text-xs text-slate-400 font-medium">Tap to search</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {POPULAR_ROUTES.map((route) => (
                        <button
                            key={`${route.from}-${route.to}`}
                            onClick={() => onRouteClick(route.from, route.to)}
                            className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <span className="text-base">{route.emoji}</span>
                                    <span>{route.from}</span>
                                    <span className="text-slate-300 font-normal">→</span>
                                    <span>{route.to}</span>
                                </div>
                                <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Book →</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">🕐 {route.duration}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-emerald-600 font-semibold">from {route.price}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Operator CTA */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="flex-1 relative z-10">
                        <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full mb-3">For operators</span>
                        <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">Run a bus service?</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">Register your fleet, create schedules, and manage passenger bookings — all from one dashboard.</p>
                    </div>
                    <div className="shrink-0 relative z-10">
                        <button className="bg-white text-slate-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg whitespace-nowrap">
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
        <footer className="mt-20 border-t border-slate-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-black">N</span>
                            </div>
                            <span className="font-extrabold text-slate-900">NexusBus</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            India's modern bus booking platform. Fast, reliable, secure.
                        </p>
                    </div>

                    {[
                        { title: 'Product', links: ['Search Routes', 'Seat Selection', 'Operator Dashboard'] },
                        { title: 'Company', links: ['About', 'Careers', 'Contact'] },
                        { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Refund Policy'] },
                    ].map(col => (
                        <div key={col.title}>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">{col.title}</p>
                            <ul className="space-y-2">
                                {col.links.map(link => (
                                    <li key={link} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">{link}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">© 2026 NexusBus. All rights reserved.</p>
                    <p className="text-xs text-slate-400">Built with React + Node.js + PostgreSQL</p>
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
                    <SearchDashboard onSearchExecute={executeSchedulesFetch} />

                    <button
                        onClick={() => { setSearched(false); setSchedulesList([]); }}
                        className="mt-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Back to home
                    </button>

                    <div className="mt-6">
                        {loading && (
                            <div className="space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="skeleton h-24 rounded-2xl" />
                                ))}
                            </div>
                        )}

                        {!loading && searched && schedulesList.length === 0 && (
                            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                                <div className="text-4xl mb-3">🔍</div>
                                <p className="text-slate-700 font-semibold text-sm">No buses found</p>
                                <p className="text-slate-400 text-xs mt-1">Try a different date or check the city names.</p>
                            </div>
                        )}

                        {!loading && schedulesList.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-semibold text-slate-900">
                                    {schedulesList.length} bus{schedulesList.length > 1 ? 'es' : ''} found
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="text-sm text-slate-500">{searchOrigin} → {searchDest}</span>
                            </div>
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
                                    <div className="bg-slate-50 border border-t-0 border-slate-200 rounded-b-2xl px-6 pb-6 mb-4">
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
    const [passengerView, setPassengerView] = useState('search');
    const showToast = (message, type = 'error') => setToast({ message, type });

    const handleLogoutAndReset = () => {
        setPassengerView('search');
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            <BookingProvider>
                <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
                    <Header onAuthClick={(tab) => setAuthModal(tab)} onProfileClick={() => setPassengerView('profile')} onSearchClick={() => setPassengerView('search')} onLogout={handleLogoutAndReset} />

                    {user?.role === 'OPERATOR' ? (
                        <main className="max-w-6xl mx-auto px-4 py-8">
                            <OperatorDashboard />
                        </main>
                    ) : user && passengerView === 'profile' ? (
                        <UserProfile />
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
