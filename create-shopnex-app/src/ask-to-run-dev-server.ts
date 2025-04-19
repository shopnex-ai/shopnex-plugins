import inquirer from "inquirer";

/**
 * Prompts the user to decide whether to run the dev server.
 * @returns {Promise<boolean>} Whether the user wants to start the dev server.
 */
export const askToRunDevServer = async (): Promise<boolean> => {
    const { runDevServer } = await inquirer.prompt([
        {
            name: "runDevServer",
            type: "confirm",
            message: "Do you want to start the development server now?",
            default: true,
        },
    ]);

    return runDevServer;
};
