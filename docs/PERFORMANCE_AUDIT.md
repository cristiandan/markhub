# Performance Audit Report

**Date:** 2026-03-03  
**Version:** 0.1.0  
**Auditor:** Markhub Worker

## Summary

This audit analyzed the Markhub application's performance characteristics and implemented optimizations to improve page load times and user experience.

## Bundle Analysis

### Total Build Size
- `.next/` folder: **222MB** (includes server-side code, expected for Next.js)

### Client-Side Chunks (Top 10 by size)
| File | Size | Notes |
|------|------|-------|
| `d27278667d3115d7.js` | 786KB | react-syntax-highlighter (Prism + themes) |
| `7de9141b1af425c3.js` | 219KB | react-markdown + remark plugins |
| `0edab8a24d59a626.js` | 121KB | Next.js client runtime |
| `a6dad97d9634a72d.js` | 110KB | React + React DOM |
| `68a088aa49e6124a.js` | 33KB | next-auth client |
| `0bd6498bda341889.js` | 30KB | App components |
| `16089f26d5e4ef5c.js` | 25KB | Utilities |

### Key Findings

1. **Heavy Markdown Dependencies (~1MB total)**
   - `react-syntax-highlighter` with Prism themes: ~786KB
   - `react-markdown` + `remark-gfm`: ~219KB
   - These are only needed on pages that render markdown content

2. **No Dynamic Imports**
   - All code was loaded synchronously on initial page load
   - Heavy components bloat the initial bundle

3. **Missing Next.js Optimizations**
   - No `next/image` for avatar/image optimization
   - Default config without performance tuning

## Optimizations Implemented

### 1. Dynamic Markdown Loading
**File:** `src/components/markdown/DynamicMarkdown.tsx`

Created a dynamic wrapper for `MarkdownRenderer` that:
- Loads markdown dependencies on demand (not in initial bundle)
- Shows a skeleton loader while loading
- Still renders server-side for SEO

**Usage:**
```tsx
// Before (loads ~1MB in initial bundle)
import { MarkdownRenderer } from '@/components/markdown';

// After (lazy loaded)
import { DynamicMarkdown } from '@/components/markdown';
```

**Impact:** ~1MB reduction in initial bundle for non-markdown pages

### 2. Next.js Config Optimizations
**File:** `next.config.ts`

Added:
- `poweredByHeader: false` — Security + smaller headers
- `compress: true` — Gzip compression enabled
- `images.remotePatterns` — Allow GitHub avatar optimization
- `images.formats` — Modern AVIF/WebP formats
- `experimental.optimizePackageImports` — Tree-shaking for heavy packages

### 3. Image Optimization Setup
Configured `next/image` support for:
- GitHub avatars (`avatars.githubusercontent.com`)
- Any GitHub-hosted images (`*.githubusercontent.com`)

## Recommendations for Future

### High Priority

1. **Use `next/image` for avatars**
   ```tsx
   // Replace <img> with <Image>
   import Image from 'next/image';
   
   <Image 
     src={user.avatar} 
     alt={user.name}
     width={40}
     height={40}
     className="rounded-full"
   />
   ```

2. **Consider lighter syntax highlighter**
   - [Shiki](https://shiki.style/) — Smaller bundle, better themes
   - [Prism Light](https://prismjs.com/) — Only import needed languages
   - Current: All Prism languages bundled (~50+ languages)

3. **Add bundle analyzer**
   ```bash
   npm install -D @next/bundle-analyzer
   ```
   Enable with `ANALYZE=true npm run build`

### Medium Priority

4. **Implement ISR for popular files**
   - Use `revalidate` for frequently accessed markdown files
   - Reduces server load and improves TTFB

5. **Add service worker for caching**
   - Cache static assets and API responses
   - Improve repeat visit performance

6. **Prefetch critical routes**
   ```tsx
   <Link href="/explore" prefetch={true}>Explore</Link>
   ```

### Low Priority

7. **Consider edge runtime for API routes**
   - Some API routes could run on edge for lower latency
   - Requires removing Node.js-specific code

8. **Implement streaming SSR**
   - Use React 18 Suspense boundaries for progressive loading

## Lighthouse Scores

> ⚠️ **Note:** Could not run Lighthouse locally (no Chrome installed). PageSpeed API quota exceeded.

### Estimated Scores (based on analysis)

| Category | Estimated Score | Notes |
|----------|-----------------|-------|
| Performance | 75-85 | Heavy JS bundle impacts FCP/LCP |
| Accessibility | 90+ | Semantic HTML, ARIA labels present |
| Best Practices | 90+ | Modern patterns, no deprecated APIs |
| SEO | 95+ | Meta tags, semantic structure, OG tags |

### Core Web Vitals (estimated)

| Metric | Target | Status |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | ⚠️ May need improvement |
| FID (First Input Delay) | < 100ms | ✅ Likely good |
| CLS (Cumulative Layout Shift) | < 0.1 | ✅ Skeleton loaders help |

## Monitoring

For ongoing performance monitoring, consider:

1. **Vercel Analytics** — Built-in if using Vercel
2. **Sentry Performance** — Real User Monitoring (RUM)
3. **Web Vitals library** — Report to custom analytics

```tsx
// Example: Report Web Vitals
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

## Conclusion

The application has a solid foundation but the heavy markdown rendering dependencies impact initial load performance. The implemented optimizations (dynamic imports, Next.js config) provide immediate improvements.

**Key wins:**
- ~1MB reduction in initial bundle for non-markdown pages
- Modern image format support configured
- Tree-shaking enabled for heavy packages

**Next steps:**
- Replace `<img>` with `<Image>` components
- Consider lighter syntax highlighting library
- Add bundle analyzer for ongoing monitoring
- Run Lighthouse once Chrome/Chromium is available

---

*This audit was performed as part of task [P5-12] Performance audit (Lighthouse)*
