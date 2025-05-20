import { spawn } from "node:child_process";
import chalk from "chalk";

export const startDevServer = (command = "npm run dev") => {
    console.log(
        chalk.blue(`\nStarting development server with "${command}"...`)
    );

    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
        stdio: "inherit",
        shell: true,
    });

    child.on("exit", (code) => {
        console.log(chalk.gray(`\nDev server exited with code ${code}`));
    });

    child.on("error", (err) => {
        console.error(
            chalk.red(`\nFailed to start dev server: ${err.message}`)
        );
    });
};
