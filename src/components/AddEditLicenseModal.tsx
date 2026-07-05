import React, { useState, useEffect } from "react";
import { X, Calendar, User, IdCard, Building2, Phone, FileText, PhoneCall } from "lucide-react";
import { License, DEPARTMENTS } from "../types";

interface AddEditLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<License, "id" | "status" | "notificationSent">) => Promise<void>;
  license?: License | null;
}

export const AddEditLicenseModal: React.FC<AddEditLicenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  license,
}) => {
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (license) {
      setName(license.name);
      setLicenseNumber(license.licenseNumber);
      setIssueDate(license.issueDate);
      setExpiryDate(license.expiryDate);
      setDepartment(license.department);
      setEmail(license.email);
      setPhone(license.phone);
      setNotes(license.notes || "");
    } else {
      // Clear fields for new license
      setName("");
      setLicenseNumber("");
      setIssueDate("");
      setExpiryDate("");
      setDepartment(DEPARTMENTS[0]);
      setEmail("");
      setPhone("");
      setNotes("");
    }
    setError("");
  }, [license, isOpen]);

  // Helper to prevent "The string did not match the expected pattern" in Safari/WebKit
  // when setting invalid date formats to native date inputs.
  const safeDateValue = (dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return dateStr;
      }
    }
    return "";
  };

  // Automatically suggest expiration date (5 years from issue date)
  const handleIssueDateChange = (val: string) => {
    setIssueDate(val);
    if (!val) {
      setExpiryDate("");
      return;
    }
    // Only calculate when we have a fully formed YYYY-MM-DD string to avoid partial typing generating NaN-NaN-NaN
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        date.setFullYear(date.getFullYear() + 5);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        setExpiryDate(`${year}-${month}-${day}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validation
    if (!name.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!licenseNumber.trim() || licenseNumber.length < 5) return setError("กรุณากรอกเลขที่ใบประกอบวิชาชีพให้ถูกต้อง (อย่างน้อย 5 หลัก)");
    if (!issueDate) return setError("กรุณาเลือกวันออกใบอนุญาต");
    if (!expiryDate) return setError("กรุณาเลือกวันหมดอายุ");
    if (new Date(expiryDate) <= new Date(issueDate)) return setError("วันหมดอายุต้องอยู่หลังวันออกใบอนุญาต");
    if (!email.trim() || email.length < 2) return setError("กรุณากรอกเบอร์ภายในโรงพยาบาลที่ถูกต้อง");
    if (!phone.trim() || phone.length < 9) return setError("กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง");

    try {
      setIsSubmitting(true);
      await onSave({
        name,
        licenseNumber,
        issueDate,
        expiryDate,
        department,
        email,
        phone,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="modal-content"
        className="bg-white rounded-3xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {license ? "แก้ไขข้อมูลใบประกอบวิชาชีพ" : "เพิ่มใบประกอบวิชาชีพใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Nurse Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> ชื่อ-นามสกุล พยาบาลวิชาชีพ
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="พว. สมรักษ์ มุ่งมั่น"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-slate-400" /> เลขที่ใบประกอบวิชาชีพ
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="6511023456"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" /> สังกัดแผนก/วอร์ด
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> วันออกใบอนุญาต
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={safeDateValue(issueDate)}
                  onChange={(e) => handleIssueDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                  required
                />
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> วันหมดอายุ
              </label>
              <input
                type="date"
                value={safeDateValue(expiryDate)}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                required
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                * ปกติมีอายุ 5 ปี (ระบบช่วยคำนวณวันหมดอายุอัตโนมัติให้แล้ว)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hospital Extension / Internal Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-slate-400" /> เบอร์ภายในโรงพยาบาล
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น 1402, 2205 หรือ 0-2XXX-XXXX ต่อ 123"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" /> เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" /> หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น อยู่ระหว่างส่งเอกสารต่ออายุใบประกอบวิชาชีพ"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
