import { useEffect } from "react";

const useThemeEnforcer = (preferredTheme: string) => {
    useEffect(() => {
        const htmlEl = document.documentElement;

        const enforceTheme = () => {
            if (htmlEl.getAttribute("data-theme") !== preferredTheme) {
                htmlEl.setAttribute("data-theme", preferredTheme);
            }
        };

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                    enforceTheme();
                }
            }
        });

        observer.observe(htmlEl, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        // Initial enforcement
        enforceTheme();

        return () => observer.disconnect();
    }, [preferredTheme]);
};

export default useThemeEnforcer;
