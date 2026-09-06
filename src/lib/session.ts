import { cookies } from "next/headers";
import { SessionPayload } from "@/types";

const COOKIE_NAME = "recyconnect_session";
const SECRET_KEY = process.env.SESSION_SECRET || "recyconnect-secure-session-auth-token-prod-2026";

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64URL encode
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Base64URL decode
function base64UrlDecode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf-8");
  }
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Import CryptoKey for HMAC-SHA256
async function getCryptoKey(): Promise<CryptoKey> {
  const keyData = stringToUint8Array(SECRET_KEY) as unknown as BufferSource;
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  
  // 7 days expiration
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const fullPayload = { ...payload, exp };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8Array(dataToSign) as unknown as BufferSource
  );

  let signature = "";
  if (typeof Buffer !== "undefined") {
    signature = Buffer.from(signatureBuffer).toString("base64url");
  } else {
    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    signature = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  return `${dataToSign}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const key = await getCryptoKey();
    let sigBytes: Uint8Array;
    if (typeof Buffer !== "undefined") {
      sigBytes = new Uint8Array(Buffer.from(signature, "base64url"));
    } else {
      const binary = atob(signature.replace(/-/g, "+").replace(/_/g, "/"));
      sigBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        sigBytes[i] = binary.charCodeAt(i);
      }
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      stringToUint8Array(dataToSign) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const parsed = JSON.parse(payloadJson);

    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      role: parsed.role,
      userId: parsed.userId,
      phone: parsed.phone,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
