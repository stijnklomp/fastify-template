jest.mock("@/common/logger", () => ({
	...jest.requireActual<typeof import("@/common/logger")>("@/common/logger"),
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
	},
}))
