"use client";

import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    KBarResults,
    useMatches,
    Action,
} from "kbar";
import { Home, LogOut, MonitorCog, Search } from "lucide-react";

import "./CommandBar.scss"; // your SCSS module
import { useRouter } from "next/navigation";
import { QuickAction } from "../../types";

function RenderResults() {
    const { results } = useMatches();
    return (
        <div className={"popup-button-list action-button-list"}>
            <KBarResults
                onRender={({ item, active }) =>
                    typeof item === "string" ? (
                        <div className="group-title" key={item}>
                            {item}
                        </div>
                    ) : (
                        <div
                            className={`action-button ${active ? "active" : ""}`}
                            key={item.id}
                        >
                            {item.icon}
                            {item.name}
                        </div>
                    )
                }
                items={results}
            />
        </div>
    );
}

type CommandBarProps = {
    children: React.ReactNode;
    actions: QuickAction[];
};

const baseClass = "CommandBar";

export function CommandBar({ children, actions }: CommandBarProps) {
    const router = useRouter();

    const allActions = actions.map((action) => {
        return {
            ...action,
            perform: () => {
                router.push(action.link ?? "/");
            },
        };
    });

    return (
        <KBarProvider actions={allActions} options={{}}>
            <KBarPortal>
                <KBarPositioner className={baseClass}>
                    <KBarAnimator className={`${baseClass}__animator`}>
                        <div className="list-controls__wrapper">
                            <Search />
                            <KBarSearch
                                className={"search-filter__input"}
                                placeholder="Search..."
                            />
                        </div>
                        <RenderResults />
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </KBarProvider>
    );
}
