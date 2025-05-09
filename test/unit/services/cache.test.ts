import cacheAdapter from "@/src/common/cache"
import cacheService from "@/src/services/cache"

const mockedCacheAdapterGetPrimary = cacheAdapter.getPrimary as jest.Mock<
	ReturnType<typeof cacheAdapter.getPrimary>
>

jest.mock("@/common/cache", () => ({
	getPrimary: jest.fn(),
}))

describe("Cache service", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("getClient", () => {
		it("should get cache client", () => {
			cacheService.getClient()
			expect(mockedCacheAdapterGetPrimary).toHaveBeenCalled()
		})
	})

	const mockedValue = {
		test: "value",
	}
	const mock = jest.fn().mockReturnValue(mockedValue)

	describe("set", () => {
		it("should set in cache", async () => {
			mockedCacheAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					set: mock,
				}),
			)
			const result = await cacheService.set(
				Object.keys(mockedValue)[0],
				Object.values(mockedValue)[0],
			)

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})

	describe("get", () => {
		it("should get from cache", async () => {
			mockedCacheAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					get: mock,
				}),
			)
			const result = await cacheService.get(Object.keys(mockedValue)[0])

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})

	describe("del", () => {
		it("should delete from cache", async () => {
			mockedCacheAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					del: mock,
				}),
			)
			const result = await cacheService.del(Object.keys(mockedValue)[0])

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})
})
