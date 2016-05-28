import gulp from 'gulp';
import { argv } from 'yargs';
import { spawn } from 'child_process';

gulp.task('php-server', (callback) => {
  const {
    host = '0.0.0.0',
    port = 80,
  } = argv;

  // Start PHP built-in web server
  spawn('php', [
    '-S',
    `${host}:${port}`,
    '-t',
    `${__dirname}/public`,
    `${__dirname}/router.php`,
  ], {
    shell: true,
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr,
    ],
  });
});
