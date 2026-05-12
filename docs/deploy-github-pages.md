# Deploy with GitHub Pages

GitHub Pages is another free option for this static site.

## 1. Push the repository

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/mrinsertcoin/portfolio-site.git
git push -u origin main
```

## 2. Enable GitHub Pages

On GitHub:

```text
Repository → Settings → Pages
```

Use:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Save.

Your site will be available at a URL like:

```text
https://mrinsertcoin.github.io/portfolio-site/
```

## 3. Custom domain

In:

```text
Repository → Settings → Pages → Custom domain
```

Enter your domain, for example:

```text
www.yourdomain.de
```

GitHub may ask you to configure DNS records at your domain provider.

## 4. CNAME file

If you use GitHub Pages with a custom domain, add a file named `CNAME` in the project root containing only your domain:

```text
www.yourdomain.de
```

Do not include `https://`.
