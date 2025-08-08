"use client";
import React from "react";

import { BlockquoteIcon } from "../../icons/Blockquote/index";
import { ElementButton } from "../Button";

export const BlockquoteElementButton = ({ format }: { format: string }) => (
    <ElementButton format={format}>
        <BlockquoteIcon />
    </ElementButton>
);
