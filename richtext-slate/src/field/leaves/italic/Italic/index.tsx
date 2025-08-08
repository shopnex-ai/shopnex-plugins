"use client";
import React from "react";

import { useLeaf } from "../../../providers/LeafProvider";

export const ItalicLeaf = () => {
    const { attributes, children } = useLeaf();
    return <em {...attributes}>{children}</em>;
};
