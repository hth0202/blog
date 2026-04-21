Open the local development server in the browser. If there are errors, fix them first.

Steps:
1. Check if port 3000 is occupied: `netstat -ano | findstr ":3000 " | findstr "LISTENING"`
2. If port 3000 IS occupied, check if it's healthy: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
   - If HTTP 200 → skip to step 5
   - If not 200 (e.g. 500) → kill all node processes and clean cache (step 3), then restart (step 4)
3. If port 3000 is NOT occupied, or server is unhealthy:
   - Kill all node processes: `powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"`
   - Delete .next cache: `powershell -Command "Remove-Item -Recurse -Force 'D:\Dev\blog\hth_blog\.next' -ErrorAction SilentlyContinue"`
4. Start the dev server in the background: `cd "D:\Dev\blog\hth_blog" && pnpm dev &` then wait 10 seconds
5. Verify server is healthy: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` — if still not 200, report the error logs
6. Open the browser: `start http://localhost:3000`
