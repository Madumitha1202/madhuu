// Starts the REST API (port 3001) and the Vite dev server together: `npm start`
import { spawn } from "node:child_process";

const run = (name, script) => {
  const child = spawn("npm", ["run", script], { stdio: "inherit", shell: true });
  child.on("exit", (code) => { console.log(`[${name}] exited with code ${code}`); stop(); });
  return child;
};
const children = [run("api", "api"), run("web", "dev")];
function stop() { children.forEach((c) => { try { c.kill(); } catch {} }); process.exit(); }
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
