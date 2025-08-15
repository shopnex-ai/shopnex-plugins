import { useCallback, useRef } from 'react';
import { PayloadService } from '../services/payload-service';
import { SaveEventManager } from '../events/save-events';
import { SaveOutput } from '../types/email-template.types';

export const useTemplateSave = (serverURL: string, identifier: string) => {
    const payloadService = useRef(new PayloadService(serverURL));
    const saveEventManager = useRef(new SaveEventManager());

    const handleSave = useCallback(async (output: SaveOutput) => {
        try {
            if (!saveEventManager.current.validateSaveData(output)) {
                return;
            }

            const savedData = await payloadService.current.saveTemplate(identifier, {
                name: output.name,
                html: output.html,
                json: output.json,
            });

            await saveEventManager.current.handleSaveSuccess(savedData);
        } catch (error) {
            await saveEventManager.current.handleSaveError(error as Error);
        }
    }, [identifier]);

    const setSaveSuccessHandler = useCallback((handler: (data: any) => void) => {
        saveEventManager.current.setSaveSuccessHandler(handler);
    }, []);

    const setSaveErrorHandler = useCallback((handler: (error: Error) => void) => {
        saveEventManager.current.setSaveErrorHandler(handler);
    }, []);

    return {
        handleSave,
        setSaveSuccessHandler,
        setSaveErrorHandler
    };
};