import React from "react";
import { motion } from "motion/react";
import { Users, ShieldCheck, ShieldAlert, ShieldX, Bell } from "lucide-react";
import { License } from "../types";

interface DashboardStatsProps {
  licenses: License[];
  onTriggerScan: () => void;
  isScanning: boolean;
  role?: "admin" | "user";
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  licenses,
  onTriggerScan,
  isScanning,
  role = "admin",
}) => {
  const total = licenses.length;
  const active = licenses.filter((l) => l.status === "active").length;
  const warning = licenses.filter((l) => l.status === "warning").length;
  const expired = licenses.filter((l) => l.status === "expired").length;

  // Percentage calculations
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const warningPercent = total > 0 ? Math.round((warning / total) * 100) : 0;
  const expiredPercent = total > 0 ? Math.round((expired / total) * 100) : 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <div id="dashboard-stats-container" className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ระบบติดตามใบประกอบวิชาชีพพยาบาล</h1>
          <p className="text-sm text-slate-500 mt-1">
            ตรวจจับและแจ้งเตือนล่วงหน้า 3 เดือน (90 วัน) เพื่อการดูแลรักษามาตรฐานวิชาชีพ
          </p>
        </div>
        {role === "admin" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTriggerScan}
            disabled={isScanning}
            id="btn-scan-system"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm animate-fade-in"
          >
            <Bell className={`w-4 h-4 ${isScanning ? "animate-bounce" : ""}`} />
            {isScanning ? "กำลังสแกนระบบ..." : "สแกนและส่งแจ้งเตือนด่วน"}
          </motion.button>
        )}
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Licenses */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          id="stat-card-total"
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">พยาบาลทั้งหมด</span>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800">{total}</h3>
            <p className="text-xs text-slate-400 mt-2">รายชื่อพยาบาลในฐานข้อมูลคลาวด์</p>
          </div>
        </motion.div>

        {/* Active Status */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          id="stat-card-active"
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">สถานะปกติ (ปลอดภัย)</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{active}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {activePercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${activePercent}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Warning Status (Expiring in 3 months) */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          id="stat-card-warning"
          className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between bg-amber-50/10"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">หมดอายุใน 3 เดือน</span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-amber-700">{warning}</h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded">
                {warningPercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${warningPercent}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Expired Status */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          id="stat-card-expired"
          className="bg-white p-6 rounded-2xl border border-red-100 shadow-xs flex flex-col justify-between bg-red-50/10"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">หมดอายุแล้ว</span>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldX className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-red-700">{expired}</h3>
              <span className="text-xs font-semibold text-red-600 bg-red-100/50 px-2 py-0.5 rounded">
                {expiredPercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${expiredPercent}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
