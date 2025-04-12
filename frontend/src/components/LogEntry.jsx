import React from 'react';
import { Link } from 'react-router-dom';

const LogEntry = ({ log }) => {
  return (
    <div 
      className={`log-entry ${
        log.action === 'create'
          ? 'log-entry-create'
          : log.action === 'update'
          ? 'log-entry-update'
          : 'log-entry-delete'
      }`}
    >
      <div className="flex justify-between items-start flex-wrap gap-2">
        <span className="text-sm text-secondary">
          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        <span className={`log-badge ${
          log.action === 'create'
            ? 'log-badge-create'
            : log.action === 'update'
            ? 'log-badge-update'
            : 'log-badge-delete'
          }`}
        >
          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
        </span>
      </div>
      
      {/* Render differently based on log type */}
      {log.logType === 'reminder' ? (
        <p className="font-medium mt-1">
          {log.details}
        </p>
      ) : (
        <p className="font-medium mt-1">
          <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} item{' '}
          {log.action !== 'delete' ? (
            <Link 
              to={`/items/edit/${log.itemId}`}
              className="text-blue-500 hover:underline font-bold"
            >
              {log.itemName}
            </Link>
          ) : (
            <span className="font-bold">{log.itemName}</span>
          )} {log.itemId && `(${log.itemId})`}
        </p>
      )}
      
      {/* Only show additional details for non-reminder logs */}
      {log.logType !== 'reminder' && log.changes && Object.keys(log.changes).length > 0 && (
        <div className="mt-2 pl-2 border-l-2 border-gray-300">
          {Object.entries(log.changes).map(([field, change]) => (
            <p key={field} className="text-sm text-secondary">
              <span className="font-medium capitalize">{field}:</span> {
                change.from !== undefined ? 
                  `${change.from} → ${change.to}` : 
                (change.added ? 
                  `Added: "${change.added}"` : 
                  change.removed ? 
                    `Removed: "${change.removed}"` : 
                    ''
                )
              }
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogEntry;