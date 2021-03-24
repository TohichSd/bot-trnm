// Тестирование базовой работы сервера
import supertest from 'supertest'
import app from "../server/server";

const request = supertest(app)

describe("Testing server", () => {
    it("Should return message pass", async done => {
        const response = await request.get('/ping')
        expect(response.body.status).toBe("pass")
        done()
    })
})