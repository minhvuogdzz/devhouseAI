import React, { useState, useRef, useEffect } from 'react';
// Import cả 2 hàm (lưu ý hàm generateContent vẫn dùng cho các nút bấm bên trên)
import { generateContent, sendChatToGemini } from '../../services/geminiService';

// ... (Giữ nguyên ActionButton và ResultBox cũ cho phần trên) ...
const ActionButton = ({ onClick, label, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="px-3 py-2 lg:px-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs transition-all text-white disabled:opacity-50 font-medium hover:scale-105 active:scale-95 whitespace-nowrap flex-grow lg:flex-grow-0">{label}</button>
);

const ResultBox = ({ content, onCopy, placeholder }) => (
  <div className="space-y-2 group h-full flex flex-col">
    <div className="flex-1 min-h-[120px] bg-slate-950/50 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap transition-colors group-hover:border-sky-500/30">
      {content || <span className="text-slate-600 italic text-xs lg:text-sm">{placeholder || "Kết quả sẽ hiện ở đây..."}</span>}
    </div>
    <button onClick={() => onCopy(content)} className="text-xs text-sky-400 font-semibold hover:text-sky-300 cursor-pointer flex items-center gap-1 self-end p-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Sao chép
    </button>
  </div>
);

const AIToolbox = ({ onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [greetingResult, setGreetingResult] = useState("");
  const [socialResult, setSocialResult] = useState("");
  
  // --- STATE MỚI CHO CHAT HISTORY ---
  const [inputMessage, setInputMessage] = useState("");
  const initialMessage = { role: 'model', text: 'Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn?' };
  const [messages, setMessages] = useState([initialMessage]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom() }, [messages]);

  // Xử lý các nút bấm nhanh (Dùng hàm cũ generateContent - Không lưu lịch sử chat này)
  const handlePresetClick = async (type, detail, setOutput) => {
    setLoading(true);
    setOutput("Đang viết...");
    const prompt = type === 'greeting' 
        ? `Viết lời chúc Tết 2026 cho ${detail}. Ngắn gọn, lịch sự.`
        : `Viết status ${detail} thông báo nghỉ Tết Dev House.`;
    
    try {
      const text = await generateContent(prompt);
      setOutput(text);
    } catch (e) { setOutput("Lỗi kết nối."); }
    finally { setLoading(false); }
  };

  // --- HÀM RESET CHAT MỚI ---
  const handleResetChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện và bắt đầu lại không?")) {
        setMessages([initialMessage]);
        setInputMessage("");
        if (textareaRef.current) textareaRef.current.style.height = '46px';
    }
  };

  // --- XỬ LÝ CHAT THÔNG MINH (CÓ NHỚ) ---
  const handleChatSubmit = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage(""); // Xóa ô nhập ngay lập tức
    if (textareaRef.current) textareaRef.current.style.height = '46px';

    // 1. Cập nhật giao diện: Thêm tin nhắn của User vào list ngay
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // 2. Chuẩn bị dữ liệu gửi cho Google (Format đúng chuẩn API yêu cầu)
      const apiHistory = newMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', 
        parts: [{ text: msg.text }]
      }));

      // 3. Gọi API với toàn bộ lịch sử
      const aiResponseText = await sendChatToGemini(apiHistory);

      // 4. Cập nhật giao diện: Thêm tin nhắn của AI vào list
      setMessages(prev => [...prev, { role: 'model', text: aiResponseText }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Có lỗi kết nối, vui lòng thử lại." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleInputResize = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
    setInputMessage(target.value);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    onShowToast();
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-6 lg:mt-12 bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-8 mb-20 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3 text-white">
            <span className="text-2xl animate-pulse">🤖</span> Trung tâm Sáng tạo AI 🧠
          </h2>
        </div>
      </div>

      {/* Phần Tool nhanh (Greeting/Social) - Giữ nguyên */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-10 border-b border-white/10 pb-10">
        <div className="space-y-4 flex flex-col">
          <h3 className="font-bold text-slate-200 flex gap-2">💌 Lời chúc nhanh</h3>
          <div className="flex flex-wrap gap-2">
            <ActionButton disabled={loading} label="Khách hàng VIP" onClick={() => handlePresetClick('greeting', 'Khách VIP', setGreetingResult)} />
            <ActionButton disabled={loading} label="Nhân viên" onClick={() => handlePresetClick('greeting', 'Nhân viên', setGreetingResult)} />
          </div>
          <ResultBox content={greetingResult} onCopy={handleCopy} placeholder="Lời chúc sẽ hiện ở đây..." />
        </div>
        <div className="space-y-4 flex flex-col">
          <h3 className="font-bold text-slate-200 flex gap-2">📣 Post Social</h3>
           <div className="flex flex-wrap gap-2">
            <ActionButton disabled={loading} label="Facebook" onClick={() => handlePresetClick('social', 'Facebook', setSocialResult)} />
            <ActionButton disabled={loading} label="Email" onClick={() => handlePresetClick('social', 'Email', setSocialResult)} />
          </div>
          <ResultBox content={socialResult} onCopy={handleCopy} placeholder="Nội dung post sẽ hiện ở đây..." />
        </div>
      </div>

      {/* --- PHẦN CHAT HISTORY MỚI --- */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">💬</div>
                <h3 className="font-bold text-slate-200">Devhouse Chatbot</h3>
            </div>
            
            {/* NÚT RESET CHAT MỚI */}
            <button 
                onClick={handleResetChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-all border border-slate-700"
                title="Xóa lịch sử và bắt đầu lại"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Chat mới
            </button>
        </div>

        {/* Khung hiển thị tin nhắn (Chat Window) */}
        <div className="bg-slate-950/50 rounded-2xl border border-white/10 p-4 h-[400px] overflow-y-auto custom-scrollbar mb-4 flex flex-col gap-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-sky-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/10'
                    }`}>
                        {msg.text}
                        {/* Nút copy nhỏ cho mỗi tin nhắn AI */}
                        {msg.role === 'model' && (
                            <button onClick={() => handleCopy(msg.text)} className="block mt-2 text-[10px] text-slate-400 hover:text-white underline opacity-50 hover:opacity-100 transition-opacity">Copy</button>
                        )}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Thanh nhập liệu (Input Bar) */}
        <div className="relative w-full group">
            <div className="relative flex items-end gap-2 bg-slate-900 border border-white/10 rounded-3xl p-2 pr-4 shadow-lg focus-within:border-sky-500/50 transition-colors">
                <textarea 
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi bất cứ điều gì..."
                    className="w-full max-h-[150px] bg-transparent text-slate-200 text-sm p-3 focus:outline-none resize-none overflow-y-auto custom-scrollbar"
                    style={{ height: '46px' }}
                    disabled={loading}
                />
                <button 
                    onClick={handleChatSubmit}
                    disabled={loading || !inputMessage.trim()}
                    className={`mb-1 p-2 rounded-full transition-all flex-shrink-0 ${inputMessage.trim() ? 'bg-sky-500 text-white hover:bg-sky-400' : 'bg-slate-800 text-slate-500'}`}
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolbox;