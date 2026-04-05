import type { Annotation, PinpointMode } from '../types';
import { PPT_PREFIX } from './constants';

export type ToolbarTheme = 'light' | 'dark';
export type ReviewTab = 'active' | 'history';

export interface HistoryGroup {
  copiedAt: number;
  annotations: Annotation[];
}

export interface ToolbarViewState {
  active: Annotation[];
  historyGroups: HistoryGroup[];
  historyCount: number;
  hasAttention: boolean;
  reviewOpen: boolean;
  selecting: boolean;
  anchorActive: boolean;
  helpOpen: boolean;
  isCopySuccessVisible: boolean;
  hasActiveAnnotations: boolean;
  showCollapsedCopy: boolean;
  showExpandedCopy: boolean;
  shouldDisableExpandedCopy: boolean;
  copyOneFeedbackId: string | null;
  mode: PinpointMode;
  tab: ReviewTab;
  theme: ToolbarTheme;
}

function CopyIcon({ success }: { success: boolean }) {
  return success ? (
    <svg className={`${PPT_PREFIX}toolbar-header-button-icon`} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.2 6.4 11l6.1-6.4" />
    </svg>
  ) : (
    <svg className={`${PPT_PREFIX}toolbar-header-button-icon`} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5.2" y="3.2" width="7.3" height="9.3" rx="1.6" />
      <path d="M9.8 3.2V2.5a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v7.3a1 1 0 0 0 1 1h.7" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className={`${PPT_PREFIX}anchor-icon`} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5.5h10M5 10h10M5 14.5h6" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className={`${PPT_PREFIX}anchor-icon`} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7.5 7.2a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.2-2.5 4" />
      <path d="M10 14.9h.01" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: ToolbarTheme }) {
  return theme === 'dark' ? (
    <svg className={`${PPT_PREFIX}theme-toggle-icon`} viewBox="0 0 24 24" aria-hidden="true">
      <path
        className={`${PPT_PREFIX}theme-toggle-moon`}
        d="M15.5 4.5a7.5 7.5 0 1 0 4 13.85A8.5 8.5 0 1 1 15.5 4.5z"
      />
    </svg>
  ) : (
    <svg className={`${PPT_PREFIX}theme-toggle-icon`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className={`${PPT_PREFIX}theme-toggle-sun-ring`} cx="12" cy="12" r="5.25" />
      <path
        className={`${PPT_PREFIX}theme-toggle-sun-rays`}
        d="M12 3.25v2.1M12 18.65v2.1M3.25 12h2.1M18.65 12h2.1M5.82 5.82l1.49 1.49M16.69 16.69l1.49 1.49M5.82 18.18l1.49-1.49M16.69 7.31l1.49-1.49"
      />
    </svg>
  );
}

function anchorButtonLabel(mode: PinpointMode): string {
  return mode === 'inactive' ? 'Activate Pinpoint' : 'Deactivate Pinpoint';
}

function anchorButtonState(mode: PinpointMode): 'inactive' | 'active' | 'review' {
  if (mode === 'inactive') return 'inactive';
  if (mode === 'active-review') return 'review';
  return 'active';
}

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function AnnotationItem({
  annotation,
  noteNumber,
  copyOneFeedbackId,
}: {
  annotation: Annotation;
  noteNumber?: number;
  copyOneFeedbackId: string | null;
}) {
  const showCopyOneFeedback = copyOneFeedbackId === annotation.id;
  const isActive = annotation.status === 'active';

  return (
    <li className={`${PPT_PREFIX}annotation-item`} data-id={annotation.id}>
      <div className={`${PPT_PREFIX}item-meta`}>
        <span className={`${PPT_PREFIX}item-element`}>{annotation.selector}</span>
        <div className={`${PPT_PREFIX}item-meta-badges`}>
          {isActive ? <span className={`${PPT_PREFIX}item-note-number`}>Note {noteNumber}</span> : null}
          {isActive ? <span className={`${PPT_PREFIX}item-badge`}>Open</span> : null}
        </div>
      </div>
      {annotation.surface && annotation.surface.kind !== 'page' ? (
        <div className={`${PPT_PREFIX}item-surface-row`}>
          <span
            className={classNames(
              `${PPT_PREFIX}item-surface`,
              annotation.surface.kind === 'dialog' && `${PPT_PREFIX}item-surface--dialog`
            )}
          >
            {annotation.surface.label}
          </span>
        </div>
      ) : null}
      <span className={`${PPT_PREFIX}item-comment`}>{annotation.feedback}</span>
      <span className={`${PPT_PREFIX}item-context`}>{annotation.context || annotation.path}</span>
      <div className={`${PPT_PREFIX}item-actions`}>
        {isActive ? (
          <button className={`${PPT_PREFIX}copy-one`} data-id={annotation.id}>
            Copy
          </button>
        ) : (
          <button
            className={classNames(
              `${PPT_PREFIX}copy-one`,
              showCopyOneFeedback && `${PPT_PREFIX}copy-one--success`
            )}
            data-id={annotation.id}
          >
            {showCopyOneFeedback ? <CopyIcon success /> : null}
            <span>{showCopyOneFeedback ? 'Copied' : 'Copy again'}</span>
          </button>
        )}
      </div>
    </li>
  );
}

function HelpPanel() {
  return (
    <div className={`${PPT_PREFIX}help-panel`} aria-label="Pinpoint shortcuts">
      <div className={`${PPT_PREFIX}help-panel-header`}>
        <span className={`${PPT_PREFIX}help-panel-title`}>Shortcuts</span>
        <span className={`${PPT_PREFIX}help-panel-subtitle`}>Move faster without leaving the page.</span>
      </div>
      <ul className={`${PPT_PREFIX}help-list`}>
        <li className={`${PPT_PREFIX}help-item`}>
          <span className={`${PPT_PREFIX}help-item-label`}>Toggle selection mode</span>
          <kbd className={`${PPT_PREFIX}help-kbd`}>⌥V</kbd>
        </li>
        <li className={`${PPT_PREFIX}help-item`}>
          <span className={`${PPT_PREFIX}help-item-label`}>Leave review</span>
          <kbd className={`${PPT_PREFIX}help-kbd`}>H</kbd>
        </li>
        <li className={`${PPT_PREFIX}help-item`}>
          <span className={`${PPT_PREFIX}help-item-label`}>Copy prompt</span>
          <kbd className={`${PPT_PREFIX}help-kbd`}>C</kbd>
        </li>
        <li className={`${PPT_PREFIX}help-item`}>
          <span className={`${PPT_PREFIX}help-item-label`}>Clear active notes</span>
          <kbd className={`${PPT_PREFIX}help-kbd`}>D</kbd>
        </li>
      </ul>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <li className={`${PPT_PREFIX}empty`}>
      <div className={`${PPT_PREFIX}empty-illustration`}></div>
      <h3 className={`${PPT_PREFIX}empty-title`}>{title}</h3>
      <p className={`${PPT_PREFIX}empty-body`}>{body}</p>
    </li>
  );
}

function ReviewTabs({ state }: { state: ToolbarViewState }) {
  return (
    <div className={`${PPT_PREFIX}review-tabs`} role="tablist" aria-label="Review sections">
      <button
        className={classNames(
          `${PPT_PREFIX}review-tab`,
          state.tab === 'active' && `${PPT_PREFIX}review-tab--active`
        )}
        type="button"
        role="tab"
        aria-selected={state.tab === 'active'}
        data-tab="active"
      >
        <span>Active</span>
        <span className={`${PPT_PREFIX}section-count`}>{state.active.length}</span>
      </button>
      <button
        className={classNames(
          `${PPT_PREFIX}review-tab`,
          state.tab === 'history' && `${PPT_PREFIX}review-tab--active`
        )}
        type="button"
        role="tab"
        aria-selected={state.tab === 'history'}
        data-tab="history"
      >
        <span>History</span>
        <span className={`${PPT_PREFIX}section-count`}>{state.historyCount}</span>
      </button>
    </div>
  );
}

function ReviewContent({
  state,
  formatHistoryTimestamp,
}: {
  state: ToolbarViewState;
  formatHistoryTimestamp: (timestamp: number) => string;
}) {
  const activeNumberById = new Map(state.active.map((annotation, index) => [annotation.id, index + 1]));

  if (state.tab === 'active') {
    if (state.active.length === 0) {
      return (
        <EmptyState
          title="Start collecting feedback"
          body="Activate Pinpoint and click any element to add a note."
        />
      );
    }

    return (
      <li className={`${PPT_PREFIX}section`}>
        <div className={`${PPT_PREFIX}section-header`}>
          <span className={`${PPT_PREFIX}section-title`}>Active</span>
          <span className={`${PPT_PREFIX}section-count`}>{state.active.length}</span>
        </div>
        <ul className={`${PPT_PREFIX}section-list`}>
          {state.active.map((annotation) => (
            <AnnotationItem
              annotation={annotation}
              noteNumber={activeNumberById.get(annotation.id)}
              copyOneFeedbackId={state.copyOneFeedbackId}
            />
          ))}
        </ul>
      </li>
    );
  }

  if (state.historyCount === 0) {
    return (
      <EmptyState
        title="No copied history yet"
        body="Copied notes will appear here in timestamped groups."
      />
    );
  }

  return (
    <>
      {state.historyGroups.map((group) => (
        <li
          className={classNames(`${PPT_PREFIX}section`, `${PPT_PREFIX}history-group`)}
          data-copied-at={group.copiedAt}
        >
          <div className={`${PPT_PREFIX}section-header`}>
            <div className={`${PPT_PREFIX}section-header-copy`}>
              <span className={`${PPT_PREFIX}section-title`}>{formatHistoryTimestamp(group.copiedAt)}</span>
              <span className={`${PPT_PREFIX}section-subtitle`}>
                {group.annotations.length} annotation{group.annotations.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              className={classNames(`${PPT_PREFIX}anchor-copy`, `${PPT_PREFIX}history-copy`)}
              type="button"
              aria-label="Copy this history group"
              title="Copy this history group"
            >
              <CopyIcon success={state.isCopySuccessVisible} />
              <span className={`${PPT_PREFIX}anchor-copy-badge`}>{group.annotations.length}</span>
            </button>
          </div>
          <ul className={`${PPT_PREFIX}section-list`}>
            {group.annotations.map((annotation) => (
              <AnnotationItem annotation={annotation} copyOneFeedbackId={state.copyOneFeedbackId} />
            ))}
          </ul>
        </li>
      ))}
    </>
  );
}

export function getToolbarClassName(state: ToolbarViewState): string {
  return classNames(
    `${PPT_PREFIX}toolbar`,
    `${PPT_PREFIX}theme-${state.theme}`,
    state.anchorActive ? `${PPT_PREFIX}toolbar--active` : `${PPT_PREFIX}toolbar--inactive`,
    state.selecting && `${PPT_PREFIX}toolbar--selecting`,
    state.reviewOpen && `${PPT_PREFIX}toolbar--review-open`,
    state.helpOpen && `${PPT_PREFIX}toolbar--help-open`
  );
}

export function ToolbarView({
  state,
  formatHistoryTimestamp,
}: {
  state: ToolbarViewState;
  formatHistoryTimestamp: (timestamp: number) => string;
}) {
  const globalCopyTitle = state.hasActiveAnnotations ? 'Copy active annotations' : 'Nothing to copy';

  return (
    <>
      <div
        className={classNames(
          `${PPT_PREFIX}anchor-shell`,
          (state.anchorActive || state.hasAttention) && `${PPT_PREFIX}anchor-shell--active`
        )}
      >
        {state.showCollapsedCopy ? (
          <button
            className={classNames(
              `${PPT_PREFIX}anchor-copy`,
              `${PPT_PREFIX}anchor-copy--collapsed`,
              state.isCopySuccessVisible && `${PPT_PREFIX}anchor-copy--success`
            )}
            type="button"
            aria-label={globalCopyTitle}
            title={globalCopyTitle}
          >
            <CopyIcon success={state.isCopySuccessVisible} />
            {state.hasActiveAnnotations ? (
              <span className={`${PPT_PREFIX}anchor-copy-badge`}>{state.active.length}</span>
            ) : null}
          </button>
        ) : null}

        {state.anchorActive ? (
          <div className={`${PPT_PREFIX}anchor-actions`} aria-label="Pinpoint actions">
            {state.showExpandedCopy ? (
              <button
                className={classNames(
                  `${PPT_PREFIX}anchor-copy`,
                  `${PPT_PREFIX}anchor-copy--expanded`,
                  state.isCopySuccessVisible && `${PPT_PREFIX}anchor-copy--success`
                )}
                type="button"
                aria-label={globalCopyTitle}
                title={globalCopyTitle}
                disabled={state.shouldDisableExpandedCopy}
              >
                <CopyIcon success={state.isCopySuccessVisible} />
                {state.hasActiveAnnotations ? (
                  <span className={classNames(`${PPT_PREFIX}anchor-action-badge`, `${PPT_PREFIX}anchor-copy-badge`)}>
                    {state.active.length}
                  </span>
                ) : null}
              </button>
            ) : null}
            <button
              className={classNames(
                `${PPT_PREFIX}anchor-action`,
                `${PPT_PREFIX}anchor-action--icon`,
                state.reviewOpen && `${PPT_PREFIX}anchor-action--selected`
              )}
              type="button"
              aria-label={state.reviewOpen ? 'Close review panel' : 'Open review panel'}
              title="Review"
            >
              <ReviewIcon />
            </button>
            <button
              className={classNames(
                `${PPT_PREFIX}anchor-action`,
                `${PPT_PREFIX}anchor-action--icon`,
                state.helpOpen && `${PPT_PREFIX}anchor-action--selected`
              )}
              type="button"
              aria-label={state.helpOpen ? 'Close help panel' : 'Open help panel'}
              title="Help"
            >
              <HelpIcon />
            </button>
            <button
              className={`${PPT_PREFIX}theme-toggle`}
              type="button"
              aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`}
              title={state.theme === 'dark' ? 'Dark theme' : 'Light theme'}
            >
              <ThemeIcon theme={state.theme} />
            </button>
          </div>
        ) : null}

        <button
          className={`${PPT_PREFIX}anchor-button`}
          type="button"
          data-state={anchorButtonState(state.mode)}
          aria-label={anchorButtonLabel(state.mode)}
        >
          <svg className={`${PPT_PREFIX}anchor-button-icon`} viewBox="0 0 24 24" aria-hidden="true">
            <path className={classNames(`${PPT_PREFIX}anchor-button-line`, `${PPT_PREFIX}anchor-button-line--top`)} d="M7 9h10" />
            <path className={classNames(`${PPT_PREFIX}anchor-button-line`, `${PPT_PREFIX}anchor-button-line--bottom`)} d="M7 15h10" />
            <path className={classNames(`${PPT_PREFIX}anchor-button-line`, `${PPT_PREFIX}anchor-button-line--vertical`)} d="M12 7v10" />
          </svg>
        </button>

        {state.helpOpen ? <HelpPanel /> : null}
      </div>

      {state.reviewOpen ? (
        <aside className={`${PPT_PREFIX}review-panel`} aria-label="Pinpoint review panel">
          <div className={`${PPT_PREFIX}toolbar-header`}>
            <div className={`${PPT_PREFIX}toolbar-brand`}>
              <h2 className={`${PPT_PREFIX}toolbar-title`}>Pinpoint</h2>
              <p className={`${PPT_PREFIX}toolbar-status`}>
                {state.active.length} active note{state.active.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className={`${PPT_PREFIX}toolbar-header-actions`}>
              <button
                className={classNames(
                  `${PPT_PREFIX}anchor-copy`,
                  `${PPT_PREFIX}copy-all`,
                  state.isCopySuccessVisible && `${PPT_PREFIX}anchor-copy--success`
                )}
                type="button"
                aria-label={globalCopyTitle}
                title={globalCopyTitle}
                disabled={state.shouldDisableExpandedCopy}
              >
                <CopyIcon success={state.isCopySuccessVisible} />
                {state.hasActiveAnnotations ? (
                  <span className={`${PPT_PREFIX}anchor-copy-badge`}>{state.active.length}</span>
                ) : null}
              </button>
              <button
                className={classNames(`${PPT_PREFIX}toolbar-header-button`, `${PPT_PREFIX}clear-active`)}
                disabled={state.active.length === 0}
              >
                Clear
              </button>
              <button
                className={classNames(
                  `${PPT_PREFIX}toolbar-header-button`,
                  `${PPT_PREFIX}toolbar-minimize`,
                  `${PPT_PREFIX}toolbar-header-button--icon`
                )}
                type="button"
                aria-label="Close review panel"
              >
                ×
              </button>
            </div>
          </div>
          <ReviewTabs state={state} />
          <ul className={`${PPT_PREFIX}list`}>
            <ReviewContent state={state} formatHistoryTimestamp={formatHistoryTimestamp} />
          </ul>
        </aside>
      ) : null}
    </>
  );
}
