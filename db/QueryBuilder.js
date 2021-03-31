class QueryBuilder {
    constructor() {
        this.queryParams = []
    }

    /**
     * @param {string} tableName
     * @param {string[]} columns - SELECT <columns> FROM ...
     * @param {object} where - WHERE <where>
     * @return {Object}
     */
    select(tableName, columns, where = {}) {
        this.type = 'SELECT'
        this.queryParams = []
        this.queryString = 'SELECT '
        for (let i = 0; i < columns.length; i++) {
            this.queryString += columns[i]
            if (i !== columns.length - 1) this.queryString += ', '
        }
        this.queryString += ` FROM ${tableName}`
        let iter = 1
        if (Object.keys(where).length !== 0)
            this.queryString += ' WHERE '
        Object.keys(where).forEach(key => {
            this.queryString += `${key} = $${iter}`
            if (iter !== Object.keys(where).length) this.queryString += ', '
            this.queryParams.push(where[key])
            iter++
        })
    }

    /**
     * @param {string} tableName
     * @param {string[]} columns
     * @param {any[]} values
     */
    insert(tableName, columns, values) {
        if (columns.length !== values.length) throw new Error('QueryBuilder: Parameters do not match the columns')
        this.type = 'INSERT'
        this.queryParams = []
        this.queryString = `INSERT INTO ${tableName} (`
        for (let i = 0; i < columns.length; i++) {
            this.queryString += columns[i]
            if (i !== columns.length - 1) this.queryString += ', '
        }
        this.queryString += ') VALUES ('
        for (let i = 0; i < columns.length; i++) {
            this.queryString += `$${i+1}`
            if (i !== columns.length - 1) this.queryString += ', '
            this.queryParams.push(values[i])
        }
        this.queryString += ')'
    }

    /**
     * @param {string} tableName
     * @param {string[]} columns
     * @param {any[]} values
     * @param {object} where
     */
    update(tableName, columns, values, where = {}) {
        if (columns.length !== values.length) throw new Error('QueryBuilder: Parameters do not match the columns')
        this.queryParams = []
        this.type = 'UPDATE'
        this.queryString = `UPDATE ${tableName} SET `
        for (let i = 0; i < columns.length; i++) {
            this.queryString += `${columns[i]} = $${i + 1}`
            this.queryParams.push(values[i])
            if (i !== columns.length - 1) this.queryString += ', '
        }
        let iter = columns.length + 1
        if (Object.keys(where).length !== 0)
            this.queryString += ' WHERE '
        Object.keys(where).forEach(key => {
            this.queryString += `${key} = $${iter}`
            if (iter !== Object.keys(where).length + columns.length) this.queryString += ', '
            this.queryParams.push(where[key])
            iter++
        })
    }
}

export default QueryBuilder