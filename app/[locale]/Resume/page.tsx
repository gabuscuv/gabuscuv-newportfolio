import {ReactNode} from 'react';
import {unstable_setRequestLocale} from 'next-intl/server';
import {ResumeBuilder} from './components/ResumeBuilder';
import {ResumeContent} from '@/src/data/Resume';

//function to generate the routes for all the locales
export async function generateStaticParams() {
  return ['en', 'es'].map(locale => ({locale}));
}

// @ts-expect-error -- TypeScript will validate that only known `params`
// are used in combination with a given `pathname`. Since the two will
// always match for the current route, we can skip runtime checks.
export default function Resume({params: {locale}}): ReactNode {
  unstable_setRequestLocale(locale);
  const resume = ResumeContent();

  return (
    <>
      {/* eslint:ignore */}
      <ResumeBuilder locale={locale} resume={resume} />
    </>
  );
}
