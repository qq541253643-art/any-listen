# Personal Zspace customization

- `PRODUCT_SPEC.md` defines the accepted mobile and download behavior. Keep the existing desktop and NAS music data intact.
- This branch targets the deployed web-server v0.10.0. Keep upstream and fork remotes distinct.
- Keep secrets, browser state, NAS credentials, and real music files out of Git and logs.
- Preserve the project's license and attribution; this deployment is for the owner's personal use.
- Never make a client-supplied URL or path an unrestricted server download target.
- Test mobile navigation and playback, download queue/file safety, and desktop regression before changing the NAS deployment. Keep SSH disabled.
