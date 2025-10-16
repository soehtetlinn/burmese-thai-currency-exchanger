import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryEntry } from '../types';

interface HistoryChartProps {
  history: HistoryEntry[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-surface rounded-2xl border border-brand-border">
        <p className="text-brand-text-secondary text-lg">No historical data available to display a chart.</p>
      </div>
    );
  }
  
  const chartData = history
    .map(entry => ({
      date: new Date(entry.id).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      'Sell Rate (<1M)': entry.sellingRates.below1M_MMK,
      'Buy Rate (Base)': entry.buyingRates.base,
    }))
    .reverse(); // Show oldest first

  return (
    <div className="w-full bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 h-96">
      <h2 className="text-3xl font-bold mb-6">Rate History</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={chartData}
          margin={{
            top: 5, right: 20, left: -10, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }} 
            labelStyle={{ color: '#f1f5f9' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ color: '#f1f5f9' }} />
          <Line type="monotone" dataKey="Sell Rate (<1M)" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Buy Rate (Base)" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};