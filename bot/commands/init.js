/**
 * @module init
 */
import init from "../helpers/init.js"

console.log = function() {}
console.error = function() {}

export default {
    run: (msg) => {
        return new Promise((resolve, reject) => {
            try {
                init.run(msg.guild)
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    name: 'init',
    description: "",
    showhelp: false,
    permissions: 2
}