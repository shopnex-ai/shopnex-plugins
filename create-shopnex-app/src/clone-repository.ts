import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import { simpleGit } from "simple-git";

export const cloneRepository = async (projectName: string, repoUrl: string) => {
    // ... (function remains the same)
    const spinner = ora(
        `Cloning ${chalk.cyan(repoUrl)} into ${chalk.cyan(projectName)}...`,
    ).start();
    try {
        if (fs.existsSync(projectName)) {
            spinner.fail(chalk.red(`Directory '${projectName}' already exists.`));
            process.exit(1);
        }
        const git = simpleGit();
        await git.clone(repoUrl, projectName, ["--no-checkout"]);
        spinner.succeed(
            chalk.green(`Successfully cloned template into ${chalk.bold(projectName)}`),
        );
    } catch (error: any) {
        spinner.fail(chalk.red("Failed to clone repository."));
        console.error(chalk.red(error?.message || error));
        console.error(chalk.yellow("Ensure Git is installed and you have network connectivity."));
        process.exit(1);
    }
};
