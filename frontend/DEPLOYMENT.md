# Claw Colosseum - Vercel Deployment Guide

## Prerequisites

- GitHub account connected to Vercel
- Vercel account (free tier works)
- Backend API deployed and accessible

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/claw-colosseum)

## Manual Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Claw Colosseum frontend"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/claw-colosseum.git

# Push
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `claw-colosseum` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configure Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.com` | Production |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-backend.com` | Production |

> For development/preview, you can set different values.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   └── styles/        # Global styles
├── public/            # Static assets
├── next.config.js     # Next.js configuration
├── vercel.json        # Vercel configuration
├── tailwind.config.js # Tailwind CSS config
└── package.json       # Dependencies
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | Yes |

## Build Output

The project builds to static pages where possible:

- `/` - Landing page (static)
- `/about` - About page (static)
- `/arena` - Battle arena (client-side)
- `/demo` - Game demo (static)
- `/guide` - User guide (static)
- `/roadmap` - Development roadmap (static)
- `/leaderboard` - Rankings (client-side)

## Troubleshooting

### Build Fails

1. Check Node.js version (requires 18+)
2. Run `npm install` locally to check for errors
3. Verify all TypeScript errors are resolved: `npm run lint`

### WebSocket Connection Issues

1. Ensure backend supports WebSocket
2. Check CORS configuration on backend
3. Verify `NEXT_PUBLIC_SOCKET_URL` is correct

### Environment Variables Not Working

1. Ensure variables start with `NEXT_PUBLIC_`
2. Redeploy after adding new variables
3. Check for typos in variable names

## Performance Tips

1. **Enable Vercel Analytics** (optional)
   - Project Settings > Analytics > Enable

2. **Edge Middleware** (optional)
   - Add `middleware.ts` for geo-routing

3. **Image Optimization**
   - Use `next/image` for all images

## Custom Domain

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS as instructed
4. SSL is automatic

## Support

For issues, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
