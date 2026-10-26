import { useEffect, useState } from "react";
import { CreditCard, Download, CheckCircle2, XCircle, Clock, Search } from "lucide-react";

import paymentService from "@/services/paymentService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function fmtAmount(amount, currency = "USD") {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency ?? "USD",
            minimumFractionDigits: 2,
        }).format(amount ?? 0);
    } catch {
        return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
    }
}

const STATUS_CONFIG = {
    success: {
        label: "Paid",
        icon: CheckCircle2,
        color: "#10B981",
        bg: "#ECFDF5",
    },
    pending: {
        label: "Pending",
        icon: Clock,
        color: "#F59E0B",
        bg: "#FFFBEB",
    },
    failed: {
        label: "Failed",
        icon: XCircle,
        color: "#EF4444",
        bg: "#FEF2F2",
    },
};

const METHOD_LABELS = {
    razorpay: "Razorpay",
    paypal: "PayPal",
    stripe: "Stripe",
    free: "Free",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PaymentHistoryPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await paymentService.getMyPayments();
                setPayments(data?.data?.payments ?? []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load payments");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Search filter ──────────────────────────────────────────────────────────
    const filtered = payments.filter((p) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
            p.course_title?.toLowerCase().includes(q) ||
            p.gateway_txn_id?.toLowerCase().includes(q) ||
            p.method?.toLowerCase().includes(q)
        );
    });

    // ── Total spent (success only) ─────────────────────────────────────────────
    const totalSpent = payments
        .filter((p) => p.status === "success")
        .reduce((acc, p) => acc + Number(p.amount ?? 0), 0);

    return (
        <>
            <div
                className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1
                            style={{
                                fontSize: "22px",
                                fontWeight: 800,
                                color: "#0F172A",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Payment History
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
                            {loading
                                ? "Loading..."
                                : `${payments.length} transaction${payments.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    {/* Total spent badge */}
                    {!loading && payments.length > 0 && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0"
                            style={{ background: "#EBF4FF", border: "1px solid #BFDBFE" }}
                        >
                            <CreditCard size={16} style={{ color: "#3282B8" }} />
                            <div>
                                <p
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color: "#3282B8",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    Total Spent
                                </p>
                                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>
                                    {fmtAmount(totalSpent, payments[0]?.currency)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Search ──────────────────────────────────────────────── */}
                {!loading && payments.length > 0 && (
                    <div className="relative max-w-[360px] mb-5">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by course, method, transaction ID..."
                            style={{
                                width: "100%",
                                height: "38px",
                                paddingLeft: "36px",
                                paddingRight: "12px",
                                borderRadius: "10px",
                                border: "1px solid #E2E8F0",
                                background: "#fff",
                                fontSize: "13px",
                                color: "#0F172A",
                                outline: "none",
                            }}
                        />
                    </div>
                )}

                {/* ── Content ─────────────────────────────────────────────── */}
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : payments.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div
                            className="hidden md:block bg-white rounded-2xl overflow-hidden"
                            style={{
                                border: "1px solid #EEF2F7",
                                boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
                            }}
                        >
                            {/* Table head */}
                            <div
                                className="grid px-6 py-3"
                                style={{
                                    gridTemplateColumns: "1fr 120px 100px 110px 90px 80px",
                                    borderBottom: "1px solid #F1F5F9",
                                    background: "#F8FAFC",
                                }}
                            >
                                {["Course", "Date", "Amount", "Method", "Status", "Invoice"].map((h) => (
                                    <span
                                        key={h}
                                        style={{
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            color: "#94A3B8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Table rows */}
                            {filtered.map((payment, idx) => (
                                <PaymentRow
                                    key={payment.id}
                                    payment={payment}
                                    isLast={idx === filtered.length - 1}
                                />
                            ))}

                            {/* No results after search */}
                            {filtered.length === 0 && (
                                <div className="py-12 text-center">
                                    <p style={{ fontSize: "14px", color: "#94A3B8" }}>
                                        No transactions match "{search}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden space-y-3">
                            {filtered.map((payment) => (
                                <PaymentCard key={payment.id} payment={payment} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// ─── Desktop Table Row ────────────────────────────────────────────────────────

function PaymentRow({ payment, isLast }) {
    const status = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = status.icon;

    return (
        <div
            className="grid px-6 py-4 items-center hover:bg-[#F8FAFC] transition-colors"
            style={{
                gridTemplateColumns: "1fr 120px 100px 110px 90px 80px",
                borderBottom: isLast ? "none" : "1px solid #F1F5F9",
            }}
        >
            {/* Course */}
            <div>
                <p
                    className="truncate"
                    style={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A", maxWidth: "260px" }}
                >
                    {payment.course_title ?? "—"}
                </p>
                {payment.gateway_txn_id && (
                    <p
                        className="truncate"
                        style={{
                            fontSize: "11px",
                            color: "#CBD5E1",
                            maxWidth: "220px",
                            marginTop: "2px",
                            fontFamily: "monospace",
                        }}
                    >
                        {payment.gateway_txn_id}
                    </p>
                )}
            </div>

            {/* Date */}
            <p style={{ fontSize: "12px", color: "#64748B" }}>{fmtDate(payment.created_at)}</p>

            {/* Amount */}
            <div>
                <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A" }}>
                    {fmtAmount(payment.amount, payment.currency)}
                </p>
                {payment.original_amount && Number(payment.original_amount) !== Number(payment.amount) && (
                    <p style={{ fontSize: "11px", color: "#CBD5E1", textDecoration: "line-through" }}>
                        {fmtAmount(payment.original_amount, payment.currency)}
                    </p>
                )}
            </div>

            {/* Method */}
            <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg w-fit"
                style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    background: "#F8FAFC",
                    color: "#475569",
                    border: "1px solid #EEF2F7",
                }}
            >
                {METHOD_LABELS[payment.method] ?? payment.method ?? "—"}
            </span>

            {/* Status */}
            <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit"
                style={{ fontSize: "11.5px", fontWeight: 700, background: status.bg, color: status.color }}
            >
                <StatusIcon size={11} />
                {status.label}
            </span>

            {/* Invoice */}
            {payment.invoice_url ? (
                <a
                    href={payment.invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 no-underline px-2.5 py-1.5 rounded-lg w-fit transition-colors"
                    style={{ fontSize: "11.5px", fontWeight: 700, background: "#EBF4FF", color: "#3282B8" }}
                >
                    <Download size={11} />
                    PDF
                </a>
            ) : (
                <span style={{ fontSize: "12px", color: "#CBD5E1" }}>—</span>
            )}
        </div>
    );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function PaymentCard({ payment }) {
    const status = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = status.icon;

    return (
        <div
            className="bg-white rounded-2xl p-4 space-y-3"
            style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}
        >
            <div className="flex items-start justify-between gap-2">
                <p
                    className="flex-1"
                    style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}
                >
                    {payment.course_title ?? "Course"}
                </p>
                <span
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ fontSize: "11px", fontWeight: 700, background: status.bg, color: status.color }}
                >
                    <StatusIcon size={10} />
                    {status.label}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <InfoChip label="Amount" value={fmtAmount(payment.amount, payment.currency)} />
                <InfoChip label="Method" value={METHOD_LABELS[payment.method] ?? payment.method ?? "—"} />
                <InfoChip label="Date" value={fmtDate(payment.created_at)} />
            </div>

            {payment.invoice_url && (
                <a
                    href={payment.invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl no-underline"
                    style={{ background: "#EBF4FF", color: "#3282B8", fontSize: "13px", fontWeight: 700 }}
                >
                    <Download size={14} />
                    Download Invoice
                </a>
            )}
        </div>
    );
}

function InfoChip({ label, value }) {
    return (
        <div className="px-3 py-2 rounded-xl" style={{ background: "#F8FAFC" }}>
            <p
                style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "2px",
                }}
            >
                {label}
            </p>
            <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F172A" }}>{value}</p>
        </div>
    );
}

// ─── Empty / Error / Skeleton ─────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "#F1F5F9" }}
            >
                <CreditCard size={28} style={{ color: "#CBD5E1" }} />
            </div>
            <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
                    No transactions yet
                </p>
                <p style={{ fontSize: "13.5px", color: "#94A3B8" }}>
                    Your payment history will appear here after you enroll in a course.
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

function TableSkeleton() {
    return (
        <div
            className="bg-white rounded-2xl overflow-hidden animate-pulse"
            style={{ border: "1px solid #EEF2F7" }}
        >
            <div className="h-12 bg-[#F8FAFC]" style={{ borderBottom: "1px solid #F1F5F9" }} />
            {Array(6)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-6 px-6 py-4"
                        style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-[#F1F5F9] rounded-full w-3/4" />
                            <div className="h-2.5 bg-[#F1F5F9] rounded-full w-1/3" />
                        </div>
                        <div className="h-3 bg-[#F1F5F9] rounded-full w-20" />
                        <div className="h-3 bg-[#F1F5F9] rounded-full w-16" />
                        <div className="h-6 bg-[#F1F5F9] rounded-lg w-20" />
                        <div className="h-6 bg-[#F1F5F9] rounded-lg w-16" />
                    </div>
                ))}
        </div>
    );
}
