import type { Metadata } from "next";
import AboutContact from "@/components/sections/AboutContact";
import Capabilities from "@/components/sections/Capabilities";
import Certifications from "@/components/sections/Certifications";
import FlagshipCaseStudy from "@/components/sections/FlagshipCaseStudy";
import Hero from "@/components/sections/Hero";
import WritingTeaser from "@/components/sections/WritingTeaser";
import {
  getCertifications,
  getFlagshipCaseStudy,
  getPosts,
  getSiteProfile,
  getSkillPillars,
} from "@/lib/content";

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
      <Hero profile={profile} caseStudy={caseStudy} />
      <FlagshipCaseStudy caseStudy={caseStudy} />
      <Capabilities pillars={pillars} />
      <Certifications certifications={certifications} />
      <WritingTeaser posts={posts.slice(0, 3)} />
      <AboutContact profile={profile} />
    </>
  );
}
