import React from 'react';
import { RenderTitle, Button } from "@payloadcms/ui";

interface EmailTemplateHeaderProps {
    templateName: string;
    onSave: () => void;
}

export const EmailTemplateHeader: React.FC<EmailTemplateHeaderProps> = ({
    templateName,
    onSave
}) => {
    return (
        <div className="header">
            <RenderTitle title={templateName || "Create New"} />
            <Button onClick={onSave}>Save</Button>
        </div>
    );
};