# MDBlogs — new post scaffold
# Usage: .\scripts\new-post.ps1 -Slug "your-post-slug"
# Creates: posts/{slug}/src/index.ts, .stackblitzrc, package.json, README.md

param(
  [Parameter(Mandatory=$true)]
  [string]$Slug
)

$PostDir = "posts\$Slug"

if (Test-Path $PostDir) {
  Write-Error "Post folder already exists: $PostDir"
  exit 1
}

New-Item -ItemType Directory -Path "$PostDir\src" -Force | Out-Null

# ── package.json ──────────────────────────────────────────────────────────────
@"
{
  "name": "$Slug",
  "version": "1.0.0",
  "description": "Code sandbox for the $Slug blog post",
  "scripts": {
    "start": "tsx src/index.ts"
  },
  "dependencies": {
    "tsx": "^4.7.0"
  }
}
"@ | Set-Content "$PostDir\package.json" -Encoding utf8

# ── .stackblitzrc ─────────────────────────────────────────────────────────────
@"
{
  "startCommand": "npm start",
  "openFiles": ["src/index.ts"]
}
"@ | Set-Content "$PostDir\.stackblitzrc" -Encoding utf8

# ── .gitignore ────────────────────────────────────────────────────────────────
@"
node_modules/
dist/
"@ | Set-Content "$PostDir\.gitignore" -Encoding utf8

# ── src/index.ts ──────────────────────────────────────────────────────────────
@"
// ─── $Slug ──────────────────────────────────────────────────────────────────
// Sandbox for the blog post. Edit this file to experiment.
// Run: npm start

console.log('Hello from $Slug sandbox!')

// TODO: add your demo code here
"@ | Set-Content "$PostDir\src\index.ts" -Encoding utf8

# ── README.md ─────────────────────────────────────────────────────────────────
@"
# $Slug

Code sandbox for the blog post: [$Slug](https://monalisadas-knowme.vercel.app/blogs)

## What I want you to notice

<!-- Describe the key pattern or insight the reader should watch for -->

## How to experiment

1. Open \`src/index.ts\`
2. <!-- Add specific things the reader can try -->
3. Save (Ctrl+S) and watch the terminal

## Run locally

\`\`\`bash
npm install
npm start
\`\`\`

---

[Blog](https://monalisadas-knowme.vercel.app/blogs) · [LinkedIn](https://www.linkedin.com/in/dmonalisa/)

— Monalisa
"@ | Set-Content "$PostDir\README.md" -Encoding utf8

Write-Host ""
Write-Host "Scaffold created: $PostDir" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd $PostDir"
Write-Host "  2. npm install   (generates package-lock.json — required for StackBlitz)"
Write-Host "  3. Fill in src/index.ts with your demo code"
Write-Host "  4. Fill in README.md (What I want you to notice, How to experiment)"
Write-Host "  5. git add . && git commit && git push"
Write-Host "  6. Add embed block to your blog post:"
Write-Host "     https://stackblitz.com/github/letusai15/MDBlogs/tree/main/posts/$Slug"
Write-Host ""
Write-Host "Remember: open the StackBlitz URL and verify it loads before publishing!" -ForegroundColor Yellow
