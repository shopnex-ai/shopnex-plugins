"use client";
import React from "react";

import { useLeaf } from "../../../providers/LeafProvider";

export const CodeLeaf = () => {
    const { attributes, children } = useLeaf();
    return <code {...attributes}>{children}</code>;
};
