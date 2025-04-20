import inquirer from "inquirer";

export const askProjectName = async (projectName?: string): Promise<string> => {
    if (projectName) return projectName;

    const { projectName: name } = await inquirer.prompt([
        {
            name: "projectName",
            type: "input",
            message: "Enter your project name:",
            validate: (input: string) => {
                if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
                return "Project name may only include letters, numbers, underscores and dashes.";
            },
        },
    ]);

    return name;
};

export const askDatabaseType = async (): Promise<"sqlite" | "postgres" | "mongo"> => {
    const { dbType } = await inquirer.prompt([
        {
            name: "dbType",
            type: "list",
            message: "Select your database type:",
            choices: [
                { name: "PostgreSQL (Production-ready relational database)", value: "postgres" },
                { name: "SQLite (For local development/testing)", value: "sqlite" },
                { name: "MongoDB (Production-ready NoSQL database)", value: "mongo" },
            ],
        },
    ]);

    return dbType;
};

export const askProjectDetails = async (
    projectName?: string,
): Promise<{
    projectName: string;
    dbType: "sqlite" | "postgres" | "mongo";
}> => {
    const name = await askProjectName(projectName);
    const dbType = await askDatabaseType();
    return { projectName: name, dbType };
};