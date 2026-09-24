# Architecture

The existing Svelte web client and Node web server remain one application. A mobile shell is selected only for narrow web viewports. It shares existing routes, player state, source resolution, and list actions. Its navigation uses a compact header/drawer and persistent mini player, with mobile list rows and a full-screen player; the desktop shell stays intact.

The authenticated web client submits music records and quality through the existing authenticated WebSocket IPC. The server checks the request, resolves the URL with the same trusted source code used by playback, and places tasks in a single-worker queue. Files are streamed into a configured `/downloads` mount, checked for audio response and size limits, then atomically linked into place without overwrite. The server owns the root path; clients cannot choose paths or URLs. Queue metadata is stored with the existing local JSON Store so task status and pending work can recover after restart. A read-only status IPC gives the client progress/failure details.

The NAS keeps its existing team music folder mounted read-only at `/music` and mounts only its new `下载` subfolder read/write at `/downloads`. That production change is separate from code delivery and requires local verification first. Keep the existing auth boundary and remote-access behavior.

Testing focuses on viewport behavior, queue input/auth/path/file handling, source URL failure, restart recovery, and desktop regression. Browser verification uses the local running web app before any NAS deployment.
