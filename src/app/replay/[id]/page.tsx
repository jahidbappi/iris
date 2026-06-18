"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionSnapshot } from "@/types";
import { ReplayTimeline } from "@/components/studio/ReplayTimeline";
import { useSessionStore } from "@/lib/store/session-store";
import { formatCost } from "@/lib/utils";

export default function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const snapshots = useSessionStore((s) => s.snapshots);

  useEffect(() => {
    void params.then(async ({ id }) => {
      const local = snapshots.find((s) => s.id === id);
      if (local) {
        setSession(local);
        return;
      }
      const res = await fetch(`/api/session?id=${id}`);
      if (res.ok) {
        setSession((await res.json()) as SessionSnapshot);
      }
    });
  }, [params, snapshots]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070d] text-white/50">
        Loading replay...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070d] px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/studio" className="text-sm text-violet-300/80 hover:text-violet-200">
          ← Back to Studio
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">{session.title}</h1>
        <p className="mt-2 text-sm text-white/50">
          {new Date(session.createdAt).toLocaleString()} · {formatCost(session.metrics.totalCostUsd)}
        </p>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <ReplayTimeline events={session.events} />
        </div>
      </div>
    </div>
  );
}
