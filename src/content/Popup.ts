import type { AnnotationRect } from '../types';
import { h, render } from 'preact';
import { EVENTS, PPT_PREFIX } from './constants';
import { PopupView } from './PopupView';

const POPUP_GAP = 12;
const POPUP_VIEWPORT_MARGIN = 12;

export class Popup {
  #el: HTMLDivElement | null = null;
  #existing: { id: string; feedback: string } | null = null;
  #form: HTMLFormElement | null = null;
  #onFormSubmit: ((event: Event) => void) | null = null;
  #onKeyDown: ((e: KeyboardEvent) => void) | null = null;
  #helperText = '';
  #submitLabel = 'Add';
  #textarea: HTMLTextAreaElement | null = null;
  #visible = false;

  mount() {
    this.#el = document.createElement('div');
    this.#el.className = `${PPT_PREFIX}popup`;
    this.#el.style.display = 'none';
    document.body.appendChild(this.#el);
    this.#onFormSubmit = (event) => {
      event.preventDefault();
      const feedback = this.#textarea?.value.trim() ?? '';
      if (!feedback) return;
      this.#handleSubmit(feedback);
    };
    this.#render();

    this.#onKeyDown = (e) => {
      if (e.key === 'Escape' && this.#visible) this.hide(true);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && this.#el?.style.display !== 'none') {
        this.#el?.querySelector<HTMLFormElement>(`.${PPT_PREFIX}popup-form`)?.requestSubmit();
      }
    };
    document.addEventListener('keydown', this.#onKeyDown);
  }

  show(
    rect: AnnotationRect,
    existing: { id: string; feedback: string } | null,
    options: { noteNumber: number; selectorPath: string }
  ) {
    this.#existing = existing;
    this.#submitLabel = existing ? 'Update' : 'Add';
    this.#helperText = options.selectorPath;
    this.#render();

    this.#el!.style.cssText = 'display:block;position:fixed;top:0;left:0;visibility:hidden';
    const popupRect = this.#el!.getBoundingClientRect();
    const fitsBelow =
      rect.y + rect.height + POPUP_GAP + popupRect.height <=
      window.innerHeight - POPUP_VIEWPORT_MARGIN;
    const preferredTop = fitsBelow
      ? rect.y + rect.height + POPUP_GAP
      : rect.y - popupRect.height - POPUP_GAP;
    const top = Math.max(
      POPUP_VIEWPORT_MARGIN,
      Math.min(window.innerHeight - popupRect.height - POPUP_VIEWPORT_MARGIN, preferredTop)
    );
    const preferredLeft = rect.x + Math.min(rect.width / 2, 48) - popupRect.width / 2;
    const left = Math.max(
      POPUP_VIEWPORT_MARGIN,
      Math.min(window.innerWidth - popupRect.width - POPUP_VIEWPORT_MARGIN, preferredLeft)
    );
    this.#el!.style.cssText = `display:block;position:fixed;top:${top}px;left:${left}px`;
    this.#visible = true;
    this.#textarea?.focus();
  }

  hide(emitCancel = false) {
    if (!this.#el) return;
    this.#el.style.display = 'none';
    this.#existing = null;
    this.#submitLabel = 'Add';
    this.#helperText = '';
    const wasVisible = this.#visible;
    this.#visible = false;
    this.#render();
    if (emitCancel && wasVisible) {
      document.dispatchEvent(
        new CustomEvent(EVENTS.ANNOTATION_CANCEL, {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  unmount() {
    if (this.#onKeyDown) document.removeEventListener('keydown', this.#onKeyDown);
    if (this.#form && this.#onFormSubmit) this.#form.removeEventListener('submit', this.#onFormSubmit);
    if (this.#el) render(null, this.#el);
    this.#el?.remove();
    this.#el = null;
    this.#form = null;
    this.#onFormSubmit = null;
    this.#textarea = null;
  }

  #handleSubmit(feedback: string): void {
    document.dispatchEvent(
      new CustomEvent(EVENTS.ANNOTATION_ADD, {
        bubbles: true,
        composed: true,
        detail: { feedback, existingId: this.#existing?.id ?? null },
      })
    );
    this.hide();
  }

  #render(): void {
    if (!this.#el) return;
    render(
      h(PopupView, {
        existingFeedback: this.#existing?.feedback ?? '',
        helperText: this.#helperText,
        submitLabel: this.#submitLabel,
        onCancel: () => this.hide(true),
        onTextareaReady: (element) => {
          this.#textarea = element;
        },
      }),
      this.#el
    );
    const nextForm = this.#el.querySelector<HTMLFormElement>(`.${PPT_PREFIX}popup-form`);
    if (nextForm !== this.#form) {
      if (this.#form && this.#onFormSubmit) {
        this.#form.removeEventListener('submit', this.#onFormSubmit);
      }
      this.#form = nextForm;
      if (this.#form && this.#onFormSubmit) {
        this.#form.addEventListener('submit', this.#onFormSubmit);
      }
    }
  }
}
