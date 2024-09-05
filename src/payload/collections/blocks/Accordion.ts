import type { Block } from "payload/types";

import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Accordion: Block = {
    slug: "accordion",
    fields: [
        {
            name: "heading",
            type: "text",
        },
        {
            name: "content",
            type: "richText",
            editor: lexicalEditor(),
            required: true,
        },
    ],
};