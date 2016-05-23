
module.exports = {

  clientConfig: {
    host: '',
    port: 443
  },

  serverConfig: {
    port: process.env.PORT || process.env.NODE_PORT || 3000,
    LMV_CONSUMERKEY: process.env.LMV_CONSUMERKEY,
    LMV_CONSUMERSECRET: process.env.LMV_CONSUMERSECRET
  }
}
