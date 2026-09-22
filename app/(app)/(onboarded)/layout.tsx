import { redirect } from 'next/navigation';
import { getCurrentStudent } from '@/lib/data/students';

// Everything under this group requires a finished onboarding (PLAN.md §4). /onboarding itself
// sits outside the group so the redirect cannot loop.
export default async function OnboardedLayout({ children }: LayoutProps<'/'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');
  if (!student.onboarding_completed_at) redirect('/onboarding');
  return children;
}
