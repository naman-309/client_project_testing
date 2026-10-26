import { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle2, Flag } from "lucide-react";

export function ExamTimer({ duration, onTimeUp, isActive }) {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, timeLeft, onTimeUp]);

    const isWarning = timeLeft <= 300 && timeLeft > 0; // last 5 minutes

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
        return `${minutes}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isWarning
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}
        >
            <Clock size={16} />
            <span className="font-semibold text-sm">{formatTime(timeLeft)}</span>
            {isWarning && <AlertCircle size={14} className="animate-pulse" />}
        </div>
    );
}

export function QuestionNavigator({
    questions,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    onQuestionSelect,
}) {
    return (
        <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <h3 className="font-semibold text-lg">Question Navigator</h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span>Flagged</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span>Not Answered</span>
                    </div>
                </div>
            </div>

            {/* Question Grid */}
            <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                        const isAnswered = answers[question.id] !== undefined;
                        const isFlagged = flaggedQuestions.includes(question.id);
                        const isCurrent = index === currentQuestionIndex;

                        return (
                            <button
                                key={question.id}
                                onClick={() => onQuestionSelect(index)}
                                className={`relative w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                                    isCurrent
                                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                        : isAnswered
                                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                                          : isFlagged
                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {index + 1}
                                {isFlagged && (
                                    <Flag size={10} className="absolute -top-1 -right-1 text-yellow-600" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>
                            {Object.keys(answers).length}/{questions.length}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SubmitExamModal({ isOpen, onClose, onSubmit, unansweredCount, flaggedCount, isSubmitting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Exam?</h3>
                    <p className="text-gray-600 text-sm">
                        Are you sure you want to submit your exam? This action cannot be undone.
                    </p>
                </div>

                {/* Warning Messages */}
                {(unansweredCount > 0 || flaggedCount > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        {unansweredCount > 0 && (
                            <div className="flex items-center gap-2 text-yellow-800 text-sm mb-2">
                                <AlertCircle size={16} />
                                <span>{unansweredCount} unanswered questions</span>
                            </div>
                        )}
                        {flaggedCount > 0 && (
                            <div className="flex items-center gap-2 text-yellow-800 text-sm">
                                <Flag size={16} />
                                <span>{flaggedCount} flagged questions for review</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Review Exam
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Submit Exam
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
