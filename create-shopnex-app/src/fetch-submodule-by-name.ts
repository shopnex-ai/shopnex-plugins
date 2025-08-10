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
 * Setup sparse checkout for a specific storefront path
 * @param storefrontPath - Path to checkout, e.g. 'apps/shop' or 'apps/builder-shop'
 */
export async function setupSparseCheckout(storefrontPath: string) {
    try {
        // Enable sparse checkout
        runCommand(`git config core.sparseCheckout true`);

        // Create sparse-checkout file with the selected storefront and core paths
        const sparseCheckoutContent = [
            "/*",
            "!/apps/*",
            "apps/cms",
            `/${storefrontPath}`,
        ].join("\n");

        // Write to .git/info/sparse-checkout
        const sparseCheckoutPath = ".git/info/sparse-checkout";
        fs.writeFileSync(sparseCheckoutPath, sparseCheckoutContent);

        // Apply sparse checkout
        runCommand(`git read-tree -m -u HEAD`);

        console.log(
            `✅ Sparse checkout configured for "${storefrontPath}" successfully.`
        );
    } catch (err) {
        console.error(
            `❌ Error setting up sparse checkout for "${storefrontPath}":`,
            err
        );
    }
}

/**
 * Legacy function - kept for backward compatibility but deprecated
 * @deprecated Use setupSparseCheckout instead
 */
export async function fetchSubmoduleByPath(submodulePath: string) {
    console.warn(
        "⚠️ fetchSubmoduleByPath is deprecated. Using sparse checkout instead."
    );
    await setupSparseCheckout(submodulePath);
}
