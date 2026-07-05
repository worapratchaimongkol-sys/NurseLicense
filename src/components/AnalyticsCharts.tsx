import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { License } from "../types";

interface AnalyticsChartsProps {
  licenses: License[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ licenses }) => {
  // 1. Data for Status distribution
  const active = licenses.filter((l) => l.status === "active").length;
  const warning = licenses.filter((l) => l.status === "warning").length;
  const expired = licenses.filter((l) => l.status === "expired").length;

  const statusData = [
    { name: "ปกติ (ปลอดภัย)", value: active, color: "#10b981" },
    { name: "หมดอายุภายใน 3 เดือน", value: warning, color: "#f59e0b" },
    { name: "หมดอายุแล้ว", value: expired, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // 2. Data for Department Breakdown
  const deptMap: Record<string, number> = {};
  licenses.forEach((lic) => {
    deptMap[lic.department] = (deptMap[lic.department] || 0) + 1;
  });

  const deptData = Object.entries(deptMap).map(([name, count]) => ({
    name: name.replace("แผนก", "").replace(" (", "\n("), // make labels shorter
    จำนวน: count,
  }));

  // 3. Expiration timeline (next 12 months)
  const getExpirationTimeline = () => {
    const monthsThai = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    
    const now = new Date();
    const timelineData: Record<string, { name: string; count: number; rawDate: Date }> = {};

    // Initialize next 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const thaiYear = d.getFullYear() + 543; // Thai Buddhist Era year
      timelineData[key] = {
        name: `${monthsThai[d.getMonth()]} ${String(thaiYear).slice(-2)}`,
        count: 0,
        rawDate: d,
      };
    }

    // Populate counts
    licenses.forEach((lic) => {
      if (lic.status === "expired") return; // skip already expired for future timeline
      const exp = new Date(lic.expiryDate);
      const key = `${exp.getFullYear()}-${String(exp.getMonth() + 1).padStart(2, "0")}`;
      if (timelineData[key]) {
        timelineData[key].count += 1;
      }
    });

    return Object.values(timelineData).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  };

  const timelineData = getExpirationTimeline();

  return (
    <div id="analytics-charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Status distribution PieChart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[340px]">
        <h3 className="text-sm font-bold text-slate-800 mb-2">สัดส่วนสถานะใบประกอบวิชาชีพ</h3>
        <p className="text-xs text-slate-400 mb-4">แสดงอัตราส่วนใบประกอบวิชาชีพตามประเภทสถานะ</p>
        <div className="flex-1 min-h-0 relative">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} ราย`, "จำนวน"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  iconType="circle"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
              ยังไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟสัดส่วน
            </div>
          )}
        </div>
      </div>

      {/* 2. Timeline BarChart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[340px] lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-800 mb-2 font-sans">แนวโน้มใบประกอบวิชาชีพหมดอายุรายเดือน (12 เดือนข้างหน้า)</h3>
        <p className="text-xs text-slate-400 mb-4 font-sans">จำนวนพยาบาลวิชาชีพที่ต้องต่ออายุในแต่ละเดือน</p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} ราย`, "พยาบาลที่กำลังจะหมดอายุ"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", fontFamily: "Inter, sans-serif" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} name="จำนวน (ราย)">
                {timelineData.map((entry, index) => {
                  // highlight warning months or general bar color
                  return <Cell key={`cell-${index}`} fill="#3b82f6" />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
