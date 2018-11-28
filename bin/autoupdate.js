"use strict"
const app = require('../server/server');
const ds = app.datasources.mongoDs;

const models = [
  'wallet',
  'coins',
  'balance',
  'User',
  'AccessToken',
  'ACL',
  'RoleMapping',
  'Role'
];

ds.autoupdate(models, err => {
  if (err) throw err;
  console.log('models synced!');
  ds.disconnect();
  process.exit();
});
