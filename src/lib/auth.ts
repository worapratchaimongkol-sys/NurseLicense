import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { License } from "../types";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required scopes
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If there is a user but no cached token, they might have reloaded.
        // In popups we usually need a fresh sign-in to get the access token,
        // or we can prompt them to sign in to renew the Google session token.
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve Google Access Token");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Google Drive & Sheets API Operations

export interface SpreadsheetMetadata {
  id: string;
  title: string;
  url: string;
  sheetTitle: string;
}

// 1. Create a new Spreadsheet
export const createSpreadsheet = async (
  accessToken: string,
  title: string
): Promise<SpreadsheetMetadata> => {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const sheetTitle = data.sheets?.[0]?.properties?.title || "Sheet1";

  return {
    id: spreadsheetId,
    title: title,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    sheetTitle,
  };
};

// 2. Fetch Spreadsheet Details (to check if it exists and find sheet title)
export const fetchSpreadsheetMetadata = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spreadsheet not found or access denied");
  }

  const data = await response.json();
  const title = data.properties?.title || "ใบประกอบวิชาชีพพยาบาล";
  const sheetTitle = data.sheets?.[0]?.properties?.title || "Sheet1";

  return {
    id: spreadsheetId,
    title,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    sheetTitle,
  };
};

// 3. Update all license data in the Spreadsheet
export const updateSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  licenses: License[]
): Promise<void> => {
  const range = `${sheetTitle}!A1`;
  
  // Format dates beautifully
  const rows = [
    [
      "รหัสพยาบาล",
      "ชื่อ-นามสกุล",
      "เลขที่ใบประกอบวิชาชีพ",
      "วันที่ออกใบอนุญาต",
      "วันที่หมดอายุ",
      "แผนก/ฝ่าย",
      "เบอร์ภายใน",
      "เบอร์โทรศัพท์",
      "สถานะ",
      "หมายเหตุ",
      "อัปเดตล่าสุด"
    ],
    ...licenses.map((lic) => [
      lic.id,
      lic.name,
      lic.licenseNumber,
      lic.issueDate,
      lic.expiryDate,
      lic.department,
      lic.email,
      lic.phone,
      lic.status === "active" ? "ปกติ" : lic.status === "warning" ? "ใกล้หมดอายุ" : "หมดอายุแล้ว",
      lic.notes || "",
      new Date().toLocaleString("th-TH")
    ])
  ];

  // We perform a PUT request to completely replace the values
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: rows,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update sheet values: ${errText}`);
  }
};

// 4. List spreadsheets created in Google Drive (recent files matching app name)
export const searchAppSpreadsheets = async (
  accessToken: string
): Promise<{ id: string; name: string }[]> => {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and name contains 'ใบประกอบวิชาชีพ' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=10`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
  }));
};
