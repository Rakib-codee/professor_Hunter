import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Uptime + keep-alive (PLAN.md §3): the weekly GitHub Action calls this so the free Supabase
// project never idles. A trivial select proves the database answers.

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    const { error } = await createAdminClient()
      .from('universities')
      .select('id', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({
      ok: true,
      db: 'up',
      latencyMs: Date.now() - startedAt,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[health] ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { ok: false, db: 'down', time: new Date().toISOString() },
      { status: 503 },
    );
  }
}
