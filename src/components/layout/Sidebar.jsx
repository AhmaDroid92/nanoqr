import React from 'react';
import { Home } from 'lucide-react';

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

const Sidebar = ({ logo, account }) => {
    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 flex flex-col p-6 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
            <div className="mb-10 pl-2">
                <img src={logo} alt="NanoQR" className="h-8 object-contain" />
            </div>

            {account}

            <div className="space-y-2 flex-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-4">Menu</div>
                <SidebarItem icon={Home} label="Generator" active={true} />
            </div>
        </aside>
    );
};

export default Sidebar;
