/**
 * @module __dfname Allows to get the current file/dir name
 */

import {
    dirname,
    basename
} from "path"
import {
    fileURLToPath
} from 'url'

/**
 * Returns filename

 * Pass import.meta.url as a parameter
 * @param {string} imu import.meta.url
 * @returns {string} filename
 */
const __filename = (imu) => {
    let fname = fileURLToPath(imu).replace(dirname(fileURLToPath(imu)), '')
    return basename(fname)
}
/**
 * Returns dirname
 * 
 * Pass import.meta.url as a parameter
 * @param {string} imu import.meta.url
 * @returns {string} dirname
 */
const __dirname = (imu) => {
    return dirname(fileURLToPath(imu))
}

/**
 * Returns last dir name and filename

 * Pass import.meta.url as a parameter
 * @param {string} imu import.meta.url
 * @returns {string} filename
 */
const dirfilename = (imu) => {
    let fname = fileURLToPath(imu).replace(dirname(fileURLToPath(imu)), '')
    let ldirname = basename(dirname(fileURLToPath(imu)))
    return ldirname+fname
}
export default {
    __filename: __filename,
    __dirname: __dirname,
    dirfilename: dirfilename
}