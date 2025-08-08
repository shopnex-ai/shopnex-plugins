"use client";
import React from "react";

import { OLIcon } from "../../icons/OrderedList/index";
import { ListButton } from "../ListButton";

export const OLElementButton = ({ format }: { format: string }) => (
    <ListButton format={format}>
        <OLIcon />
    </ListButton>
);
