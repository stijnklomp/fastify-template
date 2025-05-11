jest.mock("@/common/logger", () => ({
	logger: {
		error: jest.fn(),
		info: jest.fn(),
	},
}))
