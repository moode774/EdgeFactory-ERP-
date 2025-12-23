import React from 'react';
import { Layers, Settings, Minus, Wrench, Droplet, Box } from 'lucide-react';

export const getCategoryIcon = (iconName: string, size: number = 20) => {
    const icons: { [key: string]: React.ReactNode } = {
        'layers': <Layers size={size} />,
        'settings': <Settings size={size} />,
        'minus': <Minus size={size} />,
        'tool': <Wrench size={size} />,
        'droplet': <Droplet size={size} />,
        'box': <Box size={size} />,
    };
    return icons[iconName] || <Box size={size} />;
};
