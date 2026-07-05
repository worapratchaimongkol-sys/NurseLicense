import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Users,
  Bell,
  FileSpreadsheet,
  LogIn,
  EyeOff,
  Clock,
  ArrowRight
} from "lucide-react";

interface LandingPageProps {
  onGuestEnter: () => void;
  onLogin: () => void;
  isLoggingIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGuestEnter,
  onLogin,
  isLoggingIn = false,
}) => {
  return (
    <div id="landing-page-container" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800 selection:bg-blue-100 overflow-x-hidden">
      
      {/* Upper Navigation Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-blue-900 font-mono">NurseLicense</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onGuestEnter}
            id="btn-nav-guest-enter"
            className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            เข้าหน้าหลักแบบทดลองใช้งาน
          </button>
          <button
            onClick={onLogin}
            id="btn-nav-login"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            เข้าสู่ระบบ Admin
          </button>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: System introduction & Entry buttons */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase">ระบบสารสนเทศโรงพยาบาล</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              ระบบบริหารจัดการ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ใบประกอบวิชาชีพพยาบาล
              </span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              แพลตฟอร์มตรวจสอบ ค้นหา และจำลองการแจ้งเตือนวันหมดอายุใบอนุญาตทำงานพยาบาลในโรงพยาบาลอย่างเป็นระบบ เพื่อความต่อเนื่องในการดูแลผู้ป่วยและรักษามาตรฐานวิชาชีพ
            </p>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            
            {/* Google Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogin}
              disabled={isLoggingIn}
              id="btn-landing-login"
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer text-sm"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Admin)</span>
            </motion.button>

            {/* Guest Access Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGuestEnter}
              id="btn-landing-guest"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer text-sm"
            >
              <span>เข้าใช้งานทั่วไป (Read-only)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </motion.button>

          </div>

          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 max-w-2xl space-y-1.5">
            <p className="text-xs text-slate-600 font-bold flex items-center gap-2">
              <span className="text-red-500">🛡️</span> เฉพาะผู้ดูแลระบบที่มีสิทธิ์ (Admin) เท่านั้น
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              สิทธิ์ Admin จำกัดไว้เฉพาะอีเมล <span className="font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">worapratchaimongkol@gmail.com</span> เพื่อจัดการข้อมูลพยาบาล แก้ไข ส่งแจ้งเตือน และซิงก์ข้อมูลกับ Google Sheets โดยผู้ใช้อื่นจะได้รับสิทธิ์ <span className="font-bold text-slate-700">ผู้ใช้งานทั่วไป (Read-only)</span> และถูกปิดบังข้อมูลส่วนบุคคลที่สำคัญเพื่อความปลอดภัยสูงสุด
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Mockup Showcase */}
        <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
          
          {/* Subtle Decorative Grid */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl -z-10 blur-xl opacity-70"></div>

          {/* Visual Showcase Card */}
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-700">แจ้งเตือนเร่งด่วนตามระยะเวลา</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-full">
                สแกนรายวันอัตโนมัติ
              </span>
            </div>

            {/* List of Expiring Nurses Mockup */}
            <div className="space-y-3">
              
              {/* Nurse 1: Critical */}
              <div className="p-4.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">พญ. สุพัตรา รักษ์ดี</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">เลขใบอนุญาต: 🔒 เฉพาะ Admin</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">แผนกผู้ป่วยนอก (OPD)</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-lg">
                    หมดอายุใน 5 วัน
                  </span>
                  <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    วิกฤตมาก
                  </p>
                </div>
              </div>

              {/* Nurse 2: Warning */}
              <div className="p-4.5 bg-amber-50/40 border border-amber-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">นส. ณัฐณิชา เจริญสุข</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">เลขใบอนุญาต: 🔒 เฉพาะ Admin</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">ห้องผ่าตัด (OR)</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-lg">
                    เหลืออีก 42 วัน
                  </span>
                  <p className="text-[9px] text-amber-600 font-bold mt-1.5 flex items-center gap-1 justify-end">
                    <span>⚠️</span> ใกล้หมดอายุ
                  </p>
                </div>
              </div>

              {/* Nurse 3: Active but safe */}
              <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 opacity-60">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">นาย ณพงศ์ นครไทย</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">เลขใบอนุญาต: 🔒 เฉพาะ Admin</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-lg">
                    เหลืออีก 520 วัน
                  </span>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 justify-end">
                    <span>✓</span> ปลอดภัย
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-500" />
                จำลองส่งแจ้งเตือนเบอร์ภายในพยาบาลทันที
              </span>
              <span className="font-bold text-slate-500 font-mono">3 ระดับสถานะ</span>
            </div>
          </div>

        </div>
      </main>

      {/* Grid Features Details Section */}
      <section className="bg-white border-t border-slate-200 py-16 shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-black text-slate-900">คุณสมบัติและความสามารถหลักของระบบ</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              พัฒนาขึ้นเพื่อช่วยอำนวยความสะดวกให้ฝ่ายบุคคลหรือแผนกพยาบาลของโรงพยาบาลทำงานได้อย่างถูกต้อง ปลอดภัย และมีประสิทธิภาพสูงสุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-200 transition-colors space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800">ระบบปกป้องข้อมูลส่วนบุคคล (PDPA)</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                ปิดบังเลขใบประกอบวิชาชีพพยาบาล เบอร์ภายใน และเบอร์โทรศัพท์ของบุคลากรหากเข้าใช้ในฐานะผู้ใช้ทั่วไป และเปิดสิทธิ์ให้อ่าน-เขียนข้อมูลเฉพาะ Admin ตัวจริงที่ผ่านการล็อกอินด้วย Google เท่านั้น
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 transition-colors space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800">แดชบอร์ดและการแจ้งเตือนด่วน</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                แดชบอร์ดแสดงผลค่าสถิติเชิงลึก พร้อมปุ่มแสกนระบบเพื่อส่งสัญญาณแจ้งเตือนไปยังพยาบาลที่มีกำหนดหมดอายุภายใน 90 วัน เพื่อให้สับเปลี่ยนเวรหรือเข้าอบรมตามขั้นตอนมาตรฐานได้อย่างถูกต้อง
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-emerald-200 transition-colors space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800">ซิงโครไนซ์ Google Sheets อัตโนมัติ</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                เชื่อมต่อและอัปเดตข้อมูลกับสเปรดชีตออนไลน์ขององค์กรได้โดยตรงผ่าน Google Drive และ Google Sheets API ทำให้จัดการผ่านช่องทางอื่นหรือดึงรายงานสรุปไปใช้งานได้ทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 shrink-0 gap-4">
        <p>© 2026 ระบบบริหารจัดการใบประกอบวิชาชีพพยาบาล (NurseLicense). สงวนลิขสิทธิ์ทั้งหมด.</p>
        <p className="font-mono">พัฒนาด้วยความใส่ใจเพื่อรักษามาตรฐานวิชาชีพพยาบาลสากล</p>
      </footer>
      
    </div>
  );
};
