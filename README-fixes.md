# Fix Instructions

## Files Changed

### 1. `tsconfig.server.json`
- Kept `moduleResolution: "bundler"` (matches how esbuild works)
- Added `"lib": ["ES2022"]` explicitly — fixes the `Array.at()` error
- No change needed to relative imports (bundler mode doesn't require `.js` extensions)

### 2. `package.json`
- Added `--alias:@contracts=./contracts --alias:@db=./db --alias:@=./src` to the esbuild build command
- This tells esbuild how to resolve your path aliases at bundle time

### 3. `vercel.json` (NEW FILE — add to app/ root)
- Tells Vercel how to build and route the fullstack app
- Routes `/api/*` to the bundled server
- Routes everything else to the React frontend

## What Was Wrong

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '@contracts/*'` | esbuild didn't know about path aliases | Added `--alias` flags to build script |
| `Cannot find module '@db/*'` | Same as above | Same fix |
| `Property 'at' does not exist on type 'any[]'` | lib was missing ES2022 | Added `"lib": ["ES2022"]` |
| Vercel 404 | No `vercel.json` routing config | Added `vercel.json` |

## How to Apply
1. Replace `app/tsconfig.server.json` with the fixed version
2. Replace `app/package.json` with the fixed version  
3. Add `app/vercel.json` (new file)
4. Commit and push to GitHub
5. Vercel will auto-redeploy
