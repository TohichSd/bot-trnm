/**
 * @module delAdmin
 */

import userPermissions from "../helpers/userPermissions.js"

// console.log = function() {}
// console.error = function() {}

/**
 * Присвоить упомянотому участнику роль 1
 * @param {object} msg message
 */
function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            msg.mentions.members.forEach((member) => {
                userPermissions.set(msg.guild.id, 0, member.id)
                    .then(() => msg.reply("Теперь " + member.displayName + " не имеет прав создавать турниры."))
                    .catch(err => console.error(err))
            })
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

export default {
    name: "не-модер",
    run: main,
    description: "Даёт участнику базовые права",
    permissions: 2
}