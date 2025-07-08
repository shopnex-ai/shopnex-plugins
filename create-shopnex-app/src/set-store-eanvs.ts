import fs from "fs";
import path from "path";

export const setStoreEnvs = (
    environments: { [key: string]: string },
    projectPath: string
) => {
    const envFilePath = path.resolve(projectPath, ".env");
    const envContent = Object.entries(environments)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    fs.writeFileSync(envFilePath, envContent, "utf8");
};
