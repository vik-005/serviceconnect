'use client';

import React from 'react';
import { Badge } from '../ui/Badge';
import { Activity, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'available' | 'busy' | 'inactive';
  showLabel?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showLabel = true }) => {
  const configs = {
    available: { color: 'text-green-500', bg: 'bg-green-500', label: 'Disponible', variant: 'success' },
    busy: { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Occupé', variant: 'warning' },
    inactive: { color: 'text-gray-400', bg: 'bg-gray-400', label: 'Hors ligne', variant: 'gray' },
  };

  const config = configs[status];

  return (
    <div className="flex items-center">
      <div className="relative flex h-3 w-3 mr-2">
        {status === 'available' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.status === 'inactive' ? 'bg-gray-400' : config.bg}`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// Fixed small typo in config reference for bg
const StatusBadgeCorrected: React.FC<StatusBadgeProps> = ({ status, showLabel = true }) => {
    const configs = {
      available: { color: 'text-green-600', bg: 'bg-green-500', label: 'Disponible' },
      busy: { color: 'text-orange-600', bg: 'bg-orange-500', label: 'Occupé' },
      inactive: { color: 'text-gray-400', bg: 'bg-gray-400', label: 'Absent' },
    };
  
    const config = configs[status];
  
    return (
      <div className="flex items-center">
        <div className="relative flex h-2.5 w-2.5 mr-2">
          {status === 'available' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.bg}`} />
        </div>
        {showLabel && (
          <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  };

export default StatusBadgeCorrected;
