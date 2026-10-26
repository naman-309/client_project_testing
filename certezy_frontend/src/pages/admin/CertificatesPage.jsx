import { useState, useEffect } from "react";
import {
    Award,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    BookOpen,
    FileText,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import certificateService from "@/services/certificateService";

// Certificate Details Modal Component
function CertificateDetailsModal({ certificate, isOpen, onClose }) {
    if (!certificate) return null;

    return (
        <div className={cn("fixed inset-0 z-50 overflow-hidden", isOpen ? "block" : "hidden")}>
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />
                <section className="absolute inset-y-0 right-0 max-w-full flex">
                    <div className="relative w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Certificate Details
                                    </h2>
                                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Certificate Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Certificate Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Certificate ID</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Issue Date</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.issueDate}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 text-xs font-medium rounded-full",
                                                        certificate.status === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    )}
                                                >
                                                    {certificate.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Student Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Name</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.studentName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Email</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.studentEmail}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Course Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Course</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.courseName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Completion Date</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {certificate.completionDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Issue Certificate Modal Component
function IssueCertificateModal({ isOpen, onClose, onIssue }) {
    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        issueDate: new Date().toISOString().split("T")[0],
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await certificateService.issue(formData);
            onIssue();
            onClose();
        } catch (error) {
            console.error("Error issuing certificate:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("fixed inset-0 z-50 overflow-hidden", isOpen ? "block" : "hidden")}>
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />
                <section className="absolute inset-y-0 right-0 max-w-full flex">
                    <div className="relative w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Issue Certificate</h2>
                                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.studentId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, studentId: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Course ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.courseId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, courseId: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Issue Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.issueDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, issueDate: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? "Issuing..." : "Issue Certificate"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Certificates Table Component
function CertificatesTable({ certificates, onViewDetails, onRevoke }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                Certificate ID
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Course</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                Issue Date
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {certificates.map((certificate) => (
                            <tr key={certificate.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">#{certificate.id}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User size={14} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {certificate.studentName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {certificate.studentEmail}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <BookOpen size={14} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {certificate.courseName}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{certificate.issueDate}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-full",
                                            certificate.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        )}
                                    >
                                        {certificate.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(certificate)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => onRevoke(certificate)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Revoke Certificate"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

    const certificatesPerPage = 10;
    const totalPages = Math.ceil(certificates.length / certificatesPerPage);

    // Load certificates
    useEffect(() => {
        const loadCertificates = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await certificateService.getAllAdmin();
                const certificatesData = response.data?.data?.certificates || [];

                setCertificates(
                    certificatesData.map((cert) => ({
                        id: cert.id,
                        studentName: cert.student?.name || "Unknown Student",
                        studentEmail: cert.student?.email || "unknown@example.com",
                        courseName: cert.course?.title || "Unknown Course",
                        issueDate: new Date(cert.issueDate).toLocaleDateString(),
                        status: cert.status || "active",
                    }))
                );
            } catch (err) {
                console.error("Error loading certificates:", err);
                if (err.response?.status === 404) {
                    setError(
                        "Certificates API endpoint not available. Please ensure backend is properly configured."
                    );
                } else {
                    setError("Failed to load certificates");
                }
                setCertificates([]);
            } finally {
                setLoading(false);
            }
        };

        loadCertificates();
    }, []);

    // Filter certificates
    const filteredCertificates = certificates.filter((certificate) => {
        const matchesSearch =
            certificate.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.courseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || certificate.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    // Get paginated certificates
    const paginatedCertificates = filteredCertificates.slice(
        (currentPage - 1) * certificatesPerPage,
        currentPage * certificatesPerPage
    );

    const handleViewDetails = (certificate) => {
        setSelectedCertificate(certificate);
        setIsDetailsModalOpen(true);
    };

    const handleRevoke = async (certificate) => {
        if (window.confirm(`Are you sure you want to revoke certificate for "${certificate.studentName}"?`)) {
            try {
                await certificateService.revoke(certificate.id);
                setCertificates(certificates.filter((c) => c.id !== certificate.id));
            } catch (error) {
                console.error("Error revoking certificate:", error);
            }
        }
    };

    const handleIssue = () => {
        // Reload certificates after issuing
        certificateService.getAllAdmin().then((response) => {
            const certificatesData = response.data?.data?.certificates || [];
            setCertificates(
                certificatesData.map((cert) => ({
                    id: cert.id,
                    studentName: cert.student?.name || "Unknown Student",
                    studentEmail: cert.student?.email || "unknown@example.com",
                    courseName: cert.course?.title || "Unknown Course",
                    issueDate: new Date(cert.issueDate).toLocaleDateString(),
                    status: cert.status || "active",
                }))
            );
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-600" />
                        <div>
                            <h3 className="text-lg font-medium text-red-900">Error Loading Certificates</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
                    <p className="text-gray-600 mt-1">Manage student certificates and awards</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => setIsIssueModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Issue Certificate
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by student name, email, or course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="revoked">Revoked</option>
                        </select>

                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Certificates Table */}
            <CertificatesTable
                certificates={paginatedCertificates}
                onViewDetails={handleViewDetails}
                onRevoke={handleRevoke}
            />

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {/* Certificate Details Modal */}
            <CertificateDetailsModal
                certificate={selectedCertificate}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />

            {/* Issue Certificate Modal */}
            <IssueCertificateModal
                isOpen={isIssueModalOpen}
                onClose={() => setIsIssueModalOpen(false)}
                onIssue={handleIssue}
            />
        </div>
    );
}
