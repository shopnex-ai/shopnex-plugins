"use client";
import React from "react";

import { H6Icon } from "../../icons/headings/H6/index";
import { ElementButton } from "../Button";

export const H6ElementButton = ({ format }: { format: string }) => (
    <ElementButton format={format}>
        <H6Icon />
    </ElementButton>
);
