import React from "react";
import AboutHero from "./AboutHero";
import AboutMission from "./AboutMission";
import WhyCertezy from "./WhyCertezy";
import ImpactNumbers from "./ImpactNumbers";
import CertificationsMarquee from "./CertificationsMarquee";
import CTABanner from "../HomePage/CTABanner";
export default function About() {
    return (
        <div>
            <AboutHero />
            <AboutMission />
            <WhyCertezy />
            <ImpactNumbers />
            <CertificationsMarquee />
            <CTABanner />
        </div>
    );
}
