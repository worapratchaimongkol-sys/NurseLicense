import React from "react";
import { Mail, Check, AlertTriangle, Clock, Calendar, RefreshCw } from "lucide-react";
import { NotificationLog } from "../types";

interface NotificationCenterProps {
  logs: NotificationLog[];
  onTriggerScan: () => void;
  isScanning: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  logs,
  onTriggerScan,
  isScanning,
}) => {
  // Helper to format timestamp
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " น.";
  };

  return (
    <div id="notification-center-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">ประวัติการแจ้งเตือนและการสแกนระบบ</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            บันทึกการส่งข้อความแจ้งเตือนอัตโนมัติแก่พยาบาลวิชาชีพผ่านระบบคลาวด์
          </p>
        </div>
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          สแกนใหม่
        </button>
      </div>

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
        {logs.length > 0 ? (
          logs.map((log) => {
            const isExpiredNotif = log.type === "expired";
            return (
              <div
                key={log.id}
                className={`p-4 rounded-xl border flex gap-3.5 items-start ${
                  isExpiredNotif
                    ? "bg-red-50/25 border-red-100/70"
                    : "bg-amber-50/25 border-amber-100/70"
                }`}
              >
                {/* Icon box */}
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isExpiredNotif ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-bold text-slate-800 text-sm">
                      {isExpiredNotif ? "แจ้งเตือนใบอนุญาตหมดอายุแล้ว" : "แจ้งเตือนวันหมดอายุล่วงหน้า 3 เดือน"}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3" /> {formatTime(log.sentAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    ส่งอีเมลสำเร็จไปยัง: <span className="font-semibold text-slate-700">{log.nurseName}</span> ({log.email})
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> ใบอนุญาตเลขที่: <span className="font-mono text-slate-600">{log.licenseNumber}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 
                      {log.daysRemaining < 0 
                        ? `หมดอายุมาแล้ว ${Math.abs(log.daysRemaining)} วัน` 
                        : `จะหมดอายุในอีก ${log.daysRemaining} วัน`
                      }
                    </span>
                  </div>
                </div>

                {/* Success Indicator badge */}
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <Check className="w-3 h-3" /> ส่งแล้ว
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            ยังไม่มีบันทึกการสแกนหรือแจ้งเตือนในระบบ
          </div>
        )}
      </div>
    </div>
  );
};
