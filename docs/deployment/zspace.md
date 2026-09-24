# Z4 Pro deployment review

The custom image is built from the `webserver-v0.10.0` source to match the currently deployed service. Keep the existing `/server/data` mount, port `9500`, login password, extension data, and remote-access entry unchanged. Do not put the password in this document or an image.

## Image

Build the web distribution on Linux with Node 22 and `pnpm build:web`. Package the resulting `build/` directory with `Dockerfile.runtime` as the Docker build context and tag it `anylisten-personal:mobile-download`. Export the image with `docker save` for import through the Zspace Docker UI. The runtime image uses UID 1001, matching the upstream image.

## Container change

Create `团队文件夹/音乐/下载` before starting the new container. In the existing container configuration, keep the current music mount:

```text
/tmp/zfsv3/sata11/public/狂朝共享/音乐  ->  /music       read-only
```

Add only this new writable mount and environment variable:

```text
/tmp/zfsv3/sata11/public/狂朝共享/音乐/下载  ->  /downloads  read-write
MUSIC_DOWNLOAD_DIR=/downloads
```

The NAS folder must be writable by the container's UID 1001. Verify that before submitting a download. Do not make the whole music folder writable or change the existing data mount. Preserve the existing container configuration and image reference for rollback.

## Acceptance and rollback

After replacing the image, verify desktop playback, phone navigation at a narrow viewport, the existing music source, and existing lists. Queue one song that the owner is allowed to save and verify a playable file appears under `团队文件夹/音乐/下载`. Then queue a short test list, close the browser, and verify completion and status after reopening. Retry a failure and confirm an existing file is skipped. If playback or download fails, restore the prior image and remove only the new `/downloads` mount and `MUSIC_DOWNLOAD_DIR`; leave the music and data directories intact.
