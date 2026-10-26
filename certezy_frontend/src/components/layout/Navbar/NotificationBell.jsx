import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * NotificationBell.jsx
 *
 * Real project mein yeh Redux se aayega:
 *   const { notifications, unreadCount } = useSelector(s => s.notification)
 *   useEffect(() => dispatch(fetchNotifications()), [])
 *
 * API: GET /api/v1/notifications
 * API: PUT /api/v1/notifications/read  → mark all read
 */
export default function NotificationBell({ unreadCount = 0 }) {
    const [notifications] = useState([]); // TODO: wire to notifications API
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // ── Fetch notifications jab bell open ho ────────────────
    useEffect(() => {
        if (!open) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                // Real project mein:
                // const { data } = await notificationService.getAll();
                // setNotifications(data.data);
            } catch (err) {
                console.error("Notifications fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [open]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            {/* ── Bell trigger ── */}
            <DropdownMenuTrigger
                className={cn(
                    "relative flex items-center justify-center",
                    "w-[38px] h-[38px] rounded outline-none",
                    "text-text-secondary hover:text-primary hover:bg-primary-light",
                    "transition-colors duration-200",
                    "data-[state=open]:text-primary data-[state=open]:bg-primary-light"
                )}
            >
                <Bell size={19} />

                {/* Unread dot */}
                {unreadCount > 0 && (
                    <span className="absolute top-[7px] right-[7px] w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                )}
            </DropdownMenuTrigger>

            {/* ── Panel ── */}
            <DropdownMenuContent align="end" className="w-[316px] p-0 rounded-lg shadow-drop border-border">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-[14px] font-bold text-text-primary">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            className="text-[12.5px] font-medium text-primary hover:text-primary-hover transition-colors"
                            onClick={() => {
                                // Real project mein:
                                // dispatch(markAllRead())
                                // PUT /api/v1/notifications/read
                            }}
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-8 gap-2 text-text-muted">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-[13px]">Loading...</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && notifications.length === 0 && (
                    <div className="py-10 text-center">
                        <Bell size={28} className="mx-auto text-text-muted mb-2" />
                        <p className="text-[13px] text-text-muted">No notifications yet</p>
                    </div>
                )}

                {/* Notification items */}
                {!loading && notifications.length > 0 && (
                    <div>
                        {notifications.map((notif) => (
                            <NotifItem key={notif.id} notif={notif} />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border">
                    <Link
                        to="/student/notifications"
                        className="block text-center text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Single notification item ──────────────────────────────
function NotifItem({ notif }) {
    return (
        <div
            className={cn(
                "flex gap-3 px-4 py-3 cursor-pointer",
                "border-b border-border last:border-0",
                "hover:bg-page transition-colors duration-150",
                !notif.read && "bg-primary-light"
            )}
        >
            {/* Read / unread dot */}
            <div
                className={cn(
                    "w-2 h-2 rounded-full shrink-0 mt-[5px]",
                    notif.read ? "bg-transparent" : "bg-primary"
                )}
            />
            <div className="flex-1">
                <p
                    className={cn(
                        "text-[13px] text-text-primary leading-[1.45]",
                        notif.read ? "font-normal" : "font-semibold"
                    )}
                >
                    {notif.message}
                </p>
                <p className="text-[11.5px] text-text-muted mt-0.5">{notif.time}</p>
            </div>
        </div>
    );
}
