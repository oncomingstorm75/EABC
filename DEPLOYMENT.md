# Deployment Guide

## Quick Start

### Local Development
```bash
npm install
npm run dev
```
Visit http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Deployment Options

### 1. Docker (Recommended)

Build and run with Docker:
```bash
docker build -t eabc-encoder .
docker run -p 8080:80 eabc-encoder
```

Visit http://localhost:8080

### 2. Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo to Netlify for automatic deployments.

### 3. Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

Or import your GitHub repo in Vercel dashboard.

### 4. Static Hosting (GitHub Pages, S3, etc.)

```bash
npm run build
```

Upload the contents of the `dist` folder to your static hosting provider.

For GitHub Pages:
```bash
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/USERNAME/REPO.git main:gh-pages
```

### 5. Traditional Server (Apache/Nginx)

```bash
npm run build
```

Copy `dist` folder to your web server root, e.g.:
```bash
sudo cp -r dist/* /var/www/html/
```

For Nginx, ensure you have proper routing for SPA:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Environment Variables

No environment variables required - this is a pure client-side application.

## Troubleshooting

### Build fails
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: requires Node 16+

### Routing issues (404 on refresh)
- Ensure your server is configured for SPA routing
- Check that index.html fallback is properly configured

### Dependencies issues
```bash
npm audit fix
```

## Performance Tips

1. The build is already optimized with Vite
2. Gzip compression is handled by the server
3. For CDN deployment, set proper cache headers for static assets