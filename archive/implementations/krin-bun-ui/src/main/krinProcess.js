import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export function spawnKrin(args = []){
  const exe = process.platform === 'win32' ? 'krin.cmd' : 'krin';
  const child = spawn(exe, args, { shell: true });
  const events = new EventEmitter();
  child.stdout.on('data', d => events.emit('stdout', d.toString()));
  child.stderr.on('data', d => events.emit('stderr', d.toString()));
  child.on('exit', code => events.emit('exit', code ?? 0));
  const write = (line) => { try { child.stdin.write(line.endsWith('\n')?line:line+'\n'); } catch {} };
  const kill = () => { try { child.kill(); } catch {} };
  return { pid: child.pid ?? -1, write, kill, events };
}

export async function runKrinOnce(args = [], input){
  const exe = process.platform === 'win32' ? 'krin.cmd' : 'krin';
  return await new Promise((resolve) => {
    const child = spawn(exe, args, { shell: true });
    let out = '', err = '';
    if (input) { try { child.stdin.write(input); child.stdin.end(); } catch {} }
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());
    child.on('exit', code => resolve({ stdout: out, stderr: err, code: code ?? 0 }));
  });
}
