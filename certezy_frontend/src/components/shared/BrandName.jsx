import { BRAND } from "@/config/app";

/**
 * Brand wordmark: "Cert" + accented "ezy".
 * Pass either `accentClassName` (Tailwind) or `accentColor` (inline style).
 */
export default function BrandName({ accentClassName, accentColor }) {
    return (
        <>
            {BRAND.prefix}
            <span className={accentClassName} style={accentColor ? { color: accentColor } : undefined}>
                {BRAND.accent}
            </span>
        </>
    );
}
