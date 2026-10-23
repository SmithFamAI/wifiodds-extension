# Changelog

All notable changes to the WiFi Odds extension are recorded here. A release date identifies the
immutable source/package release and its Git tag. Chrome Web Store publication is a separate,
owner-controlled event and is stated explicitly for each release.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Popup auto-watch. When the booking page you already have open has a confirmed, tail-assigned departure (the tracker's next-~72h feed), the watch now opens by itself for the flight on that page's date and keeps its Starlink status current through the existing three-hourly tail check. Other tail-assigned departures on the same route get a one-tap Watch. Typing a flight number and date still works, but has moved behind an “Add a flight manually” disclosure — it is the fallback, not the path. The route is read from the tab, never entered: this does not reintroduce the removed FROM/TO/Go search, which the same gate still asserts is gone. Unpublished; live Store remains 3.0.2.
- Regression coverage now requires every decision-strip state to keep role=status and a non-empty accessible name on Alaska as on United and Navan. The winner name still starts "Best WiFi choice" and includes historical Starlink odds; the United sorting clause stays on Navan only. Unpublished; live Store remains 3.0.2.

### Removed

- Leftover popup airline/FROM/TO/Go route search and “Enter a route to check Starlink odds.” ConnectScore, settings, guarded trips, and finish-setup stay. Unpublished; live Store remains 3.0.2.

### Fixed

- Granted Google Flights search with no scored rows now says there are no scored flights in these results, instead of drawing a blank panel. Labels only. Google is still never reordered.
- Alaska and Navan now use the same on-page winner ring as United when Best WiFi names a winner. No ring when there is no winner.
- Popup flight list copy names lookup history, not a Best WiFi pick.
- Panel dock and drag position is stored in local extension storage only.
- Trip Guardian keeps unknown as unknown. Cannot confirm is still not no Starlink.
- Manifest `homepage_url` now points at the live product URL https://wifiodds.com/ rather than the GitHub source repo. Live Store remains 3.0.2.
- README.md and STORE.md now record live Store 3.0.2 and https://wifiodds.com/. They no longer describe the retired smithfamai.com/unitedstarlink encyclopedia as the live product. STORE.md is not a rewrite of the Chrome Web Store listing.
- README no longer names ConnectScore as a live customer metric. The overlay prints STREAMING / Streaming score.

## [3.1.0] - 2026-08-12

Chrome Web Store: not uploaded. Exact extension candidate review is pending.

### Changed

- Renamed the customer-facing ConnectScore to Streaming. The score still uses the same formula and
  ranking method; the separate coverage percentage remains supporting evidence, never the score.
- Updated customer copy, accessible names, evidence subjects, Store instructions, and replacement
  screenshot requirements to use Streaming score.

### Fixed

- Screen readers retain Navan's United-only sorting clause and omit it on other booking sites.
- Navan flight times now come from the valid time shown in the result row. Adjacent page text can
  no longer turn `5:45 pm` into an impossible value such as `55:45 pm`.
- The Store verification gate now checks the exact candidate bundle and metadata used for review;
  it no longer expects release ZIPs to be committed to Git.

### Exact model pin

- The release pins reviewed site commit `cae8be119b83abff12f57877c1cf344b03b8b6b8`, which updates
  grounded airline data separately from the terminology change, including United from 42 to 44 and
  Hawaiian from 64 to 69.

## [3.0.3] - 2026-08-12

Chrome Web Store: not uploaded.

### Fixed

- Screen readers on booking sites other than Navan no longer hear a United-specific sorting clause.

## [3.0.2] - 2026-08-10

Chrome Web Store: not uploaded.

### Fixed

- The on-page panel now closes when Navan leaves flight results, including during seat selection.
  It also has visible Minimize, Open, Move left and Move right controls, and can be dragged without
  saving its position.

## [3.0.1] - 2026-08-03

Chrome Web Store: uploaded 2026-08-04; publication could not verify.

### Added

- Local post-flight outcome capture: a traveller can record whether WiFi worked, and the answer
  remains on that device as personal history. Recording an outcome makes no network request.
- A native keyboard-operable Guard button with a 44-pixel target, first-use guidance, and a visible
  error that rolls optimistic state back when a trip cannot be guarded.
- A first-run coverage page that explains all four supported flight-search hosts and offers the
  two optional Alaska and Google Flights grants from explicit user-gesture buttons.
- A local active-page self-test that distinguishes granted host access from a page where supported
  results were actually detected and annotated.
- A one-time explanation beside the first automatic single-carrier reorder, with a direct pointer to Settings.
- Per-figure evidence disclosures now explain what each next-gen, ConnectScore, and itinerary
  figure measures; its tier, source, source date, sample and resolution; and whether it may rank
  flights, airlines or itineraries.

### Fixed

- Removed the popup's unconditional first-row crown; ranked history is no longer presented as a
  recommendation without the injected decision card's full evidence gate.
- Gave per-flight next-gen odds and ConnectScore separate tier, source, and source-date metadata.
- Removed the United-labelled prioritisation action from Alaska's single-carrier results.
- Guardian now captures up to five decision-qualified alternatives from the booking results visible
  when a flight is guarded. Later rescue alerts use only that immutable local snapshot and make no
  fresh route lookup.
- Kept the four future row-degradation states while making their currently untestable status
  explicit and machine-checked in the mutation gate.
- Replaced the popup's ambiguous `ready` and `Fresh result` labels with `access on`, an independent
  active-page health result, and source-date-qualified refetch wording.

## [3.0.0] - 2026-08-02

Chrome Web Store: published 2026-08-02.

### Added

- An evidence-gated Best WiFi choice that recommends only when at least two flights are scored, the
  lead is meaningful, and the tracker supplies decision-grade confidence.
- Labelled next-gen flight odds and streaming-class ConnectScore figures on each supported result.
- Truthful Guardian states for confirmed Starlink, confirmed non-Starlink, an unpublished
  assignment, an unavailable update, and an invalid flight.

### Changed

- Supported single-airline pages sort automatically by historical next-gen odds by default and
  provide a real undo. Mixed-airline pages preserve their host order until the traveller acts.
- Confirmed tail assignments are displayed as separate dated facts instead of being folded into a
  historical probability.

## [2.2.0] - 2026-07-31

Chrome Web Store: published 2026-07-31.

### Added

- Per-flight fallback lookups when route history is missing, so supported rows can still show real
  odds without manufacturing a route-level answer.
- Deterministic API and browser coverage for tracker failures, loading settlement, prioritisation,
  accessibility, and store-package identity.

### Changed

- Mixed-carrier results preserve the booking site's order by default and expose an explicit action
  to move scored United flights first.
- Tracker failures settle as unavailable instead of remaining in a loading state or appearing to
  prove that no history exists.

## [2.1.0] - 2026-07-29

Chrome Web Store: published 2026-07-29.

### Changed

- Restyled the popup and injected badges to the WiFi Odds visual system, with distinct treatments
  for confirmed equipment, measured odds, and unknown results.
- Reworded the manifest summary while keeping the extension's permissions and supported hosts
  unchanged.

## [2.0.0] - 2026-07-28

Chrome Web Store: published 2026-07-28.

### Added

- ConnectScore coverage for 18 airlines in the popup.
- Optional on-page support for alaskaair.com and Google Flights alongside united.com and Navan.
- Runtime permission controls so optional booking sites are enabled only after a user grants access.

### Changed

- Renamed the extension to WiFi Odds for Flights and expanded it from a United-only companion into
  a multi-airline WiFi decision tool.

[Unreleased]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v3.0.3...v3.1.0
[3.0.3]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v2.2.0...v3.0.0
[2.2.0]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/jeremyinthebay/wifiodds-extension/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/jeremyinthebay/wifiodds-extension/tree/v2.0.0
