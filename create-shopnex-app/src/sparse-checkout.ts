import { SimpleGit, simpleGit } from "simple-git";
import fs from "fs";
import path from "path";

export const sparseCheckout = async (projectPath: string, excludePaths: string[] = []) => {
    const git: SimpleGit = simpleGit(projectPath);

    await git.raw(["sparse-checkout", "init", "--cone"]);

    const sparseFilePath = path.join(projectPath, ".git", "info", "sparse-checkout");

    const sparseRules = ["/*"];

    for (const exclude of excludePaths) {
        sparseRules.push(`!${exclude}/**`);
    }

    fs.writeFileSync(sparseFilePath, sparseRules.join("\n"), "utf-8");

    await git.checkout("HEAD");
};
