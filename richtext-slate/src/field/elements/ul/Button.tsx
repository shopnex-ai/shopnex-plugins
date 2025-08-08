"use client";
import React from "react";

import { ULIcon } from "../../icons/UnorderedList/index";
import { ListButton } from "../ListButton";

export const ULElementButton = ({ format }: { format: string }) => (
    <ListButton format={format}>
        <ULIcon />
    </ListButton>
);
