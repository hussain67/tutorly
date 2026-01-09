// vitest.setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mocking next/navigation useRouter
vi.mock("next/navigation", async importActual => {
	const actual = await importActual<typeof import("next/navigation")>();
	return {
		...actual,
		useRouter: vi.fn(() => ({
			push: vi.fn(),
			replace: vi.fn(),
			refresh: vi.fn(),
			back: vi.fn()
		}))
	};
});
