export function LessonSidebar({ sections = [], currentLessonId, onSelectLesson }) {
    return (
        <aside className="lesson-sidebar">
            <h3>Course Content</h3>
            {sections.map((section) => (
                <div key={section._id} className="sidebar-section">
                    <h4>{section.title}</h4>
                    <ul>
                        {section.lessons?.map((lesson) => (
                            <li
                                key={lesson._id}
                                className={`sidebar-lesson ${lesson._id === currentLessonId ? "active" : ""} ${lesson.completed ? "completed" : ""}`}
                                onClick={() => onSelectLesson(lesson)}
                            >
                                <span className="lesson-icon">{lesson.type === "video" ? "🎥" : "📄"}</span>
                                <span>{lesson.title}</span>
                                {lesson.completed && <span className="check">✓</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </aside>
    );
}

export default LessonSidebar;
