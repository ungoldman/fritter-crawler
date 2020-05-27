function stripDatProtocol (link) {
  return link.replace(/^dat:\/\//, '')
}

function stripTrailingSlash (link) {
  return link.replace(/\/$/, '')
}

function stripTrailingJson (link) {
  return link.replace(/\.json$/, '')
}

function getDatId (url) {
  return stripTrailingJson(stripDatProtocol(stripTrailingSlash(url)))
}

module.exports = {
  stripDatProtocol,
  stripTrailingSlash,
  stripTrailingJson,
  getDatId
}
