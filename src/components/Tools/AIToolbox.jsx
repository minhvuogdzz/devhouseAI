import React, { useState, useRef } from 'react';
import { generateContent } from '../../services/geminiService';

const ActionButton = ({ onClick, label, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-2 lg:px-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:scale-105 active:scale-95 whitespace-nowrap flex-grow lg:flex-grow-0"
  >
    {label}
  </button>
);

const ResultBox = ({ content, onCopy, placeholder, minHeight = "120px" }) => (
  <div className="space-y-2 group h-full flex flex-col">
    <div 
      className={`flex-1 min-h-[${minHeight}] bg-slate-950/50 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap transition-colors group-hover:border-sky-500/30 custom-scrollbar`}
    >
      {content || <span className="text-slate-600 italic text-xs lg:text-sm">{placeholder || "Kết quả sẽ hiện ở đây..."}</span>}
    </div>
    <button 
      onClick={() => onCopy(content)}
      className="text-xs text-sky-400 font-semibold hover:text-sky-300 cursor-pointer flex items-center gap-1 transition-colors self-end p-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      Sao chép
    </button>
  </div>
);

const AIToolbox = ({ onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [greetingResult, setGreetingResult] = useState("");
  const [socialResult, setSocialResult] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customResult, setCustomResult] = useState("");
  
  // Ref để điều khiển textarea
  const textareaRef = useRef(null);

  const handleGenerate = async (type, promptText, setOutput) => {
    if (!promptText.trim()) return;
    
    setLoading(true);
    // Nếu là chat tự do, xóa prompt sau khi gửi
    if (type === 'custom') setCustomPrompt(""); 

    // Hiển thị trạng thái đang suy nghĩ ở ô kết quả tương ứng
    setOutput("Dev House AI đang suy nghĩ...");
    
    try {
      const text = await generateContent(promptText);
      setOutput(text);
    } catch (error) {
      setOutput("Có lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (type, detail, setOutput) => {
    const announcementContext = "Thông báo nghỉ Tết Dev House: Nghỉ từ 14/02 (27 Tết) đến hết 23/02 (Mùng 7). Làm lại 24/02 (Mùng 8). Chủ đề năm: Mã Niên Phi Long.";
    let prompt = "";
    if (type === 'greeting') {
        prompt = `Đóng vai Copywriter công nghệ, viết 1 lời chúc Tết 2026 ngắn gọn (dưới 50 từ) cho đối tượng: ${detail}. Lồng ghép lịch nghỉ: 14/02 - 23/02. Tone: Chân thành, hiện đại.`;
    } else {
        prompt = `Viết nội dung đăng ${detail} dựa trên thông báo này: "${announcementContext}". Yêu cầu: Có emoji 🧧, hashtag #DevHouse #Tet2026, văn phong hào hứng.`;
    }
    handleGenerate(type, prompt, setOutput);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim() || loading) return;
    const finalPrompt = `Ngữ cảnh: Tôi là nhân viên công ty phần mềm Dev House Group. Yêu cầu: ${customPrompt}`;
    handleGenerate('custom', finalPrompt, setCustomResult);
    
    // Reset chiều cao textarea về ban đầu
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  // Xử lý phím Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng
      handleCustomSubmit();
    }
  };

  // Auto-resize textarea khi gõ
  const handleInputResize = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`; // Max height 150px
    setCustomPrompt(target.value);
  };

  const handleCopy = (text) => {
    if (!text || text.includes("Dev House AI đang") || text.includes("Chọn một") || text.includes("Kết quả sẽ")) return;
    navigator.clipboard.writeText(text);
    onShowToast();
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-6 lg:mt-12 bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-8 mb-20 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3 text-white">
            <span className="text-2xl animate-pulse">✨</span> 
            Trung tâm Sáng tạo AI
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm mt-1 ml-9">Sử dụng Dev House AI chatbot để tạo nội dung</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-10">
        
        {/* Cột 1 */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">💌</div>
            <h3 className="font-bold text-slate-200">Lời chúc Cá nhân hóa</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton disabled={loading} label="Khách hàng VIP" onClick={() => handlePresetClick('greeting', 'Khách hàng VIP lâu năm', setGreetingResult)} />
            <ActionButton disabled={loading} label="Đối tác chiến lược" onClick={() => handlePresetClick('greeting', 'Đối tác công nghệ chiến lược', setGreetingResult)} />
            <ActionButton disabled={loading} label="Nhân viên nội bộ" onClick={() => handlePresetClick('greeting', 'Toàn thể nhân viên công ty', setGreetingResult)} />
          </div>
          <ResultBox content={greetingResult} onCopy={handleCopy} placeholder="Chọn đối tượng để tạo lời chúc..." />
        </div>

        {/* Cột 2 */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">📣</div>
             <h3 className="font-bold text-slate-200">Mạng xã hội</h3>
          </div>
           <div className="flex flex-wrap gap-2">
            <ActionButton disabled={loading} label="Facebook Post" onClick={() => handlePresetClick('social', 'Facebook Fanpage', setSocialResult)} />
            <ActionButton disabled={loading} label="Tin nhắn Zalo" onClick={() => handlePresetClick('social', 'Zalo OA gửi khách hàng', setSocialResult)} />
            <ActionButton disabled={loading} label="Email trang trọng" onClick={() => handlePresetClick('social', 'Email thông báo chính thức', setSocialResult)} />
          </div>
          <ResultBox content={socialResult} onCopy={handleCopy} placeholder="Chọn nền tảng để tạo nội dung..." />
        </div>
      </div>

      {/* --- PHẦN GIAO DIỆN CHAT GEMINI MỚI --- */}
      <div className="border-t border-white/10 pt-6 mt-6 lg:pt-8 lg:mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">✍️</div>
          <h3 className="font-bold text-slate-200">Chat với DevHouse AI</h3>
        </div>

        <div className="flex flex-col gap-4">
            {/* Kết quả trả về (Giống màn hình chat) */}
            <div className="w-full">
                <ResultBox content={customResult} onCopy={handleCopy} placeholder="Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn hôm nay?" minHeight="80px"/>
            </div>

            {/* Thanh nhập liệu (Style giống Gemini/ChatGPT) */}
            <div className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-end gap-2 bg-slate-900 border border-white/10 rounded-3xl p-2 pr-4 shadow-lg focus-within:border-sky-500/50 transition-colors">
                    <textarea 
                        ref={textareaRef}
                        value={customPrompt}
                        onChange={handleInputResize}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập yêu cầu tại đây... (Shift+Enter để xuống dòng)"
                        className="w-full max-h-[150px] bg-transparent text-slate-200 text-sm p-3 focus:outline-none resize-none overflow-y-auto custom-scrollbar leading-relaxed"
                        style={{ height: '46px' }} // Chiều cao mặc định 1 dòng
                        disabled={loading}
                    />
                    
                    {/* Nút gửi */}
                    <button 
                        onClick={handleCustomSubmit}
                        disabled={loading || !customPrompt.trim()}
                        className={`mb-1 p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                            customPrompt.trim() && !loading 
                            ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.5)]' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">Dev House AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolbox;