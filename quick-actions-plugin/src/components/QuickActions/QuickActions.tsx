"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import "./QuickActions.scss";
import { Button, Pill } from "@payloadcms/ui";
import { useKBar } from "kbar";

const baseClass = "quick-actions";

export const QuickActions = ({ position }: { position: "actions" }) => {
    const { query } = useKBar();
    const [shortcutKey, setShortcutKey] = useState("Ctrl");

    useEffect(() => {
        const isMac =
            typeof window !== "undefined" && /Mac/i.test(navigator.platform);
        setShortcutKey(isMac ? "⌘" : "Ctrl");
    }, []);

    return (
        <Button
            className={`${baseClass} position-${position}`}
            buttonStyle="none"
            onClick={() => query.toggle()}
        >
            <div className="quick-actions__wrap">
                <Search size={24} />
                <input
                    type="text"
                    placeholder="Search..."
                    className="search-filter__input"
                />
                <Pill className="shortcut-key">{shortcutKey} + K</Pill>
            </div>
        </Button>
    );
};
