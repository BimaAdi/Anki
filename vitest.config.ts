import { fileURLToPath } from "node:url";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"#": src,
			"@": src,
		},
	},
	plugins: [viteReact()],
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
	},
});
