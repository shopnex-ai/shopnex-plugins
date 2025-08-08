"use client";
import React from "react";

import { H2Icon } from "../../icons/headings/H2/index";
import { ElementButton } from "../Button";

export const H2ElementButton = ({ format }: { format: string }) => (
    <ElementButton format={format}>
        <H2Icon />
    </ElementButton>
);
