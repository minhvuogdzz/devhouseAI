import React from 'react';

const HorseArt = () => {
  return (
    <svg 
      className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[450px] h-auto opacity-60 z-10 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] pointer-events-none" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M4 18L7 11L10 6L14 4L18 5L20 8L18 12L14 13L16 17L12 18L10 20L4 18Z" stroke="#38bdf8" strokeWidth="0.5" strokeLinejoin="round"/>
        <path d="M10 6C10 6 9 3 12 2C15 1 18 4 18 4" stroke="#38bdf8" strokeWidth="0.5"/>
        <path d="M18 5L22 4" stroke="#38bdf8" strokeWidth="0.5"/>
        <path d="M7 11L2 10" stroke="#38bdf8" strokeWidth="0.5"/>
        <path d="M14 13C14 13 16 11 19 11C22 11 23 13 23 13" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5"/>
        <circle cx="15.5" cy="6.5" r="0.5" fill="#7dd3fc"/>
        <circle cx="10" cy="11" r="1.5" fill="#38bdf8" opacity="0.4"/>
        <circle cx="14" cy="9" r="1" fill="#38bdf8" opacity="0.4"/>
    </svg>
  );
};

export default HorseArt;