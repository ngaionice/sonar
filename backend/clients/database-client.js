import pgpUninitialized from "pg-promise";

/**
 * Returns a promise that, if resolved, contains a database client that has established a connection with the database.
 *
 * @param config Options to be used for pg-promise initialization.
 * @param {boolean} config.log True to print out every executed query in the console.
 */
async function getDatabaseClient(config = { log: false }) {
  try {
    const query = (e) => console.log("QUERY:", e.query);
    const options = config.log ? { query } : {};

    const pgp = pgpUninitialized(options);
    pgp.pg.types.setTypeParser(20, parseInt);
    const client = await pgp({
      connectionString: process.env.DB_URI.replace(
        "$env:appdata",
        process.env.APPDATA
      ),
    });

    console.log("Connected to database.");
    return client;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default getDatabaseClient;
