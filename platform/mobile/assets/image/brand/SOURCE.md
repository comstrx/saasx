# Zainlak brand assets

Every file in this folder is Zainlak's own. Nothing here is shared with another
project, and nothing here may be regenerated without Core Master's word.

## Logo and icon (2026-10-03, final)

The masters are the founder's final two files (`Downloads/final-logo/{icon,logo}.png`, 2026-10-03): the glossy teal
«Z» with an orange-to-red ribbon folded through its middle (1254², transparent) and the full «Zainlak» wordmark in the
same glaze, each letter warming to orange at its foot (2168×725, transparent). One wordmark serves both themes.
Alpha haze under 3 % was levelled out before any cut. Every cut lives in `logo/`.

| file | cut |
|---|---|
| `logo/mark.webp` | the Z on a square — ink 1165×1215 plus a 12 px margin — at 456 px (152 dp at 3×) |
| `logo/wordmark-{light,dark}.webp` | the wordmark's ink box (2043×664) at 200 px tall; both files are the same cut |
| `logo/icon.png` | 1024, opaque: the Z at 600 on a radial `#08424a → #042a2e` (iOS and the legacy launcher) |
| `logo/adaptive-background.png` | the same radial over the visible 72/108 window, `#042a2e` beyond it |
| `logo/adaptive-foreground.png` | the Z at 440 of 1024 — whole inside the circle mask |
| `logo/adaptive-monochrome.png` | the foreground's alpha → white (themed icons) |
| `logo/notification.png` | 96 px, the Z's silhouette at 88 (the status-bar glyph) |
| `logo/splash.png` | the square Z at 1024; `expo-splash-screen` draws it at 136 dp, inside Android 12's 192 dp circle |

`Logo` picks the wordmark by theme and reads both ratios from the assets at runtime, so a swap needs no code change.
The JS-drawn marks (welcome, headers, auth) change on the next bundle; the launcher icon, the adaptive and themed
icons, the notification glyph and the native splash change on the next native build.

## 3D artwork

The seven `art-*` illustrations and five `story-*` scenes are original Zainlak
assets. The folded-Z mark is the identity anchor for all of them.

| family | size | purpose |
|---|---:|---|
| `art-*` | 640×640 | entry, member, mail, phone, password, lock and vault states |
| `story-*` | 800×940 | stay, travel, visa, insurance and product chapters |

Palette: Zainlak teal `#0a9d85`, navy `#0f2034`, orange `#e07a3e`, ivory
highlights — rounded premium materials, restrained miniature-diorama depth, no
glow. Light files carry transparent padding; dark files add a subtle teal tonal
field so each silhouette holds on navy.

PNG masters were background-isolated, fitted without distortion and exported to
WebP with full alpha. Every asset is checked on both `#f6f7f8` and `#0f2034`.

## Rules

- These files plus `/brand.json` are the entire brand seam. Rebranding touches
  them and `src/brand/`, nothing else.
- The multicolour of the 3D artwork is sacred: never tint, unify or desaturate it
  toward the brand hue.
