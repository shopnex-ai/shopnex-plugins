"use client";

import React from "react";

import { useElement } from "../../providers/ElementProvider";

export const Heading1Element = () => {
    const { attributes, children } = useElement();

    return <h1 {...attributes}>{children}</h1>;
};
