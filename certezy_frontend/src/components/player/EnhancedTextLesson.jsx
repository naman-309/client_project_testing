import { useState, useEffect } from "react";
import {
    BookOpen,
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2,
} from "lucide-react";

export function EnhancedTextLesson({
    lesson,
    onMarkComplete,
    isCompleted,
    onPrevious,
    onNext,
    hasNext,
    hasPrevious,
}) {
    const [fontSize, setFontSize] = useState("medium");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    // Estimated reading time at ~200 words per minute
    const estimatedReadingTime = lesson.content ? Math.ceil(lesson.content.split(/\s+/).length / 200) : 0;

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));
        };

        if (isFullscreen) {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [isFullscreen]);

    const getFontSizeClass = (size) => {
        switch (size) {
            case "small":
                return "text-sm";
            case "large":
                return "text-lg";
            default:
                return "text-base";
        }
    };

    const renderContent = () => {
        if (!lesson.content) return null;

        // Simple markdown-like parsing
        const processedContent = lesson.content
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-5">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/\*(.*)\*/gim, '<em class="italic text-gray-700">$1</em>')
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/gim,
                '<a href="$2" class="text-blue-600 hover:text-blue-700 underline">$1</a>'
            )
            .replace(
                /`([^`]+)`/gim,
                '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">$1</code>'
            )
            .replace(
                /```([^`]+)```/gim,
                '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
            )
            .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, "<br />");

        return (
            <div
                className={`prose prose-lg max-w-none ${getFontSizeClass(fontSize)} leading-relaxed`}
                dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${processedContent}</p>` }}
            />
        );
    };

    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Text Lesson</span>
                                {estimatedReadingTime > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{estimatedReadingTime} min read</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Font Size Controls */}
                        <div className="flex items-center bg-white rounded-lg border border-gray-200">
                            <button
                                onClick={() => setFontSize("small")}
                                className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                                    fontSize === "small"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                A-
                            </button>
                            <button
                                onClick={() => setFontSize("medium")}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    fontSize === "medium"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                A
                            </button>
                            <button
                                onClick={() => setFontSize("large")}
                                className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                                    fontSize === "large"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                A+
                            </button>
                        </div>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reading Progress (Fullscreen only) */}
            {isFullscreen && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Reading Progress</span>
                        <span>{Math.round(readingProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${readingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`p-6 ${isFullscreen ? "max-w-4xl mx-auto" : ""}`}>{renderContent()}</div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {!isCompleted && (
                        <button
                            onClick={onMarkComplete}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <CheckCircle2 size={18} />
                            Mark Complete
                        </button>
                    )}

                    {isCompleted && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            <CheckCircle2 size={18} />
                            <span className="font-medium">Completed</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isFullscreen) {
        return <div className="fixed inset-0 bg-white z-50 overflow-y-auto">{content}</div>;
    }

    return content;
}
