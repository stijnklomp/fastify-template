jest.mock("@/src/common/logger", () => ({
	logger: {
		error: jest.fn(),
		info: jest.fn(),
	},
}))
