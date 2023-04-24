const pg = require("pg");

var config = {
    user: 'wxaqlnia', //env var: PGUSER
    database: 'wxaqlnia', //env var: PGDATABASE
    password: 'uFHFn-v0TXKCtqgSO0I5q1AAk-Jt1Stf', //env var: PGPASSWORD
    host: 'hattie.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

pool.connect();
module.exports = pool;