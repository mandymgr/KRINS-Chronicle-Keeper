import { deploy } from "./index";
deploy({ env:"prod", app:"pilot-service", strategy:"canary" })
  .then(r=>console.log("DEPLOY OK:", r))
  .catch(e=>{ console.error("DEPLOY ERR:", e); process.exit(1); });
