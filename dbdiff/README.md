# dbdiff

Compares two databases and prints SQL commands to modify the first one in order to match the second one.

**It does NOT execute the statements**. It only prints the statements.

It supports MySQL.

# Installing

Install globally with `npm`

```
npm install dbsync -g
```

# CLI Usage

```
dbdiff \
  -l safe
  dialect://user:pass@host[:port]/dbname1 \
  dialect://user:pass@host[:port]/dbname2
```

Where `dialect` will be `mysql`. The first database url denotes the target, the second the source, the sql queries will allow target to be updated to source state.

The flag `-l` or `--level` indicates the safety of the SQL. Allowed values are `safe`, `warn` and `drop`

# Safety level

Some statements may fail or may produce data loss depending on the data stored in the target database.

- When the `safe` level is specified, only SQL statements that are guaranteed to preserve existing data will be printed. Any other command will be commented out.
- When the `warn` level is specified also SQL statements that *may* fail because of existing data will be printed. These commands are for example: changes in data types or dropping a `NOT NULL` constraint.
- When the `drop` level is specified all SQL statements are printed and this may contain `DROP COLUMN` or `DROP TABLE` statements.

Dropping a sequence or dropping an index is considered safe.


# Usage as a library

You can use `dbdiff` as a library:



You can pass connection strings such as `mysql://user:pass@host:5432/dbname1` or objects to these methods. For example:

```javascript
dbdiff.describeDatabase({
  dialect: 'mysql', // use `mysql` for mysql
  username: 'user',
  password: 'pass',
  database: 'dbname1',
  host: 'localhost',
  dialectOptions: {
    ssl: false
  }
})
.then((schema) => {
  // ...
})
```

# Example of `.describeDatabase()` output

```json
{
  "tables": [
    {
      "name": "users",
      "schema": "public",
      "indexes": [],
      "constraints": [
        {
          "name": "email_unique",
          "schema": "public",
          "type": "unique",
          "columns": [
            "email"
          ]
        },
        {
          "name": "users_pk",
          "schema": "public",
          "type": "primary",
          "columns": [
            "id"
          ]
        }
      ],
      "columns": [
        {
          "name": "id",
          "nullable": false,
          "default_value": "nextval('users_id_seq'::regclass)",
          "type": "integer"
        },
        {
          "name": "email",
          "nullable": true,
          "default_value": null,
          "type": "character varying(255)"
        }
      ]
    },
    {
      "name": "items",
      "schema": "public",
      "indexes": [],
      "constraints": [
        {
          "name": "items_fk",
          "schema": "public",
          "type": "foreign",
          "columns": [
            "user_id"
          ],
          "referenced_table": "users",
          "referenced_columns": [
            "id"
          ]
        }
      ],
      "columns": [
        {
          "name": "id",
          "nullable": false,
          "default_value": "nextval('items_id_seq'::regclass)",
          "type": "integer"
        },
        {
          "name": "name",
          "nullable": true,
          "default_value": null,
          "type": "character varying(255)"
        },
        {
          "name": "user_id",
          "nullable": true,
          "default_value": null,
          "type": "bigint"
        }
      ]
    }
  ],
  "sequences": [
    {
      "data_type": "bigint",
      "numeric_precision": 64,
      "numeric_precision_radix": 2,
      "numeric_scale": 0,
      "start_value": "1",
      "minimum_value": "1",
      "maximum_value": "9223372036854775807",
      "increment": "1",
      "schema": "public",
      "name": "users_id_seq",
      "cycle": false
    },
    {
      "data_type": "bigint",
      "numeric_precision": 64,
      "numeric_precision_radix": 2,
      "numeric_scale": 0,
      "start_value": "1",
      "minimum_value": "1",
      "maximum_value": "9223372036854775807",
      "increment": "1",
      "schema": "public",
      "name": "items_id_seq",
      "cycle": false
    }
  ]
}
```
