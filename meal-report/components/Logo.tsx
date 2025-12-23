import React from 'react';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
    const sizes = {
        small: { container: 'w-12 h-12', text: 'text-sm' },
        medium: { container: 'w-20 h-20', text: 'text-lg' },
        large: { container: 'w-32 h-32', text: 'text-2xl' }
    };

    const currentSize = sizes[size];

    return (
        <div className="flex items-center gap-4">
            <div className={`${currentSize.container} relative`}>
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Outer Circle - Forest Green */}
                    <circle cx="100" cy="100" r="95" fill="#2d5016" opacity="0.1" />
                    <circle cx="100" cy="100" r="85" fill="none" stroke="#2d5016" strokeWidth="3" />

                    {/* Tree Symbol */}
                    <g transform="translate(100, 100)">
                        {/* Tree Trunk */}
                        <rect x="-8" y="20" width="16" height="35" fill="#5d4037" rx="2" />

                        {/* Tree Layers - Pine Tree Style */}
                        <path d="M 0,-50 L -35,-15 L -25,-15 L -40,5 L -30,5 L -45,25 L 45,25 L 30,5 L 40,5 L 25,-15 L 35,-15 Z"
                            fill="#2d5016" />
                        <path d="M 0,-45 L -30,-15 L -20,-15 L -35,5 L -25,5 L -40,25 L 40,25 L 25,5 L 35,5 L 20,-15 L 30,-15 Z"
                            fill="#4a7c2c" opacity="0.8" />

                        {/* Highlight */}
                        <path d="M 0,-50 L -20,-25 L -10,-25 Z" fill="#6ba83e" opacity="0.6" />
                    </g>

                    {/* Decorative Elements */}
                    <circle cx="40" cy="60" r="3" fill="#4a7c2c" opacity="0.4" />
                    <circle cx="160" cy="80" r="2.5" fill="#4a7c2c" opacity="0.4" />
                    <circle cx="50" cy="140" r="2" fill="#4a7c2c" opacity="0.4" />
                    <circle cx="150" cy="130" r="3.5" fill="#4a7c2c" opacity="0.4" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <h1 className={`font-bold text-[#2d5016] ${currentSize.text} leading-tight`}>
                        FOREST EDGE
                    </h1>
                    <p className="text-[#4a7c2c] text-xs font-medium tracking-wide">
                        خدمات التموين والإعاشة
                    </p>
                </div>
            )}
        </div>
    );
};

export default Logo;
