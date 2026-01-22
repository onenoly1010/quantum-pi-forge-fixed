// Centralized SVG icons for consistency and performance
export function QuantumOrbitSVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={`${className} animate-spin-slow`} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="url(#quantum-gradient)" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="12" cy="12" r="5" stroke="url(#electron-gradient)" strokeWidth="1.5">
        <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="18" cy="12" r="1.5" fill="#FF6200">
        <animateTransform 
          attributeName="transform" 
          type="rotate" 
          from="0 12 12" 
          to="360 12 12" 
          dur="4s" 
          repeatCount="indefinite" 
        />
      </circle>
      <defs>
        <linearGradient id="quantum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6200" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="electron-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PiSymbolSVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M10 20h4M12 4v16m6-16H6a4 4 0 00-4 4v8a4 4 0 004 4h12a4 4 0 004-4V8a4 4 0 00-4-4z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StakingSVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function VRGlassesSVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17 8h1a4 4 0 110 8h-1M7 8h-1a4 4 0 100 8h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function TrophySVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 15a6 6 0 100-12 6 6 0 000 12z" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4M12 15v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function ClockSVG({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}