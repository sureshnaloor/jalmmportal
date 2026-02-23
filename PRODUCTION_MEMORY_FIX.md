# Production Memory Fix Guide

## Problem
JavaScript heap out of memory error in production server:
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

## Solutions Implemented

### 1. Increased Node.js Heap Size
Updated `package.json` to include `NODE_OPTIONS='--max-old-space-size=4096'` in the start script.
This increases the heap size from default (~2GB) to 4GB.

### 2. Optimized Memory-Intensive API Routes
- Added early filtering in `openprojects` API route
- Added projection to fetch only needed fields
- Added safety limits to prevent loading too much data

## Production Deployment Steps

### Option 1: Using package.json script (Windows)
```bash
npm run start:prod
```

### Option 2: Using environment variable (Recommended)
Set the environment variable before starting:

**Windows (PowerShell):**
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

**Windows (CMD):**
```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm start
```

**Linux/Mac:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

### Option 3: Using PM2 (Recommended for Production)
If using PM2 process manager:

```bash
pm2 start npm --name "mmportal" -- start --max-old-space-size=4096
```

Or create a `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'mmportal',
    script: 'npm',
    args: 'start',
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  }]
}
```

Then run:
```bash
pm2 start ecosystem.config.js
```

### Option 4: Using Docker
If deploying with Docker, add to your Dockerfile or docker-compose.yml:

**Dockerfile:**
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

**docker-compose.yml:**
```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096
```

## Additional Recommendations

### 1. Monitor Memory Usage
- Use Node.js memory monitoring tools
- Set up alerts for high memory usage
- Consider using APM tools like New Relic or Datadog

### 2. Further Optimizations
- Implement pagination for large data sets
- Use database indexes on frequently queried fields
- Consider caching for expensive queries
- Use streaming for very large datasets

### 3. Database Indexes
Ensure these indexes exist:
```javascript
// In MongoDB
db.purchaseorders.createIndex({ "account.wbs": 1, "pending-val-sar": 1 })
db.materialdocumentsforpo.createIndex({ ponumber: 1 })
db.projects.createIndex({ "project-wbs": 1 })
```

### 4. If Memory Issues Persist
- Increase heap size further: `--max-old-space-size=6144` (6GB) or `8192` (8GB)
- Review and optimize other API routes that load large datasets
- Consider implementing data pagination
- Use MongoDB aggregation pipeline more efficiently
- Consider splitting large operations into smaller batches

## Verification
After deployment, monitor the application:
- Check server logs for memory warnings
- Monitor process memory usage
- Test the `/api/openprojects` endpoint
- Verify other memory-intensive endpoints

## Emergency Rollback
If issues occur, you can temporarily reduce heap size or revert to previous version:
```bash
NODE_OPTIONS='--max-old-space-size=2048' npm start
```
