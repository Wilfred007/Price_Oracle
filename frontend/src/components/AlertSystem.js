import React from 'react';

function AlertSystem({ notifications, onClear }) {
  if (notifications.length === 0) {
    return null;
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'bg-success-green/20 border-success-green/30 text-success-green';
      case 'error': return 'bg-error-red/20 border-error-red/30 text-error-red';
      case 'warning': return 'bg-warning-orange/20 border-warning-orange/30 text-warning-orange';
      case 'info': return 'bg-oasis-blue/20 border-oasis-blue/30 text-oasis-blue';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Clear All Button */}
      {notifications.length > 1 && (
        <button
          onClick={onClear}
          className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-1 px-3 rounded-lg transition-colors duration-200 backdrop-blur-md border border-white/20"
        >
          Clear All ({notifications.length})
        </button>
      )}

      {/* Notifications */}
      {notifications.slice(-5).map((notification) => (
        <div
          key={notification.id}
          className={`${getAlertColor(notification.type)} backdrop-blur-md rounded-lg p-4 border shadow-lg animate-slide-in`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-xl flex-shrink-0">
              {getAlertIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium break-words">
                {notification.message}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            <button
              onClick={() => onClear(notification.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Notification Counter */}
      {notifications.length > 5 && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 text-center text-white text-sm">
          +{notifications.length - 5} more notifications
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AlertSystem;
