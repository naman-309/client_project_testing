import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Info, Mail, HelpCircle, BookOpen } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Priority Navigation pattern:
 *
 * xl  (1280px+) → Home · All Courses · Blog · About · Contact   [no More]
 * lg  (1024px+) → Home · All Courses · Blog · More(About,Contact,Help)
 * md  (768px+)  → Home · All Courses · More(Blog,About,Contact,Help)
 * <md            → hidden (hamburger takes over)
 */

// Items that go into More dropdown — keyed by when they collapse
const BLOG = { label: "Blog", to: "/blog", icon: BookOpen, desc: "Tips, guides & resources" };
const ABOUT = { label: "About Us", to: "/about", icon: Info, desc: "Our story and mission" };
const CONTACT = { label: "Contact", to: "/contact-us", icon: Mail, desc: "Get in touch with us" };
const HELP = { label: "Help Center", to: "/help", icon: HelpCircle, desc: "FAQs and support" };

export default function NavLinks({ megaOpen, onToggleMega, navH = "h-[70px]" }) {
    const { pathname } = useLocation();

    return (
        <nav className="flex items-center gap-1">
            {/* Home — always visible */}
            <NavLink to="/" label="Home" isActive={pathname === "/"} navH={navH} />

            {/* All Courses — always visible */}
            <AllCoursesLink isOpen={megaOpen} onClick={onToggleMega} navH={navH} />

            {/* Blog — visible from lg+ */}
            <span className="hidden lg:block">
                <NavLink to="/blog" label="Blog" isActive={pathname === "/blog"} navH={navH} />
            </span>

            {/* About — visible from xl+ */}
            <span className="hidden xl:block">
                <NavLink to="/about" label="About Us" isActive={pathname === "/about"} navH={navH} />
            </span>

            {/* Contact — visible from xl+ */}
            <span className="hidden xl:block">
                <NavLink to="/contact-us" label="Contact" isActive={pathname === "/contact"} navH={navH} />
            </span>

            {/* More — md: Blog+About+Contact+Help, lg: About+Contact+Help, xl: hidden */}
            {/* md breakpoint More */}
            <span className="hidden md:block lg:hidden">
                <MoreDropdown items={[BLOG, ABOUT, CONTACT, { divider: true }, HELP]} navH={navH} />
            </span>

            {/* lg breakpoint More */}
            <span className="hidden lg:block xl:hidden">
                <MoreDropdown items={[ABOUT, CONTACT, { divider: true }, HELP]} navH={navH} />
            </span>

            {/* xl+ — Help only in a minimal More, or remove if not needed */}
            <span className="hidden xl:block">
                <MoreDropdown items={[{ divider: false, ...HELP }]} navH={navH} label="Help" />
            </span>
        </nav>
    );
}

// ── Base nav link ──────────────────────────────────────────
function NavLink({ to, label, isActive, navH }) {
    return (
        <Link
            to={to}
            className={cn(
                "relative flex items-center px-3",
                navH,
                "text-[13.5px] font-semibold transition-colors duration-200 group whitespace-nowrap",
                isActive ? "text-primary" : "text-text-secondary hover:text-primary"
            )}
        >
            {label}
            <span
                className={cn(
                    "absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-sm",
                    "transition-transform duration-200 origin-left",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
            />
        </Link>
    );
}

// ── All Courses ────────────────────────────────────────────
function AllCoursesLink({ isOpen, onClick, navH }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-1 px-3 outline-none",
                navH,
                "text-[13.5px] font-semibold transition-colors duration-200 group whitespace-nowrap",
                isOpen ? "text-primary" : "text-text-secondary hover:text-primary"
            )}
        >
            All Courses
            <ChevronDown
                size={13}
                className={cn("transition-transform duration-200 text-text-muted", isOpen && "rotate-180")}
            />
            <span
                className={cn(
                    "absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-sm",
                    "transition-transform duration-200 origin-left",
                    isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
            />
        </button>
    );
}

// ── More dropdown — accepts dynamic items ──────────────────
function MoreDropdown({ items = [], navH, label = "More" }) {
    // If no real items (only dividers), don't render
    const hasReal = items.some((i) => !i.divider);
    if (!hasReal) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "relative flex items-center gap-1 px-3 outline-none",
                        navH,
                        "text-[13.5px] font-semibold transition-colors duration-200 group whitespace-nowrap",
                        "text-text-secondary hover:text-primary data-[state=open]:text-primary"
                    )}
                >
                    {label}
                    <ChevronDown
                        size={13}
                        className="text-text-muted transition-transform duration-200 data-[state=open]:rotate-180"
                    />
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={-8}
                className="w-[220px] rounded-xl shadow-xl border-border p-1.5"
            >
                {items.map((item, i) =>
                    item.divider ? (
                        <DropdownMenuSeparator key={i} className="bg-border my-1" />
                    ) : (
                        <DropdownMenuItem key={i} asChild>
                            <Link
                                to={item.to}
                                className={cn(
                                    "flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                                    "hover:bg-primary-light group transition-colors duration-150",
                                    "outline-none focus:bg-primary-light"
                                )}
                            >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-page group-hover:bg-white transition-colors">
                                    <item.icon
                                        size={14}
                                        className="text-text-muted group-hover:text-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13.5px] font-semibold text-text-primary group-hover:text-primary transition-colors">
                                        {item.label}
                                    </p>
                                    <p className="text-[12px] text-text-muted mt-0.5 leading-tight">
                                        {item.desc}
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
