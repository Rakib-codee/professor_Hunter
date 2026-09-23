import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCvSignedUrl } from '@/actions/profile';
import { AcademicForm } from '@/components/profile/academic-form';
import { CvSection } from '@/components/profile/cv-section';
import { BasicForm } from '@/components/profile/basic-form';
import { CompletenessBar } from '@/components/profile/completeness-bar';
import { ResearchForm } from '@/components/profile/research-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentStudent } from '@/lib/data/students';
import { computeCompleteness } from '@/lib/profile/completeness';

export const metadata: Metadata = { title: 'Profile' };

// Same three forms as onboarding, each saving its own section.
export default async function ProfilePage() {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');
  const completeness = computeCompleteness(student);
  const cvUrl = student.cv_path ? await getCvSignedUrl() : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight">Profile</h1>
      <CompletenessBar result={completeness} />
      <Card>
        <CardHeader>
          <CardTitle>About you</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicForm student={student} flow="profile" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your application</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicForm student={student} flow="profile" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your research</CardTitle>
          <CardDescription>Used to match professors and personalise drafts.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchForm student={student} flow="profile" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>CV</CardTitle>
          <CardDescription>Private. Only you can download it.</CardDescription>
        </CardHeader>
        <CardContent>
          <CvSection downloadUrl={cvUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
