"use client";

import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    KBarResults,
    useMatches,
    KBarOptions,
} from "kbar";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import "./CommandBar.scss";
import { QuickAction, PluginHooks } from "../../types";

function RenderResults() {
    const { results } = useMatches();
    return (
        <div className={"popup-button-list action-button-list"}>
            <KBarResults
                onRender={({ item, active }) => {
                    if (typeof item === "string") {
                        return (
                            <div className="group-title" key={item}>
                                {item}
                            </div>
                        );
                    }

                    return (
                        <div
                            className={`action-button ${active ? "active" : ""}`}
                            key={item.id}
                            role="option"
                            aria-selected={active}
                        >
                            {item.icon && (
                                <span
                                    className="action-icon"
                                    aria-hidden="true"
                                >
                                    {item.icon}
                                </span>
                            )}
                            <span className="action-name">{item.name}</span>
                            {item.subtitle && (
                                <span className="action-subtitle">
                                    {item.subtitle}
                                </span>
                            )}
                        </div>
                    );
                }}
                items={results}
            />
        </div>
    );
}

type CommandBarProps = {
    children: React.ReactNode;
    actions: QuickAction[];
    kbarOptions?: KBarOptions;
    hooks?: PluginHooks;
};

const baseClass = "CommandBar";

export function CommandBar({
    children,
    actions,
    kbarOptions,
    hooks,
}: CommandBarProps) {
    const router = useRouter();

    const handleActionPerform = useCallback(
        async (action: QuickAction) => {
            try {
                if (hooks?.onActionExecute) {
                    await hooks.onActionExecute(action);
                }

                if (action.link) {
                    router.push(action.link);
                }
            } catch (error) {
                console.error("Error executing action:", error);
            }
        },
        [hooks, router]
    );

    const allActions = actions.map((action) => ({
        ...action,
        perform: () => handleActionPerform(action),
    }));

    return (
        <KBarProvider actions={allActions} options={kbarOptions}>
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
