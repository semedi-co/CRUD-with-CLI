// Update with your config settings.
require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password : process.env.MYSQL_PASSWORD,
      database : process.env.MYSQL_NAME,
    },
    migrations: {
      directory : "./database/migrations"
    }
  },

};
