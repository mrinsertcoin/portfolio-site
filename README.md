# Linus Floyd Portfolio Website

A clean static portfolio website for a junior software developer profile. It is designed to be simple to host for free, easy to edit, and useful for job applications.

## What is included

- Responsive homepage
- Project pages for:
  - Signal Leak
  - LogLens Lite
  - CSV Anonymizer
- Dark technical visual style
- No framework
- No build step
- No paid hosting requirement
- Cloudflare Pages / GitHub Pages ready

## Project structure

```text
portfolio-site/
├─ index.html
├─ projects/
│  ├─ signal-leak.html
│  ├─ loglens-lite.html
│  └─ csv-anonymizer.html
├─ assets/
│  ├─ css/styles.css
│  ├─ js/main.js
│  ├─ img/
│  └─ cv/
├─ docs/
│  ├─ deploy-cloudflare-pages.md
│  └─ deploy-github-pages.md
├─ 404.html
├─ robots.txt
└─ README.md
```

## Local preview

Open `index.html` directly in your browser.

For a cleaner local server preview, run one of these commands in the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No npm, Node, Python packages, or build tools are required.

## Edit before publishing

Update these values before using the site publicly:

1. Email address in `index.html` if needed.
2. GitHub project links if your repo names differ.
3. LinkedIn link if you want to add one.
4. Domain name in your hosting provider.
5. Project screenshots once you have real screenshots/GIFs.
6. Optional CV PDF in `assets/cv/`.

## Recommended GitHub repository name

```text
portfolio-site
```

## Suggested repository description

```text
Personal developer portfolio website built as a lightweight static site.
```

## Suggested GitHub topics

```text
portfolio
personal-website
static-site
html
css
javascript
developer-portfolio
cloudflare-pages
github-pages
```

## Deploy for free

Recommended: **Cloudflare Pages**.

Short version:

1. Push this folder to a GitHub repository.
2. Cloudflare → Workers & Pages → Create Pages project.
3. Connect the GitHub repo.
4. Build command: empty.
5. Output directory: `/`.
6. Add your custom domain in Cloudflare Pages.

See `docs/deploy-cloudflare-pages.md` for details.

Alternative: GitHub Pages. See `docs/deploy-github-pages.md`.

## Git setup

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/mrinsertcoin/portfolio-site.git
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/mrinsertcoin/portfolio-site.git
git push -u origin main
```
