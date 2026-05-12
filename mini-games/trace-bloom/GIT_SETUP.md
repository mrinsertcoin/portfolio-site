# Git Setup

Suggested repository name:

```text
trace-bloom
```

Create an empty GitHub repo, then run:

```powershell
cd path\to\trace-bloom
git init
git add .
git commit -m "Initial Trace Bloom browser game"
git branch -M main
git remote add origin https://github.com/mrinsertcoin/trace-bloom.git
git push -u origin main
```

For portfolio integration, copy the whole folder into:

```text
portfolio-site/mini-games/trace-bloom/
```

Then commit and push the portfolio repo.
