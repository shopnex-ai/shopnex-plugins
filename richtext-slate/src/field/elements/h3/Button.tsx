"use client";
import React from "react";

import { H3Icon } from "../../icons/headings/H3/index";
import { ElementButton } from "../Button";

export const H3ElementButton = ({ format }: { format: string }) => (
    <ElementButton format={format}>
        <H3Icon />
    </ElementButton>
);
