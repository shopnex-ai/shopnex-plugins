import chalk from "chalk";
import { execSync } from "node:child_process";
import ora from "ora";

export const installDbDependencies = async (dbType: string) => {
    // ... (function remains largely the same, using payload packages)
    let dbDeps: string[] = [];
    let dbName = "";

    switch (dbType) {
        case "postgres":
            dbDeps = ["@payloadcms/db-postgres@3.31.0"];
            dbName = "PostgreSQL";
            break;
        case "sqlite":
            // dbDeps = ["@payloadcms/db-sqlite"];
            dbName = "SQLite";
            break;
        case "mongo":
            dbDeps = ["@payloadcms/db-mongodb@3.31.0"];
            dbName = "MongoDB";
            break;
    }

    if (dbDeps.length > 0) {
        const depsString = dbDeps.join(" ");
        const spinner = ora(
            `Installing ${chalk.cyan(dbName)} specific dependencies (${chalk.dim(depsString)})...`
        ).start();
        const command = `pnpm add ${depsString}`;
        try {
            execSync(command, { stdio: "pipe" });
            spinner.succeed(
                chalk.green(`${dbName} dependencies installed successfully!`)
            );
        } catch (error: any) {
            spinner.fail(
                chalk.red(`Failed to install ${dbName} dependencies.`)
            );
            console.error(
                chalk.red(error?.stderr?.toString() || error?.message || error)
            );
            console.error(
                chalk.yellow(`Please try running "${command}" manually.`)
            );
            process.exit(1);
        }
    } else {
        console.log(
            chalk.yellow(
                `No specific database dependencies needed for ${dbName} based on script logic.`
            )
        );
    }
};
