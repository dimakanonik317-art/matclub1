// Dependency-free server regression suite. Node 24 provides node:sqlite.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const tests = [
  'check-http.mjs',
  'check-account.mjs',
  'check-account-grant.mjs',
  'check-server-hardening.mjs',
  'check-backend-v2.mjs',
  'check-assistant-model.mjs',
  'check-assistant-scope.mjs',
  'check-assistant-limits.mjs'
];
for (const test of tests) {
  const result = spawnSync(process.execPath, ['scripts/' + test], {
    cwd: root, stdio: 'inherit', timeout: 60000
  });
  if (result.error || result.status !== 0) {
    console.error('Backend check failed:', test, result.error?.message || '');
    process.exit(1);
  }
}
console.log(`PASS: all ${tests.length} backend suites.`);
