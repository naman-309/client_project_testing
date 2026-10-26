// src/components/Footer.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import BrandName from "@/components/shared/BrandName";
import { APP_NAME, SUPPORT_EMAIL } from "@/config/app";

// ─── ICONS ────────────────────────────────────────────────────
const IconLinkedIn = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);
const IconTwitter = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
const IconYouTube = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
        <path
            fill="#FF0000"
            d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"
        />
        <polygon fill="#FFFFFF" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
);
const IconInstagram = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="26%" stopColor="#FCAF45" />
                <stop offset="51%" stopColor="#F77737" />
                <stop offset="76%" stopColor="#F56040" />
                <stop offset="100%" stopColor="#C13584" />
            </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)" />
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
);
const IconFacebook = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);
const IconMail = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const IconHeadset = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);
const IconPhone = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const IconChevron = ({ open }) => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const IconArrowUp = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </svg>
);

// ─── DATA ─────────────────────────────────────────────────────
const CATEGORIES = [
    { label: "Cyber Security", to: "/courses?category_slug=cyber-security" },
    { label: "Project Mgmt", to: "/courses?category_slug=project-management" },
    { label: "Cloud Computing", to: "/courses?category_slug=cloud-computing" },
    { label: "DevOps", to: "/courses?category_slug=devops" },
    { label: "Data Science", to: "/courses?category_slug=data-science" },
    { label: "Networking", to: "/courses?category_slug=networking" },
];
const QUICK_LINKS = [
    { label: "About Us", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
    { label: "Help Center", to: "/help" },
];
const STUDENT_LINKS = [
    { label: "My Learning", to: "/student/my-courses", highlight: false },
    { label: "Dashboard", to: "/student/dashboard", highlight: false },
    { label: "Login", to: "/login", highlight: true },
    { label: "Sign Up", to: "/register", highlight: true },
];

// ─── ACCORDION (mobile) ───────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/[0.07]">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center py-4 bg-transparent border-none cursor-pointer text-white text-xs font-bold uppercase tracking-widest"
            >
                {title}
                <IconChevron open={open} />
            </button>
            <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? "400px" : "0" }}
            >
                <div className="pb-3">{children}</div>
            </div>
        </div>
    );
}

// ─── FOOTER LINK ──────────────────────────────────────────────
function FooterLink({ to = "#", children, highlight }) {
    return (
        <Link
            to={to}
            className={`block py-1 text-sm transition-colors duration-150 no-underline ${
                highlight
                    ? "text-blue-400 font-semibold hover:text-blue-300"
                    : "text-slate-500 font-normal hover:text-slate-200"
            }`}
        >
            {children}
        </Link>
    );
}

// ─── SOCIAL BUTTON ────────────────────────────────────────────
function SocialBtn({ icon, href = "#" }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
        >
            {icon}
        </a>
    );
}

// ─── CERTEZY LOGO ─────────────────────────────────────────────
function CertezyLogo() {
    return (
        <div className="flex items-center gap-2.5 mb-3.5">
            <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#3282B8", boxShadow: "0 2px 8px rgba(50,130,184,0.4)" }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            </div>
            <span className="text-lg font-extrabold text-slate-100 tracking-tight">
                <BrandName accentColor="#3282B8" />
            </span>
        </div>
    );
}

// ─── BACK TO TOP ──────────────────────────────────────────────
function BackToTop() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1.5 bg-transparent border border-white/10 hover:border-white/25 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-200 transition-all duration-200 cursor-pointer"
        >
            <IconArrowUp /> Back to top
        </button>
    );
}

// ─── SUPPORT CARD ─────────────────────────────────────────────
function SupportCard() {
    return (
        <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.08]">
            <p className="text-xs font-bold uppercase tracking-widest text-white mb-3.5">Support</p>

            {/* Email */}
            <div className="flex items-start gap-2.5 mb-3">
                <span className="mt-0.5" style={{ color: "#3282B8" }}>
                    <IconMail />
                </span>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Email us</p>
                    <p className="text-sm text-slate-400 font-medium">{SUPPORT_EMAIL}</p>
                </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5 mb-3">
                <span className="mt-0.5" style={{ color: "#3282B8" }}>
                    <IconPhone />
                </span>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Call us</p>
                    <p className="text-sm text-slate-400 font-medium">+91 XXXXX XXXXX</p>
                </div>
            </div>

            {/* Live chat */}
            <div className="flex items-start gap-2.5">
                <span className="mt-0.5" style={{ color: "#3282B8" }}>
                    <IconHeadset />
                </span>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Live Chat</p>
                    <p className="text-sm text-slate-400 font-medium">Available 24/7</p>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN FOOTER ──────────────────────────────────────────────
export default function Footer() {
    return (
        <footer className="relative overflow-hidden" style={{ background: "#0a1628", padding: "60px 0 0" }}>
            {/* Dot pattern bg */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                }}
            />

            <div className="max-w-screen-xl mx-auto px-6 relative z-10">
                {/* ── DESKTOP GRID ── */}
                <div
                    className="hidden md:grid gap-12"
                    style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.3fr" }}
                >
                    {/* Brand */}
                    <div>
                        <CertezyLogo />
                        <p className="text-sm text-slate-500 leading-relaxed mb-5">
                            Industry-recognized certification courses taught by experts. Advance your career
                            with confidence.
                        </p>
                        <div className="flex gap-2">
                            <SocialBtn icon={<IconLinkedIn />} href="https://linkedin.com" />
                            <SocialBtn icon={<IconInstagram />} href="https://instagram.com" />
                            <SocialBtn icon={<IconFacebook />} href="https://facebook.com" />
                            <SocialBtn icon={<IconTwitter />} href="https://twitter.com" />
                            <SocialBtn icon={<IconYouTube />} href="https://youtube.com" />
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white mb-3.5">
                            Top Categories
                        </p>
                        {CATEGORIES.map((c) => (
                            <FooterLink key={c.label} to={c.to}>
                                {c.label}
                            </FooterLink>
                        ))}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white mb-3.5">
                            Quick Links
                        </p>
                        {QUICK_LINKS.map((l) => (
                            <FooterLink key={l.label} to={l.to}>
                                {l.label}
                            </FooterLink>
                        ))}
                    </div>

                    {/* Student Area */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white mb-3.5">
                            Student Area
                        </p>
                        {STUDENT_LINKS.map((l) => (
                            <FooterLink key={l.label} to={l.to} highlight={l.highlight}>
                                {l.label}
                            </FooterLink>
                        ))}
                    </div>

                    {/* Support */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white mb-3.5">
                            Get in Touch
                        </p>
                        <SupportCard />
                    </div>
                </div>

                {/* ── MOBILE ── */}
                <div className="md:hidden">
                    <div className="pb-6 border-b border-white/[0.07]">
                        <CertezyLogo />
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                            Industry-recognized certification courses to accelerate your career.
                        </p>
                        <div className="flex gap-2">
                            <SocialBtn icon={<IconLinkedIn />} href="https://linkedin.com" />
                            <SocialBtn icon={<IconInstagram />} href="https://instagram.com" />
                            <SocialBtn icon={<IconFacebook />} href="https://facebook.com" />
                            <SocialBtn icon={<IconTwitter />} href="https://twitter.com" />
                            <SocialBtn icon={<IconYouTube />} href="https://youtube.com" />
                        </div>
                    </div>

                    <Accordion title="Categories" defaultOpen>
                        {CATEGORIES.map((c) => (
                            <FooterLink key={c.label} to={c.to}>
                                {c.label}
                            </FooterLink>
                        ))}
                    </Accordion>
                    <Accordion title="Student Area">
                        {STUDENT_LINKS.map((l) => (
                            <FooterLink key={l.label} to={l.to} highlight={l.highlight}>
                                {l.label}
                            </FooterLink>
                        ))}
                    </Accordion>
                    <Accordion title="Quick Links">
                        {QUICK_LINKS.map((l) => (
                            <FooterLink key={l.label} to={l.to}>
                                {l.label}
                            </FooterLink>
                        ))}
                    </Accordion>
                    <Accordion title="Support">
                        <div className="mt-2">
                            <SupportCard />
                        </div>
                    </Accordion>
                </div>

                {/* ── BOTTOM BAR ── */}
                <div className="border-t border-white/[0.07] mt-10">
                    <div className="flex items-center justify-between flex-wrap gap-3 py-5">
                        <span className="text-xs text-slate-600">
                            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                        </span>
                        <div className="flex items-center gap-5 flex-wrap">
                            <a
                                href="/privacy"
                                className="text-xs text-slate-600 hover:text-slate-400 transition-colors no-underline"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="/terms"
                                className="text-xs text-slate-600 hover:text-slate-400 transition-colors no-underline"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="/help"
                                className="text-xs text-slate-600 hover:text-slate-400 transition-colors no-underline"
                            >
                                Help Center
                            </a>
                            <BackToTop />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
