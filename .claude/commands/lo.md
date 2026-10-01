Open the local development server in the browser. If there are errors, fix them first.

The dev server is pinned to port 3000 (`pnpm dev` runs `next dev -p 3000`). Run all commands from the repo root.

Steps:
1. Find what is listening on port 3000: `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`
2. If a process IS listening, check that it is the dev server and healthy:
   - Walk up from that PID to its parent: `ps -o ppid=,command= -p <PID>`, then run the same command on the parent PID
   - It is the dev server only if the parent or grandparent command contains `next dev` or `pnpm dev`. A bare `next-server` under `pnpm start`/`next start` is a production build that won't pick up code changes, so treat it as unhealthy
   - Health check: `curl -s -o /dev/null -w "%{http_code}" --max-time 60 http://localhost:3000`
   - If it is the dev server and returns 200 → skip to step 5
   - Otherwise (a production server, or not 200) → go to step 3
3. Clean up:
   - Kill only the processes tied to port 3000 (the PID and its `pnpm`/`next` parents), not every node process: `kill <PIDs>`; if still listening after 3 seconds, `kill -9 <PIDs>`
   - Delete the Next.js cache: `rm -rf .next`
4. Start the dev server in the background (use `run_in_background`): `pnpm dev`
   - Wait until the log shows `Ready` (or an error) instead of sleeping for a fixed time
   - If it fails with a port-in-use error, return to step 1
5. Verify the server is healthy: `curl -s -o /dev/null -w "%{http_code}" --max-time 60 http://localhost:3000`. If it still isn't 200, read the dev server log, fix the error, and check again
6. Open the browser: `open http://localhost:3000`
