import React from 'react';
import HorseArt from './HorseArt';

// DateCard: Trên mobile full width, trên PC rộng 400px
const DateCard = ({ title, date, note, colorClass, borderColor }) => (
  <div 
    className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 mb-4 w-full lg:w-[400px] rounded-r-2xl rounded-l-sm border-l-4 transition-transform hover:translate-x-2 duration-300"
    style={{ borderLeftColor: borderColor }}
  >
    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${colorClass}`}>{title}</p>
    <p className="text-xl lg:text-2xl font-extrabold text-white">{date}</p>
    <p className="text-xs text-slate-400 mt-1 italic">{note}</p>
  </div>
);

const Poster = () => {
  return (
    <div className="relative shadow-[0_0_100px_rgba(56,189,248,0.2)] rounded-xl overflow-hidden w-full max-w-[1200px] mx-auto mt-4 lg:mt-10 min-h-[630px] lg:h-auto">
      {/* Background Container */}
      <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#0c4a6e_0%,#020617_100%)] relative border border-sky-400/20 flex flex-col lg:flex-row">
        
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:20px_20px] lg:bg-[size:40px_40px]"></div>

        {/* Con ngựa (Ẩn trên mobile nhỏ, hiện trên Tablet trở lên) */}
        <div className="block">
            <HorseArt />
        </div>

        {/* Nội dung chính */}
        <div className="relative z-20 w-full h-full flex flex-col lg:flex-row p-6 lg:p-16 gap-10 lg:gap-0">
          
          {/* Cột Trái: Thông báo */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex self-start bg-sky-400/10 text-sky-300 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full font-bold text-xs lg:text-sm tracking-widest mb-4 border border-sky-400/30 uppercase">
              Mã Niên Phi Long • 2026
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black mb-2 text-white drop-shadow-[0_0_30px_rgba(56,189,248,0.6)] tracking-tighter leading-tight">
              THÔNG BÁO<br/><span className="text-sky-400">NGHỈ TẾT</span>
            </h1>
            
            <p className="text-slate-400 text-xs lg:text-sm tracking-widest my-6 lg:my-10 font-semibold uppercase">
              Dev House Group Incorporated
            </p>
            
            <div className="space-y-3 lg:space-y-4 w-full">
              <DateCard 
                title="Tạm dừng dịch vụ"
                date={<>14.02 <span className="text-base font-normal text-slate-500">—</span> 23.02</>}
                note="(27 Tết - Hết mùng 7)"
                colorClass="text-sky-400"
                borderColor="#38bdf8"
              />
              <DateCard 
                title="Hoạt động trở lại"
                date={<>24.02 <span className="text-base font-normal text-slate-500">—</span> 08:00 AM</>}
                note="(Sáng mùng 8 Tết)"
                colorClass="text-green-400"
                borderColor="#10b981"
              />
            </div>

            <div className="mt-8 lg:mt-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg shadow-sky-500/50">
                <span>
                    <img src="./logo.png" alt="logo"/>
                </span>
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-white">DEV HOUSE GROUP</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Innovation in every line</p>
              </div>
            </div>
          </div>

          {/* Cột Phải: Lời chúc (Mobile sẽ nằm dưới, PC nằm phải) */}
          <div className="flex-1 flex flex-col justify-center lg:pl-24 pt-6 lg:pt-0 border-t border-white/10 lg:border-t-0">
            <div className="max-w-full lg:max-w-sm">
              <h3 className="font-cursive text-4xl lg:text-5xl text-sky-300 mb-4 lg:mb-6 drop-shadow-md text-center lg:text-left">
                Chúc Mừng Năm Mới
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 lg:mb-8 text-justify lg:text-left">
                Kính gửi Quý khách hàng & Đối tác, Dev House xin chân thành cảm ơn sự đồng hành của Quý vị. 
                Chúc một năm mới bứt phá mạnh mẽ như <strong>Mã Niên</strong>, vươn cao như <strong>Phi Long</strong>!
              </p>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-sm italic text-slate-200 text-center leading-loose font-serif">
                  "Sức khoẻ dồi dào, vạn sự như ý,<br/>Tỷ sự như mơ, triệu triệu bất ngờ,<br/>Hàng giờ hạnh phúc!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poster;