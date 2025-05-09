import { simpleGit } from "simple-git";

export const checkoutBranch = async (projectPath: string, branch: string) => {
    const git = simpleGit(projectPath);
    await git.checkout(branch);
};
