# Personal mobile web and NAS downloads

## Problem and goal

The current web UI is a desktop layout clipped on a phone. The owner also wants to save an online song or an entire playlist to the Zspace Z4 Pro for playback from other devices. Version one must make the existing web service usable on an iPhone and let the NAS download playable online music into the owner's team music folder.

## User and journey

One personal, non-commercial user opens the existing authenticated Any Listen service through Zspace remote access on a phone, searches or opens a playlist, plays music, and sends selected songs or the whole playlist to a NAS download queue. The phone may disconnect after submission. The user can inspect completed and failed tasks and play saved music from the mounted local folder.

## Requirements

- **M1 Mobile shell:** On narrow web viewports, show one content pane with touch-sized navigation to online resources, library/playlists, history, settings, and downloads. Preserve the current desktop layout above the breakpoint.
- **M2 Core listening:** Search, playlist browsing, play/pause/next, and now-playing details must be usable without horizontal clipping. Browser Back must remain predictable.
- **D1 Download submission:** An authenticated user can queue one or multiple online songs, including all songs in a playlist, with a chosen available quality. Local songs are not downloaded again.
- **D2 NAS execution:** The web server resolves music URLs using its existing source machinery and downloads sequentially to a configured directory within the mounted team music folder. Work continues if the phone disconnects.
- **D3 Feedback and recovery:** Show queued/running/completed/failed status and an actionable error. A failed task can be retried. Existing files are skipped, not overwritten.
- **D4 File safety:** Sanitize filenames, constrain writes to the configured download root, use a temporary file and atomic no-overwrite finalization, and reject responses that are not audio. Preserve existing music.

## Inputs, outputs, and rules

Inputs are existing Any Listen music/playlist records, source extension results, selected quality, and one server-side download directory. Output is audio files in the Zspace team music folder and task status. Source availability controls whether a song can download; unavailable quality must be reported or explicitly downgraded. No DRM or paywall bypass. Download only content the user is allowed to save. Do not expose a client-selected filesystem path or arbitrary URL download endpoint.

## Constraints and non-goals

Use the fork of Any Listen and its existing Svelte/Node web stack. Reference LX Music Mobile's interaction patterns and LX Music Desktop's task behavior without copying a native React Native screen into Svelte. Keep SSH disabled. Preserve the current read-only `/music` mount and add a separate writable mount for the new `下载` subfolder. Do not alter the running NAS service before local build, tests, and a deployment review. Native iOS/Android apps, cloud sync, audio transcoding, and public multi-user service are out of scope.

## Acceptance criteria

- **AC-M1:** At 390 px viewport width the main navigation, song list, and controls have no horizontal clipping; tap targets are at least 44 px.
- **AC-M2:** A user can search, open a list, play and pause, switch songs, and return with Back on mobile.
- **AC-D1:** One song and an entire playlist can be queued with a quality choice; duplicate and local items are handled visibly.
- **AC-D2:** Once submitted, a download completes while the browser is closed and writes only within the configured NAS directory.
- **AC-D3:** Failure, retry, existing-file skip, interruption, and restart behavior are testable and visible.
- **AC-R1:** Existing desktop playback and list functions still work.

## Open questions

No blocking product question remains. Exact source availability and NAS mount permissions are technical validation items before deployment.
