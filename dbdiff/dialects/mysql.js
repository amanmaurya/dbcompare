var dialects = require('./')
var pync = require('pync')
var MysqlClient = require('./mysql-client')

class MySQLDialect {
  _quote (str) {
    return '`' + str + '`'
  }

  describeDatabase (options) {
    var schema = { dialect: 'mysql', sequences: [] }
    var client = new MysqlClient(options)
    // console.log(options,'###################')and TABLE_TYPE="BASE TABLE"
    var sptable = options.table && options.table
    if(sptable){
     var st=` and table_name in('${sptable}') `
    }else{
     var st=''
    }
    return client.query(`select TABLE_NAME name from information_schema.tables where TABLE_SCHEMA=database() and TABLE_TYPE="BASE TABLE" ${st} `)
      .then((result) => {
        var field = result.fields[0].name
        var rows = result.rows
        var tables = rows.map((row) => row[field])
        // console.log(result,'##########$$$$$$$$$$$$$$$$$')
        return pync.map(tables, (table) => {
          var t = {
            name: table,
            constraints: [],
            indexes: []
          }
          return client.find(`select * from information_schema.columns where table_name='${table}' and table_schema = DATABASE()`)
            .then((columns) => {
              t.columns = columns.map((column) => ({
                name: column.COLUMN_NAME,
                nullable: column.IS_NULLABLE ,
                default_value: column.COLUMN_DEFAULT,
                type: column.COLUMN_TYPE,
                extra: column.EXTRA,
                CHARACTER_SET_NAME:column.CHARACTER_SET_NAME,
                COLLATION_NAME:column.COLLATION_NAME
              }))
              return t
            })
        })
      })
      .then((tables) => {
        schema.tables = tables
        return client.find(`SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='${client.database}'  ${st} `)
      })
      .then((constraints) => {
        constraints.forEach((constraint) => {
          var name = constraint['CONSTRAINT_NAME']
          var table = schema.tables.find((table) => table.name === constraint['TABLE_NAME'])
          var info = table.constraints.find((constr) => constr.name === name)
          var foreign = !!constraint['REFERENCED_TABLE_NAME']
          if (!info) {
            info = {
              name,
              type: foreign ? 'foreign' : (name === 'PRIMARY' ? 'primary' : 'unique'),
              columns: []
            }
            if (foreign) info.referenced_columns = []
            table.constraints.push(info)
          }
          if (foreign) {
            info.referenced_table = constraint['REFERENCED_TABLE_NAME']
            info.referenced_columns.push(constraint['REFERENCED_COLUMN_NAME'])
          }
          info.columns.push(constraint['COLUMN_NAME'])
        })
        return pync.series(schema.tables, (table) => (
          client.find(`SHOW INDEXES IN ${this._quote(table.name)}`)
            .then((indexes) => {
              indexes
                .filter((index) => !table.constraints.find((constraint) => constraint.name === index.Key_name))
                .forEach((index) => {
                  var info = table.indexes.find((indx) => index.Key_name === indx.name)
                  if (!info) {
                    info = {
                      name: index.Key_name,
                      type: index.Index_type,
                      columns: []
                    }
                    table.indexes.push(info)
                  }
                  info.columns.push(index.Column_name)
                })
            })
        ))
      })
      .then(() => schema)
  }
}

dialects.register('mysql', MySQLDialect)
