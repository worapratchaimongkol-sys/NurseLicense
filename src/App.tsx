import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Upload,
  RefreshCw,
  Plus,
  ShieldAlert,
  Settings,
  Database,
  Info,
  CheckCircle,
  FileSpreadsheet,
  LogOut,
  Link,
  ExternalLink,
  Check,
  ChevronDown
} from "lucide-react";
import { License, NotificationLog } from "./types";
import { DashboardStats } from "./components/DashboardStats";
import { AddEditLicenseModal } from "./components/AddEditLicenseModal";
import { LicenseTable } from "./components/LicenseTable";
import { NotificationCenter } from "./components/NotificationCenter";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { LandingPage } from "./components/LandingPage";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  createSpreadsheet,
  fetchSpreadsheetMetadata,
  updateSpreadsheetValues,
  searchAppSpreadsheets,
  SpreadsheetMetadata
} from "./lib/auth";

export default function App() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  
  // UI Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // File input ref for backup restore
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Sheets state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetMetadata | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<{ id: string; name: string }[]>([]);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("user");
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Automatically set Admin role for worapratchaimongkol@gmail.com, otherwise User role
  useEffect(() => {
    if (user) {
      if (user.email?.toLowerCase() === "worapratchaimongkol@gmail.com") {
        setRole("admin");
        showToast("สิทธิ์ผู้ดูแลระบบ (Admin) ได้รับการยืนยันแล้ว", "success");
      } else {
        setRole("user");
        showToast("ลงชื่อเข้าใช้สำเร็จในฐานะผู้ใช้งานทั่วไป (Read-only)", "info");
      }
    } else {
      setRole("user");
    }
  }, [user]);

  // Authenticate & Google Sync methods
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setHasEntered(true); // Automatically enter if already logged in!
        
        // Recover connected spreadsheet
        const savedSheetId = localStorage.getItem("connected_spreadsheet_id");
        if (savedSheetId) {
          try {
            const meta = await fetchSpreadsheetMetadata(token, savedSheetId);
            setSpreadsheet(meta);
          } catch (err) {
            console.error("Failed to fetch saved sheet metadata on start:", err);
            localStorage.removeItem("connected_spreadsheet_id");
          }
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setSpreadsheet(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGuestEnter = () => {
    setHasEntered(true);
    showToast("เข้าใช้งานในฐานะผู้ใช้งานทั่วไป (Read-only)", "info");
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setHasEntered(true); // Automatically enter the dashboard!
        showToast(`เชื่อมต่อบัญชีสำเร็จ: ${res.user.displayName || res.user.email}`, "success");

        const savedSheetId = localStorage.getItem("connected_spreadsheet_id");
        if (savedSheetId) {
          try {
            const meta = await fetchSpreadsheetMetadata(res.accessToken, savedSheetId);
            setSpreadsheet(meta);
          } catch (err) {
            localStorage.removeItem("connected_spreadsheet_id");
          }
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err?.code === "auth/popup-closed-by-user" || err?.message?.includes("popup-closed-by-user")) {
        showToast("คุณได้ปิดหน้าต่างเข้าสู่ระบบก่อนดำเนินการเสร็จสิ้น", "info");
      } else {
        showToast("การเชื่อมต่อบัญชี Google ล้มเหลว", "error");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleLogout = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      setSpreadsheet(null);
      setHasEntered(false); // Back to landing page!
      showToast("ออกจากระบบและยกเลิกการเชื่อมโยงแล้ว", "success");
    } catch (err) {
      console.error("Logout failed:", err);
      showToast("ออกจากระบบล้มเหลว", "error");
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      showToast("กรุณาเชื่อมต่อบัญชี Google ก่อน", "error");
      return;
    }
    setIsSyncing(true);
    try {
      const meta = await createSpreadsheet(accessToken, "ระบบใบประกอบวิชาชีพพยาบาล");
      setSpreadsheet(meta);
      localStorage.setItem("connected_spreadsheet_id", meta.id);
      
      // Sync initial license values
      await updateSpreadsheetValues(accessToken, meta.id, meta.sheetTitle, licenses);
      showToast("สร้าง Google Sheets และซิงก์ข้อมูลพยาบาลสำเร็จ!", "success");
    } catch (err) {
      console.error("Create sheet failed:", err);
      showToast("ไม่สามารถสร้าง Google Sheets ได้", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchSheets = async () => {
    if (!accessToken) return;
    setIsLoadingSheets(true);
    setShowSheetSelector(true);
    try {
      const files = await searchAppSpreadsheets(accessToken);
      setAvailableSheets(files);
    } catch (err) {
      console.error("Search sheets failed:", err);
      showToast("ไม่สามารถค้นหาไฟล์ชีตได้", "error");
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSelectExistingSheet = async (sheetId: string) => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      const meta = await fetchSpreadsheetMetadata(accessToken, sheetId);
      setSpreadsheet(meta);
      localStorage.setItem("connected_spreadsheet_id", sheetId);
      
      if (window.confirm(`เชื่อมต่อกับชีต "${meta.title}" สำเร็จ ต้องการเขียนข้อมูลพยาบาลปัจจุบันทับลงชีตเลยหรือไม่?`)) {
        await updateSpreadsheetValues(accessToken, meta.id, meta.sheetTitle, licenses);
        showToast("ซิงโครไนซ์ข้อมูลลงชีตเรียบร้อย!", "success");
      } else {
        showToast(`เชื่อมต่อชีต "${meta.title}" แล้ว`, "success");
      }
      setShowSheetSelector(false);
    } catch (err) {
      console.error("Link sheet failed:", err);
      showToast("ไม่สามารถเชื่อมต่อชีตนี้ได้", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!accessToken || !spreadsheet) {
      showToast("ยังไม่มีการเชื่อมต่อกับชีตหลัก", "error");
      return;
    }
    setIsSyncing(true);
    try {
      await updateSpreadsheetValues(accessToken, spreadsheet.id, spreadsheet.sheetTitle, licenses);
      showToast(`ซิงโครไนซ์ข้อมูลไปยัง Google Sheets เรียบร้อย! (${licenses.length} รายการ)`, "success");
    } catch (err) {
      console.error("Sync to sheets failed:", err);
      showToast("ไม่สามารถซิงโครไนซ์ข้อมูลได้", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Show auto-dismiss toast
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch initial data
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [licensesRes, logsRes] = await Promise.all([
        fetch("/api/licenses"),
        fetch("/api/notifications"),
      ]);
      
      if (!licensesRes.ok || !logsRes.ok) {
        throw new Error("Failed to fetch data from cloud server");
      }

      const licensesData = await licensesRes.json();
      const logsData = await logsRes.json();

      setLicenses(licensesData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("ไม่สามารถเชื่อมต่อฐานข้อมูลคลาวด์ได้", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data and trigger auto-scan once on boot to guarantee accurate statuses
    const init = async () => {
      await fetchData(true);
      // Auto scan
      try {
        await fetch("/api/licenses/check-all", { method: "POST" });
        await fetchData(false);
      } catch (err) {
        console.error("Auto scan failed:", err);
      }
    };
    init();
  }, []);

  // Handle Scan Trigger manually
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/licenses/check-all", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to scan system");
      const data = await res.json();
      await fetchData(false);
      if (data.count > 0) {
        showToast(`สแกนระบบเสร็จสิ้น: ส่งการแจ้งเตือนพยาบาลแล้ว ${data.count} รายการ`, "success");
      } else {
        showToast("สแกนระบบเสร็จสิ้น: ไม่มีใบอนุญาตที่ต้องแจ้งเตือนเพิ่มเติมในขณะนี้", "info");
      }
    } catch (error) {
      showToast("การสแกนระบบล้มเหลว", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Save (Add or Update)
  const handleSaveLicense = async (formData: Omit<License, "id" | "status" | "notificationSent">) => {
    const isEdit = !!selectedLicense;
    const url = isEdit ? `/api/licenses/${selectedLicense.id}` : "/api/licenses";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "บันทึกข้อมูลไม่สำเร็จ");
    }

    showToast(isEdit ? "แก้ไขข้อมูลใบประกอบวิชาชีพสำเร็จ" : "เพิ่มข้อมูลใบประกอบวิชาชีพสำเร็จ", "success");
    await fetchData(false);
  };

  // Handle Delete
  const handleDeleteLicense = async (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลใบประกอบวิชาชีพนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนคืนได้")) {
      try {
        const res = await fetch(`/api/licenses/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete license");
        showToast("ลบข้อมูลใบประกอบวิชาชีพเรียบร้อยแล้ว", "success");
        await fetchData(false);
      } catch (error) {
        showToast("ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

  // Handle individual notify trigger
  const handleNotifyLicense = async (id: string) => {
    try {
      const res = await fetch(`/api/licenses/notify/${id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send notification");
      showToast("ส่งอีเมลแจ้งเตือนพยาบาลวิชาชีพเรียบร้อยแล้ว (จำลอง)", "success");
      await fetchData(false);
    } catch (error) {
      showToast("ไม่สามารถส่งแจ้งเตือนได้", "error");
    }
  };

  // Handle Backup Export
  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify({ licenses, exportedAt: new Date().toISOString() }, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nurse_licenses_backup_${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      showToast("ส่งออกข้อมูลสำรองเสร็จสิ้น", "success");
    } catch (error) {
      showToast("เกิดข้อผิดพลาดในการส่งออกสำรอง", "error");
    }
  };

  // Handle Backup Restore
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== "string") return;
        
        const parsed = JSON.parse(result);
        if (!parsed.licenses || !Array.isArray(parsed.licenses)) {
          throw new Error("โครงสร้างไฟล์ข้อมูลสำรองไม่ถูกต้อง");
        }

        const res = await fetch("/api/backup/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ licenses: parsed.licenses }),
        });

        if (!res.ok) {
          throw new Error("เซิร์ฟเวอร์ปฏิเสธการนำเข้าข้อมูล");
        }

        const data = await res.json();
        showToast(`นำเข้าข้อมูลและกู้คืนเสร็จสิ้น: ทั้งหมด ${data.count} รายการ`, "success");
        await fetchData(false);
      } catch (error: any) {
        showToast(error?.message || "ไฟล์ไม่ถูกต้องหรือไม่ใช่ข้อมูลสำรองระบบ", "error");
      }
    };
    fileReader.readAsText(files[0]);
    // reset file value
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (lic: License) => {
    if (role !== "admin") {
      showToast("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขข้อมูลได้", "error");
      return;
    }
    setSelectedLicense(lic);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    if (role !== "admin") {
      showToast("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเพิ่มข้อมูลได้", "error");
      return;
    }
    setSelectedLicense(null);
    setIsModalOpen(true);
  };

  if (!hasEntered) {
    return (
      <div id="landing-root-container">
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              id="landing-toast-notification-banner"
              className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-3.5 max-w-md ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : toast.type === "error"
                  ? "bg-red-50 text-red-800 border-red-100"
                  : "bg-blue-50 text-blue-800 border-blue-100"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <LandingPage
          onGuestEnter={handleGuestEnter}
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
        />
      </div>
    );
  }

  return (
    <div id="app-root-container" className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            id="toast-notification-banner"
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-3.5 max-w-md ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : toast.type === "error"
                ? "bg-red-50 text-red-800 border-red-100"
                : "bg-blue-50 text-blue-800 border-blue-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">NurseLicense</span>
        </div>
        
        {/* Role Selector Segmented Control */}
        <div className="px-6 mb-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setRole("user")}
              id="role-user-btn"
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                role === "user"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ผู้ใช้งานทั่วไป
            </button>
            <button
              onClick={() => {
                if (user?.email?.toLowerCase() === "worapratchaimongkol@gmail.com") {
                  setRole("admin");
                } else {
                  showToast("เฉพาะผู้ดูแลระบบที่มีสิทธิ์ (worapratchaimongkol@gmail.com) เท่านั้น", "error");
                }
              }}
              disabled={user?.email?.toLowerCase() !== "worapratchaimongkol@gmail.com"}
              id="role-admin-btn"
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                role === "admin"
                  ? "bg-blue-600 text-white shadow-xs cursor-pointer"
                  : user?.email?.toLowerCase() === "worapratchaimongkol@gmail.com"
                  ? "text-slate-500 hover:text-slate-800 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              {user?.email?.toLowerCase() !== "worapratchaimongkol@gmail.com" && (
                <span className="text-[10px]">🔒</span>
              )}
              ผู้ดูแลระบบ
            </button>
          </div>
          {user?.email?.toLowerCase() !== "worapratchaimongkol@gmail.com" && (
            <p className="text-[10px] text-red-500 font-medium text-center mt-1.5 leading-snug">
              * สิทธิ์ Admin จำกัดเฉพาะ worapratchaimongkol@gmail.com
            </p>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <a href="#dashboard-stats-container" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            หน้าหลักแดชบอร์ด
          </a>
          <a href="#license-table-section" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            รายการใบอนุญาต
          </a>
          {role === "admin" && (
            <a href="#notification-center-section" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors animate-fade-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              ประวัติการแจ้งเตือน
            </a>
          )}
        </nav>

        {/* Google Sheets Integration Card */}
        {role === "admin" && (
          <div className="p-4 mx-4 mb-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-700 tracking-tight">Google Sheets</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${user ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></div>
              </div>
            </div>

            {!user ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  เชื่อมต่อชีตเพื่อซิงโครไนซ์ข้อมูลพยาบาลแบบเรียลไทม์
                </p>
                
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>เชื่อมต่อชีต</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="truncate max-w-[130px]">
                    <p className="font-semibold text-slate-800 truncate">{user.displayName || "Google User"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="ออกจากระบบ Google"
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {spreadsheet ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2 space-y-0.5">
                      <p className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">ชีตหลักระบบพยาบาล</p>
                      <p className="font-semibold text-emerald-900 truncate flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                        {spreadsheet.title}
                      </p>
                      <a
                        href={spreadsheet.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
                      >
                        <span>เปิด Google Sheets</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <button
                      onClick={handleSyncToSheets}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                    >
                      <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>อัปเดตข้อมูลพยาบาล</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกเชื่อมโยงกับชีตนี้?")) {
                          setSpreadsheet(null);
                          localStorage.removeItem("connected_spreadsheet_id");
                          showToast("ยกเลิกเชื่อมโยงชีตแล้ว", "info");
                        }
                      }}
                      className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mt-1 block"
                    >
                      ยกเลิกเชื่อมโยงชีตนี้
                  </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">ยังไม่ได้สร้างหรือเลือกชีต</p>
                    
                    <button
                      onClick={handleCreateNewSheet}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>สร้างชีตพยาบาลใหม่</span>
                    </button>

                    <button
                      onClick={handleSearchSheets}
                      className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium cursor-pointer"
                    >
                      เชื่อมโยงชีตที่มีอยู่
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
          <div className="p-4 bg-slate-900 rounded-xl text-white">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Cloud Storage</p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-sm font-medium text-slate-200">คลาวด์เชื่อมต่อสมบูรณ์</span>
            </div>
          </div>

          <button
            onClick={async () => {
              if (user) {
                await handleLogout();
              } else {
                setHasEntered(false);
                showToast("กลับสู่หน้าแรกเรียบร้อยแล้ว", "info");
              }
            }}
            id="btn-sidebar-logout"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ / กลับหน้าแรก</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-slate-800">ใบประกอบวิชาชีพพยาบาล</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Cloud Actions in Top Bar */}
            <div className="flex items-center gap-2">
              {role === "admin" && (
                <>
                  {spreadsheet && (
                    <button
                      onClick={handleSyncToSheets}
                      disabled={isSyncing}
                      title="ซิงโครไนซ์ข้อมูลลงใน Google Sheets ของคุณ"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 animate-fade-in"
                    >
                      <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>ซิงก์ Sheets</span>
                    </button>
                  )}
                  <button
                    onClick={handleExportBackup}
                    title="ดาวน์โหลดข้อมูลสำรอง JSON"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold cursor-pointer transition-colors animate-fade-in"
                  >
                    <Download className="w-3.5 h-3.5" />
                    สำรองข้อมูล
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="นำเข้าไฟล์ข้อมูลสำรอง JSON"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold cursor-pointer transition-colors animate-fade-in"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    นำเข้าข้อมูล
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestoreBackup}
                    accept=".json"
                    className="hidden"
                  />
                </>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={isLoading}
                title="รีเฟรชฐานข้อมูลคลาวด์"
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user ? user.displayName : role === "admin" ? "วรปรัชญ์ ไชยมงคล" : "ผู้ใช้งาน ทั่วไป"}
                </p>
                <p className="text-xs text-slate-400 italic">
                  {role === "admin" ? "ผู้ดูแลระบบสารสนเทศ" : "ผู้ใช้งานทั่วไป (Read-only)"}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                role === "admin"
                  ? "bg-blue-100 border-blue-200 text-blue-700"
                  : "bg-emerald-100 border-emerald-200 text-emerald-700"
              }`}>
                {user && user.displayName 
                  ? user.displayName.slice(0, 2) 
                  : role === "admin" ? "วช" : "ทป"
                }
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">กำลังเชื่อมต่อและโหลดฐานข้อมูลคลาวด์...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* 1. Dashboard Key Numbers */}
              <DashboardStats
                licenses={licenses}
                onTriggerScan={handleTriggerScan}
                isScanning={isScanning}
                role={role}
              />

              {/* 2. Visual Graphs and Analytics */}
              <AnalyticsCharts licenses={licenses} />

              {/* 3. Table and Search filters */}
              <LicenseTable
                licenses={licenses}
                onEdit={handleEditClick}
                onDelete={handleDeleteLicense}
                onNotify={handleNotifyLicense}
                onAddNewClick={handleAddNewClick}
                role={role}
              />

              {/* 4. Notification history & Simulation Logs */}
              {role === "admin" && (
                <NotificationCenter
                  logs={logs}
                  onTriggerScan={handleTriggerScan}
                  isScanning={isScanning}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Create/Update License Modal */}
      <AddEditLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLicense}
        license={selectedLicense}
      />

      {/* 6. Google Sheets Selector Modal */}
      <AnimatePresence>
        {showSheetSelector && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">เลือก Google Sheets จากไดรฟ์</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">ค้นหาไฟล์ชีตพยาบาลที่มีอยู่เพื่อนำมาเชื่อมโยง</p>
                </div>
                <button
                  onClick={() => setShowSheetSelector(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
                {isLoadingSheets ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">กำลังค้นหาไฟล์ใน Google Drive...</p>
                  </div>
                ) : availableSheets.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">ไม่พบไฟล์ที่ระบุ</p>
                    <p className="text-xs text-slate-400 max-w-[250px] mx-auto">
                      ไฟล์ชีตในไดรฟ์ต้องมีชื่อคำว่า "ใบประกอบวิชาชีพ" หรือ "พยาบาล" จึงจะแสดงขึ้นที่นี่
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableSheets.map((sheet) => (
                      <button
                        key={sheet.id}
                        onClick={() => handleSelectExistingSheet(sheet.id)}
                        className="w-full text-left p-3 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-xs text-slate-700 truncate group-hover:text-blue-600">{sheet.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{sheet.id}</p>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setShowSheetSelector(false)}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateNewSheet}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  สร้างชีตใหม่แทน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
