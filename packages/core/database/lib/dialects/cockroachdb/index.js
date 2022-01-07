'use strict';

const errors = require('../../errors');
const { Dialect } = require('../dialect');
const CockroachdbSchemaInspector = require('./schema-inspector');

class CockroachDialect extends Dialect {
  constructor(db) {
    super(db);
    console.log('CockroachDialect');

    this.schemaInspector = new CockroachdbSchemaInspector(db);
  }

  useReturning() {
    return true;
  }

  initialize() {
    this.db.connection.client.driver.types.setTypeParser(1700, 'text', parseFloat);
  }

  usesForeignKeys() {
    return true;
  }

  getSqlType(type) {
    switch (type) {
      case 'timestamp': {
        return 'datetime';
      }
      default: {
        return type;
      }
    }
  }

  transformErrors(error) {
    switch (error.code) {
      case '23502': {
        throw new errors.NotNullConstraint({ column: error.column });
      }
      default: {
        super.transformErrors(error);
      }
    }
  }
}

module.exports = CockroachDialect;
