# Changelog

All notable changes to the **Snap Judgment** project will be documented in this file.

## [2.0.0] - 2026-04-17
### Added
- **Professional UI/UX Overhaul:** Complete redesign with a dark navy blue aesthetic and mathematically centered vertical alignment.
- **Symmetric Board Layout:** Implemented a balanced 3-column system with mirrored player zones and a central Library.
- **Device-Specific Optimization:** Added 8 optimization paths for Android, iOS, Windows, Mac, and Linux to ensure perfect screen fitting.
- **Pyramid Hand Layout:** Redesigned the player hand into a centered pyramid structure with staggered dealing animations.
- **Round-Based Gameplay:** Added a full game loop including Setup, Round Prompts, Submission, Voting, and Victory phases.
- **Visual Win Piles:** Implemented stacking miniature cards to visually track wins for each player on the board.
- **Low-Latency Messaging:** Switched to a compressed MQTT payload format for nearly instantaneous wireless connectivity.

### Fixed
- **Collision & Cutoff Fixes:** Eliminated element overlapping and title cutoff issues using strict grid containers and `clamp()` typography.
- **Initialization Bug:** Resolved the "stuck on initializing" error by wrapping logic in robust DOM lifecycle listeners.
- **Button Logic Repair:** Fixed the "Begin Game," "Reset All," and "Library" buttons to ensure reliable round transitions.
- **Persistence Stability:** Corrected LocalStorage handling to maintain player hands during refreshes or accidental disconnects.

## [1.2.0] - 2026-04-17
- **Animated Background:** Implemented a playful, slow-shifting mesh gradient.
- **Vertical Flip:** Switched to vertical `rotateX` card mechanics for a natural mobile feel.

## [1.1.0] - 2026-04-17
- **Branding:** Added ChillVibez Studios and creator credits for Ethan Tyler Bonser & Tim Jacobson.
- **Mobile First:** Added media queries and touch-protection.

## [1.0.0] - 2026-04-17
- **Core Engine:** Initial release of the 3D card-flipping engine with 600 unique comedic contexts.
