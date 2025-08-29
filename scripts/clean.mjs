import { rm } from "fs/promises";

async function clean() {
  await Promise.all([
    rm("main.js", { force: true }),
    rm("dist", { recursive: true, force: true }),
  ]);
}

clean().catch(err => {
  console.error("Failed to clean build artifacts:", err);
  process.exit(1);
});

