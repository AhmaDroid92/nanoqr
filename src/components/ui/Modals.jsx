import React, { useState, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Timer, X, Zap } from 'lucide-react';
import AdUnit from './AdUnit';

export const InterstitialModal = ({ isOpen, onClose, onFinish }) => {
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (!isOpen) {
            setCount(5);
            return;
        }

        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onFinish(); // Auto trigger when done
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center relative border border-white/50">
                {count > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full text-xs">
                        <Timer size={14} />
                        <span>Wait {count}s</span>
                    </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-2">Preparing Download...</h3>
                <p className="text-gray-500 text-sm mb-6">Your free download will start automatically.</p>

                {/* Big Ad Slot */}
                <AdUnit slotId="5391886185" width="300px" height="250px" className="mx-auto mb-6 shadow-inner bg-gray-50" label="Interstitial Ad" />

                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${(1 - count / 5) * 100}%` }}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Cancel Download
                </button>
            </div>
        </div>
    );
};

export const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 relative border border-white/50">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <Zap size={40} className="text-blue-600" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Pro Vectors</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Generate infinite scalability for print, billboards, and high-end merchandise.
                        </p>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <p className="text-blue-900 font-medium">One-time fee of <span className="text-2xl font-bold text-blue-700 ml-1">$0.99</span></p>
                    </div>
                    <div className="w-full">
                        <PayPalButtons
                            style={{ layout: "vertical", shape: "pill", color: "blue" }}
                            createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "0.99" } }] })}
                            onApprove={(data, actions) => actions.order.capture().then(onUpgrade)}
                        />
                    </div>
                    <p className="text-xs text-center text-gray-400">Secure payment via PayPal. No card data stored.</p>
                </div>
            </div>
        </div>
    );
};
