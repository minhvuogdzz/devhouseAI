import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  
  // Trạng thái: Đang ở màn Đăng nhập (true) hay Đăng ký (false)?
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Trạng thái Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý khi bấm nút Submit (Đăng nhập / Đăng ký)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // Gọi hàm Đăng nhập
        await loginWithEmail(email, password);
      } else {
        // Gọi hàm Đăng ký
        if (!name.trim()) throw new Error("Vui lòng nhập Tên hiển thị!");
        if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự!");
        await registerWithEmail(email, password, name);
      }
    } catch (err) {
      // Dịch các lỗi của Firebase sang Tiếng Việt cho thân thiện
      let errorMsg = "Có lỗi xảy ra, vui lòng thử lại!";
      if (err.code === 'auth/email-already-in-use') errorMsg = 'Email này đã được sử dụng!';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') errorMsg = 'Email hoặc mật khẩu không đúng!';
      if (err.code === 'auth/user-not-found') errorMsg = 'Tài khoản không tồn tại!';
      if (err.message) errorMsg = err.code ? errorMsg : err.message;
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nút Đăng nhập Google
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError('Lỗi đăng nhập Google. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
        <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-slate-800 border border-sky-500/50 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] mb-4 p-2">
            <img src="/logo.png" alt="Dev House" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Dev House AI</h1>
            <p className="text-sm text-slate-400">{isLoginMode ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản để trải nghiệm AI.'}</p>
        </div>

        {/* Hiển thị Lỗi (nếu có) */}
        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {error}
            </div>
        )}

        {/* FORM ĐIỀN THÔNG TIN */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {!isLoginMode && (
                <div>
                    <input 
                        type="text" 
                        placeholder="Tên hiển thị" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                        required={!isLoginMode}
                    />
                </div>
            )}
            <div>
                <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    required
                />
            </div>
            <div>
                <input 
                    type="password" 
                    placeholder="Mật khẩu (Ít nhất 6 ký tự)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    required
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50"
            >
                {loading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng nhập' : 'Đăng ký ngay')}
            </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs text-slate-500 font-medium uppercase">Hoặc</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Tiếp tục với Google
        </button>
        
        <div className="text-center">
            <button 
                onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError(''); // Reset lỗi khi chuyển mode
                }} 
                className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium underline-offset-4 hover:underline"
            >
                {isLoginMode ? 'Chưa có tài khoản? Đăng ký tại đây' : 'Đã có tài khoản? Đăng nhập ngay'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;