export function QuestionCard({ question, index, selectedAnswer, onAnswerChange }) {
    const isMultiple = question.type === "multiple";

    return (
        <div className="question-card">
            <h3>
                Q{index}. {question.text}
            </h3>
            <div className="options">
                {question.options?.map((option, i) => (
                    <label key={i} className="option-label">
                        <input
                            type={isMultiple ? "checkbox" : "radio"}
                            name={`question-${question._id}`}
                            value={option}
                            checked={
                                isMultiple ? selectedAnswer?.includes(option) : selectedAnswer === option
                            }
                            onChange={() => {
                                if (isMultiple) {
                                    const current = selectedAnswer || [];
                                    const updated = current.includes(option)
                                        ? current.filter((o) => o !== option)
                                        : [...current, option];
                                    onAnswerChange(updated);
                                } else {
                                    onAnswerChange(option);
                                }
                            }}
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default QuestionCard;
