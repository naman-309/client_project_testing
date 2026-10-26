import { cn } from "@/lib/utils";

/**
 * Skeleton.jsx — Reusable skeleton components
 *
 * Usage:
 *   import { CourseCardSkeleton, TableRowSkeleton } from "@/components/shared/Skeleton";
 *
 * Add new skeletons here as needed — never create separate skeleton files.
 */

// ─────────────────────────────────────────────
// BASE — single skeleton box
// ─────────────────────────────────────────────
export function SkeletonBox({ className }) {
    return <div className={cn("bg-border rounded animate-pulse", className)} />;
}

// ─────────────────────────────────────────────
// COURSE CARD SKELETON
// ─────────────────────────────────────────────
export function CourseCardSkeleton() {
    return (
        <div className="bg-white rounded-lg overflow-hidden">
            {/* Thumbnail */}
            <SkeletonBox className="h-[140px] w-full rounded-none" />

            <div className="p-4 space-y-3">
                {/* Category */}
                <SkeletonBox className="h-3 w-24" />

                {/* Title */}
                <div className="space-y-2">
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-3/4" />
                </div>

                {/* Rating */}
                <SkeletonBox className="h-3 w-28" />

                {/* Level + Price */}
                <div className="flex items-center justify-between pt-1">
                    <SkeletonBox className="h-5 w-20 rounded-full" />
                    <SkeletonBox className="h-4 w-14" />
                </div>

                {/* Button */}
                <SkeletonBox className="h-9 w-full mt-2" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// NOTIFICATION ITEM SKELETON
// ─────────────────────────────────────────────
export function NotifItemSkeleton() {
    return (
        <div className="flex gap-3 px-4 py-3 border-b border-border">
            <SkeletonBox className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// TABLE ROW SKELETON — admin tables
// ─────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
            {Array(cols)
                .fill(0)
                .map((_, i) => (
                    <SkeletonBox key={i} className={cn("h-4", i === 0 ? "w-8" : "flex-1")} />
                ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// CATEGORY CARD SKELETON — mega menu
// ─────────────────────────────────────────────
export function CategoryCardSkeleton() {
    return (
        <div className="p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <SkeletonBox className="w-7 h-7 rounded" />
                <SkeletonBox className="h-4 w-32" />
            </div>
            <SkeletonBox className="h-px w-full mb-2" />
            <div className="space-y-1.5">
                <SkeletonBox className="h-3 w-28" />
                <SkeletonBox className="h-3 w-24" />
                <SkeletonBox className="h-3 w-20" />
            </div>
        </div>
    );
}
