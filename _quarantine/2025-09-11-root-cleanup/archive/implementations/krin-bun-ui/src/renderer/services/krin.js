export const Krin = {
  run: (args, input) => window.krin.run(args, input),
  spawnChat: () => window.krin.spawnChat(),
  sendLine: (line) => window.krin.sendLine(line),
  stop: () => window.krin.stop(),
  onStdout: (cb) => window.krin.onStdout(cb),
  onStderr: (cb) => window.krin.onStderr(cb),
  onExit: (cb) => window.krin.onExit(cb),
};
