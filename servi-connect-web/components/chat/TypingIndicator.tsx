import React from 'react';

interface TypingIndicatorProps {
  names: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names }) => {
  if (names.length === 0) return null;

  const displayText = 
    names.length === 1 
      ? `${names[0]} est en train d'écrire`
      : names.length === 2 
      ? `${names[0]} et ${names[1]} écrivent`
      : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]} écrivent`;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <span className="text-xs font-medium">{displayText}</span>
    </div>
  );
};

export default TypingIndicator;
