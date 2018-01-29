const lucifyDeployConfig = require('lucify-deploy-config').default;

const opts = {
  bucket: (env) => {
    if (env === 'production') {
      return 'lucify-mesaatio';
    }
    return null;
  },
  baseUrl: (env) => {
    if (env === 'production') {
      return 'http://data.mesaatio.fi/';
    }
    return null;
  },
  publicPath: (env) => {
    if (env === 'production') {
      return '/syrjassa/';
    }
    return '/';
  },
};

module.exports = lucifyDeployConfig(null, opts);
