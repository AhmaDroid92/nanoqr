import React, { useState } from 'react';

export const PropertySection = ({ title, children, defaultOpen = true }) => {
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

export const ColorPicker = ({ label, value, onChange }) => (
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
