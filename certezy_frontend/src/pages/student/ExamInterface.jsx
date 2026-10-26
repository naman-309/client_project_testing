import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    FileText,
    Clock,
    AlertCircle,
    Flag,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";

import testService from "@/services/testService";
import { QuestionRenderer, ExamResults } from "@/components/exam/QuestionRenderer";
import { ExamTimer, QuestionNavigator, SubmitExamModal } from "@/components/exam/ExamComponents";

export default function ExamInterface() {
    const { courseId, testId } = useParams();
    const navigate = useNavigate();

    // Exam state
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attemptId, setAttemptId] = useState(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [, setTimeLeft] = useState(0);

    useEffect(() => {
        loadExam();
    }, [testId]);

    const loadExam = async () => {
        try {
            setLoading(true);

            // Start exam attempt first to get attempt_id and questions
            const attemptRes = await testService.startAttempt(testId);
            const attemptData = attemptRes.data?.data;

            if (!attemptData) {
                throw new Error("Failed to start exam attempt");
            }

            // Set attempt ID and timer from attempt response
            setAttemptId(attemptData.attempt_id);
            setTimeLeft(attemptData.test.duration * 60); // duration in minutes to seconds

            // Set exam details from attempt response
            setExam(attemptData.test);

            // Set questions from attempt response
            setQuestions(attemptData.questions || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load exam");
            navigate(`/student/course/${courseId}/learn`);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleToggleFlag = (questionId) => {
        setFlaggedQuestions((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
        );
    };

    const handleQuestionSelect = (index) => {
        setCurrentQuestionIndex(index);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitExam = async () => {
        try {
            setSubmitting(true);

            // Convert answers to required API format
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOpts]) => ({
                question_id: parseInt(questionId),
                selected_opts: Array.isArray(selectedOpts) ? selectedOpts : [selectedOpts],
            }));

            const submitData = {
                attempt_id: attemptId,
                answers: formattedAnswers,
            };

            const resultRes = await testService.submitExam(submitData);
            const resultData = resultRes.data?.data;

            setResults({
                ...resultData,
                answers,
            });
            setShowResults(true);
            window.dispatchEvent(new Event("enrollment-updated"));
            toast.success("Exam submitted successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit exam");
        } finally {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    };

    const handleTimeUp = () => {
        toast.error("Time's up! Submitting your exam...");
        handleSubmitExam();
    };

    const handleRetry = () => {
        // Reset state and reload exam
        setAnswers({});
        setFlaggedQuestions([]);
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setResults(null);
        loadExam();
    };

    const handleBackToCourse = () => {
        navigate(`/student/course/${courseId}/learn`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (showResults && results) {
        const isPassed = Boolean(results.is_passed ?? results.passed);
        return (
            <div
                className="min-h-screen bg-gray-50"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                <ExamResults
                    results={results}
                    questions={questions}
                    onRetry={!isPassed ? handleRetry : null}
                    onBackToCourse={handleBackToCourse}
                />
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const unansweredCount = questions.length - Object.keys(answers).length;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackToCourse}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft size={20} />
                                <span>Back to Course</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{exam.title}</h1>
                                <p className="text-sm text-gray-600">{exam.description}</p>
                            </div>
                        </div>

                        <ExamTimer duration={exam.duration_minutes} onTimeUp={handleTimeUp} isActive={true} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Question Content */}
                    <div className="flex-1">
                        {/* Question Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-500">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} />
                                        <span>{exam.duration_minutes} minutes</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleFlag(currentQuestion.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                        flaggedQuestions.includes(currentQuestion.id)
                                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    <Flag size={16} />
                                    <span className="text-sm font-medium">
                                        {flaggedQuestions.includes(currentQuestion.id) ? "Flagged" : "Flag"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Question */}
                        <QuestionRenderer
                            question={currentQuestion}
                            answer={answers[currentQuestion.id]}
                            onAnswerChange={handleAnswerChange}
                        />

                        {/* Navigation */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        {answeredCount} of {questions.length} answered
                                    </span>
                                </div>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={() => setShowSubmitModal(true)}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Send size={16} />
                                        Submit Exam
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Next
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="flex-shrink-0">
                        <QuestionNavigator
                            questions={questions}
                            currentQuestionIndex={currentQuestionIndex}
                            answers={answers}
                            flaggedQuestions={flaggedQuestions}
                            onQuestionSelect={handleQuestionSelect}
                            onToggleFlag={handleToggleFlag}
                        />
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            <SubmitExamModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onSubmit={handleSubmitExam}
                unansweredCount={unansweredCount}
                flaggedCount={flaggedQuestions.length}
                isSubmitting={submitting}
            />
        </div>
    );
}
