import { runSecOps } from "./index";
runSecOps({ runSemgrep: false }).then(r=>{
  console.log("SecOps:", r);
  const ok = r.gitleaks==="pass" && r.trivy==="pass" && (r.semgrep===undefined || r.semgrep==="pass");
  if (!ok) process.exit(1);
});
