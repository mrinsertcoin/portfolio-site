# Trace Bloom

**Trace Bloom** is a tiny browser game built for a personal developer portfolio.

You pilot a small signal core inside a corrupted network. Hold a live neon trace, move through leaking nodes, and stabilize them before red noise pulses drain your signal.

The game is designed to be:

- playable directly in a browser
- lightweight enough for a portfolio website
- dependency-free
- readable as a small JavaScript/Canvas project
- easy to embed into an existing static site

## Play

Open:

```text
index.html
```

in a browser.

No install, no build step, no server required.

## Controls

| Action | Input |
|---|---|
| Move | WASD / Arrow Keys |
| Draw trace | Hold Space or hold Left Mouse |
| Restart | R |
| Pause | P |
| Mute/unmute | M |

## Objective

Stabilize all cyan leak nodes in the current wave.

To stabilize a node:

1. Hold **Space** or **Left Mouse** to draw a live trace.
2. Move into a cyan leak node.
3. Stay inside it while tracing until it blooms.

Avoid red noise pulses. They damage your signal and can cut your trace. While tracing near a cyan node, the node creates a bloom field that pushes enemies away so they cannot camp the objective.

## Features

- Canvas-based rendering
- No dependencies
- Responsive layout
- Keyboard and mouse input
- Wave-based difficulty scaling with a calmer tutorial wave
- Local high score via `localStorage`
- Lightweight procedural visuals
- Portfolio-ready project structure

## Project Structure

```text
trace-bloom/
├─ index.html
├─ styles.css
├─ trace-bloom.js
├─ README.md
└─ docs/
   └─ portfolio-integration.md
```

## Embed into a portfolio site

You can link to the game:

```html
<a href="/mini-games/trace-bloom/">Play Trace Bloom</a>
```

Or embed it with an iframe:

```html
<iframe
  src="/mini-games/trace-bloom/"
  title="Trace Bloom browser game"
  loading="lazy"
  width="960"
  height="540">
</iframe>
```

For best results, place the folder here in your portfolio repo:

```text
mini-games/trace-bloom/
```

## GitHub Repository Description

```text
A lightweight browser game about stabilizing corrupted signal nodes, built with vanilla JavaScript and HTML Canvas.
```

## Suggested GitHub Topics

```text
javascript
html5-canvas
browser-game
mini-game
portfolio-project
vanilla-js
game-development
web-game
```

## Development Notes

The project intentionally avoids frameworks and build tooling. It is meant to be easy to inspect, easy to host, and easy to understand.

The main game loop is in `trace-bloom.js`:

- input handling
- entity updates
- collision checks
- rendering
- wave progression
- local high score storage

## License

MIT
