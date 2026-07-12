import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmationDialog({ open, onClose, onConfirm, title = 'Confirm action', message, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'dark'} onClick={() => { onConfirm?.(); onClose?.(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="font-mono text-[13px] text-ink-soft">{message}</p>
    </Modal>
  );
}
