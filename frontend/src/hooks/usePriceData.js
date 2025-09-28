import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export function usePriceData(contract) {
  const [priceData, setPriceData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLatestPrice = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError(null);

      // Get latest price data
      const [price, timestamp] = await contract.getLatestPrice();
      const fullPriceData = await contract.getLatestPriceData();
      
      const priceValue = parseFloat(ethers.formatUnits(price, 8));
      const timestampValue = Number(timestamp);
      
      const newPriceData = {
        price: priceValue,
        timestamp: timestampValue,
        oracle: fullPriceData[2],
        dataHash: fullPriceData[3],
        lastUpdated: new Date(timestampValue * 1000),
        formattedPrice: `$${priceValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      };

      setPriceData(newPriceData);

      // Add to price history (keep last 50 entries)
      setPriceHistory(prev => {
        const updated = [...prev, {
          price: priceValue,
          timestamp: timestampValue,
          time: new Date(timestampValue * 1000).toLocaleTimeString()
        }].slice(-50);
        return updated;
      });

    } catch (err) {
      console.error('Error fetching price data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Initial fetch
  useEffect(() => {
    fetchLatestPrice();
  }, [fetchLatestPrice]);

  // Set up periodic updates
  useEffect(() => {
    if (!contract) return;

    const updateInterval = parseInt(process.env.REACT_APP_UPDATE_INTERVAL) || 30000;
    const interval = setInterval(fetchLatestPrice, updateInterval);

    return () => clearInterval(interval);
  }, [contract, fetchLatestPrice]);

  // Listen for price update events
  useEffect(() => {
    if (!contract) return;

    const handlePriceUpdate = (price, timestamp, oracle, appId) => {
      console.log('Price update event received:', {
        price: ethers.formatUnits(price, 8),
        timestamp: Number(timestamp),
        oracle,
        appId
      });
      
      // Refresh price data when event is received
      setTimeout(fetchLatestPrice, 1000); // Small delay to ensure data is available
    };

    contract.on('PriceUpdated', handlePriceUpdate);

    return () => {
      contract.off('PriceUpdated', handlePriceUpdate);
    };
  }, [contract, fetchLatestPrice]);

  return {
    priceData,
    priceHistory,
    loading,
    error,
    refetch: fetchLatestPrice
  };
}
