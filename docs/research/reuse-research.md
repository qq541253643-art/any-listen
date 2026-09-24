# Existing solution research

## Product need

Make the existing Any Listen web service useful on a phone and add personal NAS downloads. Research completed on 2026-09-24 against the repositories below.

## Candidates

| Repository | Reusable part | Fit and maintenance | License | Cost | Decision |
| --- | --- | --- | --- | --- | --- |
| [Any Listen](https://github.com/any-listen/any-listen) | Existing player, source resolution, playlists, web/server stack | Direct fit for currently deployed v0.10.0; active upstream, but mobile UI and web downloads absent | AGPL-3.0 text with additional non-commercial terms in `LICENSE` | Medium | **ADAPT** for personal use |
| [LX Music Mobile](https://github.com/lyswhut/lx-music-mobile) | Narrow-screen navigation, list page and player-bar interaction patterns | Official maintained mobile app; React Native screens are not directly portable to Svelte | Apache-2.0 | Low as reference, high as code port | **REFERENCE_ONLY** |
| [LX Music Desktop](https://github.com/lyswhut/lx-music-desktop) | Batch quality selection, queue/progress/retry model | Mature download flow, but Electron renderer/worker cannot run as the NAS server | Apache-2.0 | Low as reference, high as direct integration | **REFERENCE_ONLY** |

## Recommended reuse and custom work

Retain Any Listen's data, routes, auth and source URL resolution. Build a mobile-only shell and responsive list/player presentation in the web client. Build a small server-side download queue around the existing source resolver rather than importing Electron's downloader. Reuse native Node streaming and filesystem primitives where sufficient. The queue, file safety, and status API require custom code because no existing web-server module provides them.

## Risks

The Any Listen license requires non-commercial use unless its author grants written permission; the owner confirmed personal use. Audio source links can expire, reject server-side requests, or return non-audio content. The current `/music` mount is read-only. Auth and path validation are mandatory; unrestricted download URLs or client-selected paths would create avoidable server risk. Upstream web-server main is already on a later beta than the deployed v0.10.0, so this branch starts from the deployed tag to reduce upgrade risk.

**REUSE_RESEARCH_GATE: PASS.**
