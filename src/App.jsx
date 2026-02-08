import React, { useState, useEffect, useRef } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import QRCodeStyling from 'qr-code-styling';
import {
    Download,
    Lock,
    Upload,
    Link2,
    Home,
    Image as ImageIcon
} from 'lucide-react';

// Components
import Sidebar from './components/layout/Sidebar';
import AdUnit from './components/ui/AdUnit';
import { PropertySection, ColorPicker } from './components/ui/Properties';
import { PremiumModal, InterstitialModal } from './components/ui/Modals';

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

export default function App() {
    // State
    const { user, isLoaded, isSignedIn } = useUser();
    const [url, setUrl] = useState("https://nanoqr.com");
    const debouncedUrl = useDebounce(url, 300);
    const [dotsColor, setDotsColor] = useState("#2563eb"); // Blue default
    const [bgColor, setBgColor] = useState("#ffffff");
    const [logo, setLogo] = useState(null);
    const [logoSize, setLogoSize] = useState(0.4);
    const [isPremiumUser, setIsPremiumUser] = useState(() => {
        return localStorage.getItem("nanoqr_premium") === "true";
    });
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showInterstitial, setShowInterstitial] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const qrRef = useRef(null);
    const qrCode = useRef(null);

    // Check persistence when user loads
    useEffect(() => {
        if (!isLoaded) return;
        const key = isSignedIn ? `nanoqr_premium_${user.id}` : "nanoqr_premium";
        const isPaid = localStorage.getItem(key) === "true";

        // Migration logic for guest -> user
        const isGuestPaid = localStorage.getItem("nanoqr_premium") === "true";
        if (isGuestPaid && isSignedIn) {
            localStorage.setItem(`nanoqr_premium_${user.id}`, "true");
        }

        setIsPremiumUser(isPaid || isGuestPaid);
    }, [isLoaded, isSignedIn, user]);

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

        if (ext === 'png') {
            setShowInterstitial(true);
            return;
        }

        executeDownload(ext);
    };

    const executeDownload = (ext) => {
        if (ext === 'png') {
            qrCode.current.update({ width: 150, height: 150 });
            qrCode.current.download({ name: "nano-qr-basic", extension: "png" });
            setTimeout(() => {
                qrCode.current.update({ width: 350, height: 350 });
            }, 100);
        } else {
            qrCode.current.update({ width: 500, height: 500 });
            qrCode.current.download({ name: "nano-qr-pro", extension: ext });
            setTimeout(() => {
                qrCode.current.update({ width: 350, height: 350 });
            }, 100);
        }
    };

    const handleUpgrade = () => {
        const key = isSignedIn ? `nanoqr_premium_${user.id}` : "nanoqr_premium";
        localStorage.setItem(key, "true");
        setIsPremiumUser(true);
        setShowPremiumModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        executeDownload('svg');
    };

    // Render Account Section
    const accountSection = (
        <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-4">Account</div>
            <div className="px-2">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="w-full bg-white border border-gray-200 text-gray-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-800 truncate">{user?.firstName || 'User'}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                {isPremiumUser ? 'Premium Pro' : 'Free Plan'}
                            </span>
                        </div>
                    </div>
                </SignedIn>
            </div>
        </div>
    );

    return (
        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
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

                {/* --- Left Sidebar --- */}
                <Sidebar logo={BRAND_LOGO} account={accountSection} />

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
                            slotId="8191010157"
                            width="728px"
                            height="90px"
                            className="mx-auto bg-gray-200/50 border-gray-300"
                            label="Top Banner Ad (728x90)"
                        />
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 ring-1 ring-white/60 backdrop-blur-sm relative group transition-all duration-500 hover:shadow-3xl hover:shadow-blue-900/10">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 blur-3xl rounded-full -z-10 group-hover:bg-gradient-to-tr group-hover:from-blue-200/40 group-hover:to-purple-200/40 transition-colors"></div>

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

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <AdUnit slotId="1644212868" height="250px" label="Sidebar Ad" />
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
        </PayPalScriptProvider>
    );
}
