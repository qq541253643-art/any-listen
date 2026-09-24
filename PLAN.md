# Plan

1. Build and verify the phone layout against the deployed v0.10.0 source, preserving desktop behavior.
2. Implement an authenticated NAS download queue, status/retry API, quality selection, and single/playlist actions.
3. Test failure/recovery and mobile/desktop browser flows locally.
4. Build a reviewed container image and migration instructions; only then update the NAS mount and service.
