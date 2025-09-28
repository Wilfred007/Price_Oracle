import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function PriceChart({ priceHistory }) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">📈 Price History</h3>
        <div className="text-center text-gray-300 py-8">
          <div className="text-4xl mb-2">📊</div>
          <p>No price history available yet.</p>
          <p className="text-sm mt-2">Chart will appear after a few price updates.</p>
        </div>
      </div>
    );
  }

  // Calculate price change
  const firstPrice = priceHistory[0]?.price || 0;
  const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
  
  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? 'text-success-green' : 'text-error-red';
  const changeIcon = isPositive ? '📈' : '📉';

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <p className="text-white font-medium">${payload[0].value.toFixed(2)}</p>
          <p className="text-gray-300 text-sm">{data.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">📈 Price History</h3>
        
        <div className={`flex items-center space-x-2 ${changeColor}`}>
          <span className="text-lg">{changeIcon}</span>
          <span className="font-medium">
            {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
              domain={['dataMin - 10', 'dataMax + 10']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#22C55E" 
              strokeWidth={2}
              dot={{ fill: '#22C55E', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#22C55E', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-300">Data Points</div>
          <div className="text-white font-medium">{priceHistory.length}</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-300">Min Price</div>
          <div className="text-white font-medium">
            ${Math.min(...priceHistory.map(p => p.price)).toFixed(2)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-300">Max Price</div>
          <div className="text-white font-medium">
            ${Math.max(...priceHistory.map(p => p.price)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceChart;
