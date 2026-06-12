# CLAUDE.md

Guidance for agents working in this repository.

## Mental model (read first)

This repository contains **puzzleDrag2 (Godot)**, a Godot 4.6 (GL Compatibility renderer, mobile-first portrait 720×1280) game. It is a port of the React+Phaser drag-chain puzzle.

All game code, assets, and tests live at the root of this repository.

---

## Orientation & File Structure

- [project.godot](file:///c:/Users/grima/Documents/aiDev/puzzleDrag2-godot/project.godot) — Godot 4.6 project configuration
- [export_presets.cfg](file:///c:/Users/grima/Documents/aiDev/puzzleDrag2-godot/export_presets.cfg) — Web export preset (single-threaded, runs on plain GitHub Pages)
- `icon.svg`
- `scenes/` — Game scenes and GDScript nodes:
  - `Main.gd` + `Main.tscn` — Root scene. Owns game state, board, ViewRouter, audio, and layouts UI screens in code.
  - `Board.gd` + `Board.tscn` — 6x6 board grid, handles dragging input and collapses.
  - `Tile.gd` + `Tile.tscn` — Individual board tiles (renders animated frames / flat texture / color square fallbacks).
  - `*Screen.gd` / `*Modal.gd` — UI panels and menus swapped in.
- `scripts/` — GDScript data models, configs, and services:
  - `GameState.gd` — Canonical economy, stockpile, turns, settlement data.
  - `ViewRouter.gd` — Navigation state machine (views/modals), synchronized to browser history on Web.
  - `UiKit.gd` — Central UI layout, scroll containers, backdrops, and components builder.
  - `UiFx.gd` — Central motion and animation helper kit.
  - `*Config.gd` / `Constants.gd` — Configuration catalogs.
- `assets/` — Textures, tiles, and sound effects:
  - `tiles/` — Flat PNG tile textures (Stage 1/2).
  - `tiles/v2/` — Animated SpriteFrames `.tres` (Stage 3).
- `tests/` — Headless GDScript unit test suites (run via `res://tests/run_*.gd`).
- `test/` — GdUnit4 test suites.
- `tools/` — Developer and integration scripts:
  - [integrate.mjs](file:///c:/Users/grima/Documents/aiDev/puzzleDrag2-godot/tools/integrate.mjs) — Integrates exported frames into Godot SpriteFrames `.tres`.

---

## Architecture (No Autoloads)

State and services are plain `class_name`-registered scripts, owned and wired by the root scene (`Main.gd`) — there is no `[autoload]` section in `project.godot`.

---

## Touch / Input Gotcha

Both `pointing/emulate_mouse_from_touch` and `pointing/emulate_touch_from_mouse` are enabled. Listen to mouse events only (mouse path) in custom input/tap handlers to avoid double-processing drag and tap inputs (which causes issues like double-scrolling or double-clicking).

---

## Commands (requires Godot 4.6.2 binary on PATH)

```bash
# Local Development
godot --editor                                               # open editor
godot                                                        # play game (windowed)
godot --headless --import                                    # build import cache / class registry (run first)

# Unit / Scene Tests
godot --headless --script res://tests/run_tests.gd           # run headless unit tests
godot --headless --script res://tests/run_scene_smoke.gd     # run headless scene smoke test

# Web Export & Playwright Smokes
godot --headless --export-release "Web" dist/index.html      # export Web build
npm install                                                  # install Playwright dependencies
npx playwright test                                          # run Web-boot Playwright smoke test
```

---

## Workflow & CI/CD

- The GitHub Actions workflow `.github/workflows/deploy.yml` runs all headless tests, GdUnit4 suites, exports to Web, runs Playwright boot smoke tests, and deploys to GitHub Pages on pushes to `main`.
- The live build is deployed to: `https://grimatoma.github.io/puzzleDrag2-godot/`
