import React from 'react';
import HorseArt from './HorseArt';

// Component hiển thị Dịch vụ
const ServiceCard = ({ title, desc, icon, borderColor, path }) => (
  <a 
    href={path}
    className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 w-full rounded-r-2xl rounded-l-sm border-l-4 transition-all duration-300 flex items-center gap-4 hover:translate-x-2 hover:bg-white/5 group cursor-pointer"
    style={{ borderLeftColor: borderColor }}
    target='blank'
  >
    <div className="text-3xl drop-shadow-md transition-transform group-hover:scale-110">{icon}</div>
    <div>
        <p className="text-sm font-bold uppercase tracking-wider text-white transition-colors group-hover:text-sky-300">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  </a>
);

// Component hiển thị Mạng xã hội / Liên hệ
const ContactLink = ({ platform, info, link, iconSvg, hoverColor }) => (
  <a 
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/10 group ${hoverColor}`}
  >
    <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors shadow-lg">
      {iconSvg}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{platform}</p>
      <p className="text-sm font-bold text-slate-100">{info}</p>
    </div>
  </a>
);

const Poster = () => {
  return (
    <div className="relative shadow-[0_0_100px_rgba(56,189,248,0.2)] rounded-xl overflow-hidden w-full mx-auto mt-4 lg:mt-10 min-h-[630px] lg:h-auto">
      {/* Background Container */}
      <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#0c4a6e_0%,#020617_100%)] relative border border-sky-400/20 flex flex-col lg:flex-row">
        
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:20px_20px] lg:bg-[size:40px_40px]"></div>

        {/* Nghệ thuật trang trí (Có thể thay ngựa bằng hình khác sau này) */}
        <div className="block">
            <HorseArt />
        </div>

        {/* Nội dung chính */}
        <div className="relative z-20 w-full h-full flex flex-col lg:flex-row p-6 lg:p-16 gap-10 lg:gap-0">
          
          {/* Cột Trái: Thông báo & Dịch vụ */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex self-start bg-sky-400/10 text-sky-300 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full font-bold text-xs lg:text-sm tracking-widest mb-4 border border-sky-400/30 uppercase">
              Công Ty TNHH Dev House
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black mb-2 text-white drop-shadow-[0_0_30px_rgba(56,189,248,0.6)] tracking-tighter leading-tight">
              Trung tâm<br/><span className="text-sky-400">Hỗ trợ & Dịch vụ</span>
            </h1>
            
            <p className="text-slate-400 text-xs lg:text-sm tracking-widest my-6 lg:my-8 font-semibold uppercase flex items-center gap-2">
              <span className="w-8 h-[1px] bg-slate-500"></span>
              Service of us
            </p>
            
            {/* Danh sách dịch vụ - Có gắn link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-[500px]">
              <ServiceCard 
                title="Phát triển Website" 
                desc="Landing page, Web App, E-commerce"
                icon="💻" 
                borderColor="#38bdf8" 
                path="https://thedevhouse-web-a8fw.vercel.app/" 
              />
              <ServiceCard 
                title="Lập trình Game" 
                desc="Game 2D/3D, Web3, Mobile Games"
                icon="🎮" 
                borderColor="#a855f7" 
                path="https://thedevhouse-web-a8fw.vercel.app/" 
              />
              <ServiceCard 
                title="Triển khai (Deploy)" 
                desc="AWS, Vercel, VPS, DevOps Setup"
                icon="🚀" 
                borderColor="#10b981" 
                path="https://thedevhouse-web-a8fw.vercel.app/" 
              />
              <ServiceCard 
                title="Thiết kế Đồ hoạ" 
                desc="UI/UX, Branding, Banner, Logo"
                icon="🎨" 
                borderColor="#f43f5e" 
                path="https://thedevhouse-web-a8fw.vercel.app/" 
              />
            </div>

            <div>
              <a className="mt-8 lg:mt-10 flex items-center space-x-3" href="https://thedevhouse-web-a8fw.vercel.app/" alt="The Dev House Web" target='blank'>
                <div className="w-10 h-10 bg-slate-900 border border-sky-500/50 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] overflow-hidden p-1">
                  {/* LƯU Ý: Đường dẫn ảnh nên bắt đầu bằng / nếu để trong public */}
                    <img src="/logo.png" alt="logo" className="w-full h-full object-contain"/>
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-white">DEV HOUSE GROUP</p>
                  <p className="text-[9px] text-sky-400 uppercase tracking-widest">Innovation in every line</p>
                </div>
              </a>
            </div>
          </div>

          {/* Cột Phải: Liên hệ */}
          <div className="flex-1 flex flex-col justify-center lg:pl-20 pt-8 lg:pt-0 border-t border-white/10 lg:border-t-0">
            <div className="max-w-full lg:max-w-md w-full ml-auto">
              <h3 className="text-3xl lg:text-4xl text-white font-bold mb-4 drop-shadow-md text-center lg:text-left tracking-tight">
                Kết nối với chúng tôi
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 text-center lg:text-left">
                Bạn có ý tưởng? Chúng tôi có công nghệ. Hãy liên hệ với Dev House qua các nền tảng dưới đây để được tư vấn và hỗ trợ nhanh nhất.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <ContactLink 
                  platform="Facebook" 
                  info="Dev House Group Inc" 
                  link="https://www.facebook.com/profile.php?id=61576886176025"
                  hoverColor="hover:border-blue-500/50"
                  iconSvg={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>}
                />
                
                <ContactLink 
                  platform="Zalo / Hotline" 
                  info="0869.528.304" 
                  link="https://zalo.me/0869528304"
                  hoverColor="hover:border-blue-400/50"
                  iconSvg={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.9 10.1C20.6 4.7 16.1.4 10.7.1 5-.2.2 4.3 0 10c-.1 3.5 1.7 6.6 4.4 8.5-.2 1.4-.8 3.5-.8 3.5 0 .2.2.4.4.4.1 0 .2 0 .3-.1l4-2c1 .3 2.1.4 3.2.3 5.3-.2 9.6-4.6 9.4-10.5zM12.4 13.9h-1.8v-1.8h1.8v1.8zm0-3.6h-1.8V6.7h1.8v3.6z"/></svg>}
                />

                <ContactLink 
                  platform="Instagram" 
                  info="@_minhvuog.dev" 
                  link="https://www.instagram.com/_minhvuog.dev/"
                  hoverColor="hover:border-pink-500/50"
                  iconSvg={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.46 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/></svg>}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poster;