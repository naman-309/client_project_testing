import { cn } from "@/lib/utils";

const METHODS = [
    {
        id: "razorpay",
        label: "Razorpay",
        desc: "UPI, Cards, Net Banking, Wallets (INR)",
    },
    {
        id: "paypal",
        label: "PayPal",
        desc: "International cards & PayPal balance (USD)",
    },
];

export default function PaymentMethod({ selected, onChange }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-[#EEF2F7]">
            <SectionTitle title="Payment Method" />

            <div className="mt-4 space-y-3">
                {METHODS.map((m) => {
                    const active = selected === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => onChange(m.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150",
                                active
                                    ? "border-[#3282B8] bg-[#EBF4FF]"
                                    : "border-[#EEF2F7] bg-white hover:border-[#BFDBFE]"
                            )}
                        >
                            {/* Radio */}
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                    active ? "border-[#3282B8]" : "border-slate-300"
                                )}
                            >
                                {active && <div className="w-2.5 h-2.5 rounded-full bg-[#3282B8]" />}
                            </div>

                            <div>
                                <p className="text-[14px] font-bold text-slate-900">{m.label}</p>
                                <p className="text-[12px] text-slate-500 mt-0.5">{m.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function SectionTitle({ title }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-[3px] h-5 rounded-full bg-[#3282B8] shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900">{title}</h2>
        </div>
    );
}
