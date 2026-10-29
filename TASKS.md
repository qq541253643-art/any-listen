# Tasks

- [x] Mobile navigation and viewport fit: 390 px and 1440 px browser checks, drawer, settings navigation, and Back.
- [ ] Mobile online search with the owner's extension and a real playlist; local synthetic-song playback passed.
- [x] Download queue failure, retry, and persistence across browser disconnect and server restart with a synthetic record.
- [x] Safe audio writer: path sanitization, duplicate, format mismatch, invalid response, and interrupted stream covered by seven local tests.
- [x] Single/list submission, quality selection, and failure status with a synthetic online record mixed with a local song.
- [x] Linux `pnpm build:web`, seven writer tests, and local runtime image startup/mount check.
- [x] Authenticated phone/desktop layout smoke check and synthetic local playback; real NAS source and 93-song playlist remain for deployment validation.
- [ ] Review NAS deployment change and validate saved file in team music folder.

## Current follow-up

- [ ] Reproduce whether iOS background playback is better in Safari / Home Screen web app than in the Zspace in-app browser.
- [ ] Decide whether a native iOS shell is in scope; do not treat the web deployment as a native background-audio fix.
- [ ] Audit source results that return an invalid URL or unavailable requested quality, then define fallback behavior.
