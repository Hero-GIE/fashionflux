const Publitio = require("publitio_js_sdk").default;

const publitio = new Publitio(
  process.env.PUBLITIO_API_KEY,
  process.env.PUBLITIO_API_SECRET
);

module.exports = publitio;
