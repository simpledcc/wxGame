# Cocos Runtime Performance Evidence

Date: 2026-07-10

## Purpose

The migration design requires Home idle, rapid PK taps, rapid spelling input, three-minute room polling, and low-end-device checks. Source-level tests cannot prove those real-device outcomes, so the Cocos runtime now records a bounded, privacy-safe performance report that can be retained with each device test.

This instrumentation prepares evidence; it does not turn mock or desktop measurements into a device-performance pass.

## Collected Data

`PerformanceService` records:

- Total frames for the full Home-shell session.
- Average, maximum, and slow-frame count using the explicit 50 ms threshold.
- P95 over a fixed ring containing the latest 1,800 frame samples.
- Per-route frame totals, average/max frame time, and slow-frame percentage.
- Latest and peak Cocos node counts, sampled once every 60 frames.
- Capture timestamp and elapsed Home-shell session duration.

The report contains route names and numeric measurements only. It does not include openids, room codes, words, meanings, answers, feedback text, or contact information.

## Runtime Cost Controls

- Frame aggregation is constant time and does not allocate a new sample object each frame.
- The recent-frame ring has a fixed maximum length.
- Full-session values use counters rather than retaining every frame.
- Recursive node counting runs once every 60 frames, not every frame.
- Reporting performs sorting/JSON serialization only when the developer explicitly requests a report.

## Developer Workflow

The `性能报告` button is compiled only when Cocos `DEV` is true. It copies the current JSON report through `RuntimePort`; release builds do not expose this button.

For each external scenario, restart the preview so the Home shell begins a new report:

1. Stay on Home for 30 seconds without interaction, then copy the report.
2. Enter PK, rapidly tap valid targets for at least 30 seconds, return to Home, then copy the report.
3. Enter spell co-op, rapidly type/delete/submit for at least 30 seconds, return to Home, then copy the report.
4. Keep a room connected and polling for at least three minutes, return to Home, then copy the report.
5. Repeat the scenarios on the lowest-spec supported phone and retain device model, WeChat version, base-library version, theme, and report JSON beside the QA record.

Use the data comparatively first. Final pass/fail budgets must be agreed from real target-device captures; this checkout must not invent a low-end-device pass from mock timing.

## Automated Verification

Run from `cocos-client/`:

```bash
npm run test:performance
npm run test:shell-runtime
npm run verify
```

The pure test covers the bounded ring, all-session/per-route aggregates, slow frames, node peaks, invalid inputs, serialization, and reset. The runtime shell test advances the real shell for 60 mock frames, samples its node tree, clicks the DEV report button, and parses the copied JSON.
