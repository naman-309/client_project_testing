import { useState, useEffect } from "react";
import {
    Folder,
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
    BookOpen,
    Layers,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sectionService from "@/services/sectionService";

// Section Form Component
function SectionForm({ section, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: section?.title || "",
        description: section?.description || "",
        courseId: section?.courseId || "",
        order: section?.order || 1,
        isPublished: section?.isPublished !== undefined ? section.isPublished : true,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (section?.id) {
                await sectionService.update(section.id, formData);
            } else {
                await sectionService.create(formData);
            }
            onSave();
        } catch (error) {
            console.error("Error saving section:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {section?.id ? "Edit Section" : "Create Section"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Introduction to React"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course ID</label>
                        <input
                            type="text"
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="course-123"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="1"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Learn the basics of React..."
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                        Published
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Saving..." : section?.id ? "Update" : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

// Section Details Modal Component
function SectionDetailsModal({ section, isOpen, onClose }) {
    if (!section) return null;

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
                                    <h2 className="text-lg font-semibold text-gray-900">Section Details</h2>
                                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Section Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Section Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Title</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {section.title}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Course ID</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {section.courseId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Order</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {section.order}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 text-xs font-medium rounded-full",
                                                        section.isPublished
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    )}
                                                >
                                                    {section.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {section.description && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Description
                                            </h4>
                                            <p className="text-sm text-gray-600">{section.description}</p>
                                        </div>
                                    )}

                                    {/* Statistics */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Statistics</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Lessons Count</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {section.lessonsCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Duration</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {section.totalDuration || "0 min"}
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

// Sections Table Component
function SectionsTable({ sections, onViewDetails, onEdit, onDelete }) {
    const getStatusBadge = (isPublished) => {
        return (
            <span
                className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                )}
            >
                {isPublished ? "Published" : "Draft"}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Section</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Course</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lessons</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                Duration
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sections.map((section) => (
                            <tr key={section.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Layers size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {section.title}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                                            <BookOpen size={12} className="text-gray-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">{section.courseId}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">#{section.order}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {section.lessonsCount || 0}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {section.totalDuration || "0 min"}
                                </td>
                                <td className="py-3 px-4">{getStatusBadge(section.isPublished)}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(section)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(section)}
                                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                            title="Edit Section"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(section)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete Section"
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

export default function SectionsPage() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSection, setSelectedSection] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [, setIsFormModalOpen] = useState(false);

    const sectionsPerPage = 10;
    const totalPages = Math.ceil(sections.length / sectionsPerPage);

    // Load sections
    useEffect(() => {
        const loadSections = async () => {
            try {
                setLoading(true);
                setError(null);

                // For now, we'll need to get sections by course ID
                // In a real implementation, you might have an admin endpoint to get all sections
                const response = await sectionService.getByCourseId("all"); // This would need to be implemented
                const sectionsData = response.data?.data?.sections || [];

                setSections(
                    sectionsData.map((section) => ({
                        id: section.id,
                        title: section.title || "Untitled Section",
                        description: section.description || "",
                        courseId: section.courseId || "unknown",
                        order: section.order || 1,
                        isPublished: section.isPublished !== false,
                        lessonsCount: section.lessonsCount || 0,
                        totalDuration: section.totalDuration || "0 min",
                        createdAt: new Date(section.createdAt).toLocaleDateString(),
                    }))
                );
            } catch (err) {
                console.error("Error loading sections:", err);
                if (err.response?.status === 404) {
                    setError(
                        "Sections API endpoint not available. Please ensure backend is properly configured."
                    );
                } else {
                    setError("Failed to load sections");
                }
                setSections([]);
            } finally {
                setLoading(false);
            }
        };

        loadSections();
    }, []);

    // Filter sections
    const filteredSections = sections.filter((section) => {
        const matchesSearch =
            section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.courseId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "published" && section.isPublished) ||
            (selectedStatus === "draft" && !section.isPublished);
        const matchesCourse = selectedCourse === "all" || section.courseId === selectedCourse;

        return matchesSearch && matchesStatus && matchesCourse;
    });

    // Get paginated sections
    const paginatedSections = filteredSections.slice(
        (currentPage - 1) * sectionsPerPage,
        currentPage * sectionsPerPage
    );

    const handleViewDetails = (section) => {
        setSelectedSection(section);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (section) => {
        setSelectedSection(section);
        setIsFormModalOpen(true);
    };

    const handleDelete = (section) => {
        if (window.confirm(`Are you sure you want to delete section "${section.title}"?`)) {
            sectionService
                .delete(section.id)
                .then(() => {
                    setSections(sections.filter((s) => s.id !== section.id));
                })
                .catch((error) => {
                    console.error("Error deleting section:", error);
                });
        }
    };

    const handleSave = () => {
        setIsFormModalOpen(false);
        setSelectedSection(null);
        // Reload sections - this would need a proper admin endpoint
        window.location.reload();
    };

    const handleCancel = () => {
        setIsFormModalOpen(false);
        setSelectedSection(null);
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
                            <h3 className="text-lg font-medium text-red-900">Error Loading Sections</h3>
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
                    <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
                    <p className="text-gray-600 mt-1">Manage course sections and content organization</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => setIsFormModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Create Section
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
                                placeholder="Search by title, description, or course ID..."
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
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Courses</option>
                            {/* This would be populated with actual courses */}
                        </select>

                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Sections Table */}
            <SectionsTable
                sections={paginatedSections}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {/* Section Details Modal */}
            <SectionDetailsModal
                section={selectedSection}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />

            {/* Section Form Modal */}
            <SectionForm section={selectedSection} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
}
