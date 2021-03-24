import pg from 'pg'

const pool = new pg.Pool()

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export {pool}