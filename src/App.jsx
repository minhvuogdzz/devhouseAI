import React, { useState } from 'react';
import Poster from './components/Poster/Poster';
import AIToolbox from './components/Tools/AIToolbox';
import Toast from './components/UI/Toast';

function App() {
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans flex flex-col items-center py-6 px-4 lg:py-10">
      <Poster />
      <AIToolbox onShowToast={triggerToast} />
      <Toast show={showToast} />
      
      <p className="text-slate-600 text-[10px] lg:text-xs mt-auto text-center">
         2026 Dev House Group Inc - All Rights Reserved
      </p>
    </div>
  );
}

export default App;