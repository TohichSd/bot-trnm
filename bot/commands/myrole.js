/**
 * @module status
 */

export default {
    run: (msg, role) => {
        return new Promise((resolve, reject) => {
            try {
                msg.reply("Ваша роль: " + role)
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    name: 'myrole',
    description: "",
    showhelp: false
}