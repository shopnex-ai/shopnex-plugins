"use client";

import React from "react";
import { PasswordField } from "@payloadcms/ui";
import "./ApiToken.scss";

interface ApiTokenProps {
    path: string;
    field: any;
}

export function ApiToken({ path, field }: ApiTokenProps) {
    return (
        <PasswordField
            autoComplete="new-password"
            field={{
                name: "password",
                label: field.label,
            }}
            indexPath=""
            parentPath=""
            parentSchemaPath=""
            path={path}
            schemaPath="password"
        />
    );
}
