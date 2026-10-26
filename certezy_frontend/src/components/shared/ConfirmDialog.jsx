export function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="confirm-dialog-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
