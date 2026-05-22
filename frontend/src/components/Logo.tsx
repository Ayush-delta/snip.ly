import React from "react";

export default function Logo({ size = 20, fontSize = 15, className = "" }: { size?: number; fontSize?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-medium tracking-tight text-[#1a1a18] ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <rect 
          x="4" 
          y="4" 
          width="24" 
          height="24" 
          rx="6" 
          stroke="#185FA5" 
          strokeWidth="3" 
          fill="none" 
        />
        <path 
          d="M 10 22 L 21 11 M 15 11 L 21 11 L 21 17" 
          stroke="#185FA5" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
      </svg>
      <span style={{ fontSize }}>
        snip<span className="text-[#5a5a56] font-medium">.ly</span>
      </span>
    </div>
  );
}
