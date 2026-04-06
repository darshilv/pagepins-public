# Playwright Learnings: Dialog/Modal Loop and Reflow Reliability

## Why this note exists

During the element-targeting reliability work, the longest debugging loop happened in the dialog/modal scenario. The test appeared to "hang" repeatedly, and quick retries did not converge until we changed both the test shape and one runtime re-anchor behavior.

This note summarizes what actually failed, why it was misleading, and what helped us exit the loop.

## What kept looping in the dialog test

### 1) Modal interception looked like a targeting failure

In the dialog spec, Playwright repeatedly reported click interception by the open `<dialog>` subtree while trying to click extension UI controls (`.ppt-anchor-button` and popup submit).

Observed pattern:

- Target looked visible and enabled.
- Playwright retried click with "intercepts pointer events" messages.
- Test timed out, which initially looked like "capture event not emitted."

Actual issue:

- This was primarily interaction routing in top-layer modal state, not selector-generation logic.

### 2) The test mixed too many moving parts in one assertion path

Original flow tried to validate:

- element click capture,
- debug event bridge emission,
- popup submit interaction,
- and review-panel rendering

all under a live modal.

When one step was blocked by modal layering, the downstream signal (missing debug event / hidden popup timeout) looked like a core targeting regression, even when targeting itself was fine.

### 3) Retrying the same shape produced false "progress"

Repeated single-spec reruns without changing the interaction model burned time. We only got traction after narrowing each failure to one of:

- activation sequencing,
- click generation path,
- popup submit path,
- persistence assertion path.

## What worked to break the loop

### 1) Activation first, then open dialog state

Entering selection mode before forcing modal state removed one unstable variable.

### 2) Use minimal verification surface for modal scenarios

For dialog coverage, checking persisted annotation metadata (`surface.label`) was more stable than relying on a full interactive closeout through review panel controls under modal layering.

### 3) Keep debug-bridge assumptions narrow

When a test already has a deterministic product-level assertion (annotation persisted with dialog surface metadata), avoid coupling it to optional debug-event timing in the same scenario.

## Reflow lesson: IO-only was insufficient

The reflow test exposed a real runtime gap:

- marker Y position stayed stale after deterministic layout shift in some runs.

Root cause:

- IntersectionObserver callbacks do not guarantee timely updates for all pure layout-shift movement cases.

Fix:

- Keep the bounded observer model, but add a bounded periodic refresh of already-observed anchors.
- This preserved the "bounded re-anchor" plan constraint while making marker repositioning deterministic in browser e2e.

## Practical debugging playbook (for future e2e work)

1. Prove browser launch/environment first (especially extension + headed runs).
2. Split failures into activation, capture, submit, and persistence phases.
3. In modal/top-layer scenarios, prefer deterministic state assertions over UI click chains that cross modal boundaries.
4. Treat debug-event bridges as diagnostics; keep core pass/fail tied to product behavior.
5. For anchor movement tests, verify marker coordinates after controlled layout changes, not just observer callback assumptions.

## Scope guardrails preserved

The final fixes stayed within documented constraints:

- no pre-launch migration work,
- bounded re-anchor behavior,
- unsupported iframe/closed-shadow stance unchanged,
- fixture hooks remain test-only (not production targeting logic).
