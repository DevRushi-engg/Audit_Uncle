/**
 * In-memory cross-device session store for live mobile camera bridge.
 * Sessions expire after 15 minutes.
 */

export interface ScanSession {
  id: string;
  createdAt: number;
  status: "waiting" | "processing" | "completed" | "error";
  csvData?: string;
  error?: string;
  previewUrl?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __scanSessions: Map<string, ScanSession> | undefined;
}

const sessions = global.__scanSessions ?? new Map<string, ScanSession>();
if (process.env.NODE_ENV !== "production") {
  global.__scanSessions = sessions;
}

// Auto-cleanup sessions older than 15 minutes
function pruneOldSessions() {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (session.createdAt < cutoff) {
      sessions.delete(id);
    }
  }
}

export function createScanSession(): ScanSession {
  pruneOldSessions();
  // Simple human-readable 6-character session token
  const id = "AU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const session: ScanSession = {
    id,
    createdAt: Date.now(),
    status: "waiting",
  };
  sessions.set(id, session);
  return session;
}

export function getScanSession(id: string): ScanSession | null {
  pruneOldSessions();
  return sessions.get(id) || null;
}

export function updateScanSession(
  id: string,
  update: Partial<Omit<ScanSession, "id" | "createdAt">>
): ScanSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  Object.assign(session, update);
  return session;
}

export function deleteScanSession(id: string): void {
  sessions.delete(id);
}
