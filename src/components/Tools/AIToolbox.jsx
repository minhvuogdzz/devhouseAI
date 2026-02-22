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
  
  // STATE MỚI: Xử lý Kéo thả và File
  const [attachment, setAttachment] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // Trạng thái kéo thả
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const initialMessage = { role: 'model', text: 'Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn?' };
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

  // --- HÀM XỬ LÝ FILE DÙNG CHUNG (Cho cả Chọn, Kéo thả, Dán) ---
  const processFile = (file) => {
    if (!file) return;

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn file dưới 5MB để đảm bảo tốc độ nhé!");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onloadend = () => {
      setAttachment({
        file: file,
        name: file.name,
        base64: reader.result,
        mimeType: file.type,
        isImage: isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : null
      });
    };
    reader.readAsDataURL(file);
  };

  // Các handler khi bấm nút chọn file
  const handleImageChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = ''; 
  };

  const handleDocChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = ''; 
  };

  // --- XỬ LÝ DÁN (PASTE) ---
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('pdf') !== -1) {
        const file = items[i].getAsFile();
        processFile(file);
        e.preventDefault(); // Ngăn hành vi dán text linh tinh nếu paste ảnh
        break; // Chỉ lấy file đầu tiên
      }
    }
  };

  // --- XỬ LÝ KÉO THẢ (DRAG & DROP) ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleChatSubmit = async () => {
    if ((!inputMessage.trim() && !attachment) || loading) return;

    const userText = inputMessage.trim() || (attachment?.isImage ? "Hãy phân tích hình ảnh này." : "Hãy phân tích tài liệu này.");
    const currentAttachment = attachment; 

    setInputMessage("");
    setAttachment(null); 
    if (textareaRef.current) textareaRef.current.style.height = '46px';

    const newMessages = [...messages, { role: 'user', text: userText, attachment: currentAttachment }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiHistory = newMessages.map(msg => {
        const parts = [];
        if (msg.attachment && msg.attachment.base64) {
          const base64Data = msg.attachment.base64.split(',')[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: msg.attachment.mimeType
            }
          });
        }
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
                        
                        {/* HIỂN THỊ FILE TRONG LỊCH SỬ CHAT */}
                        {msg.attachment && (
                            <div className="mb-3">
                                {msg.attachment.isImage ? (
                                    <img 
                                        src={msg.attachment.previewUrl || msg.attachment.base64} 
                                        alt="Đính kèm" 
                                        className="max-w-full rounded-xl border border-white/20 shadow-lg object-cover" 
                                        style={{ maxHeight: '250px' }} 
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
                                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                                        <span className="text-sm font-medium">{msg.attachment.name}</span>
                                    </div>
                                )}
                            </div>
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

        {/* KHUNG NHẬP LIỆU (Bao gồm vùng Drop zone) */}
        <div 
            className={`relative w-full group rounded-3xl transition-all duration-300 ${isDragging ? 'ring-2 ring-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* 2 Input ẩn để chọn file */}
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <input type="file" ref={docInputRef} onChange={handleDocChange} accept=".pdf,.txt,.csv,.json" className="hidden" />

            {/* Thông báo Kéo thả mờ mờ khi đang kéo file */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 rounded-3xl flex items-center justify-center border-2 border-dashed border-sky-400">
                    <p className="text-sky-400 font-bold text-lg animate-pulse">Thả file vào đây...</p>
                </div>
            )}

            <div className="relative flex flex-col bg-slate-900 border border-white/10 rounded-3xl p-2 shadow-lg focus-within:border-sky-500/50 transition-colors">
                
                {/* HIỂN THỊ PREVIEW KHI ĐÃ ĐÍNH KÈM */}
                {attachment && (
                  <div className="relative inline-flex items-center gap-3 bg-slate-800 p-2 pr-8 rounded-xl border border-sky-500/50 shadow-md ml-3 mt-2 mb-2 max-w-fit">
                    {attachment.isImage ? (
                        <img src={attachment.previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md border border-white/10" />
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-md text-red-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                        </div>
                    )}
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{attachment.name || "Tệp đính kèm"}</span>
                    <button 
                      onClick={handleRemoveAttachment}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 w-full pr-2">
                    {/* KHU VỰC CÁC NÚT ĐÍNH KÈM */}
                    <div className="flex mb-1 ml-1">
                        {/* Nút đính kèm Hình Ảnh */}
                        <button 
                            onClick={() => imageInputRef.current.click()}
                            disabled={loading}
                            className="p-2.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                            title="Tải lên hình ảnh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </button>

                        {/* Nút đính kèm File / Tài liệu */}
                        <button 
                            onClick={() => docInputRef.current.click()}
                            disabled={loading}
                            className="p-2.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                            title="Tải lên tài liệu (PDF, TXT...)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>
                    </div>

                    <textarea 
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={handleInputResize}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste} // Lắng nghe sự kiện Dán
                        placeholder="Hỏi bất cứ điều gì..."
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