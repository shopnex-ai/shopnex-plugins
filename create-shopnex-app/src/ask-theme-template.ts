import inquirer from "inquirer";

export const askThemeTemplate = async (): Promise<"builder" | "custom"> => {
    const { themeType } = await inquirer.prompt([
        {
            name: "themeType",
            type: "list",
            message: "Choose your eCommerce theme setup:",
            choices: [
                {
                    name: "Builder.io (Visual headless CMS integration)",
                    value: "builder",
                },
                {
                    name: "Custom Next.js Template (Pre-built storefront using Next.js)",
                    value: "custom",
                },
            ],
        },
    ]);

    return themeType;
};
