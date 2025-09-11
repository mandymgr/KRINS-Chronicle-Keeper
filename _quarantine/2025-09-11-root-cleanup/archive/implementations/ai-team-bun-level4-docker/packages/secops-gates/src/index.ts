import { spawn } from "node:child_process";

function run(cmd: string, args: string[] = [], cwd?: string): Promise<{code:number, stdout:string, stderr:string}> {
  return new Promise((resolve,reject)=>{
    const child = spawn(cmd, args, { cwd, stdio:["ignore","pipe","pipe"] });
    let stdout="", stderr="";
    child.stdout.on("data",(d)=>stdout+=String(d));
    child.stderr.on("data",(d)=>stderr+=String(d));
    child.on("error",reject);
    child.on("close",(code)=>resolve({code:code??-1, stdout, stderr}));
  });
}

export type SecOpsReport = {
  gitleaks: "pass"|"fail";
  trivy: "pass"|"fail";
  semgrep?: "pass"|"fail";
};

export async function runSecOps(opts: { runSemgrep?: boolean } = {}): Promise<SecOpsReport> {
  let gitleaks: "pass"|"fail" = "pass";
  let trivy: "pass"|"fail" = "pass";
  let semgrep: "pass"|"fail"|undefined;

  // gitleaks
  const gl = await run("gitleaks", ["detect","--source",".","--no-banner","--redact","--exit-code","1"]);
  if (gl.code !== 0) gitleaks = "fail";

  // trivy (filesystem scan)
  const tv = await run("trivy", ["fs","--exit-code","1","--severity","CRITICAL,HIGH","."]);
  if (tv.code !== 0) trivy = "fail";

  if (opts.runSemgrep) {
    const sg = await run("semgrep", ["--error","--config","auto","."]);
    semgrep = sg.code === 0 ? "pass" : "fail";
  }

  return { gitleaks, trivy, semgrep };
}
