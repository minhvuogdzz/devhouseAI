import React, { useState } from 'react';
import { generateContent } from '../../services/geminiService';

const ActionButton = ({ onClick, label, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    // Thêm whitespace-nowrap để chữ không bị ngắt dòng xấu xí
    className="px-3 py-2 lg:px-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:scale-105 active:scale-95 whitespace-nowrap flex-grow lg:flex-grow-0"
  >
    {label}
  </button>
);

const ResultBox = ({ content, onCopy, placeholder }) => (
  <div className="space-y-2 group h-full flex flex-col">
    <div className="flex-1 min-h-[120px] bg-slate-950/50 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap transition-colors group-hover:border-sky-500/30">
      {content || <span className="text-slate-600 italic text-xs lg:text-sm">{placeholder || "Kết quả sẽ hiện ở đây..."}</span>}
    </div>
    <button 
      onClick={() => onCopy(content)}
      className="text-xs text-sky-400 font-semibold hover:text-sky-300 cursor-pointer flex items-center gap-1 transition-colors self-end p-2"
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

  const handleGenerate = async (type, promptText, setOutput) => {
    if (!promptText.trim()) return;
    
    setLoading(true);
    setOutput("Dev House AI đang suy nghĩ...");
    
    try {
      const text = await generateContent(promptText);
      setOutput(text);
    } catch (error) {
      setOutput("Có lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      // Mẹo nhỏ: Giữ trạng thái loading thêm 2 giây để người dùng không bấm liên tục được
      setTimeout(() => {
        setLoading(false);
      }, 2000); 
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
    const finalPrompt = `Ngữ cảnh: Tôi là nhân viên công ty phần mềm Dev House Group. Yêu cầu: ${customPrompt}`;
    handleGenerate('custom', finalPrompt, setCustomResult);
  };

  const handleCopy = (text) => {
    if (!text || text.includes("Dev House AI đang") || text.includes("Chọn một") || text.includes("Kết quả sẽ")) return;
    navigator.clipboard.writeText(text);
    onShowToast();
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-6 lg:mt-12 bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-8 mb-20 shadow-2xl">
      {/* Header - Responsive Flex */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3 text-white">
            <span className="text-2xl animate-pulse">✨</span> 
            Trung tâm Sáng tạo AI
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm mt-1 ml-9">Sử dụng Dev House AI chatbot để tạo nội dung</p>
        </div>
        
        {loading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-sky-500/10 rounded-full border border-sky-500/20 w-full lg:w-auto justify-center">
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent"></div>
             <span className="text-sm font-semibold text-sky-400">Dev House AI đang viết...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-10">
        
        {/* Cột 1 */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">💌</div>
            <h3 className="font-bold text-slate-200">Lời chúc Cá nhân hóa</h3>
          </div>
          {/* Flex wrap để nút tự xuống dòng trên mobile */}
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

      {/* Sáng tạo tự do */}
      <div className="border-t border-white/10 pt-6 mt-6 lg:pt-8 lg:mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">✍️</div>
          <h3 className="font-bold text-slate-200">Sáng tạo tự do</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-fit sticky top-4 space-y-3">
                <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Nhập yêu cầu...(VD: Thơ chúc tết sếp...)"
                    className="w-full h-[100px] lg:h-[120px] bg-slate-950 p-4 rounded-xl border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-slate-300 text-sm transition-all resize-none"
                    disabled={loading}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleCustomSubmit}
                        disabled={loading || !customPrompt.trim()}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full lg:w-auto justify-center"
                    >
                        <span>Gửi yêu cầu</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                </div>
            </div>

            <div className="md:col-span-1">
                <ResultBox content={customResult} onCopy={handleCopy} placeholder="Kết quả..." />
            </div>
        </div>
      </div>

    </div>
  );
};

export default AIToolbox;