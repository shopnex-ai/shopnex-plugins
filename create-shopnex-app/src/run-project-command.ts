import chalk from "chalk";
import { execSync } from "node:child_process";
import ora from "ora";

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a shell command within the current working directory (assumed to be the project dir).
 * Shows a spinner and handles success/failure.
 * @param command The command to run (e.g., "pnpm run build")
 * @param spinnerText Text to show in the spinner
 * @returns {Promise<boolean>} True if the command succeeded, false otherwise.
 */
export const runProjectCommand = async (
    command: string,
    spinnerText: string
): Promise<void> => {
    const spinner = ora(
        `${spinnerText} (Running: ${chalk.cyan(command)})...`
    ).start();
    try {
        // execSync is simpler for commands that should finish relatively quickly.
        // Use stdio: 'pipe' to capture output/errors without printing them raw.
        execSync(command, { stdio: "pipe" });
        spinner.succeed(chalk.green(`${spinnerText} completed successfully.`));
    } catch (error: any) {
        spinner.fail(chalk.red(`${spinnerText} failed.`));
        // Log the error output for debugging
        console.error(chalk.red(`\n--- Error Output for "${command}" ---`));
        // error.stdout might contain useful info even on failure
        if (error.stdout) {
            console.error(chalk.grey(error.stdout.toString()));
        }
        if (error.stderr) {
            console.error(chalk.redBright(error.stderr.toString()));
        } else {
            console.error(chalk.redBright(error.message)); // Fallback if no stderr
        }
        console.error(chalk.red(`--- End Error Output ---`));
        console.log(
            chalk.yellow(
                `\nYou might need to run "${command}" manually to fix issues.`
            )
        );
        process.exit(1);
    }
};
