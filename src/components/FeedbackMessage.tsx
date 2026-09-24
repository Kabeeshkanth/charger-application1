interface FeedbackMessageProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export function FeedbackMessage({
                                    type,
                                    message,
                                    onClose,
                                }: FeedbackMessageProps) {
    return (
        <div className={`feedback-message feedback-${type}`} role="alert">
            <span>{message}</span>
            <button type="button" onClick={onClose} aria-label="Close message">
                ×
            </button>
        </div>
    );
}
