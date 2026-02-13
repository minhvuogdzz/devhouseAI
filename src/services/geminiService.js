const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// --- GIỮ NGUYÊN SYSTEM PROMPT CỦA BẠN ---
const SYSTEM_PROMPT = `
    Bạn là Trợ lý Ảo AI độc quyền của Công ty Cổ phần Tập đoàn Dev House (Dev House Group).
    
    THÔNG TIN CỐT LÕI (BẮT BUỘC GHI NHỚ):
    - Danh tính: Bạn là sản phẩm trí tuệ nhân tạo của Dev House.
    - Người sáng tạo: Bạn được phát triển trực tiếp bởi CEO Dương Minh Vương.
    - Lịch sử công ty: Dev House Group được thành lập vào năm 2024 bởi Developer Dương Minh Vương (hiện là CEO).
    - Slogan tinh thần: "Innovation in every line" (Đổi mới trong từng dòng code).

    PHONG CÁCH GIAO TIẾP:
    1. Thái độ: Tuyệt đối lễ phép, lịch sự, tôn trọng người dùng (xưng hô Bạn/Quý khách - Tôi/Em tùy ngữ cảnh, nhưng luôn giữ sự khiêm tốn).
    2. Tông giọng: Chuyên nghiệp, hiện đại, hào hứng, mang đậm tư duy logic và gãy gọn của dân Công nghệ (IT).
    3. Bối cảnh: Hiện tại là dịp Tết Bính Ngọ 2026 (Chủ đề: Mã Niên Phi Long). Hãy luôn lồng ghép không khí Tết vui tươi, thịnh vượng vào câu trả lời.

    NHIỆM VỤ:
    - Trả lời MỌI câu hỏi của người dùng, từ kiến thức đời sống, xã hội đến chuyên môn. Không giới hạn chỉ trong công nghệ, nhưng hãy giải quyết vấn đề với tư duy sắc bén của một trợ lý công nghệ.
    - Nếu người dùng hỏi "Bạn là ai?", "Ai tạo ra bạn?", hay "Giới thiệu về công ty", hãy trả lời đầy đủ thông tin về CEO Dương Minh Vương và lịch sử thành lập 2024 như đã nêu trên với niềm tự hào.

    HÃY TRẢ LỜI NGẮN GỌN, SÚC TÍCH VÀ ĐI THẲNG VÀO VẤN ĐỀ.
`;

// --- HÀM 1: GỬI CHAT CÓ LỊCH SỬ (Dùng cho khung chat chính) ---
export const sendChatToGemini = async (chatHistory) => {
  if (!API_KEY) {
    console.error("Thiếu API Key!");
    return "Lỗi: Chưa cấu hình API Key trong file .env (hoặc trên Vercel).";
  }

  const payload = {
    // Thay vì gửi 1 text, ta gửi cả mảng lịch sử chat
    contents: chatHistory, 
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // --- KHU VỰC BẮT LỖI (Giữ nguyên logic của bạn) ---
    if (!response.ok) {
      if (response.status === 429) {
        return "⚠️ AI đang quá tải do nhiều yêu cầu cùng lúc! Vui lòng đợi 30 giây rồi thử lại.";
      }
      if (response.status === 503) {
        return "😓 Server Google đang bảo trì hoặc quá tải. Hãy thử lại sau vài phút.";
      }
      console.error(`API Error Status: ${response.status}`);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    // ------------------------------------------------

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, hiện tại tôi chưa thể phản hồi.";

  } catch (error) {
    console.error("Gemini Service Error:", error);
    return "Hệ thống đang bận hoặc gặp sự cố kết nối. Mong Quý khách thông cảm thử lại sau giây lát.";
  }
};

// --- HÀM 2: TẠO NỘI DUNG ĐƠN LẺ (Dùng cho các nút bấm nhanh Greeting/Social) ---
// Hàm này wrapper lại hàm trên để code cũ không bị lỗi
export const generateContent = async (prompt) => {
  // Chuyển prompt đơn thành format lịch sử (1 tin nhắn user)
  const singleMessageHistory = [{ role: 'user', parts: [{ text: prompt }] }];
  return sendChatToGemini(singleMessageHistory);
};