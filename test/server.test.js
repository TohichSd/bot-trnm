// Тестирование базовой работы сервера
import supertest from 'supertest'
// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from "regenerator-runtime"
import app from "../server/server";

const request = supertest(app)

describe("Testing server", () => {
    it("Should return message pass", async done => {
        const response = await request.get('/ping')
        expect(response.body.status).toBe("pass")
        done()
    })
})