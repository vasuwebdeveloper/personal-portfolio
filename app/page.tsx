import type { Metadata } from "next";
import AboutContact from "@/components/sections/AboutContact";
import Capabilities from "@/components/sections/Capabilities";
import Certifications from "@/components/sections/Certifications";
import FlagshipCaseStudy from "@/components/sections/FlagshipCaseStudy";
import Hero from "@/components/sections/Hero";
import WritingTeaser from "@/components/sections/WritingTeaser";
import JsonLd from "@/components/ui/JsonLd";
import {
  getCertifications,
  getFlagshipCaseStudy,
  getPosts,
  getSiteProfile,
  getSkillPillars,
} from "@/lib/content";
import { personSchema, webSiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [profile, caseStudy, pillars, certifications, posts] =
    await Promise.all([
      getSiteProfile(),
      getFlagshipCaseStudy(),
      getSkillPillars(),
      getCertifications(),
      getPosts(),
    ]);

  return (
    <>
      <JsonLd data={personSchema(profile)} />
      <JsonLd data={webSiteSchema(profile)} />
      <Hero profile={profile} caseStudy={caseStudy} />
      <FlagshipCaseStudy caseStudy={caseStudy} />
      <Capabilities pillars={pillars} />
      <Certifications certifications={certifications} />
      <WritingTeaser posts={posts.slice(0, 3)} />
      <AboutContact profile={profile} />
    </>
  );
}
