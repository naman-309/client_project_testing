import React, { useState, useEffect } from "react";
import { Search, X, Send, Clock, CheckCircle, Copy, Users, BookOpen, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";
import courseService from "@/services/courseService";
import authService from "@/services/authService";
import discountService from "@/services/discountService";

export default function DiscountsPage() {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [discountPrice, setDiscountPrice] = useState("");
    const [expiryHours, setExpiryHours] = useState(24);
    const [showSuccess, setShowSuccess] = useState(false);
    const [sentLink, setSentLink] = useState("");

    // Load courses and students on mount
    useEffect(() => {
        loadCourses();
        loadStudents();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await courseService.getAll({ limit: 100 });
            setCourses(response.data?.data || []);
        } catch (error) {
            console.error("Failed to load courses:", error);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await authService.getAllUsers({ role: "student", limit: 100 });
            setStudents(response.data?.data || []);
        } catch (error) {
            console.error("Failed to load students:", error);
        }
    };

    const calculateDiscountPercentage = () => {
        if (!selectedCourse || !discountPrice) return 0;
        const original = selectedCourse.price;
        const discounted = parseFloat(discountPrice);
        if (original <= 0 || discounted <= 0) return 0;
        return (((original - discounted) / original) * 100).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCourse || !selectedStudent || !discountPrice) {
            toast.error("Please fill all required fields");
            return;
        }

        const originalPrice = selectedCourse.price;
        const discountAmount = parseFloat(discountPrice);

        if (discountAmount >= originalPrice) {
            toast.error("Discount price must be less than original price");
            return;
        }

        setLoading(true);
        try {
            const response = await discountService.createDiscountLink({
                user_id: selectedStudent.id,
                course_id: selectedCourse.id,
                discount_price: discountAmount,
                expiry_hours: expiryHours,
            });

            setShowSuccess(true);
            setSentLink(response.data?.discountLink || "");
            toast.success("Discount link sent successfully!");

            // Reset form
            setSelectedCourse(null);
            setSelectedStudent(null);
            setDiscountPrice("");
            setExpiryHours(24);
        } catch (error) {
            console.error("Failed to send discount:", error);
            toast.error(error.response?.data?.message || "Failed to send discount");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sentLink);
        toast.success("Link copied to clipboard!");
    };

    const inputCls =
        "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Send Discount Link</h1>
                    <p className="text-slate-600 text-sm">Create personalized discount offers for students</p>
                </div>

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Discount Link Sent!
                                </h3>
                                <p className="text-slate-600 text-sm mb-4">
                                    The discount link has been sent to the student's email
                                </p>

                                {sentLink && (
                                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={sentLink}
                                                readOnly
                                                className="flex-1 bg-transparent text-xs text-slate-700 outline-none"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
                                    style={{ background: "#3282B8" }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                Select Course
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedCourse?.id || ""}
                                    onChange={(e) =>
                                        setSelectedCourse(
                                            courses.find((c) => c.id === parseInt(e.target.value))
                                        )
                                    }
                                    className={`${inputCls} pl-10 appearance-none cursor-pointer`}
                                    required
                                >
                                    <option value="">Choose a course...</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Course Info Card */}
                            {selectedCourse && (
                                <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex gap-3">
                                        {selectedCourse.thumbnail ? (
                                            <img
                                                src={selectedCourse.thumbnail}
                                                alt={selectedCourse.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#3282B8] to-[#0a1628] flex items-center justify-center">
                                                <BookOpen className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 text-sm">
                                                {selectedCourse.title}
                                            </h4>
                                            <div className="mt-1">
                                                <span className="text-slate-400 text-xs line-through">
                                                    Original Price: ₹{selectedCourse.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Student Selection */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                Select Student
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedStudent?.id || ""}
                                    onChange={(e) =>
                                        setSelectedStudent(
                                            students.find((s) => s.id === parseInt(e.target.value))
                                        )
                                    }
                                    className={`${inputCls} pl-10 appearance-none cursor-pointer`}
                                    required
                                >
                                    <option value="">Search student by name or email...</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Student Info Card */}
                            {selectedStudent && (
                                <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3282B8] to-[#0a1628] flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-sm">
                                                {selectedStudent.name}
                                            </h4>
                                            <p className="text-slate-500 text-xs">{selectedStudent.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Discount Pricing */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                Discount Pricing
                            </label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500">
                                        Original Price (Read-only)
                                    </label>
                                    <div
                                        className={`${inputCls} bg-slate-100 text-slate-500 cursor-not-allowed flex items-center gap-2`}
                                    >
                                        <IndianRupee className="w-4 h-4" />
                                        {selectedCourse ? selectedCourse.price : "0"}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500">Discounted Price</label>
                                    <div className={`${inputCls} flex items-center gap-2`}>
                                        <IndianRupee className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            placeholder="Enter discounted price"
                                            min="0"
                                            max={selectedCourse ? selectedCourse.price - 1 : ""}
                                            required
                                            className="flex-1 bg-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Discount Percentage */}
                                {selectedCourse && discountPrice && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-semibold text-green-800">
                                                You're offering {calculateDiscountPercentage()}% discount!
                                            </span>
                                        </div>
                                        <div className="text-xs text-green-700 mt-1">
                                            Student saves: ₹
                                            {(selectedCourse.price - parseFloat(discountPrice)).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expiry Settings */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                Link Expiry
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[6, 12, 24, 48].map((hours) => (
                                    <button
                                        key={hours}
                                        type="button"
                                        onClick={() => setExpiryHours(hours)}
                                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
                                            expiryHours === hours
                                                ? "bg-[#3282B8] text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {hours} hours
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    value={expiryHours}
                                    onChange={(e) => setExpiryHours(parseInt(e.target.value) || 24)}
                                    min="1"
                                    max="168"
                                    className={`${inputCls} flex items-center gap-2`}
                                    placeholder="Custom hours"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCourse(null);
                                    setSelectedStudent(null);
                                    setDiscountPrice("");
                                    setExpiryHours(24);
                                }}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                style={{ background: "#3282B8" }}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Discount Link
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
