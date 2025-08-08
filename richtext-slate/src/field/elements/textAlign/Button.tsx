"use client";
import React from "react";

import { AlignCenterIcon } from "../../icons/AlignCenter/index";
import { AlignLeftIcon } from "../../icons/AlignLeft/index";
import { AlignRightIcon } from "../../icons/AlignRight/index";
import { ElementButton } from "../Button";

export const TextAlignElementButton = () => (
    <React.Fragment>
        <ElementButton format="left" type="textAlign">
            <AlignLeftIcon />
        </ElementButton>
        <ElementButton format="center" type="textAlign">
            <AlignCenterIcon />
        </ElementButton>
        <ElementButton format="right" type="textAlign">
            <AlignRightIcon />
        </ElementButton>
    </React.Fragment>
);
