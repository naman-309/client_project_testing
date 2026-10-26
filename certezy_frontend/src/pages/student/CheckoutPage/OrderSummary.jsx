import { Clock, BarChart2, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "./PaymentMethod";

function fmtDuration(mins) {
    if (!mins) return "Self-paced";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

export default function OrderSummary({ course, paymentAmount, paymentCurrency }) {
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

    const displayPrice = paymentAmount
        ? formatPrice(paymentAmount, paymentCurrency)
        : course?.price
          ? `$${course.price}`
          : "—";

    const meta = [
        {
            icon: BarChart2,
            label: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : "All levels",
        },
        { icon: Clock, label: fmtDuration(course.total_duration) },
        { icon: BookOpen, label: `${course.total_lessons || 0} lessons` },
        ...(course.certificate_eligible === 1 ? [{ icon: Award, label: "Certificate included" }] : []),
    ];

    return (
        <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-2xl overflow-hidden border border-[#EEF2F7]">
            {/* Thumbnail */}
            <div className="h-[160px] relative bg-gradient-to-br from-[#0a1628] via-[#0f2545] to-[#162d5a]">
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-black text-white/10 tracking-tighter">
                            {course.title?.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 space-y-4">
                <SectionTitle title="Order Summary" />

                <p className="text-[14px] font-bold text-slate-900 leading-snug">{course.title}</p>

                <div className="space-y-2">
                    {meta.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2.5">
                            <Icon size={13} className="text-[#3282B8] shrink-0" />
                            <span className="text-[12.5px] text-slate-500">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Price */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] text-slate-500">Course price</span>
                        <span className="text-[13px] font-semibold text-slate-900">{displayPrice}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[14px] font-bold text-slate-900">Total</span>
                        <span className="text-[18px] font-extrabold text-slate-900">{displayPrice}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-slate-500">30-day money-back guarantee</span>
                </div>
            </div>
        </div>
    );
}
