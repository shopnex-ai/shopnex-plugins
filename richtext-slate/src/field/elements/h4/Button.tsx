"use client";
import React from "react";

import { H4Icon } from "../../icons/headings/H4/index";
import { ElementButton } from "../Button";

export const H4ElementButton = ({ format }: { format: string }) => (
    <ElementButton format={format}>
        <H4Icon />
    </ElementButton>
);
