import { NextRequest, NextResponse } from "next/server";
import type { SessionSnapshot } from "@/types";

const sessions = new Map<string, SessionSnapshot>();

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ sessions: Array.from(sessions.values()) });
  }

  const session = sessions.get(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function POST(request: NextRequest) {
  const snapshot = (await request.json()) as SessionSnapshot;
  sessions.set(snapshot.id, snapshot);
  return NextResponse.json({
    ...snapshot,
    shareUrl: `/replay/${snapshot.id}`,
  });
}
