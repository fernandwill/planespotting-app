// server/db.js

const { Pool } = require("pg")

// Free to customize based on setup
const pool = new Pool ({
    user: "postgres",
    host: "localhost",
    database: "photos",
    password: "AirbusA330941",
    port: 5432,
})

module.exports = pool