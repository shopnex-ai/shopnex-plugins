"use client";

import type { TextFieldClientComponent } from "payload";

import { TextInput, useField } from "@payloadcms/ui";
// import { EyeClosedIcon, EyeIcon } from 'lucide-react'
import React, { useState } from "react";

export const PasswordField: TextFieldClientComponent = ({ field, path }) => {
    const { setValue, value } = useField<string>({ path });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="password-field">
            {/* <TextInput
        className="password-input"
        onChange={(e) => setValue(e.target.value)}
        placeholder={field.label as string}
        value={value || ''}
      /> */}
            <button
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
            >
                {/* {showPassword ? <EyeIcon /> : <EyeClosedIcon />} */}
            </button>
        </div>
    );
};
