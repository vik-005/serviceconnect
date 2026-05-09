'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: {
    value: number;
    isUp: boolean;
    label: string;
  };
  sparklineData: { value: number }[];
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const AnalyticCard: React.FC<AnalyticCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  sparklineData,
  color = 'blue' 
}) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', fill: '#2563eb', stroke: '#3b82f6' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', fill: '#10b981', stroke: '#059669' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', fill: '#f59e0b', stroke: '#d97706' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', fill: '#8b5cf6', stroke: '#7c3aed' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', fill: '#ef4444', stroke: '#dc2626' },
  };

  const theme = colorMap[color];

  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group overflow-hidden relative">
      {/* Background Decor */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${theme.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
      
      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-4 rounded-2xl ${theme.bg} ${theme.text} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black ${
            trend.isUp ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend.value}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-card-foreground tracking-tight">{value}</h3>
        </div>

        <div className="mt-6 flex items-end justify-between h-12">
          <div className="flex-1 h-full max-w-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.fill} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.fill} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme.stroke} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill={`url(#gradient-${color})`} 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground text-right leading-tight max-w-[80px]">
            {trend.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticCard;
