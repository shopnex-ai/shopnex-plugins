"use client";
import React from "react";

import { useLeaf } from "../../../providers/LeafProvider";

export const UnderlineLeaf = () => {
    const { attributes, children } = useLeaf();
    return <u {...attributes}>{children}</u>;
};
