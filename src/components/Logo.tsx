
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
      <path
        d="M20 50 L30 20 L50 30 L70 20 L80 50 L50 80 Z"
        fill="none"
        stroke="#0C9D6A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 30 L50 80"
        fill="none"
        stroke="#0C9D6A"
        strokeWidth="2"
      />
      <circle cx="30" cy="20" r="5" fill="#0C9D6A" />
      <circle cx="50" cy="30" r="5" fill="#0C9D6A" />
      <circle cx="70" cy="20" r="5" fill="#E62F29" />
      <circle cx="20" cy="50" r="5" fill="#0C9D6A" />
      <circle cx="80" cy="50" r="5" fill="#0C9D6A" />
      <circle cx="50" cy="80" r="5" fill="#0C9D6A" />
    </svg>
  );
};

export default Logo;
