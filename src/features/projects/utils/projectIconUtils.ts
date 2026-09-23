import React from 'react';
import { 
    Folder, 
    Rocket, 
    Code, 
    Palette, 
    Terminal, 
    Zap, 
    Layers, 
    Globe, 
    Briefcase,
    type LucideIcon 
} from 'lucide-react';

export const PROJECT_ICONS_CONFIG = [
    { name: 'folder', label: 'Folder', icon: Folder },
    { name: 'rocket_launch', label: 'Rocket', icon: Rocket },
    { name: 'code', label: 'Code', icon: Code },
    { name: 'palette', label: 'Design', icon: Palette },
    { name: 'terminal', label: 'DevOps', icon: Terminal },
    { name: 'bolt', label: 'Sprint', icon: Zap },
    { name: 'layers', label: 'App', icon: Layers },
    { name: 'globe', label: 'Web', icon: Globe },
    { name: 'briefcase', label: 'Business', icon: Briefcase },
];

const ICON_MAP: Record<string, LucideIcon> = {
    folder: Folder,
    rocket_launch: Rocket,
    code: Code,
    palette: Palette,
    terminal: Terminal,
    bolt: Zap,
    layers: Layers,
    globe: Globe,
    briefcase: Briefcase,
};

export function getProjectIcon(iconName?: string | null): LucideIcon {
    if (!iconName) return Folder;
    return ICON_MAP[iconName.toLowerCase()] || Folder;
}
