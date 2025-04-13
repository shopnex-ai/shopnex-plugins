"use client";

import React from "react";
import { PasswordField } from "@payloadcms/ui";
import "./ApiToken.scss";

interface ApiTokenProps {
    path: string;
    readOnly?: boolean;
    label?: string;
}

export function ApiToken({ path, readOnly, label = "API Token" }: ApiTokenProps) {
    return (
        <PasswordField
            autoComplete="new-password"
            field={{
                name: "password",
                label: "API Token",
            }}
            indexPath=""
            parentPath=""
            parentSchemaPath=""
            path={path}
            schemaPath="password"
        />
    );
}
