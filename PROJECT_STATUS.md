# Project status

Last updated: 2026-10-29

## Current state

- The customization is based on the deployed Any Listen web-server `v0.10.0` source.
- The phone layout and NAS download queue have been built and deployed to the owner's Zspace Z4 Pro.
- The running service is reached through Zspace remote access; deployment details are intentionally limited to placeholders in this public repository.
- The owner's LX music list was imported into the running service.
- Playback works for available sources. Some download tasks fail when a source returns an invalid audio URL; the queue surfaces the failure and allows a retry.

## Known issues

- iOS can suspend web content while the Zspace app is in the background. Hosting the web service on the NAS does not change that platform behavior.
- Some source results do not provide a playable URL or the requested quality. Source fallback and quality downgrade need separate validation before being treated as complete.
- The public repository contains source and deployment guidance only. NAS credentials, remote-access details, local music, and extension data stay outside Git.

## Next decisions

Choose the phone playback target before adding another client shell:

1. Test the existing URL in Safari and as a Home Screen web app.
2. Add a thin native iOS shell with audio background mode if Safari is still suspended.
3. Keep the NAS as the server and download worker in either case; it cannot continue playback on the phone by itself.

The accepted scope and acceptance criteria remain in `PRODUCT_SPEC.md`. A native client is a scope expansion and needs its own requirements, architecture, distribution decision, and test plan before implementation.
