import {
    DefaultNodeTypes,
    SanitizedServerEditorConfig,
    TypedEditorState,
    getEnabledNodes,
} from "@payloadcms/richtext-lexical";
import { UploadNode } from "@payloadcms/richtext-lexical/client";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $getSelection, type SerializedLexicalNode } from "lexical";

export const customConvertHTMLToLexical = async <
    TNodeTypes extends SerializedLexicalNode = DefaultNodeTypes,
>({
    editorConfig,
    html,
    JSDOM,
    uploadImage, // Function to upload image
}: {
    editorConfig: SanitizedServerEditorConfig;
    html: string;
    JSDOM: new (html: string) => {
        window: {
            document: Document;
        };
    };
    uploadImage: (src: string) => Promise<any>; // Upload function returns the uploaded image object
}): Promise<TypedEditorState<TNodeTypes>> => {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const images = Array.from(document.querySelectorAll("img"));

    // Store image replacement data
    const imageReplacements = new Map<string, any>();

    // Upload images and store their Payload data
    await Promise.all(
        images.map(async (img) => {
            if (img.src) {
                const uploadedImage = await uploadImage(img.src);
                imageReplacements.set(img.src, uploadedImage);
            }
        }),
    );

    // Create a headless editor
    const headlessEditor = createHeadlessEditor({
        nodes: getEnabledNodes({ editorConfig }),
    });

    // Convert updated HTML into Lexical nodes
    headlessEditor.update(
        () => {
            const nodes = $generateNodesFromDOM(headlessEditor, document);

            // Replace <img> nodes with custom upload nodes
            nodes.forEach((node, index) => {
                if (node.getType() === "image") {
                    const src = (node as any).__src; // Get original image src
                    const uploadedImage = imageReplacements.get(src);

                    if (uploadedImage) {
                        // Replace image node with upload node
                        // const uploadNode = new UploadNode(uploadedImage);
                        // nodes[index] = uploadNode;
                    }
                }
            });

            $getRoot().select();
            const selection = $getSelection();
            if (selection === null) {
                throw new Error("Selection is null");
            }
            selection.insertNodes(nodes);
        },
        { discrete: true },
    );

    // Return the Lexical JSON state
    return headlessEditor.getEditorState().toJSON() as TypedEditorState<TNodeTypes>;
};
