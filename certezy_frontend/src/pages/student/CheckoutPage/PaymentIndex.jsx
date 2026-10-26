import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, ChevronLeft, Lock, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useCheckout } from "./useCheckout";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import BrandName from "@/components/shared/BrandName";

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get("course");

    const {
        course,
        loading,
        error,
        method,
        setMethod,
        paying,
        scriptLoading,
        handlePay,
        paymentAmount,
        paymentCurrency,
    } = useCheckout(courseId);

    if (loading) return <CheckoutSkeleton />;

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center px-6">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-[15px] font-semibold text-slate-900 mb-3">{error}</p>
                    <button
                        onClick={() => navigate("/courses")}
                        className="px-4 py-2 rounded-xl bg-[#3282B8] text-white text-sm font-bold"
                    >
                        Browse Courses
                    </button>
                </div>
            </div>
        );

    // Format price using backend values
    const formatPrice = (amount, currency) => {
        if (amount == null || !currency) {
            return currency === "INR" ? "₹..." : "$...";
        }

        return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const priceLabel = paymentAmount
        ? formatPrice(paymentAmount, paymentCurrency)
        : course?.price
          ? `$${course.price}`
          : "...";

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Topbar ────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 h-[60px] flex items-center px-4 sm:px-6 bg-white border-b border-[#EEF2F7]">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 mr-4 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <div className="w-7 h-7 rounded-lg bg-[#3282B8] flex items-center justify-center">
                        <svg
                            width="13"
                            height="13"
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
                    <span className="text-[15px] font-extrabold text-slate-900">
                        <BrandName accentClassName="text-[#3282B8]" />
                    </span>
                </Link>

                <div className="ml-auto flex items-center gap-1.5 text-emerald-600 text-[12px] font-semibold">
                    <Lock size={13} />
                    Secure Checkout
                </div>
            </div>

            {/* ── Body ─────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-6">
                    Complete Your Purchase
                </h1>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left */}
                    <div className="flex-1 space-y-4">
                        <PaymentMethod selected={method} onChange={setMethod} />

                        {/* Security note */}
                        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-[12.5px] text-emerald-800 leading-relaxed">
                                Your payment is processed securely. Certezy never stores your card details.
                                You'll get instant access after payment.
                            </p>
                        </div>

                        {/* Pay button */}
                        <button
                            onClick={handlePay}
                            disabled={paying || scriptLoading}
                            className="w-full h-[50px] rounded-xl flex items-center justify-center gap-2 font-extrabold text-[15px] text-white bg-[#3282B8] hover:bg-[#2a6fa0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_4px_14px_rgba(50,130,184,0.35)]"
                        >
                            {paying || scriptLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {scriptLoading ? "Loading..." : "Processing..."}
                                </>
                            ) : (
                                <>
                                    <CreditCard size={17} />
                                    Pay {priceLabel}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right */}
                    <OrderSummary
                        course={course}
                        paymentAmount={paymentAmount}
                        paymentCurrency={paymentCurrency}
                    />
                </div>
            </div>
        </div>
    );
}

function CheckoutSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 animate-pulse">
            <div className="h-[60px] bg-white border-b border-[#EEF2F7]" />
            <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white rounded-2xl h-[340px] border border-[#EEF2F7]" />
                <div className="w-full lg:w-[320px] bg-white rounded-2xl h-[440px] border border-[#EEF2F7]" />
            </div>
        </div>
    );
}
