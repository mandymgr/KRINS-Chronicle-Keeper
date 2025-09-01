import WebSocket from "ws";
import { v4 as uuid } from "uuid";

export class ToolingClient {
  private ws: WebSocket;
  private pending = new Map<string,(v:any)=>void>();
  private pendingErr = new Map<string,(e:any)=>void>();

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on("message",(buf)=>{
      const res = JSON.parse(buf.toString());
      const id = res.id;
      if (res.ok) this.pending.get(id)?.(res);
      else this.pendingErr.get(id)?.(res);
      this.pending.delete(id); this.pendingErr.delete(id);
    });
  }
  private call(method: string, params: any = {}, agent?: string): Promise<any> {
    const id = uuid();
    const payload = JSON.stringify({ id, method, params, agent });
    return new Promise((resolve,reject)=>{
      this.pending.set(id, resolve); this.pendingErr.set(id, reject);
      this.ws.send(payload);
    });
  }
  readFile(path: string, agent?: string){ return this.call("read_file", {path}, agent); }
  writeFile(path: string, content: string, agent?: string, ifNotExists?: boolean, expectedHash?: string){ return this.call("write_file", {path, content, ifNotExists, expectedHash}, agent); }
  searchCode(pattern: string, globs?: string[], agent?: string){ return this.call("search_code", {pattern, globs}, agent); }
  run(cmd: string, args: string[] = [], cwd?: string, agent?: string, timeoutMs?: number){ return this.call("run", {cmd,args,cwd,timeoutMs}, agent); }
  git(subcmd: "add"|"commit"|"status"|"restore", args: string[] = [], cwd?: string, agent?: string){ return this.call("git", {subcmd,args,cwd}, agent); }
  test(framework: "bun"|"vitest"|"jest"="bun", args: string[] = [], cwd?: string, agent?: string){ return this.call("test", {framework,args,cwd}, agent); }
}
