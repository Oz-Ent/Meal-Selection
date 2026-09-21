import { spawn } from 'node:child_process';

const URL = process.env.CYPRESS_BASE_URL || 'http://localhost:5173';
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

async function checkUrl(targetUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(targetUrl, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkUrl(targetUrl)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function killProcess(proc) {
  if (!proc || proc.killed) return;
  if (isWin && proc.pid) {
    try {
      spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
    } catch {
      proc.kill();
    }
  } else {
    proc.kill('SIGTERM');
  }
}

async function run() {
  const alreadyRunning = await checkUrl(URL);
  let devServer = null;

  if (!alreadyRunning) {
    console.log(`Starting dev server on ${URL}...`);
    devServer = spawn(npmCmd, ['run', 'dev'], {
      stdio: 'pipe',
      detached: false,
      shell: true,
    });

    devServer.on('error', (err) => {
      console.error('Failed to start dev server:', err);
    });

    const ready = await waitForServer(URL);
    if (!ready) {
      console.error(`Dev server did not start on ${URL} within timeout.`);
      killProcess(devServer);
      process.exit(1);
    }
    console.log(`Dev server is ready at ${URL}`);
  } else {
    console.log(`Dev server is already running at ${URL}`);
  }

  console.log('Running Cypress E2E tests...');
  const cypress = spawn(npxCmd, ['cypress', 'run'], {
    stdio: 'inherit',
    shell: true,
  });

  cypress.on('close', (code) => {
    if (devServer) {
      killProcess(devServer);
    }
    process.exit(code ?? 0);
  });
}

run();
