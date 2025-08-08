"use client";
import React from "react";

import { StrikethroughIcon } from "../../icons/Strikethrough/index";
import { LeafButton } from "../Button";

export const StrikethroughLeafButton = () => (
    <LeafButton format="strikethrough">
        <StrikethroughIcon />
    </LeafButton>
);
