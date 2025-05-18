"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const GlobalRedirectClient = ({ to }: { to: string }) => {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            router.push(to);
        }, 0);
    }, [to, router]);

    return null;
};
