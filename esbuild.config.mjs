import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs/promises";

// กำหนดตำแหน่ง Vault ทดสอบ
const TEST_VAULT = ".test-vault/.obsidian/plugins/ultima-orb/"; 
const prod = (process.argv[2] === "production");

// ฟังก์ชันสำหรับคัดลอกไฟล์
async function copyStaticFiles() {
    try {
        await fs.mkdir(TEST_VAULT, { recursive: true });
        await fs.copyFile("manifest.json", `${TEST_VAULT}/manifest.json`);
        await fs.copyFile("styles.css", `${TEST_VAULT}/styles.css`);
    } catch (err) {
        console.error("Error copying static files:", err);
    }
}

// Build configuration
const buildConfig = {
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", ...builtins],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: prod ? "main.js" : `${TEST_VAULT}/main.js`,
};

if (prod) {
    // Production build
    esbuild.build(buildConfig).then(async () => {
        console.log("Production build successful!");
    }).catch(() => process.exit(1));
} else {
    // Development build with watch
    esbuild.context(buildConfig).then(async (context) => {
        await context.watch();
        await copyStaticFiles();
        console.log("Initial build successful! Watching for changes...");
    }).catch(() => process.exit(1));
}
