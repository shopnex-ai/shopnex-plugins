"use client";
import React from "react";

import { useLeaf } from "../../../providers/LeafProvider";

export const BoldLeaf = () => {
    const { attributes, children } = useLeaf();
    return <strong {...attributes}>{children}</strong>;
};
