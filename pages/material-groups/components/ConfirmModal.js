import styles from '../MaterialGroups.module.css';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'primary',
}) {
  if (!open) {
    return null;
  }

  const confirmClass =
    variant === 'danger' ? styles.modalConfirmDanger : styles.modalConfirmPrimary;

  return (
    <div className={styles.modalOverlay} onClick={loading ? undefined : onCancel}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h3 id="confirm-modal-title" className={styles.modalTitle}>
          {title}
        </h3>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
