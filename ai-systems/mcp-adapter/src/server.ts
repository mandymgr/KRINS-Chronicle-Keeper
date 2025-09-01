import "dotenv/config";
import { ToolingClient } from "./tooling-client";

const url = process.env.TOOLING_URL ?? "ws://localhost:3007/ws";
const agent = process.env.AGENT_NAME ?? "mcp";
const tools = new ToolingClient(url);

process.stdin.setEncoding("utf8");

function send(obj: any) {
  try {
    process.stdout.write(JSON.stringify(obj) + "\n");
  } catch (e) {
    process.stderr.write(String(e) + "\n");
  }
}

process.stdin.on("data", async (chunk) => {
  const lines = chunk.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    let req: any;
    try {
      req = JSON.parse(line);
    } catch (e) {
      send({ ok:false, error:{ code:"EBADJSON", message:String(e) }});
      continue;
    }
    const id = req.id;
    const m = req.method;
    const p = req.params ?? {};
    try {
      let res: any;
      switch (m) {
        case "read_file": res = await tools.readFile(p.path, agent); break;
        case "write_file": res = await tools.writeFile(p.path, p.content, agent, p.ifNotExists, p.expectedHash); break;
        case "search_code": res = await tools.searchCode(p.pattern, p.globs, agent); break;
        case "run": res = await tools.run(p.cmd, p.args, p.cwd, agent, p.timeoutMs); break;
        case "git": res = await tools.git(p.subcmd, p.args, p.cwd, agent); break;
        case "test": res = await tools.test(p.framework, p.args, p.cwd, agent); break;
        default: throw Object.assign(new Error("Unknown method: "+m), { code:"EMETHOD" });
      }
      send({ id, ok:true, result: res.result ?? res });
    } catch (e: any) {
      send({ id, ok:false, error:{ code: e?.code, message: e?.message ?? String(e) }});
    }
  }
});

process.stdin.on("end", ()=> process.exit(0));

process.stderr.write(`[mcp-adapter] ready → ${url} (agent=${agent})\n`);
