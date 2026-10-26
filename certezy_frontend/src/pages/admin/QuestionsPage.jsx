import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Loader2,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Clock,
    Target,
    Info,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { cn } from "@/lib/utils";

// ─── Inline services ───────────────────────────────────────────────────────────
const testService = {
    getById: (id) => api.get(`/tests/${id}`),
    getFull: (id) => api.get(`/tests/${id}/full`),
};

const questionService = {
    getByTestId: (testId) => api.get(`/questions/test/${testId}`),
    create: (data) => api.post("/questions/create", data),
    update: (id, d) => api.put(`/questions/update/${id}`, d),
    delete: (id) => api.delete(`/questions/delete/${id}`),
};

const optionService = {
    bulkCreate: (opts) => api.post("/options/bulk/create", opts),
    update: (id, d) => api.put(`/options/update/${id}`, d),
    delete: (id) => api.delete(`/options/delete/${id}`),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

const DIFFICULTY_STYLE = {
    easy: { label: "EASY", bg: "#F0FDF4", color: "#16A34A" },
    medium: { label: "MEDIUM", bg: "#FFFBEB", color: "#F59E0B" },
    hard: { label: "HARD", bg: "#FEF2F2", color: "#EF4444" },
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const EMPTY_QUESTION_FORM = {
    question: "",
    type: "single",
    difficulty: "medium",
    topic_tag: "",
    explanation: "",
    order_num: 1,
};

const makeEmptyOptions = () => [
    { option_text: "", is_correct: 1, order_num: 1 },
    { option_text: "", is_correct: 0, order_num: 2 },
    { option_text: "", is_correct: 0, order_num: 3 },
    { option_text: "", is_correct: 0, order_num: 4 },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]); // [{...q, options:[]}]
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    // Question modal
    const [showModal, setShowModal] = useState(false);
    const [editQ, setEditQ] = useState(null);
    const [qForm, setQForm] = useState(EMPTY_QUESTION_FORM);
    const [options, setOptions] = useState(makeEmptyOptions());
    const [savingQ, setSavingQ] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // ── Load test info ─────────────────────────────────────────────────────────
    useEffect(() => {
        testService
            .getById(testId)
            .then((r) => setTest(r.data?.data?.test ?? null))
            .catch(() => {});
    }, [testId]);

    // ── Load questions + options ───────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await testService.getFull(testId);

            // ✅ Fix — backend test.questions mein data hai
            const questions = data?.data?.test?.questions ?? [];
            setQuestions(questions);
        } catch (err) {
            // Fallback
            try {
                const { data } = await questionService.getByTestId(testId);
                setQuestions(data?.data?.questions ?? []);
            } catch {
                toast.error("Failed to load questions");
            }
        } finally {
            setLoading(false);
        }
    }, [testId]);
    useEffect(() => {
        load();
    }, [load]);

    // ── Question handlers ──────────────────────────────────────────────────────

    const openCreate = () => {
        setEditQ(null);
        setQForm({ ...EMPTY_QUESTION_FORM, order_num: questions.length + 1 });
        setOptions(makeEmptyOptions());
        setShowModal(true);
    };

    const openEdit = (q) => {
        setEditQ(q);
        setQForm({
            question: q.question ?? "",
            type: q.type ?? "single",
            difficulty: q.difficulty ?? "medium",
            topic_tag: q.topic_tag ?? "",
            explanation: q.explanation ?? "",
            order_num: q.order_num ?? 1,
        });
        setOptions(q.options?.length > 0 ? q.options.map((o) => ({ ...o })) : makeEmptyOptions());
        setShowModal(true);
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!qForm.question.trim()) {
            toast.error("Question required");
            return;
        }
        const validOpts = options.filter((o) => o.option_text.trim());
        if (validOpts.length < 2) {
            toast.error("At least 2 options required");
            return;
        }
        if (!validOpts.some((o) => o.is_correct)) {
            toast.error("Mark at least one correct answer");
            return;
        }

        setSavingQ(true);
        try {
            const qPayload = {
                test_id: testId,
                question: qForm.question.trim(),
                type: qForm.type,
                difficulty: qForm.difficulty,
                topic_tag: qForm.topic_tag?.trim() || undefined,
                explanation: qForm.explanation?.trim() || undefined,
                order_num: Number(qForm.order_num),
            };

            let questionId;

            if (editQ) {
                // Update question (test_id not allowed in update)
                const { test_id, ...updatePayload } = qPayload;
                await questionService.update(editQ.id, updatePayload);
                questionId = editQ.id;

                // Update existing options individually, bulk create new ones
                const existingIds = new Set(editQ.options?.map((o) => o.id) ?? []);
                const toUpdate = validOpts.filter((o) => o.id && existingIds.has(o.id));
                const toCreate = validOpts.filter((o) => !o.id);

                await Promise.all(
                    toUpdate.map((o) =>
                        optionService.update(o.id, {
                            option_text: o.option_text.trim(),
                            is_correct: o.is_correct ? 1 : 0,
                            order_num: o.order_num,
                        })
                    )
                );

                if (toCreate.length > 0) {
                    await optionService.bulkCreate({
                        question_id: questionId,
                        options: toCreate.map((o) => ({
                            option_text: o.option_text.trim(),
                            is_correct: o.is_correct ? 1 : 0,
                            order_num: o.order_num,
                        })),
                    });
                }

                toast.success("Question updated!");
            } else {
                // Create question
                const res = await questionService.create(qPayload);
                questionId = res.data?.data?.question?.id ?? res.data?.data?.id;

                // Bulk create options
                await optionService.bulkCreate({
                    question_id: questionId,
                    options: validOpts.map((o, i) => ({
                        option_text: o.option_text.trim(),
                        is_correct: o.is_correct ? 1 : 0,
                        order_num: i + 1,
                    })),
                });

                toast.success("Question created!");
            }

            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save question");
        } finally {
            setSavingQ(false);
        }
    };

    const handleDeleteQuestion = async (q) => {
        setDeletingId(q.id);
        try {
            await questionService.delete(q.id);
            toast.success("Question deleted!");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    // ── Option helpers ─────────────────────────────────────────────────────────

    const setOptionText = (idx, text) =>
        setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, option_text: text } : o)));

    const setCorrect = (idx) =>
        setOptions((prev) => prev.map((o, i) => ({ ...o, is_correct: i === idx ? 1 : 0 })));

    const addOption = () => {
        if (options.length >= 6) return;
        setOptions((prev) => [...prev, { option_text: "", is_correct: 0, order_num: prev.length + 1 }]);
    };

    const removeOption = (idx) => {
        if (options.length <= 2) return;
        setOptions((prev) => prev.filter((_, i) => i !== idx));
    };

    const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    const setF = (k, v) => setQForm((p) => ({ ...p, [k]: v }));

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex-wrap">
                <span
                    className="hover:text-slate-600 cursor-pointer"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    Dashboard
                </span>
                <ChevronRight size={11} />
                <span
                    className="hover:text-slate-600 cursor-pointer"
                    onClick={() => navigate("/admin/courses")}
                >
                    Courses
                </span>
                <ChevronRight size={11} />
                <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate(-1)}>
                    Tests
                </span>
                <ChevronRight size={11} />
                <span className="text-slate-500 truncate max-w-[100px]">{test?.title ?? "..."}</span>
                <ChevronRight size={11} />
                <span style={{ color: "#3282B8" }}>Questions</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                        Questions Manager
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Manage and refine assessment content for {test?.title ?? "this test"}.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0 transition-colors"
                    style={{ background: "#3282B8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                >
                    <Plus size={15} /> Add Question
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: "Questions",
                        value: questions.length,
                        sub: "Total",
                        icon: ClipboardList,
                        ibg: "#EBF4FF",
                        ic: "#3282B8",
                    },
                    {
                        label: "Duration",
                        value: `${test?.duration ?? 0}`,
                        sub: "Minutes",
                        icon: Clock,
                        ibg: "#FFFBEB",
                        ic: "#F59E0B",
                    },
                    {
                        label: "Pass Rate",
                        value: `${test?.pass_percentage ?? 0}%`,
                        sub: "Minimum",
                        icon: Target,
                        ibg: "#F0FDF4",
                        ic: "#16A34A",
                    },
                ].map(({ label, value, sub, icon: Icon, ibg, ic }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-slate-100 p-5"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: ibg }}
                            >
                                <Icon size={20} style={{ color: ic }} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {label}
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-[26px] font-extrabold text-slate-900 leading-none mt-0.5">
                                        {value}
                                    </p>
                                    <p className="text-[12px] text-slate-400 font-medium">{sub}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Questions list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#3282B8" }} />
                </div>
            ) : questions.length === 0 ? (
                <EmptyState onAdd={openCreate} />
            ) : (
                <div className="space-y-3">
                    {questions.map((q, idx) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={idx}
                            expanded={!!expanded[q.id]}
                            onToggle={() => toggleExpand(q.id)}
                            onEdit={() => openEdit(q)}
                            onDelete={() => handleDeleteQuestion(q)}
                            deleting={deletingId === q.id}
                        />
                    ))}
                </div>
            )}

            {/* Question Modal */}
            {showModal && (
                <Overlay onClose={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-slate-900">
                                    {editQ ? "Edit Question" : "Add Question"}
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    Configure question and answer options
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveQuestion}
                            className="overflow-y-auto px-6 py-5 space-y-5 flex-1"
                        >
                            {/* Question text */}
                            <Field label="Question *">
                                <textarea
                                    rows={3}
                                    autoFocus
                                    required
                                    value={qForm.question}
                                    onChange={(e) => setF("question", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter your question here..."
                                    style={{ resize: "none" }}
                                />
                            </Field>

                            {/* Difficulty + Topic + Order */}
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Difficulty">
                                    <select
                                        value={qForm.difficulty}
                                        onChange={(e) => setF("difficulty", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </Field>
                                <Field label="Topic Tag">
                                    <input
                                        type="text"
                                        value={qForm.topic_tag}
                                        onChange={(e) => setF("topic_tag", e.target.value)}
                                        className={inputCls}
                                        placeholder="e.g. EC2"
                                    />
                                </Field>
                                <Field label="Order #">
                                    <input
                                        type="number"
                                        min={1}
                                        value={qForm.order_num}
                                        onChange={(e) => setF("order_num", e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            {/* Explanation */}
                            <Field label="Explanation (optional)">
                                <textarea
                                    rows={2}
                                    value={qForm.explanation}
                                    onChange={(e) => setF("explanation", e.target.value)}
                                    className={inputCls}
                                    placeholder="Explain the correct answer..."
                                    style={{ resize: "none" }}
                                />
                            </Field>

                            {/* Options */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
                                            Answer Options
                                        </p>
                                        <p className="text-[11.5px] text-slate-400 mt-0.5">
                                            Click the radio to mark the correct answer
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    {options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all",
                                                opt.is_correct
                                                    ? "border-[#22C55E] bg-[#F0FDF4]"
                                                    : "border-slate-200 bg-white"
                                            )}
                                        >
                                            {/* Radio */}
                                            <button
                                                type="button"
                                                onClick={() => setCorrect(i)}
                                                className={cn(
                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                    opt.is_correct
                                                        ? "border-[#22C55E] bg-[#22C55E]"
                                                        : "border-slate-300 hover:border-[#3282B8]"
                                                )}
                                            >
                                                {opt.is_correct && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </button>

                                            {/* Letter */}
                                            <span
                                                className={cn(
                                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0",
                                                    opt.is_correct
                                                        ? "bg-[#22C55E] text-white"
                                                        : "bg-slate-100 text-slate-500"
                                                )}
                                            >
                                                {OPTION_LETTERS[i]}
                                            </span>

                                            {/* Input */}
                                            <input
                                                type="text"
                                                value={opt.option_text}
                                                onChange={(e) => setOptionText(i, e.target.value)}
                                                placeholder={`Option ${OPTION_LETTERS[i]}`}
                                                className="flex-1 bg-transparent outline-none text-[13.5px] text-slate-800 placeholder-slate-400"
                                            />

                                            {/* Remove */}
                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(i)}
                                                    className="p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add option */}
                                {options.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-[#BFDBFE] text-[13px] font-semibold text-[#3282B8] hover:bg-[#EBF4FF] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Add Option
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveQuestion}
                                disabled={savingQ}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                style={{ background: "#3282B8" }}
                                onMouseEnter={(e) => {
                                    if (!savingQ) e.currentTarget.style.background = "#2a6fa0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#3282B8";
                                }}
                            >
                                {savingQ ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={14} />
                                        {editQ ? "Update Question" : "Save Question"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}
        </div>
    );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ question, index, expanded, onToggle, onEdit, onDelete, deleting }) {
    const diff = DIFFICULTY_STYLE[question.difficulty] ?? DIFFICULTY_STYLE.medium;

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}
        >
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-4">
                {/* Q number */}
                <div
                    className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-extrabold shrink-0",
                        expanded ? "text-white" : "bg-slate-100 text-slate-600"
                    )}
                    style={expanded ? { background: "#3282B8" } : {}}
                >
                    {index + 1}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                        style={{ background: diff.bg, color: diff.color }}
                    >
                        {diff.label}
                    </span>
                    {question.topic_tag && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider border border-[#BFDBFE] text-[#3282B8] bg-[#EBF4FF]">
                            {question.topic_tag}
                        </span>
                    )}
                </div>

                {/* Question text — collapsed shows truncated */}
                {!expanded && (
                    <p
                        className="flex-1 text-[13.5px] font-semibold text-slate-800 truncate min-w-0 cursor-pointer"
                        onClick={onToggle}
                    >
                        {question.question}
                    </p>
                )}

                {expanded && <div className="flex-1" />}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors ml-1"
                    >
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                    {/* Question content label */}
                    <div>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Question Content
                        </p>
                        <p className="text-[14.5px] font-bold text-slate-900 leading-relaxed">
                            {question.question}
                        </p>
                    </div>

                    {/* Options grid */}
                    {question.options?.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {question.options
                                .sort((a, b) => a.order_num - b.order_num)
                                .map((opt, i) => (
                                    <div
                                        key={opt.id ?? i}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all",
                                            opt.is_correct
                                                ? "border-[#22C55E] bg-[#F0FDF4]"
                                                : "border-slate-200 bg-white"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0",
                                                opt.is_correct
                                                    ? "bg-[#22C55E] text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {OPTION_LETTERS[i]}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[13px] flex-1 truncate",
                                                opt.is_correct
                                                    ? "font-semibold text-[#16A34A]"
                                                    : "text-slate-700"
                                            )}
                                        >
                                            {opt.option_text}
                                        </span>
                                        {opt.is_correct ? (
                                            <CheckCircle2 size={15} className="text-[#22C55E] shrink-0" />
                                        ) : (
                                            <XCircle size={15} className="text-slate-300 shrink-0" />
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                            <Info size={15} className="text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10.5px] font-bold text-amber-700 uppercase tracking-widest mb-1">
                                    Expert Explanation
                                </p>
                                <p className="text-[13px] text-amber-800 leading-relaxed italic">
                                    {question.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center gap-4 text-center"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            <div className="w-14 h-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center">
                <ClipboardList size={26} style={{ color: "#3282B8" }} />
            </div>
            <div>
                <p className="text-[15px] font-bold text-slate-800">No questions yet</p>
                <p className="text-[13px] text-slate-400 mt-1">Add your first question to this test</p>
            </div>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: "#3282B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
            >
                <Plus size={15} /> Add Question
            </button>
        </div>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Overlay({ onClose, children }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
