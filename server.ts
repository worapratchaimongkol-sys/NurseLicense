import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface License {
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

interface NotificationLog {
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

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const LICENSES_FILE = path.join(DATA_DIR, "licenses.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LICENSES_FILE)) {
  fs.writeFileSync(LICENSES_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
}

// Read and write helper functions
function readLicenses(): License[] {
  try {
    const data = fs.readFileSync(LICENSES_FILE, "utf-8");
    return JSON.parse(data) as License[];
  } catch (error) {
    console.error("Error reading licenses:", error);
    return [];
  }
}

function writeLicenses(licenses: License[]) {
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(licenses, null, 2));
  } catch (error) {
    console.error("Error writing licenses:", error);
  }
}

function readNotifications(): NotificationLog[] {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
    return JSON.parse(data) as NotificationLog[];
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

function writeNotifications(notifications: NotificationLog[]) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error("Error writing notifications:", error);
  }
}

// Calculate license status based on expiry date
function calculateStatus(expiryDateStr: string): "active" | "warning" | "expired" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < now) {
    return "expired";
  }

  // Calculate difference in months
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 3 months is approximately 90 days
  if (diffDays <= 90) {
    return "warning";
  }

  return "active";
}

// Auto-seed with initial data if empty
function seedInitialData() {
  // Mock data seeding has been removed as requested.
}

seedInitialData();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get all licenses with updated status recalculated dynamically
  app.get("/api/licenses", (req, res) => {
    try {
      const licenses = readLicenses();
      const updatedLicenses = licenses.map((lic) => {
        const calculated = calculateStatus(lic.expiryDate);
        if (calculated !== lic.status) {
          lic.status = calculated;
        }
        return lic;
      });
      writeLicenses(updatedLicenses);
      res.json(updatedLicenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  // API: Get single license
  app.get("/api/licenses/:id", (req, res) => {
    try {
      const licenses = readLicenses();
      const license = licenses.find((l) => l.id === req.params.id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });

  // API: Create license
  app.post("/api/licenses", (req, res) => {
    try {
      const { name, licenseNumber, issueDate, expiryDate, department, email, phone, notes } = req.body;
      
      if (!name || !licenseNumber || !issueDate || !expiryDate || !department || !email || !phone) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const licenses = readLicenses();
      
      // Check for duplicate license number
      const isDuplicate = licenses.some((l) => l.licenseNumber === licenseNumber);
      if (isDuplicate) {
        return res.status(400).json({ error: "เลขที่ใบประกอบวิชาชีพนี้มีอยู่ในระบบแล้ว" });
      }

      const calculatedStatus = calculateStatus(expiryDate);
      const newLicense: License = {
        id: `lic_${Date.now()}`,
        name,
        licenseNumber,
        issueDate,
        expiryDate,
        department,
        email,
        phone,
        notes: notes || "",
        status: calculatedStatus,
        notificationSent: false,
        lastNotifiedAt: null,
      };

      licenses.push(newLicense);
      writeLicenses(licenses);
      res.status(201).json(newLicense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create license" });
    }
  });

  // API: Update license
  app.put("/api/licenses/:id", (req, res) => {
    try {
      const { name, licenseNumber, issueDate, expiryDate, department, email, phone, notes } = req.body;
      const licenses = readLicenses();
      const index = licenses.findIndex((l) => l.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "License not found" });
      }

      // Check for duplicate license number other than current license
      const isDuplicate = licenses.some((l) => l.licenseNumber === licenseNumber && l.id !== req.params.id);
      if (isDuplicate) {
        return res.status(400).json({ error: "เลขที่ใบประกอบวิชาชีพนี้มีอยู่ในระบบแล้ว" });
      }

      const calculatedStatus = calculateStatus(expiryDate);
      const originalLic = licenses[index];
      
      // Reset notification if expiration date changed
      const expiryChanged = originalLic.expiryDate !== expiryDate;

      licenses[index] = {
        ...originalLic,
        name,
        licenseNumber,
        issueDate,
        expiryDate,
        department,
        email,
        phone,
        notes: notes || "",
        status: calculatedStatus,
        notificationSent: expiryChanged ? false : originalLic.notificationSent,
        lastNotifiedAt: expiryChanged ? null : originalLic.lastNotifiedAt,
      };

      writeLicenses(licenses);
      res.json(licenses[index]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update license" });
    }
  });

  // API: Delete license
  app.delete("/api/licenses/:id", (req, res) => {
    try {
      const licenses = readLicenses();
      const filtered = licenses.filter((l) => l.id !== req.params.id);
      
      if (licenses.length === filtered.length) {
        return res.status(404).json({ error: "License not found" });
      }

      writeLicenses(filtered);
      res.json({ message: "License deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete license" });
    }
  });

  // API: Trigger/Simulate sending email notification
  app.post("/api/licenses/notify/:id", (req, res) => {
    try {
      const licenses = readLicenses();
      const index = licenses.findIndex((l) => l.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "License not found" });
      }

      const lic = licenses[index];
      const now = new Date();
      const expiry = new Date(lic.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const type = calculateStatus(lic.expiryDate) === "expired" ? "expired" : "warning";

      // Save notification log
      const notifications = readNotifications();
      const newLog: NotificationLog = {
        id: `notif_${Date.now()}`,
        licenseId: lic.id,
        nurseName: lic.name,
        licenseNumber: lic.licenseNumber,
        email: lic.email,
        sentAt: now.toISOString(),
        expiryDate: lic.expiryDate,
        daysRemaining: diffDays,
        type,
        status: "success",
      };

      notifications.unshift(newLog);
      writeNotifications(notifications);

      // Update license notification status
      licenses[index].notificationSent = true;
      licenses[index].lastNotifiedAt = now.toISOString();
      writeLicenses(licenses);

      res.json({ message: "Notification sent successfully", log: newLog });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // API: Get notification logs
  app.get("/api/notifications", (req, res) => {
    try {
      res.json(readNotifications());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // API: Auto-check all and trigger notifications for warning/expired
  app.post("/api/licenses/check-all", (req, res) => {
    try {
      const licenses = readLicenses();
      const notifications = readNotifications();
      const now = new Date();
      let count = 0;

      const updatedLicenses = licenses.map((lic) => {
        const calculatedStatus = calculateStatus(lic.expiryDate);
        lic.status = calculatedStatus;

        // If it's a warning or expired and hasn't been notified yet (or notify state reset)
        if ((calculatedStatus === "warning" || calculatedStatus === "expired") && !lic.notificationSent) {
          const expiry = new Date(lic.expiryDate);
          const diffTime = expiry.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const newLog: NotificationLog = {
            id: `notif_${Date.now()}_${count}`,
            licenseId: lic.id,
            nurseName: lic.name,
            licenseNumber: lic.licenseNumber,
            email: lic.email,
            sentAt: now.toISOString(),
            expiryDate: lic.expiryDate,
            daysRemaining: diffDays,
            type: calculatedStatus === "expired" ? "expired" : "warning",
            status: "success",
          };

          notifications.unshift(newLog);
          lic.notificationSent = true;
          lic.lastNotifiedAt = now.toISOString();
          count++;
        }
        return lic;
      });

      if (count > 0) {
        writeNotifications(notifications);
        writeLicenses(updatedLicenses);
      }

      res.json({ message: `System scan complete. Sent ${count} pending notifications.`, count });
    } catch (error) {
      res.status(500).json({ error: "Failed to run system scan" });
    }
  });

  // API: Backup Restore
  app.post("/api/backup/restore", (req, res) => {
    try {
      const { licenses } = req.body;
      if (!Array.isArray(licenses)) {
        return res.status(400).json({ error: "Invalid backup file structure" });
      }

      // Revalidate all statuses on restore
      const restored = licenses.map((lic: any) => {
        const status = calculateStatus(lic.expiryDate);
        return {
          id: lic.id || `lic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: lic.name || "",
          licenseNumber: lic.licenseNumber || "",
          issueDate: lic.issueDate || "",
          expiryDate: lic.expiryDate || "",
          department: lic.department || "",
          email: lic.email || "",
          phone: lic.phone || "",
          notes: lic.notes || "",
          status,
          notificationSent: lic.notificationSent || false,
          lastNotifiedAt: lic.lastNotifiedAt || null,
        };
      });

      writeLicenses(restored);
      res.json({ message: "Restore successful", count: restored.length });
    } catch (error) {
      res.status(500).json({ error: "Restore failed" });
    }
  });

  // Vite middleware for asset serving in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
