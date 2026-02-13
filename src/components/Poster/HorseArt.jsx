import React from 'react';

const HorseArt = () => {
  return (
    <div className='absolute right-[4%] lg:right-[8%] top-[3%] lg:top-1/2 lg:-translate-y-1/2 w-[45%] h-auto opacity-80 z-10 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)] pointer-events-none animate-pulse transition-all duration-500'>
      <img 
        src="/unnamed.png" 
        alt="Horse Art" 
        className='w-full h-auto animate-float-slow'
      />
    </div>
  );
};

export default HorseArt;