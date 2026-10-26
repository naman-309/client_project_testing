import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";

import { selectIsLoggedIn, selectUser } from "@/features/auth/authSlice";
import Searchbar from "./Searchbar";
import NavLinks from "./NavLinks";
import MegaMenu from "./MegaMenu";
import NotificationBell from "./NotificationBell";
import AvatarMenu from "./AvatarMenu";
import MobileMenu from "./MobileMenu";
import { cn } from "@/lib/utils";
import BrandName from "@/components/shared/BrandName";

/**
 * Responsive strategy:
 *
 * < md  (768px)   → Logo + Hamburger only
 * md    (768px)   → Logo + NavLinks(Home, All Courses, More) + Search(small) + Auth
 * lg    (1024px)  → Logo + NavLinks(+ Blog) + Search(medium) + Auth + MyLearning
 * xl    (1280px)  → Logo + NavLinks(+ About, Contact) + Search(large) + Auth
 * 2xl   (1536px)  → Same as xl, max-width expands to 1536px
 */

const NAV_H = "h-[70px]";

function NavBarIndex() {
    const [megaOpen, setMegaOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);

    const toggleMega = () => {
        setMegaOpen((p) => !p);
        setMobileOpen(false);
    };
    const toggleMobile = () => {
        setMobileOpen((p) => !p);
        setMegaOpen(false);
    };
    const closeMega = () => setMegaOpen(false);
    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
                {/*
                    max-w-screen-2xl = 1536px on 2xl screens
                    On xl (1280px) and below it fills naturally
                */}
                <div className={cn("max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center", NAV_H)}>
                    {/* ── Logo ── */}
                    <Logo />

                    {/* ── Nav links — desktop only ── */}
                    <div className="hidden md:flex items-center ml-6">
                        <NavLinks megaOpen={megaOpen} onToggleMega={toggleMega} navH={NAV_H} />
                    </div>

                    {/* ── Right group ── */}
                    <div className="hidden md:flex items-center gap-3 ml-auto">
                        {/* Search — grows with screen */}
                        <div className="w-[160px] lg:w-[200px] xl:w-[260px] 2xl:w-[300px]">
                            <Searchbar />
                        </div>

                        {isLoggedIn && user ? (
                            <>
                                {/* My Learning — lg+ only */}
                                <Link
                                    to="/student/my-courses"
                                    className="hidden lg:block text-[13.5px] font-semibold text-text-secondary hover:text-primary transition-colors whitespace-nowrap"
                                >
                                    My Learning
                                </Link>
                                <NotificationBell unreadCount={user.unreadCount ?? 0} />
                                <AvatarMenu user={user} />
                            </>
                        ) : (
                            <>
                                <LoginBtn />
                                <RegisterBtn />
                            </>
                        )}
                    </div>

                    {/* ── Hamburger — mobile only ── */}
                    <button
                        onClick={toggleMobile}
                        aria-label="Toggle menu"
                        className={cn(
                            "md:hidden flex items-center justify-center ml-auto",
                            "w-9 h-9 rounded-lg text-text-secondary",
                            "hover:text-primary hover:bg-primary-light transition-colors duration-200"
                        )}
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && <MobileMenu isLoggedIn={isLoggedIn} user={user} onClose={closeMobile} />}
            </header>

            {/* Mega menu — outside header so it overlaps content */}
            {megaOpen && <MegaMenu onClose={closeMega} />}
        </>
    );
}

// ── Logo ───────────────────────────────────────────────────
function Logo() {
    return (
        <Link to="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-[30px] h-[30px] rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <svg
                    width="15"
                    height="15"
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
            <span className="text-[16px] font-extrabold text-text-primary tracking-tight">
                <BrandName accentClassName="text-primary" />
            </span>
        </Link>
    );
}

// ── Auth buttons ───────────────────────────────────────────
function LoginBtn() {
    return (
        <Link
            to="/login"
            className="text-[13.5px] font-semibold text-text-secondary hover:text-primary transition-colors duration-200 whitespace-nowrap"
        >
            Log In
        </Link>
    );
}

function RegisterBtn() {
    return (
        <Link
            to="/register"
            className={cn(
                "flex items-center h-[36px] px-5 rounded-lg shrink-0",
                "bg-primary hover:bg-primary-hover",
                "text-[13.5px] font-bold text-white",
                "transition-colors duration-200 whitespace-nowrap",
                "shadow-sm"
            )}
        >
            Sign Up
        </Link>
    );
}

export default NavBarIndex;
