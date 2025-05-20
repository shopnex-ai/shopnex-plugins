import type { FieldServerComponent } from "payload";

import { Button, Modal } from "@payloadcms/ui";
import React from "react";

const RefundButton: FieldServerComponent = ({ data, payload }) => {
    return (
        <>
            <Modal slug="refundModal" title="Refund">
                <h1>Refund</h1>
            </Modal>
            <Button buttonStyle="secondary" size="small">
                Refund
            </Button>
        </>
    );
};

export default RefundButton;
