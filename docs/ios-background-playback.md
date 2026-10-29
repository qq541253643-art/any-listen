# iOS background playback

The NAS hosts the web application, source extensions, queue, and saved music. Audio playback still runs in the phone's browser or WebView. Moving the server to another machine cannot prevent iOS from suspending that web process.

## What the current web player does

- The player uses HTML audio together with Media Session metadata and lock-screen controls.
- It does not pause when `document.hidden` changes.
- WebKit can still suspend an audio context or web process when an embedding app does not keep a playback audio session active.
- Zspace's in-app browser controls the WKWebView hosting Any Listen, so its background behavior cannot be fully fixed from the NAS-side web code.

## Options, from least to most work

| Option | Background reliability | Cost | Best fit |
| --- | --- | --- | --- |
| Keep using Zspace's in-app browser | Depends on Zspace's WKWebView audio-session policy | None | Occasional foreground listening |
| Open the service in Safari and add it to the Home Screen | Usually better for HTML audio and Media Session; the page can still be suspended in some PWA cases | None | Quick test before building an app |
| Thin native iOS shell around the existing web UI | High when the shell enables the `audio` background mode, configures playback audio, and handles track transitions | Xcode, signing, and user testing | Personal app that should keep the same UI and NAS connection |
| Native player with downloaded or streamed media | Highest and most controllable | Full native client and distribution work | Reliable daily listening, especially in weak network conditions |

Apple requires the `audio` background mode and an appropriate audio session for an app to keep playing in the background. A web wrapper only helps if the native shell actually supplies those settings; a plain WebView with no background-audio configuration has the same limitation as Zspace.

## Recommendation

First verify the current service in Safari and as a Home Screen web app on the same iPhone. If it still stops, build a small personal iOS shell rather than another server deployment. The shell can open the existing authenticated URL, keep the URL outside source control, enable background audio, and preserve the web UI. Distribution as a personal app needs a signing decision; App Store or TestFlight distribution requires an Apple Developer Program membership and review.

Downloaded files in the NAS library remain usable through a native media player independently of the web client's background limits.
