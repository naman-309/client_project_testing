export function ArticleViewer({ content }) {
    return (
        <div className="article-viewer">
            <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: content || "<p>No content available.</p>" }}
            />
        </div>
    );
}

export default ArticleViewer;
