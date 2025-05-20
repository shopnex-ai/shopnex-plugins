export const sleep = (ms = 200) =>
    new Promise((resolve) => setTimeout(resolve, ms));
