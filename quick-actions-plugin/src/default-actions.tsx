import { Home, LogOut } from "lucide-react";
import { QuickAction } from "./types";

export const defaultActions = ({
    adminRoute,
}: {
    adminRoute: string;
}): QuickAction[] => [
    {
        id: "home",
        name: "Go to Home",
        icon: <Home size={16} />,
        keywords: "go-home",
        link: "/admin",
        priority: 100,
    },
    {
        id: "logout",
        name: "Logout",
        icon: <LogOut size={16} />,
        keywords: "log-out",
        link: "/admin/logout",
        priority: 100,
    },
];
