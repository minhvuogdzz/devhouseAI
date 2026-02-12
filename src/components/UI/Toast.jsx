import React from 'react';

const Toast = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce font-semibold flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      Đã sao chép vào bộ nhớ đệm!
    </div>
  );
};

export default Toast;