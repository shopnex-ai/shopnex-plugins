import chalk from "chalk";

let isExiting = false;
// --- Graceful Exit Handler (Keep from previous fix) ---
export const cleanupAndExit = (signal = "UNKNOWN") => {
    // ... (keep the implementation from the previous answer) ...
    if (isExiting) return;
    isExiting = true;
    console.log(chalk.yellow(`\n👋 "${signal}" received, exiting gracefully...`));
    try {
        process.stdout.write("\x1B[?25h"); // Ensure cursor is visible
    } catch (e) {
        /* ignore */
    }
    process.exit(0);
};
process.on("SIGINT", () => cleanupAndExit("SIGINT"));
process.on("SIGTERM", () => cleanupAndExit("SIGTERM"));
process.on("uncaughtException", (error) => {
    console.error(chalk.red("\n❌ Uncaught Exception:"));
    console.error(error);
    cleanupAndExit("uncaughtException");
    process.exit(1);
});
