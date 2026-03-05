import React, { useState, useRef, useEffect } from 'react';
import { sendChatToGemini } from '../../services/geminiService';
import { createNewChat, updateChat, getChatDetail } from '../../services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

const AIToolbox = ({ currentUser, currentChatId, setCurrentChatId, onChatUpdated, onShowToast, resetTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // ==========================================
  // BỘ KHÓA CHỐNG ĐẺ NHIỀU LỊCH SỬ (RACE CONDITION)
  // ==========================================
  const chatIdRef = useRef(currentChatId);
  const isCreatingNewRef = useRef(false);
  const createChatPromiseRef = useRef(null); // Ổ khóa lưu trạng thái tạo phòng

  // Mỏ neo ID theo thời gian thực
  useEffect(() => {
    chatIdRef.current = currentChatId;
  }, [currentChatId]);

  // STATE: Quản lý ghi âm
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // STATE: Ref cho Tách riêng Image và Doc
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const initialMessage = { role: 'model', text: 'Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn ?' };
  const [messages, setMessages] = useState([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => { 
    if (messages.length > 1) scrollToBottom();
  }, [messages]);

  // CÀI ĐẶT BỘ NHẬN DIỆN GIỌNG NÓI
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Lỗi Micro:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // KHI BẤM "ĐOẠN CHAT MỚI"
  useEffect(() => {
    if (!currentChatId) {
      setMessages([initialMessage]);
      setLoading(false); 
      setInputMessage("");
      setAttachment(null);
      createChatPromiseRef.current = null; // Bắt buộc mở khóa khi tạo chat mới
    }
  }, [currentChatId, resetTrigger]);

  // KHI CLICK VÀO LỊCH SỬ CŨ BÊN SIDEBAR
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChatId) {
        if (isCreatingNewRef.current) {
            isCreatingNewRef.current = false;
            return;
        }
        setLoading(true);
        try {
          const oldMessages = await getChatDetail(currentChatId);
          if (oldMessages) setMessages(oldMessages);
        } catch (error) {
          console.error("Lỗi tải tin nhắn từ Database:", error);
        } finally {
          setLoading(false); 
        }
      }
    };
    fetchMessages();
  }, [currentChatId]);

  // HÀM BẬT/TẮT GHI ÂM
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge.");
      }
    }
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn file dưới 5MB để đảm bảo tốc độ nhé!");
      return;
    }
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        file: file, name: file.name, base64: reader.result, mimeType: file.type, isImage: isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : null
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('pdf') !== -1) {
        processFile(items[i].getAsFile());
        e.preventDefault();
        break;
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // ==========================================
  // HÀM SUBMIT TIN NHẮN ĐÃ TỐI ƯU CỰC MẠNH
  // ==========================================
  const handleChatSubmit = async () => {
    if ((!inputMessage.trim() && !attachment) || loading) return;

    const userText = inputMessage.trim() || (attachment?.isImage ? "Hãy phân tích hình ảnh này." : "Hãy phân tích tài liệu này.");
    const currentAttachment = attachment; 

    setInputMessage("");
    setAttachment(null); 
    if (textareaRef.current) textareaRef.current.style.height = '46px';
    
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }

    const newMessages = [...messages, { role: 'user', text: userText, attachment: currentAttachment }];
    setMessages(newMessages);
    setLoading(true); // Khóa màn hình để đợi AI

    try {
      const apiHistory = newMessages.map(msg => {
        const parts = [];
        if (msg.attachment && msg.attachment.base64) {
          parts.push({ inlineData: { data: msg.attachment.base64.split(',')[1], mimeType: msg.attachment.mimeType } });
        }
        parts.push({ text: msg.text });
        return { role: msg.role === 'model' ? 'model' : 'user', parts: parts };
      });

      // BƯỚC 1: LẤY CÂU TRẢ LỜI TỪ AI
      const aiResponseText = await sendChatToGemini(apiHistory);
      const finalMessages = [...newMessages, { role: 'model', text: aiResponseText }];
      setMessages(finalMessages);
      
      // Mở khóa màn hình cho user chat tiếp ngay lập tức
      setLoading(false); 

      // BƯỚC 2: LƯU FIREBASE (VỚI Ổ KHÓA THÔNG MINH)
      (async () => {
        try {
          if (!chatIdRef.current) {
            
            // Nếu chưa ai tạo phòng -> Đứng ra tạo phòng và chốt ổ khóa
            if (!createChatPromiseRef.current) {
              isCreatingNewRef.current = true; 
              
              // Giữ Promise tạo phòng vào ổ khóa
              createChatPromiseRef.current = createNewChat(currentUser.uid, userText, finalMessages);
              const newChat = await createChatPromiseRef.current;
              
              chatIdRef.current = newChat.id;
              setCurrentChatId(newChat.id); 
            } 
            // Nếu phòng đang được tạo dở mà user nhắn thêm câu 2
            else {
              const newChat = await createChatPromiseRef.current; // Chờ phòng tạo xong
              await updateChat(newChat.id, finalMessages); // Nhét chung vào phòng đó
            }

          } else {
            // Đã có phòng từ trước -> Cứ thế update vào
            await updateChat(chatIdRef.current, finalMessages);
          }
        } catch (dbError) {
          console.error("Lỗi Database Firebase:", dbError);
        }
      })();

    } catch (error) {
      console.error("Lỗi gọi Gemini:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Lỗi phản hồi từ AI, vui lòng thử lại." }]);
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

  return (
    <div className="w-full mt-4 lg:mt-8 bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6 mb-10 shadow-2xl flex flex-col flex-1 min-h-[500px]">
      
      <div className="bg-slate-950/50 rounded-2xl border border-white/10 p-4 flex-1 overflow-y-auto custom-scrollbar mb-4 flex flex-col gap-4">
          {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-br-none whitespace-pre-wrap' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/10'
                  }`}>
                      
                      {msg.attachment && (
                          <div className="mb-3">
                              {msg.attachment.isImage ? (
                                  <img src={msg.attachment.previewUrl || msg.attachment.base64} alt="Đính kèm" className="max-w-full rounded-xl border border-white/20 shadow-lg object-cover" style={{ maxHeight: '250px' }} />
                              ) : (
                                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
                                      <span className="text-sm font-medium">{msg.attachment.name}</span>
                                  </div>
                              )}
                          </div>
                      )}

                      {msg.role === 'model' ? (
                          <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                  code({node, inline, className, children, ...props}) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const lang = match ? match[1] : '';
                                      return !inline && match ? (
                                          <div className="relative rounded-lg overflow-hidden my-4 border border-white/20 shadow-lg">
                                              <div className="px-4 py-2 flex justify-between items-center text-xs font-mono border-b bg-[#1e1e1e] text-slate-400 border-white/10">
                                                  <span>{lang}</span>
                                                  <button onClick={() => {navigator.clipboard.writeText(String(children)); onShowToast();}} className="hover:text-sky-400">Copy code</button>
                                              </div>
                                              <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} style={vscDarkPlus} language={lang} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }} />
                                          </div>
                                      ) : (
                                          <code {...props} className="bg-slate-900/50 text-sky-300 px-1.5 py-0.5 rounded text-[13px] font-mono border border-white/5">{children}</code>
                                      )
                                  },
                                  p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-white" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-white" {...props} />,
                              }}
                          >
                              {msg.text}
                          </ReactMarkdown>
                      ) : ( msg.text )}
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

      <div 
          className={`relative w-full group rounded-3xl transition-all duration-300 ${isDragging ? 'ring-2 ring-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]' : ''}`}
          onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
          onDragLeave={(e) => {e.preventDefault(); setIsDragging(false);}}
          onDrop={handleDrop}
      >
          {/* Tách lại 2 Input cho 2 nút (Ảnh và File) */}
          <input type="file" ref={imageInputRef} onChange={(e) => {processFile(e.target.files[0]); e.target.value='';}} accept="image/*" className="hidden" />
          <input type="file" ref={docInputRef} onChange={(e) => {processFile(e.target.files[0]); e.target.value='';}} accept=".pdf,.txt,.csv,.json" className="hidden" />

          {isDragging && (
              <div className="absolute inset-0 z-50 bg-slate-900/90 rounded-3xl flex items-center justify-center border-2 border-dashed border-sky-400">
                  <p className="text-sky-400 font-bold text-lg animate-pulse">Thả file vào đây...</p>
              </div>
          )}

          <div className="relative flex flex-col bg-slate-900 border border-white/10 rounded-3xl p-2 shadow-lg focus-within:border-sky-500/50 transition-colors">
              {attachment && (
                <div className="relative inline-flex items-center gap-3 bg-slate-800 p-2 pr-8 rounded-xl border border-sky-500/50 shadow-md ml-3 mt-2 mb-2 max-w-fit">
                  {attachment.isImage ? (
                      <img src={attachment.previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md border border-white/10" />
                  ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-md text-sky-400">📎</div>
                  )}
                  <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{attachment.name || "Tệp đính kèm"}</span>
                  <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">×</button>
                </div>
              )}

              <div className="flex items-end gap-1 lg:gap-2 w-full pr-2">
                  
                  {/* BỘ 3 NÚT: ẢNH - FILE - MICRO */}
                  <div className="flex mb-1 ml-1">
                      <button onClick={() => imageInputRef.current.click()} disabled={loading} className="p-2.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-full transition-colors flex-shrink-0" title="Tải lên hình ảnh">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </button>

                      <button onClick={() => docInputRef.current.click()} disabled={loading} className="p-2.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-full transition-colors flex-shrink-0" title="Tải lên tài liệu (PDF, TXT...)">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      </button>

                      <button onClick={toggleRecording} disabled={loading} className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${isRecording ? 'text-red-500 bg-red-500/20 animate-pulse' : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'}`} title={isRecording ? "Đang thu âm... (Bấm để dừng)" : "Nhập bằng giọng nói"}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                      </button>
                  </div>

                  <textarea 
                      ref={textareaRef} value={inputMessage} onChange={handleInputResize} onKeyDown={handleKeyDown} onPaste={handlePaste}
                      placeholder={isRecording ? "Đang nghe..." : "Hỏi bất cứ điều gì..."}
                      className="w-full max-h-[150px] bg-transparent text-slate-200 text-sm p-3 focus:outline-none resize-none overflow-y-auto custom-scrollbar"
                      style={{ height: '46px' }} disabled={loading}
                  />

                  {/* NÚT GỬI */}
                  <button onClick={handleChatSubmit} disabled={loading || (!inputMessage.trim() && !attachment)} className={`mb-1 p-2.5 rounded-full transition-all flex-shrink-0 ${(inputMessage.trim() || attachment) ? 'bg-sky-500 text-white hover:bg-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                      <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AIToolbox;