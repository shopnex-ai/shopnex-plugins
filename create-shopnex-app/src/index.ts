#!/usr/bin/env node

import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import path from "path";
import fs from "fs";
import { promisify } from "util"; // Needed for async figlet
import inquirer from "inquirer"; // <--- Import inquirer here

// Assuming these are correctly implemented in separate files as per user's code structure
import { installDbDependencies } from "./install-db-dependencies.js";
import { installDependencies } from "./install-dependencies.js";
import { cleanupAndExit } from "./cleanup-and-exit.js";
import { cloneRepository } from "./clone-repository.js";
import { askDatabaseType, askProjectDetails } from "./ask-project-details.js";
import { runProjectCommand } from "./run-project-command.js";
import { askAndUpdateEnvUri } from "./ask-and-update-env-uri.js";
import { startDevServer } from "./start-dev-server.js";
import { askToRunDevServer } from "./ask-to-run-dev-server.js";

const args = process.argv.slice(2);
const flags = {
    fresh: args.includes("--fresh"),
    skipEnv: args.includes("--skip-env"), 
    noDev: args.includes("--skip-dev"),
    db: (() => {
        const dbArg = args.find((arg) => arg.startsWith("--db="));
        if (dbArg) {
            const val = dbArg.split("=")[1];
            if (["sqlite", "postgres", "mongo"].includes(val)) return val;
        }
        return undefined;
    })(),
};

// --- Graceful Exit Handler Setup (if not done in cleanup-and-exit.js) ---
process.on("SIGINT", () => cleanupAndExit("SIGINT"));
process.on("SIGTERM", () => cleanupAndExit("SIGTERM"));
process.on("uncaughtException", (error) => {
    console.error(chalk.red("\n❌ Uncaught Exception:"));
    console.error(error);
    cleanupAndExit("uncaughtException");
    process.exit(1); // Ensure exit after cleanup attempt on uncaught exception
});
// --- End Graceful Exit Handler ---

// --- Configuration ---
const REPO_URL = "https://github.com/shopnex-ai/shopnex.git"; // User provided repo
const ORG_NAME = chalk.hex("#1687b9").bold("ShopNex");

// --- Helper Functions ---

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms)); // Reduce default sleep
const figletPromise = promisify(figlet); // For async banner

const displayBanner = async () => {
    // ... (function remains the same)
    const msg = "ShopNex";
    try {
        const data = await figletPromise(msg);
        if (data) {
            console.log(gradient.pastel.multiline(data));
            console.log(`\n Welcome to ${ORG_NAME} E-commerce Platform Setup!\n`);
        } else {
            throw new Error("Figlet returned no data");
        }
    } catch (err) {
        console.log(gradient.pastel.multiline(msg)); // Fallback
        console.log(`\n Welcome to ${ORG_NAME} E-commerce Platform Setup!\n`);
        console.warn(chalk.yellow("Could not render fancy banner."));
    }
};

const setupDatabaseConfig = async (projectPath: string, dbType: string) => {
    // ... (function remains the same as the previous version)
    const spinner = ora(`Configuring project settings for ${chalk.cyan(dbType)}...`).start();
    const payloadConfigFilename = "payload.config.ts"; // Assuming TS template
    const payloadConfigPath = path.join(projectPath, "src", payloadConfigFilename);

    try {
        // --- Step 1: Copy .env file ---
        const envExamplePath = path.join(projectPath, ".env.example");
        const envPath = path.join(projectPath, ".env");
        spinner.text = `Handling ${chalk.cyan(".env")} file...`;
        await sleep();
        if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
            fs.copyFileSync(envExamplePath, envPath);
            spinner.text = `Copied ${chalk.cyan(".env.example")} to ${chalk.cyan(".env")}`;
            await sleep();
        } else if (!fs.existsSync(envExamplePath)) {
            spinner.text = `No ${chalk.cyan(".env.example")} found to copy.`;
            await sleep();
        } else {
            spinner.text = `${chalk.cyan(".env")} already exists. Skipping copy.`;
            await sleep();
        }

        // --- Step 2: Modify payload.config.ts (ONLY IF NOT SQLite) ---
        if (dbType === "sqlite") {
            spinner.succeed(
                chalk.green(
                    `Keeping default SQLite configuration in ${chalk.cyan(payloadConfigFilename)}.`,
                ),
            );
            // Reminder about .env for SQLite will be handled in askAndUpdateEnvUri or displayNextSteps
            return;
        }

        // Proceed only for Postgres or Mongo
        spinner.text = `Updating ${chalk.cyan(payloadConfigFilename)} for ${chalk.cyan(dbType)}...`;
        await sleep();

        if (!fs.existsSync(payloadConfigPath)) {
            spinner.warn(
                chalk.yellow(
                    `Could not find ${chalk.cyan(payloadConfigPath)}. Skipping DB adapter configuration.`,
                ),
            );
            await sleep();
            return;
        }

        let configContent = fs.readFileSync(payloadConfigPath, "utf-8");

        // Define Adapters & Imports (non-SQLite)
        const postgresAdapterConfig = `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } })`;
        const mongooseAdapterConfig = `mongooseAdapter({ url: process.env.DATABASE_URI || '' })`;
        const postgresImport = "import { postgresAdapter } from '@payloadcms/db-postgres'";
        const mongoImport = "import { mongooseAdapter } from '@payloadcms/db-mongodb'";

        let newAdapterConfig = "";
        let requiredImport = "";

        if (dbType === "postgres") {
            newAdapterConfig = postgresAdapterConfig;
            requiredImport = postgresImport;
        } else if (dbType === "mongo") {
            newAdapterConfig = mongooseAdapterConfig;
            requiredImport = mongoImport;
        } else {
            spinner.fail(chalk.red(`Invalid database type '${dbType}' encountered.`));
            return;
        }

        // Replace DB Block
        const dbBlockRegex =
            /db:\s*(?:sqliteAdapter|postgresAdapter|mongooseAdapter)\s*\([\s\S]*?\)\s*,?/;
        if (!dbBlockRegex.test(configContent)) {
            spinner.warn(
                chalk.yellow(
                    `Could not find DB block in ${chalk.cyan(payloadConfigFilename)}. Manual config needed.`,
                ),
            );
            return; // Stop if block missing
        }
        configContent = configContent.replace(dbBlockRegex, `db: ${newAdapterConfig},`);
        spinner.text = `Replaced DB adapter block in ${chalk.cyan(payloadConfigFilename)}.`;
        await sleep();

        // Handle Imports (Remove all, add required)
        spinner.text = `Updating imports in ${chalk.cyan(payloadConfigFilename)}...`;
        await sleep();
        const anyDbAdapterImportRegex =
            /^\s*(\/\/)?\s*import\s*{?\s*(?:sqliteAdapter|postgresAdapter|mongooseAdapter)\s*}?\s*from\s*['"]@payloadcms\/db-(?:sqlite|postgres|mongodb)['"];?\s*$/gm;
        configContent = configContent.replace(anyDbAdapterImportRegex, "").trim();
        const separator = configContent.length > 0 ? "\n\n" : "";
        configContent = `${requiredImport}${separator}${configContent}`;

        // Write back
        fs.writeFileSync(payloadConfigPath, configContent);
        spinner.succeed(
            chalk.green(
                `Successfully updated ${chalk.cyan(payloadConfigFilename)} for ${chalk.cyan(dbType)}.`,
            ),
        );
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed during config for ${chalk.cyan(payloadConfigFilename)}.`));
        console.error(chalk.red(error?.message || error));
        console.log(chalk.yellow("Manual configuration may be needed."));
    }
};

// ==============================================================
// DisplayNextSteps function (Adjusted slightly)
// ==============================================================
const displayNextSteps = (projectName: string, dbType: string) => {
    console.log(chalk.green.bold("\n✨ Project setup complete! ✨\n"));
    console.log(`Navigate to your new project:`);
    console.log(chalk.cyan(`  cd ${projectName}\n`));

    console.log(`Next steps:`);
    // Step 1 about .env is now less critical as we prompted for URI, but good to keep as a check
    console.log(
        `  1. ${chalk.yellow("Verify")} the ${chalk.cyan(".env")} file (especially if you need other variables).`,
    );
    if (dbType !== "sqlite") {
        console.log(
            `     (Ensure your ${chalk.cyan(dbType)} server is running and accessible with the provided URI)`,
        );
    }
    console.log(`  2. Start the development server:`);
    console.log(chalk.cyan(`     pnpm dev`));
    console.log(
        chalk.dim(
            `     (Consult Payload documentation for manual migration commands if needed.)\n`,
        ),
    );

    console.log(`Happy coding with ${ORG_NAME}! 🎉`);
    process.exit(0);
};

// --- Main Execution ---

const run = async () => {
    await displayBanner();

    // Get CLI args (skip flags)
    const nonFlagArgs = args.filter((arg) => !arg.startsWith("--"));
    let projectName = nonFlagArgs[0];

    let dbType: string;

    if (!projectName && !flags.db) {
        const answers = await askProjectDetails();
        projectName = answers.projectName;
        dbType = answers.dbType;
    } else if (projectName && !flags.db) {
        dbType = await askDatabaseType();
    } else if (!projectName && flags.db) {
        const answers = await askProjectDetails();
        projectName = answers.projectName;
        dbType = flags.db;
    } else {
        dbType = flags.db!;
    }
    
    const projectPath = path.resolve(process.cwd(), projectName);

    await cloneRepository(projectName, REPO_URL);

    try {
        process.chdir(projectPath);
        console.log(chalk.blue(`Changed directory to: ${process.cwd()}`));
    } catch (err: any) {
        console.error(chalk.red(`Failed to change directory to ${projectName}. Exiting.`));
        console.error(chalk.red(err.message));
        process.exit(1);
    }

    await runProjectCommand(
        "git remote rename origin shopnex",
        "Updating git remote name to shopnex",
    );
    await installDependencies(projectPath);
    await installDbDependencies(dbType);
    await setupDatabaseConfig(projectPath, dbType);

    if (!flags.skipEnv) {
        await askAndUpdateEnvUri(projectPath, dbType);
    } else {
        console.log(chalk.yellow("⚠️ Skipping environment configuration (--no-env)"));
    }

    if (!flags.fresh) {
        await runProjectCommand("npm run db:seed", "Attempting to seed database");
    } else {
        console.log(chalk.yellow("⚠️ Skipping database seeding (--fresh)"));
    }

    const shouldRun = flags.noDev && (await askToRunDevServer());
    if (shouldRun) {
        startDevServer();
    } else if (flags.noDev) {
        console.log(chalk.yellow("⚠️ Skipping dev server startup (--no-dev)"));
    }

    if (flags.noDev || !shouldRun) {
        displayNextSteps(projectName, dbType);
    }
};


// Use the catch block that handles Ctrl+C / errors
run().catch((error: any) => {
    if (error?.message?.includes("User force closed the prompt")) {
        cleanupAndExit("User Abort"); // Use the imported/setup handler
    } else {
        console.error(chalk.red("\n❌ An unexpected error occurred during execution:"));
        console.error(error);
        if (error instanceof Error) {
            console.error(chalk.red(`Error Message: ${error.message}`));
        }
        // Attempt cleanup even on other errors? Maybe not, process might be unstable.
        process.exit(1);
    }
});
