import React from 'react';

// Orion constellation star positions (relative coordinates 0-100)
const orionStars = [
  // Betelgeuse (left shoulder)
  { x: 25, y: 20, size: 4, brightness: 1, name: 'Betelgeuse', color: 'rgb(255, 180, 130)' },
  // Bellatrix (right shoulder)
  { x: 75, y: 22, size: 3.5, brightness: 0.9, name: 'Bellatrix', color: 'rgb(180, 200, 255)' },
  // Meissa (head)
  { x: 50, y: 8, size: 2.5, brightness: 0.7, name: 'Meissa', color: 'rgb(200, 220, 255)' },
  // Alnitak (left belt)
  { x: 40, y: 45, size: 3, brightness: 0.95, name: 'Alnitak', color: 'rgb(180, 200, 255)' },
  // Alnilam (center belt)
  { x: 50, y: 47, size: 3.2, brightness: 1, name: 'Alnilam', color: 'rgb(180, 200, 255)' },
  // Mintaka (right belt)
  { x: 60, y: 45, size: 2.8, brightness: 0.85, name: 'Mintaka', color: 'rgb(180, 200, 255)' },
  // Saiph (left foot)
  { x: 30, y: 82, size: 3, brightness: 0.8, name: 'Saiph', color: 'rgb(180, 200, 255)' },
  // Rigel (right foot)
  { x: 70, y: 85, size: 4, brightness: 1, name: 'Rigel', color: 'rgb(180, 220, 255)' },
  // Sword stars
  { x: 48, y: 55, size: 1.5, brightness: 0.5, name: 'Sword1', color: 'rgb(255, 180, 200)' },
  { x: 50, y: 60, size: 2, brightness: 0.6, name: 'OrionNebula', color: 'rgb(255, 150, 200)' },
  { x: 52, y: 65, size: 1.5, brightness: 0.5, name: 'Sword3', color: 'rgb(200, 180, 255)' },
];

// Connection lines for the constellation
const orionLines = [
  // Head to shoulders
  [2, 0], [2, 1],
  // Shoulders to belt
  [0, 3], [1, 5],
  // Belt connections
  [3, 4], [4, 5],
  // Belt to feet
  [3, 6], [5, 7],
  // Sword
  [4, 8], [8, 9], [9, 10],
];

interface OrionConstellationProps {
  className?: string;
}

const OrionConstellation: React.FC<OrionConstellationProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full opacity-80"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Glow filters for stars */}
          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="bigStarGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(147, 112, 219)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="rgb(100, 180, 255)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(147, 112, 219)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Constellation lines */}
        {orionLines.map(([startIdx, endIdx], index) => (
          <line
            key={`line-${index}`}
            x1={orionStars[startIdx].x}
            y1={orionStars[startIdx].y}
            x2={orionStars[endIdx].x}
            y2={orionStars[endIdx].y}
            stroke="url(#lineGradient)"
            strokeWidth="0.15"
            className="animate-pulse"
            style={{ animationDelay: `${index * 0.2}s` }}
          />
        ))}

        {/* Stars */}
        {orionStars.map((star, index) => (
          <g key={`star-${index}`}>
            {/* Outer glow */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 1.5}
              fill={star.color}
              opacity={star.brightness * 0.2}
              filter="url(#bigStarGlow)"
            />
            {/* Main star */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 0.5}
              fill={star.color}
              opacity={star.brightness}
              filter="url(#starGlow)"
              className="animate-twinkle"
              style={{ 
                animationDelay: `${index * 0.3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
            {/* Core */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 0.2}
              fill="white"
              opacity={star.brightness}
            />
          </g>
        ))}

        {/* Orion Nebula special effect */}
        <ellipse
          cx={50}
          cy={60}
          rx={4}
          ry={6}
          fill="url(#nebulaGradient)"
          opacity={0.4}
          className="animate-pulse"
        />
        <defs>
          <radialGradient id="nebulaGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(255, 100, 150)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="rgb(180, 100, 255)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(100, 150, 255)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default OrionConstellation;
