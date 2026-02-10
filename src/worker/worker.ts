import 'dotenv/config';
import './signer'; // 5초마다 서명 루프
import './scheduler'; // 10분/1시간마다 감사 루프

console.log('[Worker Process] Background services started...');

process.on('SIGTERM', () => {
  console.log('[Worker Process] shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('[Worker Process] Uncaught Exception', err);
});
