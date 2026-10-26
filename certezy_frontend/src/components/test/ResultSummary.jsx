export function ResultSummary({ result }) {
    if (!result) return null;

    return (
        <div className="result-summary">
            <div className="score-card">
                <h2>
                    Score: {result.score}/{result.totalQuestions}
                </h2>
                <p className="percentage">{Math.round((result.score / result.totalQuestions) * 100)}%</p>
                <p className={result.passed ? "passed" : "failed"}>
                    {result.passed ? "✅ Passed" : "❌ Failed"}
                </p>
            </div>
            <div className="answers-breakdown">
                <h3>Answer Breakdown</h3>
                {result.answers?.map((answer, index) => (
                    <div key={index} className={`answer-item ${answer.isCorrect ? "correct" : "incorrect"}`}>
                        <h4>
                            Q{index + 1}. {answer.questionText}
                        </h4>
                        <p>
                            Your answer:{" "}
                            {Array.isArray(answer.selected) ? answer.selected.join(", ") : answer.selected}
                        </p>
                        <p>
                            Correct answer:{" "}
                            {Array.isArray(answer.correct) ? answer.correct.join(", ") : answer.correct}
                        </p>
                        {answer.explanation && <p className="explanation">💡 {answer.explanation}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResultSummary;
