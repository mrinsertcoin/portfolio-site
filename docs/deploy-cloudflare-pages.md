# Deploy with Cloudflare Pages

Cloudflare Pages is the recommended free hosting option for this static portfolio site.

## 1. Push to GitHub

Create a repository, for example:

```text
portfolio-site
```

Then push the project:

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/mrinsertcoin/portfolio-site.git
git push -u origin main
```

## 2. Create a Cloudflare Pages project

In Cloudflare:

```text
Workers & Pages → Create application → Pages → Connect to Git
```

Select your `portfolio-site` repository.

Use these build settings:

```text
Framework preset: None
Build command: leave empty
Output directory: /
```

Then deploy.

## 3. Add your custom domain

In the Cloudflare Pages project:

```text
Custom domains → Set up a custom domain
```

Examples:

```text
www.yourdomain.de
yourdomain.de
```

If your domain is not yet managed by Cloudflare, Cloudflare may ask you to change nameservers at your domain provider.

## 4. Recommended domain setup

The cleanest setup is:

```text
yourdomain.de      → portfolio site
www.yourdomain.de  → portfolio site or redirect to root
```

If root-domain setup is annoying, use:

```text
www.yourdomain.de → portfolio site
```

and redirect the root domain to `www` at your domain provider or Cloudflare.
