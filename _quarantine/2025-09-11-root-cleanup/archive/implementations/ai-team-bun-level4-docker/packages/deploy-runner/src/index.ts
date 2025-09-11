import { spawn } from "node:child_process";
import crypto from "node:crypto";

type DeployInput = {
  app?: string;
  env: "staging"|"prod";
  strategy?: "canary"|"blue-green";
  image?: string;       // override REGISTRY/IMAGE
  tag?: string;         // override default git-sha fallback
  context?: string;     // build context
  dockerfile?: string;  // path to Dockerfile
};

function run(cmd: string, args: string[] = [], cwd?: string): Promise<{code:number, stdout:string, stderr:string}> {
  return new Promise((resolve,reject)=>{
    const child = spawn(cmd, args, { cwd, stdio:["ignore","pipe","pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", d => stdout += String(d));
    child.stderr.on("data", d => stderr += String(d));
    child.on("error", reject);
    child.on("close", code => resolve({ code: code ?? -1, stdout, stderr }));
  });
}

async function getGitSha() {
  const r = await run("git", ["rev-parse","--short","HEAD"]);
  if (r.code === 0) return r.stdout.trim();
  return crypto.randomBytes(4).toString("hex");
}

function envOr(name: string, def?: string) { return process.env[name] ?? def; }

export async function deploy(input: DeployInput) {
  const REGISTRY = envOr("REGISTRY", "ghcr.io/your-org");
  const IMAGE    = envOr("IMAGE", input.app ?? "service");
  const TAG      = input.tag ?? envOr("TAG", await getGitSha());
  const CONTEXT  = input.context ?? envOr("CONTEXT", ".");
  const DOCKERFILE = input.dockerfile ?? envOr("DOCKERFILE", "./Dockerfile");
  const PROD_PORT  = Number(envOr("PROD_PORT","8080"));
  const CANARY_PORT = Number(envOr("CANARY_PORT","8081"));
  const HEALTH_URL = envOr("HEALTH_URL", `http://localhost:${CANARY_PORT}/health`);
  const CANARY_TIMEOUT_MS = Number(envOr("CANARY_TIMEOUT_MS", "60000"));

  const fullImage = input.image ?? `${REGISTRY}/${IMAGE}:${TAG}`;
  const steps: string[] = [];

  // 1) Build
  steps.push(`docker build -t ${fullImage} -f ${DOCKERFILE} ${CONTEXT}`);
  let r = await run("docker", ["build","-t", fullImage, "-f", DOCKERFILE, CONTEXT]);
  if (r.code !== 0) throw new Error("docker build failed: " + r.stderr);

  // 2) Push
  steps.push(`docker push ${fullImage}`);
  r = await run("docker", ["push", fullImage]);
  if (r.code !== 0) throw new Error("docker push failed: " + r.stderr);

  // 3) Canary up
  const canaryName = `${IMAGE}-canary`;
  steps.push(`docker rm -f ${canaryName} || true`);
  await run("docker", ["rm","-f", canaryName]); // ignore error
  steps.push(`docker run -d --name ${canaryName} -p ${CANARY_PORT}:${PROD_PORT} ${fullImage}`);
  r = await run("docker", ["run","-d","--name",canaryName,"-p",`${CANARY_PORT}:${PROD_PORT}`, fullImage]);
  if (r.code !== 0) throw new Error("docker run canary failed: " + r.stderr);

  // 4) Health-check loop
  const started = Date.now();
  let healthy = false;
  steps.push(`health-check ${HEALTH_URL}`);
  while (Date.now() - started < CANARY_TIMEOUT_MS) {
    const curl = await run("curl", ["-fsS", HEALTH_URL]);
    if (curl.code === 0) { healthy = true; break; }
    await new Promise(res=>setTimeout(res, 2000));
  }

  if (!healthy) {
    steps.push("rollback: remove canary");
    await run("docker", ["rm","-f", canaryName]);
    throw new Error("canary health-check failed; rolled back");
  }

  // 5) Promote: replace prod container with canary image
  const prodName = `${IMAGE}-prod`;
  steps.push(`docker rm -f ${prodName} || true`);
  await run("docker", ["rm","-f", prodName]); // ignore error
  steps.push(`docker run -d --name ${prodName} -p ${PROD_PORT}:${PROD_PORT} ${fullImage}`);
  r = await run("docker", ["run","-d","--name",prodName,"-p",`${PROD_PORT}:${PROD_PORT}`, fullImage]);
  if (r.code !== 0) throw new Error("docker run prod failed: " + r.stderr);

  // 6) Cleanup canary
  steps.push("docker rm -f canary");
  await run("docker", ["rm","-f", canaryName]);

  return { status: "deployed", image: fullImage, steps };
}
