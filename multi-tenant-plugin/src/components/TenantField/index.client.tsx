"use client";

import type { RelationshipFieldClientProps } from "payload";

import { RelationshipField, useField } from "@payloadcms/ui";
import React from "react";

import { useTenantSelection } from "../../providers/TenantSelectionProvider/index.client";
import "./index.scss";

const baseClass = "tenantField";

type Props = {
    debug?: boolean;
    unique?: boolean;
} & RelationshipFieldClientProps;

export const TenantField = (args: Props) => {
    const { debug, path, unique } = args;
    const { value, setValue } = useField<number | string>({ path });
    const { options, selectedTenantID, setPreventRefreshOnChange, setTenant } =
        useTenantSelection();

    const hasSetValueRef = React.useRef(false);

    const lastSetValue = React.useRef<number | string | null>(null);

    React.useEffect(() => {
        console.log("🚨 Effect triggered", { value, selectedTenantID, last: lastSetValue.current });

        if (!hasSetValueRef.current) {
            const initialValue =
                value && value !== selectedTenantID ? value : selectedTenantID || options[0]?.value;
            console.log("🌱 First load - setTenant", initialValue);

            setTenant({ id: initialValue, refresh: unique });
            hasSetValueRef.current = true;
            lastSetValue.current = initialValue;
        } else if (
            selectedTenantID &&
            selectedTenantID !== value &&
            selectedTenantID !== lastSetValue.current
        ) {
            console.log("🔄 Updating value via setValue to match selectedTenantID");
            setValue(selectedTenantID);
            lastSetValue.current = selectedTenantID;
        }
    }, [value, selectedTenantID, setTenant, setValue, options, unique]);

    React.useEffect(() => {
        if (!unique) {
            setPreventRefreshOnChange(true);
        }
        return () => {
            setPreventRefreshOnChange(false);
        };
    }, [unique, setPreventRefreshOnChange]);

    if (debug) {
        return (
            <div className={baseClass}>
                <div className={`${baseClass}__wrapper`}>
                    <RelationshipField {...args} />
                </div>
                <div className={`${baseClass}__hr`} />
            </div>
        );
    }

    return null;
};
