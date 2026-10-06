import { NextRequest, NextResponse } from "next/server";
import os from "os";
import {
  createScanSession,
  getScanSession,
  updateScanSession,
} from "@/lib/scan/sessionStore";

function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// GET /api/scan/session?id=AU-XXXXXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const session = getScanSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session expired or not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

// POST /api/scan/session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Create session (called by Desktop)
    if (action === "create") {
      const session = createScanSession();
      const lanIp = getLanIp();
      const host = req.headers.get("host") || "localhost:3000";
      const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
      const port = host.includes(":") ? host.split(":")[1] : "3000";

      // If user is accessing via localhost, use LAN IP so mobile devices on the same Wi-Fi can open it
      const mobileHost = isLocalhost ? `${lanIp}:${port}` : host;
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const baseUrl = `${protocol}://${mobileHost}`;

      return NextResponse.json({ session, baseUrl, lanIp });
    }

    // 2. Submit photo or parsed CSV (called by Mobile)
    if (action === "submit") {
      const { id, csvData, imageBase64 } = body;

      if (!id) {
        return NextResponse.json({ error: "Missing session id" }, { status: 400 });
      }

      const session = getScanSession(id);
      if (!session) {
        return NextResponse.json({ error: "Session expired or invalid" }, { status: 404 });
      }

      // If pre-parsed CSV is provided directly
      if (csvData) {
        updateScanSession(id, {
          status: "completed",
          csvData,
        });
        return NextResponse.json({ success: true });
      }

      // If raw imageBase64 is provided from mobile camera, trigger vision parse
      if (imageBase64) {
        updateScanSession(id, { status: "processing" });

        // Forward to vision parse endpoint internally
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const visionUrl = `${protocol}://${host}/api/vision/parse-bill`;

        try {
          const vRes = await fetch(visionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64 }),
          });

          const vData = await vRes.json();

          if (vRes.ok && vData.csvData) {
            updateScanSession(id, {
              status: "completed",
              csvData: vData.csvData,
              error: undefined,
            });
            return NextResponse.json({
              success: true,
              rowCount: vData.rowCount,
              notes: vData.notes,
            });
          } else {
            updateScanSession(id, {
              status: "error",
              error: vData.error || "Could not read transactions from photo.",
            });
            return NextResponse.json(
              { error: vData.error || "Failed to parse image." },
              { status: 422 }
            );
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Vision processing failed";
          updateScanSession(id, { status: "error", error: msg });
          return NextResponse.json({ error: msg }, { status: 500 });
        }
      }

      return NextResponse.json({ error: "No image or CSV provided" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
