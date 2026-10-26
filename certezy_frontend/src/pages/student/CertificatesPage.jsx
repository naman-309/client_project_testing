import { useEffect, useState } from "react";
import { Award, Download, ExternalLink, Calendar, Hash } from "lucide-react";

import certificateService from "@/services/certificateService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await certificateService.getMyCertificates();
                setCertificates(data?.data?.certificates ?? []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load certificates");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <>
            <div
                className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="mb-6">
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#0F172A",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        My Certificates
                    </h1>
                    <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
                        {loading
                            ? "Loading..."
                            : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} earned`}
                    </p>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                {loading ? (
                    <CertSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : certificates.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {certificates.map((cert) => (
                            <CertCard key={cert.id} cert={cert} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

function CertCard({ cert }) {
    return (
        <div
            className="bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{
                border: "1px solid #EEF2F7",
                boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
            }}
        >
            {/* Card header — decorative */}
            <div
                className="relative px-6 pt-6 pb-5 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
                }}
            >
                {/* dot pattern */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.05,
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        pointerEvents: "none",
                    }}
                />

                {/* Gold glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "-20px",
                        right: "-20px",
                        width: "120px",
                        height: "120px",
                        background: "radial-gradient(circle, rgba(245,158,11,0.20), transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div className="relative flex items-start justify-between gap-3">
                    {/* Icon */}
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: "rgba(245,158,11,0.15)",
                            border: "1px solid rgba(245,158,11,0.25)",
                        }}
                    >
                        <Award size={22} style={{ color: "#F59E0B" }} />
                    </div>

                    {/* Certificate badge */}
                    <span
                        className="shrink-0 px-2.5 py-1 rounded-lg"
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            background: "rgba(245,158,11,0.15)",
                            color: "#FCD34D",
                            border: "1px solid rgba(245,158,11,0.20)",
                        }}
                    >
                        Certified
                    </span>
                </div>

                {/* Course title */}
                <p
                    className="mt-4 line-clamp-2"
                    style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.4,
                    }}
                >
                    {cert.course_title}
                </p>
            </div>

            {/* Card body */}
            <div className="px-6 py-4 flex flex-col gap-3 flex-1">
                {/* Meta */}
                <div className="space-y-2">
                    <MetaRow icon={Calendar} label="Issued on" value={fmtDate(cert.issued_at)} />
                    {cert.valid_until && (
                        <MetaRow icon={Calendar} label="Valid until" value={fmtDate(cert.valid_until)} />
                    )}
                    {cert.certificate_no && (
                        <MetaRow icon={Hash} label="Certificate No." value={cert.certificate_no} mono />
                    )}
                </div>

                {/* Actions */}
                <div
                    className="flex items-center gap-2 mt-auto pt-3"
                    style={{ borderTop: "1px solid #F1F5F9" }}
                >
                    {cert.pdf_url ? (
                        <>
                            <a
                                href={cert.pdf_url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl no-underline transition-colors duration-150"
                                style={{
                                    background: "#3282B8",
                                    color: "#fff",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                }}
                            >
                                <Download size={14} />
                                Download PDF
                            </a>
                            <a
                                href={cert.pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl flex items-center justify-center no-underline transition-colors duration-150"
                                style={{ background: "#F1F5F9", color: "#64748B" }}
                                title="Open in new tab"
                            >
                                <ExternalLink size={15} />
                            </a>
                        </>
                    ) : (
                        <div
                            className="flex-1 flex items-center justify-center py-2.5 rounded-xl"
                            style={{
                                background: "#F8FAFC",
                                fontSize: "13px",
                                color: "#94A3B8",
                                fontWeight: 600,
                            }}
                        >
                            PDF not available yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetaRow({ icon: Icon, label, value, mono }) {
    return (
        <div className="flex items-center gap-2.5">
            <Icon size={13} style={{ color: "#94A3B8", shrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500, minWidth: "90px" }}>
                {label}
            </span>
            <span
                style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#0F172A",
                    fontFamily: mono ? "monospace" : "inherit",
                }}
            >
                {value}
            </span>
        </div>
    );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
            >
                <Award size={28} style={{ color: "#F59E0B" }} />
            </div>
            <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
                    No certificates yet
                </p>
                <p style={{ fontSize: "13.5px", color: "#94A3B8", maxWidth: "320px" }}>
                    Complete a course to earn your certificate. Keep learning!
                </p>
            </div>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#EF4444" }}>{message}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl"
                style={{ background: "#FEF2F2", color: "#EF4444", fontSize: "13px", fontWeight: 700 }}
            >
                Try Again
            </button>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CertSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
            {Array(6)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl overflow-hidden"
                        style={{ border: "1px solid #EEF2F7" }}
                    >
                        <div
                            className="h-[140px]"
                            style={{ background: "linear-gradient(135deg, #0a1628, #162d5a)" }}
                        />
                        <div className="p-5 space-y-3">
                            <div className="h-3 bg-[#F1F5F9] rounded-full w-3/4" />
                            <div className="h-3 bg-[#F1F5F9] rounded-full w-1/2" />
                            <div className="h-9 bg-[#F1F5F9] rounded-xl w-full mt-4" />
                        </div>
                    </div>
                ))}
        </div>
    );
}
