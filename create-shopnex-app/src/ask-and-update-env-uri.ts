import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import fs from "fs";
// Add crypto import at the top of the file
import crypto from "crypto";

// Assuming sleep is available (either defined here or imported)
const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const askAndUpdateEnvUri = async (
    projectPath: string,
    dbType: string
) => {
    const envPath = path.join(projectPath, ".env");
    let envContent = "";
    let envExisted = fs.existsSync(envPath);
    // Start spinner earlier for initial .env processing
    const spinner = ora(`Processing ${chalk.cyan(".env")} file...`).start();
    let secretUpdatedOrHandled = false; // Flag to track if secret logic affected content

    try {
        // --- Step 1: Read/Copy .env and Handle PAYLOAD_SECRET ---

        // Read existing .env content if it exists
        if (envExisted) {
            envContent = fs.readFileSync(envPath, "utf-8");
        } else {
            // If .env doesn't exist, check for .env.example to copy
            const envExamplePath = path.join(projectPath, ".env.example");
            if (fs.existsSync(envExamplePath)) {
                spinner.text = `Copying ${chalk.cyan(".env.example")} to ${chalk.cyan(".env")}...`;
                await sleep();
                fs.copyFileSync(envExamplePath, envPath);
                envContent = fs.readFileSync(envPath, "utf-8"); // Read the newly copied content
                envExisted = true; // Treat as existing now
                spinner.text = `Copied ${chalk.cyan(".env.example")}. Processing...`;
                await sleep();
            } else {
                spinner.text = `${chalk.cyan(".env")} not found and no ${chalk.cyan(".env.example")} to copy. Will create .env if needed.`;
                await sleep();
                // Content remains empty, we'll add lines later if needed
            }
        }

        // --- Generate and Replace PAYLOAD_SECRET ---
        spinner.text = `Checking/Updating ${chalk.cyan("PAYLOAD_SECRET")}...`;
        await sleep();
        const secretPlaceholderRegex = /^PAYLOAD_SECRET=YOUR_SECRET_HERE$/m; // Match specific placeholder
        let secretJustGenerated = false; // Track if we actively changed the secret

        if (secretPlaceholderRegex.test(envContent)) {
            const newSecret = crypto.randomBytes(32).toString("hex"); // Generate 32 random bytes -> 64 hex chars
            envContent = envContent.replace(
                secretPlaceholderRegex,
                `PAYLOAD_SECRET=${newSecret}`
            );
            spinner.text = `Generated and set new ${chalk.cyan("PAYLOAD_SECRET")}.`;
            secretUpdatedOrHandled = true;
            secretJustGenerated = true;
            await sleep();
        } else if (envContent.includes("PAYLOAD_SECRET=")) {
            spinner.text = `${chalk.cyan("PAYLOAD_SECRET")} seems to be already set or modified. Skipping generation.`;
            secretUpdatedOrHandled = true; // It exists, so we don't need to add it
            await sleep();
        } else {
            // Placeholder not found and no secret exists at all in the current content
            const newSecret = crypto.randomBytes(32).toString("hex");
            spinner.warn(
                chalk.yellow(
                    `${chalk.cyan("PAYLOAD_SECRET")} not found. Adding generated secret.`
                )
            );
            await sleep();
            const separator =
                envContent.length > 0 && !envContent.endsWith("\n") ? "\n" : "";
            envContent += `${separator}PAYLOAD_SECRET=${newSecret}\n`; // Append if missing entirely
            secretUpdatedOrHandled = true;
            secretJustGenerated = true;
        }

        // --- Step 2: Handle DATABASE_URI based on dbType ---

        // If SQLite, write .env if secret was handled/added, then return
        if (dbType === "sqlite") {
            // Write the file *only if* it didn't exist initially OR if we just added/generated the secret
            if (!envExisted || secretJustGenerated) {
                fs.writeFileSync(envPath, envContent);
                spinner.text = `Saved ${chalk.cyan(".env")} with updated PAYLOAD_SECRET.`;
                await sleep();
            }
            spinner.succeed(
                chalk.green(`Processed ${chalk.cyan(".env")} for SQLite.`)
            );
            console.log(
                chalk.blue(`\nSkipping Database URI prompt for SQLite.`)
            );
            console.log(
                chalk.yellow(
                    `  ${chalk.bold("Reminder:")} Check ${chalk.cyan(".env")} for the SQLite path (default: ${chalk.dim("file:./payload.db")}) and ensure PAYLOAD_SECRET is set.`
                )
            );
            return; // Do not prompt for URI
        }

        // --- Proceed with URI prompt for Postgres/Mongo ---
        spinner.stop(); // Stop spinner before prompt
        console.log(
            chalk.blue(
                `\nPlease provide the Database Connection URI for ${chalk.cyan(dbType)}.`
            )
        );
        let expectedFormat = "";
        if (dbType === "postgres") {
            expectedFormat = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE";
        } else {
            // mongo
            expectedFormat =
                "mongodb+srv://USER:PASSWORD@CLUSTER_URL/DB or mongodb://HOST:PORT/DB";
        }
        console.log(chalk.dim(`  Expected format: ${expectedFormat}`));

        const { dbUri } = await inquirer.prompt([
            {
                name: "dbUri",
                type: "password", // Use password type to hide input
                message: "Database URI:",
                mask: "*", // Mask input (check terminal compatibility if not working)
                validate: (input: string) => {
                    if (!input) {
                        return "Database URI cannot be empty.";
                    }
                    // Basic format check (optional but helpful)
                    if (
                        dbType === "postgres" &&
                        !input.startsWith("postgresql://")
                    ) {
                        return "PostgreSQL URI should start with postgresql://";
                    }
                    if (
                        dbType === "mongo" &&
                        !input.startsWith("mongodb://") &&
                        !input.startsWith("mongodb+srv://")
                    ) {
                        return "MongoDB URI should start with mongodb:// or mongodb+srv://";
                    }
                    return true;
                },
            },
        ]);

        spinner.start(
            `Updating ${chalk.cyan("DATABASE_URI")} in ${chalk.cyan(".env")}...`
        ); // Restart spinner
        await sleep();
        const uriLine = `DATABASE_URI=${dbUri}`;
        const uriRegex = /^DATABASE_URI=.*$/m; // Regex to find existing URI line (multiline)
        let uriFoundAndReplaced = false;

        if (uriRegex.test(envContent)) {
            // Replace existing line
            envContent = envContent.replace(uriRegex, uriLine);
            uriFoundAndReplaced = true;
        }

        // If line wasn't found, append it
        if (!uriFoundAndReplaced) {
            // Add a newline before appending if content exists and doesn't end with newline
            const separator =
                envContent.length > 0 && !envContent.endsWith("\n") ? "\n" : "";
            envContent += separator + uriLine + "\n";
        }

        // Write the final content (with potentially updated secret and URI) back to the file
        fs.writeFileSync(envPath, envContent);
        spinner.succeed(
            chalk.green(`Successfully processed ${chalk.cyan(".env")} file.`)
        );
    } catch (error: any) {
        spinner.fail(
            chalk.red(`Failed during ${chalk.cyan(".env")} processing.`)
        );
        console.error(chalk.red(error?.message || error));
        console.log(
            chalk.yellow(
                `Please check your ${chalk.cyan(".env")} file manually.`
            )
        );
        // Decide if you want to exit or continue based on overall script logic
    }
};
