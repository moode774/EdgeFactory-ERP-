import React from 'react';

const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-stone-100/80 hover:shadow-md transition-all duration-300 hover:border-stone-200">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                {React.cloneElement(icon, { className: color.replace('bg-', 'text-'), size: 22 })}
            </div>
        </div>
        <h3 className="text-stone-500 text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-stone-800 tracking-tight">{value}</p>
    </div>
);

export default StatCard;
