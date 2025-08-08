import { Collection } from "@shopnex/types";
import { WooTag } from "../types";

export function mapWooTag(
    tag: WooTag
): Omit<Collection, "id" | "updatedAt" | "createdAt"> {
    return {
        title: tag.name,
        handle: tag.slug,
        description: tag.description
            ? {
                  root: {
                      type: "paragraph",
                      children: [
                          {
                              type: "text",
                              text: tag.description,
                              version: 1,
                          },
                      ],
                      direction: null,
                      format: "",
                      indent: 0,
                      version: 1,
                  },
              }
            : null,
        products: undefined,
    };
}
