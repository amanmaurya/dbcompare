var dbdiff = require('./dbdiff')
var config = require('./config');



console.log(process.argv)
var target= config[process.argv[2]]
target.table= process.argv[3]
target.dialect= 'mysql';
var source= config[process.argv[4]]
source.table= process.argv[5]
source.dialect= 'mysql'
console.log(target,source)
// target={
//         dialect: 'mysql',
//         username: 'newuser',
//         password: 'newuser',
//         database: 'db_taget_sync',
//         host: 'localhost', // host is 'localhost:port' hostname is just 'localhost'
//         port: '3306',
//         table:'slr_pmt_master_d'
//       }
// source={
//         dialect: 'mysql',
//         username: 'newuser',
//         password: 'newuser',
//         database: 'db_sync',
//         host: 'localhost', // host is 'localhost:port' hostname is just 'localhost'
//         port: '3306',
//         table:'slr_order_master_d'

//       }
// node app

var diff = new dbdiff.DbDiff()

  // Compare two databases passing the connection strings
diff.compare(target, source)
  .then(() => {
  	// console.log('1sdds')
    console.log(diff.commands('drop'))
                            setTimeout(function() {
                            process.exit(0)
                        }, 1000);
  })


