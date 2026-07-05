import React, { useState } from "react";
import { Search, Edit2, Trash2, Bell, AlertTriangle, CheckCircle, Clock, Filter, Plus } from "lucide-react";
import { License, DEPARTMENTS } from "../types";

interface LicenseTableProps {
  licenses: License[];
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
  onNotify: (id: string) => void;
  onAddNewClick: () => void;
  role?: "admin" | "user";
}

export const LicenseTable: React.FC<LicenseTableProps> = ({
  licenses,
  onEdit,
  onDelete,
  onNotify,
  onAddNewClick,
  role = "admin",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"expiryAsc" | "expiryDesc" | "nameAsc">("expiryAsc");

  // Helper to calculate remaining days
  const getRemainingDays = (expiryDateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper for Thai Date presentation
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter & Sort Licenses
  const filteredLicenses = licenses
    .filter((lic) => {
      const matchSearch =
        lic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role === "admin" && lic.licenseNumber.includes(searchQuery));
      const matchStatus = statusFilter === "all" || lic.status === statusFilter;
      const matchDept = deptFilter === "all" || lic.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    })
    .sort((a, b) => {
      if (sortBy === "expiryAsc") {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      } else if (sortBy === "expiryDesc") {
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      } else {
        return a.name.localeCompare(b.name, "th");
      }
    });

  return (
    <div id="license-table-section" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Table Filters/Header */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">รายชื่อผู้ถือใบประกอบวิชาชีพ</h2>
          {role === "admin" && (
            <button
              onClick={onAddNewClick}
              id="btn-add-new-license"
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-xs animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              เพิ่มข้อมูลพยาบาล
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือเลขใบประกอบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 text-sm transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-700 text-xs font-medium"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ปกติ (ปลอดภัย)</option>
              <option value="warning">หมดอายุใน 3 เดือน</option>
              <option value="expired">หมดอายุแล้ว</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Building2Icon className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-700 text-xs font-medium"
            >
              <option value="all">ทุกแผนก/วอร์ด</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-transparent border-none outline-none text-slate-700 text-xs font-medium"
            >
              <option value="expiryAsc">วันหมดอายุ (ใกล้ที่สุดก่อน)</option>
              <option value="expiryDesc">วันหมดอายุ (ไกลที่สุดก่อน)</option>
              <option value="nameAsc">เรียงชื่อ ก-ฮ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider">
              <th className="px-6 py-4">รายชื่อพยาบาล</th>
              <th className="px-6 py-4">เลขใบประกอบวิชาชีพ</th>
              <th className="px-6 py-4">แผนก/วอร์ด</th>
              <th className="px-6 py-4">วันหมดอายุ (อายุขัย)</th>
              <th className="px-6 py-4">ระยะเวลาที่เหลือ</th>
              <th className="px-6 py-4 font-bold">สถานะการแจ้งเตือน</th>
              {role === "admin" && <th className="px-6 py-4 text-right font-bold">จัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {filteredLicenses.length > 0 ? (
              filteredLicenses.map((lic) => {
                const daysRemaining = getRemainingDays(lic.expiryDate);
                
                // Status styles
                let statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full text-emerald-700 bg-emerald-50 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" /> ปกติ
                  </span>
                );
                
                if (lic.status === "warning") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full text-amber-700 bg-amber-50 border border-amber-100 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> เตือนต่ออายุ
                    </span>
                  );
                } else if (lic.status === "expired") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full text-red-700 bg-red-50 border border-red-100">
                      <Clock className="w-3.5 h-3.5" /> หมดอายุ
                    </span>
                  );
                }

                return (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Nurse info */}
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-bold text-slate-800">{lic.name}</p>
                        {role === "admin" ? (
                          <p className="text-[11px] text-slate-400 mt-0.5">เบอร์ภายใน: {lic.email} | โทร: {lic.phone}</p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 select-none" title="สงวนสิทธิ์เฉพาะ Admin">
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-100 text-slate-400 rounded text-[9px] font-extrabold">
                              🔒 เบอร์ภายใน
                            </span>
                            <span className="font-mono text-slate-300">••••</span>
                            <span className="text-slate-300">|</span>
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-100 text-slate-400 rounded text-[9px] font-extrabold">
                              🔒 TEL
                            </span>
                            <span className="font-mono text-slate-300">••••••••••</span>
                          </p>
                        )}
                      </div>
                    </td>
                    {/* License number */}
                    <td className="px-6 py-4.5 font-mono text-xs font-medium text-slate-600">
                      {role === "admin" ? (
                        lic.licenseNumber
                      ) : (
                        <span className="inline-flex items-center gap-1 select-none text-slate-300 font-mono" title="สงวนสิทธิ์เฉพาะ Admin">
                          <span>🔒</span>
                          <span>••••••••••</span>
                        </span>
                      )}
                    </td>
                    {/* Department */}
                    <td className="px-6 py-4.5 text-slate-600 font-medium">
                      {lic.department}
                    </td>
                    {/* Expiration date */}
                    <td className="px-6 py-4.5">
                      <div className="text-slate-700 font-semibold">{formatThaiDate(lic.expiryDate)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">ออกให้: {formatThaiDate(lic.issueDate)}</div>
                    </td>
                    {/* Countdown/Status */}
                    <td className="px-6 py-4.5">
                      <div className="space-y-1">
                        {daysRemaining < 0 ? (
                          <span className="text-xs font-bold text-red-600">
                            หมดอายุแล้ว {Math.abs(daysRemaining)} วัน
                          </span>
                        ) : daysRemaining <= 90 ? (
                          <span className="text-xs font-bold text-amber-600">
                            เหลืออีก {daysRemaining} วัน (ใกล้หมดอายุ)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">
                            เหลืออีก {daysRemaining} วัน
                          </span>
                        )}
                        <div>{statusBadge}</div>
                      </div>
                    </td>
                    {/* Notification state */}
                    <td className="px-6 py-4.5">
                      {lic.notificationSent ? (
                        <div className="space-y-0.5">
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> แจ้งเตือนแล้ว
                          </span>
                          {lic.lastNotifiedAt && (
                            <p className="text-[10px] text-slate-400">
                              {new Date(lic.lastNotifiedAt).toLocaleDateString("th-TH", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })} น.
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          ยังไม่มีการส่งเตือน
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    {role === "admin" && (
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Notify trigger */}
                          <button
                            onClick={() => onNotify(lic.id)}
                            title="ส่งแจ้งเตือนไปยังเบอร์ภายในโรงพยาบาล (จำลอง)"
                            disabled={lic.status === "active"}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              lic.status === "active"
                                ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                                : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            }`}
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => onEdit(lic)}
                            title="แก้ไข"
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => onDelete(lic.id)}
                            title="ลบ"
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={role === "admin" ? 7 : 6} className="px-6 py-12 text-center text-slate-400 font-medium">
                  ไม่พบข้อมูลใบประกอบวิชาชีพตามเงื่อนไขที่ระบุ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper icon component since we don't have building icon easily without typing
const Building2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);
