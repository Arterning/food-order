const path = require('path');

module.exports = {
  apps: [
    {
      name: 'food-order-h5',
      script: path.resolve(__dirname, 'node_modules/serve/build/main.js'),
      args: 'dist/build/h5',
      cwd: __dirname,
      watch: false,
      autorestart: true,
    },
  ],
};
