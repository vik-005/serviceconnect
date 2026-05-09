'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Legend
} from 'recharts';

interface OverviewChartProps {
  data: any[];
  title: string;
  description?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-4 rounded-2xl shadow-2xl border border-border outline outline-4 outline-card/50">
        <p className="text-sm font-black text-card-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                {entry.name}: <span className="text-card-foreground">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const OverviewChart: React.FC<OverviewChartProps> = ({ data, title, description }) => {
  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 space-y-4 md:space-y-0">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-card-foreground tracking-tight leading-none">{title}</h3>
          {description && <p className="text-sm text-muted-foreground font-medium tracking-tight">{description}</p>}
        </div>
        <div className="flex bg-muted p-1.5 rounded-2xl">
          <button className="px-4 py-2 bg-card shadow-sm rounded-xl text-xs font-black text-primary uppercase tracking-wider transition-all">Semaine</button>
          <button className="px-4 py-2 hover:bg-muted rounded-xl text-xs font-black text-muted-foreground uppercase tracking-wider transition-all">Mois</button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--muted-foreground)' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--muted-foreground)' }} 
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 2 }} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ top: -40, right: 0 }}
              formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{value}</span>}
            />
            <Area 
              type="monotone" 
              name="Croissance"
              dataKey="value" 
              stroke="var(--primary)" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorArea)" 
              animationDuration={1500}
            />
            <Bar 
              name="Volume"
              dataKey="value" 
              fill="var(--secondary)" 
              radius={[6, 6, 0, 0]} 
              barSize={20} 
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverviewChart;
