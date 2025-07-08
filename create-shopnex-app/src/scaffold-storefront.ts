import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import ora from "ora";
const execAsync = promisify(exec);

export const scaffoldStorefront = async (
    projectName: string,
    repoUrl: string
) => {
    const spinner = ora(
        `Scaffolding ${chalk.cyan(repoUrl)} into ${chalk.cyan(projectName)}...`
    ).start();

    try {
        await execAsync(`npx degit ${repoUrl} ${projectName}`);
        spinner.succeed(
            chalk.green(
                `Successfully scaffolded into ${chalk.bold(projectName)}`
            )
        );
    } catch (error: any) {
        spinner.fail(chalk.red("Error scaffolding project."));
        console.error(chalk.red(error?.message || error));
    }
};
