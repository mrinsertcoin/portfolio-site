# Portfolio Integration

Recommended location inside your portfolio website:

```text
portfolio-site/
└─ mini-games/
   └─ trace-bloom/
      ├─ index.html
      ├─ styles.css
      └─ trace-bloom.js
```

Then add a project card on your homepage:

```html
<article class="project-card">
  <h3>Trace Bloom</h3>
  <p>
    A lightweight browser game built with vanilla JavaScript and HTML Canvas.
    Stabilize corrupted signal nodes while avoiding noise pulses.
  </p>
  <a href="/mini-games/trace-bloom/">Play in browser</a>
</article>
```

Optional iframe embed:

```html
<iframe
  class="game-frame"
  src="/mini-games/trace-bloom/"
  title="Trace Bloom browser game"
  loading="lazy">
</iframe>
```

Suggested CSS:

```css
.game-frame {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(80, 240, 255, 0.35);
  border-radius: 18px;
  background: #05070f;
}
```

For CV wording:

```text
Built a small browser game using vanilla JavaScript and HTML Canvas, including responsive rendering, wave-based difficulty scaling, collision handling, procedural visual effects, and local high-score persistence.
```
