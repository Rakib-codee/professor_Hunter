import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCvSignedUrl } from '@/actions/profile';
import { AcademicForm } from '@/components/profile/academic-form';
import { BasicForm } from '@/components/profile/basic-form';
import { CompletenessBar } from '@/components/profile/completeness-bar';
import { CvSection } from '@/components/profile/cv-section';
import { ProfileSections } from '@/components/profile/profile-sections';
import { ResearchForm } from '@/components/profile/research-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentStudent } from '@/lib/data/students';
import { computeCompleteness } from '@/lib/profile/completeness';
import { PROFILE_SECTIONS, missingBySection, sectionElementId } from '@/lib/profile/sections';

export const metadata: Metadata = { title: 'Profile' };

const [ABOUT, APPLICATION, RESEARCH] = PROFILE_SECTIONS;
const headingId = (id: (typeof PROFILE_SECTIONS)[number]['id']) =>
  `${sectionElementId(id)}-heading`;

// Same three forms as onboarding, each saving its own section. Layout, tabs and the section
// list live in ProfileSections; the forms render their own heading with the saved state.
export default async function ProfilePage() {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');
  const completeness = computeCompleteness(student);
  const cvUrl = student.cv_path ? await getCvSignedUrl() : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="heading-page">Profile</h1>
      <ProfileSections
        missing={missingBySection(completeness.missingItems)}
        summary={<CompletenessBar result={completeness} />}
        sections={{
          about: (
            <Card>
              <CardContent>
                <BasicForm
                  student={student}
                  flow="profile"
                  title={ABOUT.title}
                  headingId={headingId(ABOUT.id)}
                />
              </CardContent>
            </Card>
          ),
          application: (
            <>
              <Card>
                <CardContent>
                  <AcademicForm
                    student={student}
                    flow="profile"
                    title={APPLICATION.title}
                    headingId={headingId(APPLICATION.id)}
                  />
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
            </>
          ),
          research: (
            <Card>
              <CardContent>
                <ResearchForm
                  student={student}
                  flow="profile"
                  title={RESEARCH.title}
                  description={RESEARCH.description}
                  headingId={headingId(RESEARCH.id)}
                />
              </CardContent>
            </Card>
          ),
        }}
      />
    </div>
  );
}
