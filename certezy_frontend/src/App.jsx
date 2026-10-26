import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

import { fetchMe } from "@/features/auth/authSlice";
import RouterProgress from "@/components/shared/RouterProgress";
import AppRoutes from "@/routes/AppRoutes";

const TOAST_OPTIONS = {
    duration: 3000,
    style: { fontSize: "13.5px", fontWeight: 600, borderRadius: "10px" },
};

export default function App() {
    const dispatch = useDispatch();

    // Restore an existing session if there is one. Guests simply stay logged
    // out — public pages render immediately and never wait on this call.
    useEffect(() => {
        dispatch(fetchMe());
    }, [dispatch]);

    return (
        <>
            <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
            <RouterProgress />
            <AppRoutes />
        </>
    );
}
