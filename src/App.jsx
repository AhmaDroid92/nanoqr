import React, { useState, useEffect, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import QRCodeStyling from 'qr-code-styling';
import {
    Download,
    Lock,
    Upload,
    X,
    Check,
    Zap,
    LayoutGrid,
    Palette,
    Image as ImageIcon,
    Home,
    Type,
    Link2,
    Timer
} from 'lucide-react';

// --- Assets ---
// Using a darker text for the logo in light mode
const BRAND_LOGO = "https://placehold.co/150x50/white/2563eb?text=NanoQR";

// --- Hooks ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
    >
        <Icon size={20} className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span className="font-medium">{label}</span>
    </button>
);

const PropertySection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-4 px-1 text-left hover:text-blue-600 transition-colors"
            >
                <span className="font-semibold text-gray-800 text-sm">{title}</span>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m1 1 4 4 4-4" /></svg>
                </div>
            </button>
            {isOpen && <div className="pb-6 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

const ColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded border-none p-0 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-gray-600 uppercase flex-1">{value}</span>
        </div>
    </div>
);

// Ad Component Structure
const AdUnit = ({ slotId, label, width, height, className }) => {
    return (
        <div
            className={`bg-gray-100 border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 overflow-hidden relative ${className}`}
            style={{ width: width || '100%', height: height || 'auto', minHeight: height }}
        >
            {/* If slotId is present, we would inject the Ad script here */}
            {slotId ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    {/* Placeholder for real Ad script injection */}
                    <span className="text-xs font-mono">[Ad: {slotId}]</span>
                </div>
            ) : (
                <>
                    <span className="text-xs font-semibold uppercase tracking-wider">Ad Space</span>
                    {width && height && <span className="text-[10px] opacity-75">{width}x{height}</span>}
                </>
            )}
        </div>
    );
};

const InterstitialModal = ({ isOpen, onClose, onFinish }) => {
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
                <AdUnit width="300px" height="250px" className="mx-auto mb-6 shadow-inner bg-gray-50" label="Interstitial Ad" />

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

const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
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
                        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
                            <PayPalButtons
                                style={{ layout: "vertical", shape: "pill", color: "blue" }}
                                createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "0.99" } }] })}
                                onApprove={(data, actions) => actions.order.capture().then(onUpgrade)}
                            />
                        </PayPalScriptProvider>
                    </div>
                    <p className="text-xs text-center text-gray-400">Secure payment via PayPal. No card data stored.</p>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
    // State
    const [url, setUrl] = useState("https://nanoqr.com");
    const debouncedUrl = useDebounce(url, 300);
    const [dotsColor, setDotsColor] = useState("#2563eb"); // Blue default
    const [bgColor, setBgColor] = useState("#ffffff");
    const [logo, setLogo] = useState(null);
    const [logoSize, setLogoSize] = useState(0.4);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showInterstitial, setShowInterstitial] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const qrRef = useRef(null);
    const qrCode = useRef(null);

    // Initialize QR
    useEffect(() => {
        qrCode.current = new QRCodeStyling({
            width: 350, // Reduced for UI preview
            height: 350,
            type: "canvas",
            data: debouncedUrl,
            image: logo,
            dotsOptions: { color: dotsColor, type: "rounded" },
            backgroundOptions: { color: bgColor },
            imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: logoSize },
            cornersSquareOptions: { type: "extra-rounded", color: dotsColor },
            cornersDotOptions: { type: "dot", color: dotsColor }
        });
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }, []);

    // Update QR
    useEffect(() => {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: debouncedUrl,
            image: logo,
            dotsOptions: { color: dotsColor },
            backgroundOptions: { color: bgColor },
            imageOptions: { imageSize: logoSize },
            cornersSquareOptions: { color: dotsColor },
            cornersDotOptions: { color: dotsColor }
        });
    }, [debouncedUrl, dotsColor, bgColor, logo, logoSize]);

    // Handlers
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadClick = (ext) => {
        if (ext === 'svg' && !isPremiumUser) {
            setShowPremiumModal(true);
            return;
        }

        // Interstitial for Free PNG
        if (ext === 'png') {
            setShowInterstitial(true);
            return;
        }

        // Direct download for Premium SVG (if already paid)
        executeDownload(ext);
    };

    const executeDownload = (ext) => {
        if (ext === 'png') {
            // Force low res (250x250) for PNG to prevent scaling
            qrCode.current.update({ width: 250, height: 250 });
            qrCode.current.download({ name: "nano-qr-basic", extension: "png" });

            // Restore preview size
            setTimeout(() => {
                qrCode.current.update({ width: 350, height: 350 });
            }, 100);
        } else {
            // SVG is vector so size doesn't matter, but 500 is good default
            qrCode.current.update({ width: 500, height: 500 });
            qrCode.current.download({ name: "nano-qr-pro", extension: ext });
            setTimeout(() => {
                qrCode.current.update({ width: 350, height: 350 });
            }, 100);
        }
    };

    const handleUpgrade = () => {
        setIsPremiumUser(true);
        setShowPremiumModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        executeDownload('svg');
    };

    return (
        <div className="flex h-screen bg-[#F3F5F9] font-sans text-gray-900 overflow-hidden selection:bg-blue-100">
            {/* Toast */}
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-green-700 px-6 py-4 rounded-2xl shadow-xl shadow-green-900/5 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in border border-green-100">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-bold">Payment Successful!</p>
                        <p className="text-sm text-green-600">Your pro vector is downloading...</p>
                    </div>
                </div>
            )}

            {/* --- Left Sidebar (Navigation) --- */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 flex flex-col p-6 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
                <div className="mb-10 pl-2">
                    <img src={BRAND_LOGO} alt="NanoQR" className="h-8 object-contain" />
                </div>

                <div className="space-y-2 flex-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-4">Menu</div>
                    <SidebarItem icon={Home} label="Generator" active={true} />
                </div>
            </aside>

            {/* --- Center (Canvas) --- */}
            <main className="flex-1 relative flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">New QR Code</h1>
                        <p className="text-sm text-gray-400">Design and customize your code</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleDownloadClick('png')}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold border border-gray-200 shadow-sm transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download size={18} /> PNG
                        </button>
                        <button
                            onClick={() => handleDownloadClick('svg')}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-gray-900/10 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isPremiumUser ? <Download size={18} /> : <Lock size={18} />}
                            SVG
                        </button>
                    </div>
                </header>

                {/* Ad Space: Header Leaderboard */}
                <div className="px-8 mt-2">
                    <AdUnit
                        width="728px"
                        height="90px"
                        className="mx-auto bg-gray-200/50 border-gray-300"
                        label="Top Banner Ad (728x90)"
                    />
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 ring-1 ring-white/60 backdrop-blur-sm relative group transition-all duration-500 hover:shadow-3xl hover:shadow-blue-900/10">
                        {/* Decorative background blur behind QR */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 blur-3xl rounded-full -z-10 group-hover:bg-gradient-to-tr group-hover:from-blue-200/40 group-hover:to-purple-200/40 transition-colors"></div>

                        {/* Watermark Overlay (Anti-Screenshot) */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden rounded-[2.5rem]">
                            <div className="absolute inset-0 flex flex-wrap content-center justify-center opacity-[0.06] -rotate-45 scale-150 gap-12 p-10">
                                {Array(30).fill("PREVIEW").map((t, i) => (
                                    <span key={i} className="text-2xl font-black text-gray-900 whitespace-nowrap">{t}</span>
                                ))}
                            </div>
                        </div>

                        <div ref={qrRef} className="rounded-xl overflow-hidden relative z-0" />
                    </div>
                </div>
            </main>

            {/* --- Right Sidebar (Properties) --- */}
            <aside className="w-80 bg-white/90 backdrop-blur-md border-l border-white/50 flex flex-col z-20 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.02)]">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-bold text-lg text-gray-800">Customization</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">

                    <PropertySection title="Destination">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Target URL</label>
                            <div className="relative">
                                <Link2 className="absolute top-3 left-3 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </PropertySection>

                    <PropertySection title="Appearance">
                        <div className="grid grid-cols-2 gap-4">
                            <ColorPicker label="Dots" value={dotsColor} onChange={setDotsColor} />
                            <ColorPicker label="Background" value={bgColor} onChange={setBgColor} />
                        </div>
                    </PropertySection>

                    <PropertySection title="Branding">
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                                    {logo ? (
                                        <img src={logo} alt="Brand" className="h-10 w-10 object-contain" />
                                    ) : (
                                        <Upload size={24} />
                                    )}
                                    <span className="text-xs font-medium">{logo ? 'Change Logo' : 'Upload Logo'}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Logo Size</span>
                                    <span>{Math.round(logoSize * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.5"
                                    step="0.05"
                                    value={logoSize}
                                    onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                    disabled={!logo}
                                />
                            </div>
                        </div>
                    </PropertySection>

                    {/* Sidebar Ad Space */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <AdUnit height="250px" label="Sidebar Ad" />
                    </div>

                </div>
            </aside>

            {/* Modals */}
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onUpgrade={handleUpgrade}
            />

            <InterstitialModal
                isOpen={showInterstitial}
                onClose={() => setShowInterstitial(false)}
                onFinish={() => {
                    setShowInterstitial(false);
                    executeDownload('png');
                }}
            />
        </div>
    );
}
