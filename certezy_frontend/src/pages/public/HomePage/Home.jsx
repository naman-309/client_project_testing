import HeroSection from "./HeroSection";
import LearningSection from "./LearningSection";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import CTABanner from "./CTABanner";
import WhyChooseSection from "./WhyChooseSection";
import SkillsSection from "./SkillsSection";
//import FeaturedCourses from "./FeaturedCourses";
// Yeh sections baad mein banate jayenge — import karte rehna
// import StatsBar          from "@/components/home/StatsBar";
// import FeaturedCourses   from "@/components/home/FeaturedCourses";
// import HowItWorks        from "@/components/home/HowItWorks";
// import CategoriesSection from "@/components/home/CategoriesSection";
// import Testimonials      from "@/components/home/Testimonials";
// import CTASection        from "@/components/home/CTASection";
// import Footer            from "@/components/home/Footer";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <LearningSection />
            {/* <FeaturedCourses/> */}
            <HowItWorks />
            <Testimonials />

            <WhyChooseSection />

            <SkillsSection />

            <CTABanner />
            {/* Yeh uncomment karte jayenge jaise jaise components bante jayenge */}
            {/* <StatsBar /> */}
            {/* <FeaturedCourses /> */}
            {/* <HowItWorks /> */}
            {/* <CategoriesSection /> */}
            {/* <Testimonials /> */}
            {/* <CTASection /> */}
            {/* <Footer /> */}
        </main>
    );
}
