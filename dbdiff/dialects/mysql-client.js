var mysql = require('mysql')
// var url = require('url')
var querystring = require('querystring')
// var parse = require('url-parse')

var connections = {}
// console.log(122222222222222222222222)
class MysqlClient {
  constructor (options) {
    if (1) {
      // var info = parse(options)
      // console.log(options,info,'>>>>>>>>>>>>>>>>>>>>')
      // var auth = info.auth && info.auth.split(':')
      // var more = info.query && querystring.parse(info.query)
      // // get port from url parser, input options, or default to 3306
      var port = options.port ? options.port : '3306'
      options = Object.assign(options)
    }
    this.options = Object.assign({
      user: options.username,
      multipleStatements: true
    }, options)
    this.database = options.database

    var key = `${options.username}:${options.password}@${options.host}:${port}/${options.database}`
    var conn = connections[key]
    if (!conn) {
      conn = connections[key] = mysql.createConnection(this.options)
    }
    this.connection = conn
  }

  dropTables () {
    return this.find(`
      SELECT concat('DROP TABLE IF EXISTS ', table_name, ';') AS fullSQL
      FROM information_schema.tables
      WHERE table_schema = ?;
    `, [this.options.database])
      .then((results) => {
        var sql = results.map((result) => result.fullSQL).join(' ')
        return sql && this.query(sql)
      })
  }

  query (sql, params = []) {
    return new Promise((resolve, reject) => {
      // console.log(sql,'#######################################')
      this.connection.query(sql, params, (err, rows, fields) => {
        err ? reject(err) : resolve({ rows, fields })
      })
    })
  }

  find (sql, params = []) {
    return this.query(sql, params).then((result) => result.rows)
  }

  findOne (sql, params = []) {
    return this.query(sql, params).then((result) => result.rows[0])
  }
}

module.exports = MysqlClient
