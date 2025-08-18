import { NAVIGATION_PATHS } from './constants';

export const createNavigationItems = (templateName: string, identifier: string) => [
    {
        label: "Email Templates",
        url: NAVIGATION_PATHS.EMAIL_TEMPLATES,
    },
    {
        label: templateName || "Create New",
        url: NAVIGATION_PATHS.EMAIL_TEMPLATE_EDIT(identifier),
    },
];

export const isCreateMode = (identifier: string): boolean => {
    return identifier === "create";
};