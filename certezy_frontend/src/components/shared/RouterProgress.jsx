/**
 * RouterProgress.jsx
 *
 * NProgress top loading bar — route change pe automatically trigger hota hai
 *
 * Setup:
 *   npm install nprogress
 *
 * Usage — App.jsx ya main router mein wrap karo:
 *   import RouterProgress from "@/components/shared/RouterProgress";
 *   <RouterProgress />
 *
 * Aur index.css ya main.jsx mein yeh import karo:
 *   import "nprogress/nprogress.css";
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";

// NProgress config — thin bar, no spinner
NProgress.configure({
    showSpinner: false,
    speed: 300,
    minimum: 0.1,
    trickleSpeed: 200,
});

export default function RouterProgress() {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        // Small timeout taaki fast routes pe bhi flash dikhe
        const timer = setTimeout(() => NProgress.done(), 300);
        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location.pathname]);

    return null; // No UI — NProgress injects its own bar
}
