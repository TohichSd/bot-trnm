import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { start } from '../src/bot.js'

chai.should()
chai.use(chaiAsPromised)

describe('Discord-side', function () {
  describe('Bot', function () {
    it('Starts bot', async function () {
      return start().should.eventually.equal(true)
    })
  })
})