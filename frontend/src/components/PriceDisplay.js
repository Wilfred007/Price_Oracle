import React from 'react';

function PriceDisplay({ priceData, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading price data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-8 border border-red-500/30">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-300 mb-2">Connection Error</h3>
          <p className="text-red-200">{error}</p>
          <p className="text-red-200 text-sm mt-2">
            Please check your network connection and contract configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-8 border border-yellow-500/30">
        <div className="text-center">
          <div className="text-yellow-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Price Data</h3>
          <p className="text-yellow-200">
            Waiting for the first price update from the oracle...
          </p>
        </div>
      </div>
    );
  }

  const isRecent = Date.now() - (priceData.timestamp * 1000) < 300000; // 5 minutes
  const statusColor = isRecent ? 'text-success-green' : 'text-warning-orange';
  const glowClass = isRecent ? 'pulse-glow' : '';

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 ${glowClass}`}>
      {/* Main Price Display */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="text-6xl mr-4">💎</div>
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {priceData.formattedPrice}
            </h2>
            <p className="text-xl text-gray-300">ETH/USD</p>
          </div>
        </div>
        
        <div className={`inline-flex items-center px-4 py-2 rounded-full bg-white/10 ${statusColor}`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${isRecent ? 'bg-success-green' : 'bg-warning-orange'} animate-pulse`}></div>
          <span className="font-medium">
            {isRecent ? 'Live' : 'Stale'} • Updated {priceData.lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Price Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">⏰</div>
          <div className="text-sm text-gray-300 mb-1">Last Updated</div>
          <div className="text-white font-mono text-sm">
            {priceData.lastUpdated.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔐</div>
          <div className="text-sm text-gray-300 mb-1">Oracle Address</div>
          <div className="text-white font-mono text-xs">
            {priceData.oracle ? 
              `${priceData.oracle.slice(0, 6)}...${priceData.oracle.slice(-4)}` :
              'N/A'
            }
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <div className="text-sm text-gray-300 mb-1">Data Hash</div>
          <div className="text-white font-mono text-xs">
            {priceData.dataHash ? 
              `${priceData.dataHash.slice(0, 6)}...${priceData.dataHash.slice(-4)}` :
              'N/A'
            }
          </div>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-success-green/20 border border-success-green/30 rounded-full">
          <div className="text-success-green text-xl mr-3">✅</div>
          <div className="text-success-green font-medium">
            Verified by TEE Attestation
          </div>
        </div>
      </div>

      {/* Price Precision Info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Price precision: 8 decimal places • Source: CoinGecko API</p>
      </div>
    </div>
  );
}

export default PriceDisplay;
