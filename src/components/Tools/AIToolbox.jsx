import React, { useState, useRef, useEffect } from 'react';
import { sendChatToGemini } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

const AIToolbox = ({ onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  
  // STATE MỚI: Xử lý file đính kèm
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const initialMessage = { role: 'model', text: 'Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn ?' };
  const [messages, setMessages] = useState([initialMessage]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => { 
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleResetChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện và bắt đầu lại không?")) {
        setMessages([initialMessage]);
        setInputMessage("");
        setAttachment(null);
        if (textareaRef.current) textareaRef.current.style.height = '46px';
    }
  };

  // --- HÀM MỚI: Xử lý chọn ảnh ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn 5MB để tránh lag trình duyệt và vượt API limit
    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh dưới 5MB để đảm bảo tốc độ nhé!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        file: file,
        base64: reader.result, // Chuỗi Base64 để gửi cho Google
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file) // Link ảo để hiện UI cho nhanh
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input để có thể chọn lại cùng 1 file
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleChatSubmit = async () => {
    // Chỉ gửi khi có chữ HOẶC có ảnh
    if ((!inputMessage.trim() && !attachment) || loading) return;

    const userText = inputMessage.trim() || "Hãy phân tích hình ảnh này cho tôi.";
    const currentAttachment = attachment; // Lưu tạm để UI không bị mất ảnh khi đang load

    setInputMessage("");
    setAttachment(null); // Xóa UI đính kèm ngay lập tức
    if (textareaRef.current) textareaRef.current.style.height = '46px';

    // Đẩy tin nhắn vào UI
    const newMessages = [...messages, { role: 'user', text: userText, attachment: currentAttachment }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build lịch sử gửi API có kẹp Base64 ảnh
      const apiHistory = newMessages.map(msg => {
        const parts = [];
        
        // Nếu tin nhắn có ảnh, nhét nó vào format inlineData của Gemini
        if (msg.attachment && msg.attachment.base64) {
          const base64Data = msg.attachment.base64.split(',')[1]; // Cắt bỏ đoạn 'data:image/png;base64,'
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: msg.attachment.mimeType
            }
          });
        }
        
        // Luôn luôn push text vào
        parts.push({ text: msg.text });

        return {
          role: msg.role === 'model' ? 'model' : 'user', 
          parts: parts
        };
      });

      const aiResponseText = await sendChatToGemini(apiHistory);
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3 text-white">
            <span className="text-2xl animate-pulse">🤖</span> Trung tâm Sáng tạo AI 🧠
          </h2>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">💬</div>
                <h3 className="font-bold text-slate-200">Devhouse Chatbot</h3>
            </div>
            
            <button 
                onClick={handleResetChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-all border border-slate-700"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Chat mới
            </button>
        </div>

        <div className="bg-slate-950/50 rounded-2xl border border-white/10 p-4 h-[500px] overflow-y-auto custom-scrollbar mb-4 flex flex-col gap-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-sky-600 text-white rounded-br-none whitespace-pre-wrap' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/10'
                    }`}>
                        
                        {/* HIỂN THỊ ẢNH ĐÍNH KÈM TRONG LỊCH SỬ CHAT */}
                        {msg.attachment && (
                            <img 
                              src={msg.attachment.previewUrl || msg.attachment.base64} 
                              alt="Đính kèm" 
                              className="max-w-full rounded-xl mb-3 border border-white/20 shadow-lg object-cover" 
                              style={{ maxHeight: '250px' }} 
                            />
                        )}

                        {/* TRÌNH RENDER MARKDOWN & LATEX */}
                        {msg.role === 'model' ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const lang = match ? match[1] : '';
                                        const isHtmlCss = lang === 'html' || lang === 'css';
                                        
                                        return !inline && match ? (
                                            <div className="relative rounded-lg overflow-hidden my-4 border border-white/20 shadow-lg">
                                                <div className={`px-4 py-2 flex justify-between items-center text-xs font-mono border-b ${isHtmlCss ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-[#1e1e1e] text-slate-400 border-white/10'}`}>
                                                    <span>{lang}</span>
                                                    <button onClick={() => handleCopy(String(children))} className="hover:text-sky-400 transition-colors">
                                                        Copy code
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    {...props}
                                                    children={String(children).replace(/\n$/, '')}
                                                    style={isHtmlCss ? oneLight : vscDarkPlus}
                                                    language={lang}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1rem', background: isHtmlCss ? '#f8fafc' : '#1e1e1e' }}
                                                />
                                            </div>
                                        ) : (
                                            <code {...props} className="bg-slate-900/50 text-sky-300 px-1.5 py-0.5 rounded text-[13px] font-mono border border-white/5">
                                                {children}
                                            </code>
                                        )
                                    },
                                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-sky-300" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-white" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-white" {...props} />,
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}

                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="relative w-full group">
            {/* THÊM MỚI: Input ẩn để chọn file */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/webp, image/heic" 
              className="hidden" 
            />

            <div className="relative flex flex-col bg-slate-900 border border-white/10 rounded-3xl p-2 shadow-lg focus-within:border-sky-500/50 transition-colors">
                
                {/* HIỂN THỊ PREVIEW ẢNH NẰM TRONG KHUNG NHẬP CHỮ */}
                {attachment && (
                  <div className="relative w-20 h-20 ml-3 mt-2 mb-2 group/preview">
                    <img 
                      src={attachment.previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-xl border border-sky-500/50 shadow-md"
                    />
                    <button 
                      onClick={handleRemoveAttachment}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 w-full pr-2">
                    {/* NÚT ĐÍNH KÈM (Kẹp ghim) */}
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={loading}
                        className="mb-1 p-2.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                        title="Đính kèm hình ảnh"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    </button>

                    <textarea 
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={handleInputResize}
                        onKeyDown={handleKeyDown}
                        placeholder={attachment ? "Nhập yêu cầu cho bức ảnh này..." : "Hỏi bất cứ điều gì (Gửi ảnh, viết code, giải toán...)"}
                        className="w-full max-h-[150px] bg-transparent text-slate-200 text-sm p-3 focus:outline-none resize-none overflow-y-auto custom-scrollbar"
                        style={{ height: '46px' }}
                        disabled={loading}
                    />

                    {/* NÚT GỬI */}
                    <button 
                        onClick={handleChatSubmit}
                        disabled={loading || (!inputMessage.trim() && !attachment)}
                        className={`mb-1 p-2.5 rounded-full transition-all flex-shrink-0 ${(inputMessage.trim() || attachment) ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-slate-800 text-slate-500'}`}
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolbox;