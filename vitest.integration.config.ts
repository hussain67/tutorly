import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["app/actions/__tests__/integration/*.test.ts", "app/**/*.integration.test.ts"]
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "app")
		}
	}
});
