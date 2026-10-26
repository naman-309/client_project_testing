// src/pages/contact/ContactForm.jsx

import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import contactService from "@/services/contactService";

const SUBJECTS = [
    "General Inquiry",
    "Technical Support",
    "Course Question",
    "Partnership",
    "Billing",
    "Other",
];

const officeHours = [
    { day: "Monday – Friday", time: "24/7 Available" },
    { day: "Saturday", time: "24/7 Available" },
    { day: "Sunday", time: "24/7 Available" },
];

// ── SVG World Map ─────────────────────────────────────────────
const WorldMapSVG = () => (
    <div
        className="relative w-full h-48 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)" }}
    >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15">
            {[0, 25, 50, 75, 100].map((p) => (
                <line
                    key={`h${p}`}
                    x1="0"
                    y1={`${p}%`}
                    x2="100%"
                    y2={`${p}%`}
                    stroke="#3282B8"
                    strokeWidth="0.5"
                />
            ))}
            {[0, 20, 40, 60, 80, 100].map((p) => (
                <line
                    key={`v${p}`}
                    x1={`${p}%`}
                    y1="0"
                    x2={`${p}%`}
                    y2="100%"
                    stroke="#3282B8"
                    strokeWidth="0.5"
                />
            ))}
        </svg>

        {/* Continents */}
        <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-35">
            <ellipse cx="90" cy="80" rx="55" ry="45" fill="#3282B8" />
            <ellipse cx="110" cy="145" rx="28" ry="38" fill="#3282B8" />
            <ellipse cx="195" cy="68" rx="28" ry="22" fill="#3282B8" />
            <ellipse cx="200" cy="125" rx="30" ry="40" fill="#3282B8" />
            <ellipse cx="290" cy="75" rx="70" ry="45" fill="#3282B8" />
            <ellipse cx="320" cy="148" rx="28" ry="20" fill="#3282B8" />
        </svg>

        {/* Location pin */}
        <div className="absolute flex flex-col items-center" style={{ top: "38%", left: "12%" }}>
            <div
                className="w-7 h-7 flex items-center justify-center"
                style={{
                    borderRadius: "50% 50% 50% 0",
                    background: "#3282B8",
                    transform: "rotate(-45deg)",
                    boxShadow: "0 0 0 5px rgba(50,130,184,0.25)",
                }}
            >
                <div className="w-2 h-2 rounded-full bg-white" style={{ transform: "rotate(45deg)" }} />
            </div>
        </div>

        {/* HQ label */}
        <div
            className="absolute bottom-3 left-3 rounded-lg px-3 py-2"
            style={{ background: "rgba(10,22,40,0.85)", border: "1px solid rgba(50,130,184,0.3)" }}
        >
            <div
                className="font-bold uppercase tracking-widest mb-0.5"
                style={{ fontSize: "9px", color: "#3282B8" }}
            >
                Our Headquarters
            </div>
            <div className="text-xs text-slate-400">
                123 Scholar Plaza, Innovation District, San Francisco
            </div>
        </div>
    </div>
);

export default function ContactForm() {
    const user = useSelector((s) => s.auth?.user);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        subject: SUBJECTS[0],
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!user;

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.message) {
            toast.error("Name, email aur message required hai!");
            return;
        }
        setLoading(true);
        try {
            await contactService.submit(form);
            toast.success("Message sent successfully! We will get back to you soon");
            setForm((prev) => ({
                ...prev,
                phone: "",
                subject: SUBJECTS[0],
                message: "",
                ...(isLoggedIn ? {} : { name: "", email: "" }),
            }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Shared input/textarea/select base classes
    const inputCls = [
        "w-full rounded-xl px-4 py-3 text-sm text-slate-200",
        "bg-white/5 border border-white/10",
        "placeholder:text-slate-500",
        "focus:outline-none focus:border-[#3282B8] focus:bg-[#3282B8]/5",
        "transition-colors duration-200",
    ].join(" ");

    return (
        <section
            className="px-6 pb-20 pt-14"
            style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)" }}
        >
            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* ── LEFT: Form ─────────────────────────────────────── */}
                <div
                    className="rounded-2xl p-8 md:p-9"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <h2 className="text-xl font-bold text-slate-100 mb-7">Send a Message</h2>

                    {/* Autofill badge */}
                    {isLoggedIn && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1 mb-6">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Name & email auto-filled from your account
                        </div>
                    )}

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-white">
                                Full Name
                            </label>
                            <input
                                className={inputCls}
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                disabled={isLoggedIn}
                                style={isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-white">
                                Email Address
                            </label>
                            <input
                                className={inputCls}
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={handleChange}
                                disabled={isLoggedIn}
                                style={isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white">
                            Phone{" "}
                            <span className="text-slate-500 normal-case font-normal tracking-normal">
                                (Optional)
                            </span>
                        </label>
                        <input
                            className={inputCls}
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white">
                            Subject
                        </label>
                        <select
                            className={inputCls}
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            style={{
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 14px center",
                                cursor: "pointer",
                            }}
                        >
                            {SUBJECTS.map((s) => (
                                <option key={s} value={s} style={{ background: "#0f2545", color: "#e2e8f0" }}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5 mb-6">
                        <label className="text-xs font-bold uppercase tracking-widest text-white">
                            Message
                        </label>
                        <textarea
                            className={inputCls}
                            name="message"
                            placeholder="Tell us how we can help..."
                            value={form.message}
                            onChange={handleChange}
                            rows={5}
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 hover:brightness-90 active:scale-[0.99]"
                        style={{
                            background: "#3282B8",
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: loading ? "none" : "0 4px 20px rgba(50,130,184,0.3)",
                        }}
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </div>

                {/* ── RIGHT: Map + Hours ─────────────────────────────── */}
                <div className="flex flex-col gap-5">
                    <iframe
                        src="https://www.google.com/maps?q=CERTEZY%20E-LEARNING%20PRIVATE%20LIMITED%20Indore&output=embed"
                        width="100%"
                        height="220"
                        style={{ border: 0, borderRadius: "16px" }}
                        loading="lazy"
                    />

                    {/* Office Hours */}
                    <div
                        className="rounded-2xl p-7"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2.5 mb-5">
                            <span
                                className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"
                                style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.2)" }}
                            />
                            <h3 className="text-base font-bold text-slate-100">Support Hours</h3>
                        </div>

                        {/* 24/7 highlight */}
                        <div
                            className="flex items-center justify-center rounded-xl py-4 mb-5 gap-3"
                            style={{
                                background: "rgba(50,130,184,0.1)",
                                border: "1px solid rgba(50,130,184,0.2)",
                            }}
                        >
                            <span className="text-3xl font-extrabold tracking-tight text-white">24/7</span>
                            <span className="text-sm text-white font-medium leading-snug">
                                Always available
                                <br />
                                for you
                            </span>
                        </div>

                        {/* Days */}
                        {officeHours.map((h) => (
                            <div
                                key={h.day}
                                className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0 text-sm"
                            >
                                <span className="text-slate-400">{h.day}</span>
                                <span className="font-semibold text-white">{h.time}</span>
                            </div>
                        ))}

                        {/* Note */}
                        <div
                            className="mt-4 rounded-xl px-4 py-3 text-xs text-slate-400 leading-relaxed"
                            style={{
                                background: "rgba(50,130,184,0.08)",
                                border: "1px solid rgba(50,130,184,0.2)",
                            }}
                        >
                            <strong style={{ color: "#3282B8" }}>Note:</strong> Enterprise Plan members get
                            priority support via the private scholar dashboard.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
