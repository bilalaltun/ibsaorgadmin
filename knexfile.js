require('dotenv').config();

module.exports = {
  development: {
    client: 'mssql',
    connection: {
      host: '31.186.13.154',
      port: 52332,
      user: 'manager',
      password: 'FidTbp5Rmv3sh8',
      database: 'admin_ibsa',
      options: {
        trustServerCertificate: true,
        encrypt: true,
      },
    },
    migrations: {
      directory: './migrations',
    },
  },
};
