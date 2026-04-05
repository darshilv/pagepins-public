import { useCallback } from 'preact/hooks';

import { PPT_PREFIX } from './constants';

interface PopupViewProps {
  existingFeedback: string;
  helperText: string;
  submitLabel: string;
  onCancel: () => void;
  onTextareaReady: (element: HTMLTextAreaElement | null) => void;
}

export function PopupView({
  existingFeedback,
  helperText,
  submitLabel,
  onCancel,
  onTextareaReady,
}: PopupViewProps) {
  const setTextareaRef = useCallback(
    (element: HTMLTextAreaElement | null) => {
      onTextareaReady(element);
    },
    [onTextareaReady]
  );

  return (
    <form className={`${PPT_PREFIX}popup-form`}>
      <div className={`${PPT_PREFIX}popup-header`}>
        <p className={`${PPT_PREFIX}popup-eyebrow`}>Pinpoint note</p>
        <button
          type="button"
          className={`${PPT_PREFIX}popup-close`}
          aria-label="Close note composer"
          onClick={onCancel}
        >
          ×
        </button>
      </div>
      <p className={`${PPT_PREFIX}popup-helper`}>{helperText}</p>
      <textarea
        ref={setTextareaRef}
        key={existingFeedback}
        className={`${PPT_PREFIX}popup-textarea`}
        placeholder="Capture what would change, describe the issue, the intended outcome, or the exact UI adjustment you want."
        rows={4}
        defaultValue={existingFeedback}
      />
      <div className={`${PPT_PREFIX}popup-actions`}>
        <button type="button" className={`${PPT_PREFIX}popup-cancel`} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={`${PPT_PREFIX}popup-submit`}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
