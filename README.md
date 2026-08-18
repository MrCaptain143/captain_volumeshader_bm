# VolumeShaderBM — Android / No-Zoom Final

GitHub Pages-ready GPU/WebGL shader benchmark.

## Final behavior
1. On first open, a **small centered warning box** appears.
2. **CANCEL** denies access and shows an access-not-granted message.
3. **I UNDERSTAND** closes the warning, requests Android fullscreen, starts the original local benchmark music, and opens the test UI.
4. The UI is designed for Android portrait screens and uses a fixed no-zoom viewport.
5. Simple / Standard / Advanced / Extreme change the live WebGL workload.
6. FPS, frame time, mode, status and stability are measured live.
7. Fullscreen and red Stop controls are available.
8. Only **(Mr Captain Ofc)** has the animated rainbow effect; `Developed by` stays white.
9. The supplied workload reference image is included at `assets/workload-reference.png`.
10. Local music is included at `music/benchmark-ambient.wav`.

## GitHub Pages
Upload the entire project, not only `index.html`. Enable GitHub Pages from the `main` branch and root folder.

## Important
This is a GPU stress/performance test. Heavy modes can increase device temperature and power usage.

## Latest UI fixes
- Removed 360°/workload/benchmark labels and the rainbow dotted ring.
- Central shader object rotates continuously in the WebGL render itself.
- Compact equal-width FULLSCREEN and STOP buttons.
- LIVE FPS is shown beside the render.
- Android no-zoom viewport remains enabled.
