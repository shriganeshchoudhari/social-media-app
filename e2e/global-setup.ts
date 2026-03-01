import { FullConfig } from '@playwright/test';

const HEALTH_URL = 'http://localhost:9090/api/v1/health';
const FRONTEND_URL = 'http://localhost:3001';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Global setup — runs once before any test file.
 *
 * Verifies that both the backend and frontend are running before tests start.
 * Fails fast with a clear, actionable error message if either is unavailable.
 */
export default async function globalSetup(_config: FullConfig) {
    await checkService('Backend API', HEALTH_URL);
    await checkService('Frontend (Vite dev server)', FRONTEND_URL);
}

async function checkService(name: string, url: string): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res.ok || res.status <= 503) {
                console.log(`  ✅  ${name} is reachable at ${url}`);
                return;
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            const isLast = attempt === MAX_RETRIES;
            if (isLast) {
                throw new Error(
                    `\n\n❌  Playwright global setup failed — ${name} is NOT reachable at ${url}.\n` +
                    `   Make sure it is running before executing the E2E suite.\n` +
                    `   Backend:  cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev\n` +
                    `   Frontend: cd frontend && npm run dev\n` +
                    `   Original error: ${(err as Error).message}\n`
                );
            }
            console.warn(`  ⚠️  ${name} not ready (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms…`);
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
    }
}
