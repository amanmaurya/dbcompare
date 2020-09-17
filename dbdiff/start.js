var dbdiff = require('/dbdiff')

dbdiff.describeDatabase(connString)
  .then((schema) => {
    // schema is a JSON-serializable object representing the database structure
  })

