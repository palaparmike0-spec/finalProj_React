import Button from './Button';

export default function Modal({ open, title, children, onConfirm, onCancel, confirmText = 'Confirm', loading = false }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" type="button" loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}