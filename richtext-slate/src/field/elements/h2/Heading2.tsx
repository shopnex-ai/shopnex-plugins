"use client";

import React from "react";

import { useElement } from "../../providers/ElementProvider";

export const Heading2Element = () => {
    const { attributes, children } = useElement();

    return <h2 {...attributes}>{children}</h2>;
};
