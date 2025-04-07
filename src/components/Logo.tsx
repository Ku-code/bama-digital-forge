
import React from "react";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = "default" }) => {
  const strokeColor = variant === "light" ? "#ffffff" : "#0C9D6A";
  const redCircleColor = "#E62F29";
  
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 50 L30 20 L50 30 L70 20 L80 50 L50 80 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 30 L50 80"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <circle cx="30" cy="20" r="5" fill={strokeColor} />
      <circle cx="50" cy="30" r="5" fill={strokeColor} />
      <circle cx="70" cy="20" r="5" fill={redCircleColor} />
      <circle cx="20" cy="50" r="5" fill={strokeColor} />
      <circle cx="80" cy="50" r="5" fill={strokeColor} />
      <circle cx="50" cy="80" r="5" fill={strokeColor} />
    </svg>
  );
};

export default Logo;
