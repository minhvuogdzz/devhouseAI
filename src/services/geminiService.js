const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export const generateContent = async (prompt) => {
  if (!API_KEY) {
    return "Lỗi: Chưa cấu hình API Key trong file .env (hoặc trên Vercel).";
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{ text: "Bạn là trợ lý truyền thông của Dev House Group. Văn phong: Chuyên nghiệp, Công nghệ, Hào hứng, có không khí Tết." }]
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // --- KHU VỰC BẮT LỖI MỚI ---
    if (!response.ok) {
      // Lỗi 429: Bấm nhiều quá
      if (response.status === 429) {
        return "⚠️ AI đang quá tải do nhiều người dùng! Vui lòng đợi 30 giây rồi thử lại.";
      }
      // Lỗi 503: Server Google sập tạm thời
      if (response.status === 503) {
        return "😓 Server Google đang bảo trì. Hãy thử lại sau vài phút.";
      }
      // Các lỗi khác
      throw new Error(`API Error: ${response.status}`);
    }
    // ---------------------------

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Có lỗi kết nối. Vui lòng kiểm tra mạng hoặc thử lại sau.";
  }
};