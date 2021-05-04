import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiHttp from 'chai-http'
import app from "../src/server/server.js"

chai.should()
chai.use(chaiAsPromised)
chai.use(chaiHttp)

describe("Server", function() {
  it('Страница пинга', function() {
    chai.request(app)
      .get('/ping')
      .end(((err, res) => {
        err.should.equal(null)
        res.should.equal('pass')
      }))
  })
  it('Проверка ошибки 404', function() {
    chai.request(app)
      .get('/non-existed-page')
      .end((err, res) => {
        res.should.have.status(404)
      })
  })
})