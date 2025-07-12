import chalk from "chalk";
import { execSync } from "child_process";
import ora from "ora";

export const installDependencies = async (projectPath: string) => {
    // ... (function remains the same)
    const spinner = ora(
        `Installing base dependencies with ${chalk.cyan("pnpm")}... (This may take a few minutes)`
    ).start();
    try {
        execSync("pnpm install", { stdio: "pipe" });
        spinner.succeed(
            chalk.green("Base dependencies installed successfully!")
        );
    } catch (error: any) {
        spinner.fail(chalk.red("Failed to install base dependencies."));
        console.error(
            chalk.red(error?.stderr?.toString() || error?.message || error)
        );
        console.error(
            chalk.yellow(
                'Ensure pnpm is installed. Try "pnpm install" manually.'
            )
        );
        process.exit(1);
    }
};
