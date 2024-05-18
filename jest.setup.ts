import { jest } from "@jest/globals"
import * as matchers from "jest-extended"

global.jest = jest
expect.extend(matchers)
