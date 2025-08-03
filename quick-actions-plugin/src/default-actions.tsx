import { Home, LogOut } from "lucide-react";
import { QuickAction } from "./types";
import React from "react";

export const defaultActions = ({
    adminRoute,
}: {
    adminRoute: string;
}): QuickAction[] => [
    {
        id: "home",
        name: "Go to Home",
        icon: <Home size={16} />,
        keywords: "home,dashboard,overview",
        link: "/admin",
        priority: 100,
    },
    {
        id: "logout",
        name: "Logout",
        icon: <LogOut size={16} />,
        keywords: "logout,signout,exit",
        link: "/admin/logout",
        priority: 100,
    },
];
