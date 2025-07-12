import { execSync } from "child_process";
import fs from "fs";

/**
 * Run a shell command and print the output
 */
function runCommand(cmd: string) {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
}

/**
 * Ensures a specific submodule is initialized, synced, and updated.
 * @param submodulePath - Path as defined in `.gitmodules`, e.g. 'apps/shop'
 */
export async function fetchSubmoduleByPath(submodulePath: string) {
    try {
        // Initialize all (required once)
        runCommand(`git submodule init`);
        runCommand(`git submodule sync`);
        runCommand(`git submodule update --remote -- ${submodulePath}`);

        console.log(`✅ Submodule "${submodulePath}" updated successfully.`);
    } catch (err) {
        console.error(`❌ Error updating submodule "${submodulePath}":`, err);
    }
}
