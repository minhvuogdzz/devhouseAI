import React, { useState, useRef, useEffect } from 'react';
import { sendChatToGemini } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css'; // File CSS bắt buộc để toán học không bị vỡ font

const AIToolbox = ({ onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const initialMessage = { role: 'model', text: 'Chào bạn, tôi là AI của Dev House. Tôi có thể giúp gì cho bạn? Bạn có thể yêu cầu tôi viết code hoặc giải toán!' };
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
        if (textareaRef.current) textareaRef.current.style.height = '46px';
    }
  };

  const handleChatSubmit = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    if (textareaRef.current) textareaRef.current.style.height = '46px';

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiHistory = newMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', 
        parts: [{ text: msg.text }]
      }));

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
                title="Xóa lịch sử và bắt đầu lại"
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
                        
                        {/* TRÌNH RENDER MARKDOWN & LATEX TÍCH HỢP */}
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
            <div className="relative flex items-end gap-2 bg-slate-900 border border-white/10 rounded-3xl p-2 pr-4 shadow-lg focus-within:border-sky-500/50 transition-colors">
                <textarea 
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi bất cứ điều gì (Viết hàm Python, Giải phương trình bậc 2...)"
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