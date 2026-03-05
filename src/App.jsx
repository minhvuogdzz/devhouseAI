import React, { useState, useEffect } from 'react';
import Poster from './components/Poster/Poster';
import AIToolbox from './components/Tools/AIToolbox';
import Toast from './components/UI/Toast';
import Login from './components/Auth/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getUserChats } from './services/chatService';

const MainApp = () => {
  const { currentUser, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  
  // Quản lý trạng thái mở/đóng Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Xử lý Responsive: Tự động đóng/mở sidebar dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // Mobile: Mặc định đóng
      } else {
        setIsSidebarOpen(true);  // PC: Mặc định mở
      }
    };
    
    handleResize(); // Chạy ngay khi load lần đầu
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadChats = async () => {
    if (currentUser) {
      try {
        const userChats = await getUserChats(currentUser.uid);
        setChats(userChats);
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    }
  };

  useEffect(() => {
    loadChats();
  }, [currentUser]);

  const handleChatUpdated = (optimisticData) => {
    if (optimisticData) {
      setChats(prev => {
        let updatedChats = [...prev];
        const index = updatedChats.findIndex(c => c.id === optimisticData.id);
        
        if (index > -1) {
          const [item] = updatedChats.splice(index, 1);
          item.updatedAt = Date.now();
          updatedChats.unshift(item);
        } else if (optimisticData.title) {
          updatedChats.unshift({
            id: optimisticData.id,
            title: optimisticData.title,
            updatedAt: Date.now()
          });
        }
        return updatedChats;
      });
    }
    loadChats();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setResetTrigger(prev => prev + 1);
    // Tự đóng sidebar trên mobile khi bấm tạo chat mới
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    // Tự đóng sidebar trên mobile khi chọn xong chat
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden relative">
      
      {/* LỚP PHỦ ĐEN (Chỉ hiện trên Mobile khi Sidebar mở) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR TRÁI */}
      <div 
        className={`
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} 
          absolute md:relative z-50 h-full 
          transition-all duration-300 ease-in-out
          bg-slate-900 border-r border-white/10 flex flex-col shrink-0 overflow-hidden
        `}
      >
        <div className="p-4 flex justify-center items-center whitespace-nowrap border-b border-white/10">
          <button 
            onClick={handleNewChat} 
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-sky-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Đoạn chat mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-2">Lịch sử của bạn</p>
          {chats.map(chat => (
            <button 
              key={chat.id} 
              onClick={() => handleSelectChat(chat.id)} 
              className={`w-full text-left px-3 py-3 rounded-xl text-sm truncate transition-all ${
                currentChatId === chat.id 
                ? 'bg-slate-800 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              💬 {chat.title}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900/50 whitespace-nowrap">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <img src={currentUser.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-700 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-200 truncate">{currentUser.displayName}</span>
              <span className="text-[10px] text-sky-400">Dev House Member</span>
            </div>
          </div>
          <button onClick={logout} title="Đăng xuất" className="text-slate-500 hover:text-red-400 bg-slate-800 p-2 rounded-lg transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>

      {/* CONTENT CHÍNH */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative custom-scrollbar">
        <div className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-md p-4 flex items-center border-b border-white/10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-slate-400 hover:text-white mr-4 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 className="font-bold text-lg flex items-center gap-2">
             <img src="/logo.png" className="w-6 h-6" alt="logo"/> Dev House AI
          </h1>
        </div>

        <div className="p-4 lg:p-8 mx-auto w-full max-w-[1442px] flex-1 flex flex-col">
          {!currentChatId && <Poster />}
          
          <AIToolbox 
            currentUser={currentUser}
            currentChatId={currentChatId}
            setCurrentChatId={setCurrentChatId}
            onChatUpdated={handleChatUpdated}
            onShowToast={triggerToast} 
            resetTrigger={resetTrigger}
          />
        </div>
      </div>
      <Toast show={showToast} />
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();
  return currentUser ? <MainApp /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;