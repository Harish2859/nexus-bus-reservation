import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught a fatal interface crash:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-5xl animate-bounce">⚡</span>
                    <h2 className="text-xl font-black text-cyan-400 tracking-tight mt-4">Interface Core Restructuring</h2>
                    <p className="text-sm text-slate-400 max-w-sm mt-2">
                        An unexpected rendering fault occurred. The runtime boundary safely contained the thread.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                    >
                        Reinitialize Workspace
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
