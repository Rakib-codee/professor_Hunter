'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentStudent } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';

// Admin mutations. RLS (professors_admin, reports_admin_update) is the real gate; the role
// check here only gives a clean message instead of a policy error.

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

const PROFESSOR_STATUSES = ['active', 'bounced', 'moved', 'retired'] as const;
const NOT_ADMIN = 'Admin only.';
const GENERIC = 'Could not save. Please try again.';

async function requireAdmin(): Promise<boolean> {
  const student = await getCurrentStudent();
  return student?.role === 'admin';
}

export async function resolveReport(id: string): Promise<AdminActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: GENERIC };
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN };
  const supabase = await createClient();
  const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
  if (error) {
    console.error(`[admin.resolveReport] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/admin');
  revalidatePath('/admin/reports');
  return { ok: true };
}

const statusSchema = z.object({ professorId: z.uuid(), status: z.enum(PROFESSOR_STATUSES) });

export async function setProfessorStatus(
  input: z.input<typeof statusSchema>,
): Promise<AdminActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Choose a valid status.' };
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN };
  const supabase = await createClient();
  const { error } = await supabase
    .from('professors')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.professorId);
  if (error) {
    console.error(`[admin.setProfessorStatus] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/admin/reports');
  revalidatePath(`/professor/${parsed.data.professorId}`);
  return { ok: true };
}
