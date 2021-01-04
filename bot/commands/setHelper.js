/**
 * @module setAdmin
 */

import userPermissions from "../helpers/userPermissions.js"

console.log = function() {}
console.error = function() {}
/**
 * Присвоить упомянотому участнику роль 1
 * @param {object} msg message
 */
function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            msg.mentions.members.forEach((member) => {
                userPermissions.set(msg.guild.id, 1, member.id)
                    .catch(err => console.error(err))
            })
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

export default {
    name: "помощник",
    run: main,
    description: "Дать участнику права управлять ботом",
    permissions: 2
}