import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import paymentService from "@/services/paymentService";
import courseService from "@/services/courseService";
import discountService from "@/services/discountService";
import { fetchMe, selectUser } from "@/features/auth/authSlice";
import { useSearchParams } from "react-router-dom";

// ── Utility Functions ─────────────────────────
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

const getErrorMessage = (error) => {
    if (error.message === "Popup blocked") {
        return "Please allow popups for PayPal";
    }
    if (error.message === "Payment timeout") {
        return "Payment timed out, please try again";
    }
    if (error.message === "cancelled") {
        return "Payment cancelled";
    }
    if (error.message === "Verification failed") {
        return "Payment verification failed. Contact support if amount was deducted";
    }
    if (error.code === "NETWORK_ERROR" || error.message.includes("network")) {
        return "Check your internet connection";
    }
    return "Payment failed. Please try again";
};

// ── Razorpay Loader (with retry and timeout) ─────────────────────────
function loadRazorpayScript(maxRetries = 3) {
    return retryWithBackoff(async () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) return resolve(true);

            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";

            const timeout = setTimeout(() => {
                document.body.removeChild(s);
                reject(new Error("Razorpay SDK failed to load"));
            }, 10000);

            s.onload = () => {
                clearTimeout(timeout);
                resolve(true);
            };

            s.onerror = () => {
                clearTimeout(timeout);
                document.body.removeChild(s);
                reject(new Error("Razorpay SDK failed to load"));
            };

            document.body.appendChild(s);
        });
    }, maxRetries);
}

export function useCheckout(courseId) {
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    // Refs for cleanup and state management
    const isMounted = useRef(true);
    const paypalWindow = useRef(null);
    const paypalPoll = useRef(null);
    const paypalTimeout = useRef(null);
    const lastClickTime = useRef(0);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [method, setMethod] = useState("razorpay");
    const [paying, setPaying] = useState(false);
    const [scriptLoading, setScriptLoading] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState(null);
    const [paymentCurrency, setPaymentCurrency] = useState(null);
    const [discountInfo, setDiscountInfo] = useState(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (paypalPoll.current) clearInterval(paypalPoll.current);
            if (paypalTimeout.current) clearTimeout(paypalTimeout.current);
            if (paypalWindow.current && !paypalWindow.current.closed) {
                paypalWindow.current.close();
            }
        };
    }, []);

    // Set initial price when course loads
    useEffect(() => {
        if (course) {
            setPaymentAmount(course.price);
            setPaymentCurrency("USD");
        }
    }, [course]);

    // ── Fetch course ─────────────────────────
    useEffect(() => {
        if (!courseId) return navigate("/courses");
        if (!user) return navigate("/login");

        const discountToken = searchParams.get("discount");

        const fetchCourse = async () => {
            try {
                setLoading(true);

                let courseData = null;
                const cached = sessionStorage.getItem(`course_${courseId}`);

                if (cached) {
                    courseData = JSON.parse(cached);
                } else {
                    const res = await retryWithBackoff(() => courseService.getBySlug(courseId));
                    courseData = res.data.data;
                    sessionStorage.setItem(`course_${courseId}`, JSON.stringify(courseData));
                }

                // Apply discount if token exists
                if (discountToken) {
                    try {
                        const discountRes = await retryWithBackoff(() =>
                            discountService.verifyToken(discountToken)
                        );
                        const discount = discountRes.data.data;

                        if (discount && discount.discount_price) {
                            courseData.discount_price = discount.discount_price;
                            courseData.discount_link_id = discount.id;
                            setDiscountInfo(discount);
                        }
                    } catch (discountErr) {
                        console.warn("Invalid discount token:", discountErr);
                    }
                }

                if (isMounted.current) {
                    setCourse(courseData);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError("Failed to load course");
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchCourse();
    }, [courseId, searchParams.get("discount")]);

    // ── Create Order (COMMON) with retry ─────────────────────────
    const createOrder = useCallback(
        async (type) => {
            const api =
                type === "razorpay" ? paymentService.razorpayCreateOrder : paymentService.paypalCreateOrder;

            const orderData = {
                course_id: course.id,
                ...(course.discount_link_id && { discount_link_id: course.discount_link_id }),
            };

            const { data } = await retryWithBackoff(() => api(orderData));
            const order = data.data;

            if (isMounted.current) {
                setPaymentAmount(order.amount);
                setPaymentCurrency(order.currency);
            }

            return order;
        },
        [course]
    );

    // ── Razorpay Payment ─────────────────────────
    const payRazorpay = useCallback(async () => {
        try {
            setScriptLoading(true);
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error("Unable to load payment gateway. Try again.");
        } catch (err) {
            throw new Error("Unable to load payment gateway. Try again.");
        } finally {
            setScriptLoading(false);
        }

        const order = await createOrder("razorpay");

        return new Promise((resolve, reject) => {
            const rzp = new window.Razorpay({
                key: order.key_id,
                amount: Math.round(order.amount * 100),
                currency: order.currency,
                order_id: order.razorpay_order_id,
                name: "Certezy",
                description: course.title,
                prefill: { name: user.name, email: user.email },

                handler: async (response) => {
                    try {
                        await retryWithBackoff(() =>
                            paymentService.razorpayVerify({
                                payment_id: order.payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })
                        );

                        if (isMounted.current) resolve({ status: "success" });
                    } catch {
                        reject(new Error("Verification failed"));
                    }
                },

                modal: {
                    ondismiss: () => reject(new Error("cancelled")),
                },
            });

            rzp.open();
        });
    }, [course, user, createOrder]);

    // ── PayPal Payment ─────────────────────────
    const payPaypal = useCallback(async () => {
        const order = await createOrder("paypal");

        const baseUrl =
            import.meta.env.VITE_PAYPAL_MODE === "live"
                ? "https://www.paypal.com/checkoutnow"
                : "https://www.sandbox.paypal.com/checkoutnow";

        // Prevent duplicate polling instances
        if (paypalPoll.current) {
            clearInterval(paypalPoll.current);
        }

        paypalWindow.current = window.open(
            `${baseUrl}?token=${order.paypal_order_id}`,
            "PayPal",
            "width=600,height=700"
        );

        if (!paypalWindow.current) throw new Error("Popup blocked");

        return new Promise((resolve, reject) => {
            // Set timeout for polling
            paypalTimeout.current = setTimeout(() => {
                clearInterval(paypalPoll.current);
                paypalWindow.current?.close();
                reject(new Error("Payment timeout"));
            }, 30000);

            paypalPoll.current = setInterval(async () => {
                if (!paypalWindow.current?.closed) return;

                clearInterval(paypalPoll.current);
                clearTimeout(paypalTimeout.current);

                try {
                    await retryWithBackoff(() =>
                        paymentService.paypalCapture({
                            payment_id: order.payment_id,
                            paypal_order_id: order.paypal_order_id,
                        })
                    );

                    if (isMounted.current) resolve({ status: "success" });
                } catch {
                    reject(new Error("Verification failed"));
                }
            }, 1000);
        });
    }, [createOrder]);

    // ── Main Payment Handler ─────────────────────────
    const handlePay = useCallback(async () => {
        // Double payment protection with timestamp
        const now = Date.now();
        if (now - lastClickTime.current < 1000) return;
        lastClickTime.current = now;

        if (paying || scriptLoading) return;
        if (!course?.id) {
            toast.error("Invalid course");
            return;
        }

        setPaying(true);

        try {
            if (method === "razorpay") {
                await payRazorpay();
            } else {
                await payPaypal();
            }

            if (isMounted.current) {
                toast.success("Payment successful 🎉");
                await dispatch(fetchMe());
                navigate(`/student/course/${course.id}/learn`);
            }
        } catch (err) {
            if (isMounted.current) {
                const errorMessage = getErrorMessage(err);
                if (err.message === "cancelled") {
                    toast(errorMessage);
                } else {
                    toast.error(errorMessage);
                }
            }
        } finally {
            if (isMounted.current) {
                setPaying(false);
            }
        }
    }, [paying, scriptLoading, course, method, payRazorpay, payPaypal, dispatch, navigate]);

    return {
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
        discountInfo,
    };
}
