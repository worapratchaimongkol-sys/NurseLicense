export interface License {
  id: string;
  name: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  department: string;
  email: string;
  phone: string;
  notes?: string;
  status: "active" | "warning" | "expired";
  notificationSent: boolean;
  lastNotifiedAt?: string | null;
}

export interface NotificationLog {
  id: string;
  licenseId: string;
  nurseName: string;
  licenseNumber: string;
  email: string;
  sentAt: string;
  expiryDate: string;
  daysRemaining: number;
  type: "warning" | "expired";
  status: "success" | "failed";
}

export const DEPARTMENTS = [
  "แผนกผู้ป่วยนอก (OPD)",
  "แผนกผู้ป่วยใน (IPD)",
  "ผู้ป่วยวิกฤต (ICU)",
  "ห้องฉุกเฉิน (ER)",
  "แผนกไตเทียม",
  "กุมารเวชกรรม (Pediatrics)",
  "แผนกสูตินรีเวช (OB-GYN)",
  "ห้องผ่าตัด (OR)",
  "ห้องผ่าตัดเล็ก",
  "งานส่องตรวจพิเศษ",
  "แผนกวิสัญญี (Anesthesiology)",
  "แผนกจิตเวช (Psychiatry)",
  "แผนกฟื้นฟู (Rehabilitation)",
];
