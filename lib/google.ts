// Google Identity Services + REST API utility
// Docs: https://developers.google.com/identity/oauth2/web/guides/use-token-model

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const TOKEN_KEY = 'productivity-app-google-token';
const CLIENT_ID_KEY = 'productivity-app-google-client-id';
const USER_INFO_KEY = 'productivity-app-google-user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoogleToken {
  access_token: string;
  expires_at: number; // ms timestamp
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  htmlLink: string;
}

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

// ─── Client ID ────────────────────────────────────────────────────────────────

export function saveClientId(clientId: string): void {
  localStorage.setItem(CLIENT_ID_KEY, clientId);
}

export function getClientId(): string | null {
  return localStorage.getItem(CLIENT_ID_KEY);
}

// ─── Token Management ─────────────────────────────────────────────────────────

function storeToken(access_token: string, expires_in: number): void {
  const data: GoogleToken = {
    access_token,
    expires_at: Date.now() + expires_in * 1000 - 60_000, // 60s buffer
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

export function getStoredToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const data: GoogleToken = JSON.parse(raw);
    if (Date.now() < data.expires_at) return data.access_token;
  } catch { /* ignore */ }
  localStorage.removeItem(TOKEN_KEY);
  return null;
}

export function signOutGoogle(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

export function getStoredUserInfo(): GoogleUserInfo | null {
  const raw = localStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ─── OAuth (Google Identity Services) ────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.getElementById('gis-script');
    if (existing) {
      // Script tag already injected; poll until loaded
      const poll = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(poll); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export async function signInWithGoogle(clientId: string): Promise<string> {
  await loadGISScript();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (response: { access_token?: string; expires_in?: number; error?: string }) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'OAuth failed'));
          return;
        }
        storeToken(response.access_token, response.expires_in ?? 3600);
        // Fetch and cache user info
        try {
          const info = await googleFetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            response.access_token
          );
          localStorage.setItem(USER_INFO_KEY, JSON.stringify({
            email: info.email,
            name: info.name,
            picture: info.picture,
          }));
        } catch { /* non-fatal */ }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

// ─── API Helper ───────────────────────────────────────────────────────────────

async function googleFetch(url: string, token: string): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google API ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export async function getCalendarEvents(token: string, maxResults = 10): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(now)}&maxResults=${maxResults}`;
  const data = await googleFetch(url, token);
  return (data.items ?? []) as CalendarEvent[];
}

// ─── Gmail ────────────────────────────────────────────────────────────────────

export async function getRecentEmails(token: string, maxResults = 20): Promise<GmailMessage[]> {
  // 1. List message IDs
  const listUrl =
    `https://www.googleapis.com/gmail/v1/users/me/messages` +
    `?maxResults=${maxResults}&labelIds=INBOX`;
  const listData = await googleFetch(listUrl, token);
  const ids: string[] = (listData.messages ?? []).map((m: { id: string }) => m.id);
  if (ids.length === 0) return [];

  // 2. Fetch metadata for each (in parallel, capped at 20)
  const messages = await Promise.all(
    ids.map(id =>
      googleFetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${id}` +
        `?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        token
      )
    )
  );

  return messages.map(msg => {
    const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
    const get = (name: string) => headers.find(h => h.name === name)?.value ?? '';
    return {
      id: msg.id,
      subject: get('Subject') || '(no subject)',
      from: get('From'),
      snippet: msg.snippet ?? '',
      date: get('Date'),
    };
  });
}

// ─── Drive ────────────────────────────────────────────────────────────────────

export async function listDriveFiles(token: string, query?: string): Promise<DriveFile[]> {
  let url =
    `https://www.googleapis.com/drive/v3/files` +
    `?pageSize=20&fields=files(id,name,mimeType,webViewLink,modifiedTime)&orderBy=modifiedTime+desc`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  const data = await googleFetch(url, token);
  return (data.files ?? []) as DriveFile[];
}
