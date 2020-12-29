/**
 * @module textToCodeBlock
 */
/**
 * Returns markdown code block or highlighted line
 * @param {string} text Text to send
 * @param {string} language programming language of message
 * @returns {string}
 */

const textToCodeBlock = (text, language="bash") => {
    if(text.includes('\n'))
        return `\`\`\`${language}\n${text}\`\`\``
    else
        return `\`${text}\``
}

export default textToCodeBlock