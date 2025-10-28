import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryEntry } from '../types';

interface HistoryChartProps {
  history: HistoryEntry[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="card glass-card text-center">
        <div className="card-body py-5">
          <i className="bi bi-graph-up fs-1 text-muted d-block mb-3"></i>
          <p className="text-muted fs-5 mb-0">No historical data available to display a chart.</p>
        </div>
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
    <div className="card glass-card" style={{ height: '400px' }}>
      <div className="card-header border-0">
        <h2 className="fw-bold fs-2 mb-0">
          <i className="bi bi-graph-up-arrow text-accent me-2"></i>
          Rate History
        </h2>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height="100%">
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
            <Line type="monotone" dataKey="Sell Rate (<1M)" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Buy Rate (Base)" stroke="#22d3ee" strokeWidth={3} activeDot={{ r: 8 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};