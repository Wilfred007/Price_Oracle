import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ThresholdConfig({ contract, onUpdate }) {
  const [thresholds, setThresholds] = useState({
    upperBound: '',
    lowerBound: '',
    enabled: false
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch current thresholds
  useEffect(() => {
    const fetchThresholds = async () => {
      if (!contract) return;

      try {
        setLoading(true);
        const currentThresholds = await contract.getThresholds();
        
        setThresholds({
          upperBound: ethers.formatUnits(currentThresholds.upperBound, 8),
          lowerBound: ethers.formatUnits(currentThresholds.lowerBound, 8),
          enabled: currentThresholds.enabled
        });
      } catch (error) {
        console.error('Error fetching thresholds:', error);
        onUpdate('Failed to fetch current thresholds', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchThresholds();
  }, [contract, onUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract) {
      onUpdate('Contract not available', 'error');
      return;
    }

    if (!thresholds.upperBound || !thresholds.lowerBound) {
      onUpdate('Please enter both upper and lower bounds', 'error');
      return;
    }

    const upperBound = parseFloat(thresholds.upperBound);
    const lowerBound = parseFloat(thresholds.lowerBound);

    if (upperBound <= lowerBound) {
      onUpdate('Upper bound must be greater than lower bound', 'error');
      return;
    }

    try {
      setUpdating(true);
      
      // Get contract with signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Convert to contract format (8 decimals)
      const upperBoundWei = ethers.parseUnits(upperBound.toString(), 8);
      const lowerBoundWei = ethers.parseUnits(lowerBound.toString(), 8);

      // Submit transaction
      const tx = await contractWithSigner.setThresholds(
        upperBoundWei,
        lowerBoundWei,
        thresholds.enabled
      );

      onUpdate('Transaction submitted. Waiting for confirmation...', 'info');

      // Wait for confirmation
      await tx.wait();
      
      onUpdate(
        `Thresholds updated successfully! Upper: $${upperBound}, Lower: $${lowerBound}`,
        'success'
      );

    } catch (error) {
      console.error('Error updating thresholds:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        onUpdate('Transaction rejected by user', 'error');
      } else if (error.message.includes('OwnableUnauthorizedAccount')) {
        onUpdate('Only contract owner can update thresholds', 'error');
      } else {
        onUpdate(`Failed to update thresholds: ${error.message}`, 'error');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setThresholds(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-white">Loading thresholds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        ⚙️ Threshold Configuration
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upper Bound */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upper Bound ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={thresholds.upperBound}
            onChange={(e) => handleInputChange('upperBound', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oasis-blue"
            placeholder="e.g., 3000"
            disabled={updating}
          />
        </div>

        {/* Lower Bound */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lower Bound ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={thresholds.lowerBound}
            onChange={(e) => handleInputChange('lowerBound', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oasis-blue"
            placeholder="e.g., 1500"
            disabled={updating}
          />
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="enableThresholds"
            checked={thresholds.enabled}
            onChange={(e) => handleInputChange('enabled', e.target.checked)}
            className="w-4 h-4 text-oasis-blue bg-white/10 border-white/20 rounded focus:ring-oasis-blue"
            disabled={updating}
          />
          <label htmlFor="enableThresholds" className="text-sm text-gray-300">
            Enable threshold alerts
          </label>
        </div>

        {/* Current Values Display */}
        {(thresholds.upperBound || thresholds.lowerBound) && (
          <div className="bg-white/5 rounded-lg p-3 text-sm">
            <div className="text-gray-300 mb-2">Current Settings:</div>
            <div className="space-y-1 text-white">
              <div>Upper: ${thresholds.upperBound || 'Not set'}</div>
              <div>Lower: ${thresholds.lowerBound || 'Not set'}</div>
              <div>Status: {thresholds.enabled ? '✅ Enabled' : '❌ Disabled'}</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={updating || !thresholds.upperBound || !thresholds.lowerBound}
          className="w-full bg-oasis-blue hover:bg-oasis-purple disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            'Update Thresholds'
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-400">
        <p>💡 Tip: Set thresholds to receive alerts when ETH price moves outside your target range.</p>
      </div>
    </div>
  );
}

export default ThresholdConfig;
