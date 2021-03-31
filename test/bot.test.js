// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from "regenerator-runtime"
import {start} from '../bot/bot.js'

describe("Bot", (() => {
    it("Starts bot", () => expect(start()).resolves.toBe(true))
}))