// @ts-check
import { defineConfig } from "astro/config";
import { siteUrl } from "./site.config.js";

const scriptEntryName = (chunk) => {
    const name = chunk.name
        .replace(/\.astro_astro_type_script_index_\d+_lang$/, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();

    return `asset/${name}.[hash].js`;
};

export default defineConfig({
    site: siteUrl,
    compressHTML: "jsx",
    build: {
        assets: "asset",
    },
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
        environments: {
            client: {
                build: {
                    rollupOptions: {
                        output: {
                            entryFileNames: scriptEntryName,
                            chunkFileNames: scriptEntryName,
                        },
                    },
                },
            },
        },
    },
});
