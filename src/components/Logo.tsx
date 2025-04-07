
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="3" />
      <path
        d="M30 30 L50 20 L70 30 L70 60 L50 80 L30 60 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 20 L50 80"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      <path
        d="M30 30 L70 30"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
      />
      <path
        d="M30 60 L70 60"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
      />
      <circle cx="50" cy="20" r="3" fill="url(#logoGradient)" />
      <circle cx="30" cy="30" r="3" fill="url(#logoGradient)" />
      <circle cx="70" cy="30" r="3" fill="url(#logoGradient)" />
      <circle cx="30" cy="60" r="3" fill="url(#logoGradient)" />
      <circle cx="70" cy="60" r="3" fill="url(#logoGradient)" />
      <circle cx="50" cy="80" r="3" fill="url(#logoGradient)" />
    </svg>
  );
};

export default Logo;
