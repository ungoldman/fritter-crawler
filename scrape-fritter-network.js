#!/usr/bin/env node

var discovery = require('hyperdiscovery')
var ram = require('random-access-memory')
var hyperdrive = require('hyperdrive')
var pkg = require('./package.json')
var datDns = require('dat-dns')()
var mkdirp = require('mkdirp')
var isUrl = require('is-url')
var PQ = require('p-queue')
var path = require('path')
var fs = require('fs')

var users = {}

var profile = 'dat://fritter-ungoldman.hashbase.io'
var concurrency = 10

var q = new PQ({ concurrency })

var jobId = 0

mkdirp.sync('./fritters')
mkdirp.sync('./not-fritters')

var startup = [
  `fritter crawler ${pkg.version}`,
  `patient zero: ${profile}`,
  `concurrency: ${concurrency}\n`
]

startup.forEach(msg => console.log(msg))

q.add(worker(profile))
  .catch(err => console.error('ERROR', 'Promise Rejection', err))

q.onIdle().then(() => {
  console.log(`All done. Total jobs processed: ${jobId}`)
  process.exit(0)
})

function worker (url) {
  var id = jobId++

  return () => {
    var key = stripTrailingSlash(url)

    console.log(
      `job: ${id}`,
      `link: ${key}`,
      `queue: ${q.size}`,
      `pending: ${q.pending}`
    )

    return new Promise((resolve, reject) => {
      // wait for 30 seconds before timeout
      var timeout = setTimeout(() => {
        console.log(`job: ${id}`, 'TIMEOUT', key)
        resolve()
      }, 30 * 1000)

      addLink(key, users, (err, profile) => {
        clearTimeout(timeout)

        if (err) {
          console.error(`job: ${id}`, 'ERROR', key, err)
          return resolve()
        }

        if (!profile || !profile.follows) return resolve()

        profile.follows.forEach(follow => {
          if (stripTrailingSlash(follow.url) in users) return
          q.add(worker(follow.url))
        })

        resolve()
      })
    })
  }
}

function addLink (key, db, callback) {
  if (key in db) return callback()

  db[key] = {}

  getDatLink(key, (err, datLink) => {
    if (err) return callback(err)

    if (key !== datLink) {
      db[key] = { alias: datLink }

      key = datLink
      db[key] = {}
    }

    getArchive(key, (err, profile) => {
      if (err) return callback(err)

      db[key] = profile

      var filename = stripDatProtocol(key) + '.json'
      var dir = profile.notFound ? 'not-fritters' : 'fritters'

      fs.writeFile(path.join(dir, filename), JSON.stringify(profile, null, 2), (err) => {
        if (err) throw err
      })

      callback(null, profile)
    })
  })
}

function getArchive (key, callback) {
  var archive = hyperdrive(ram, stripDatProtocol(key))

  archive.on('error', callback)

  archive.on('ready', () => {
    discovery(archive)

    archive.readFile('profile.json', 'utf-8', (err, data) => {
      if (err) {
        if (err.notFound) {
          // capture error message
          return callback(null, Object.assign({}, err, { message: err.message }))
        }
        return callback(err)
      }

      var profile = JSON.parse(data)

      archive.close()

      callback(null, profile)
    })
  })
}

function getDatLink (url, callback) {
  if (!isUrl(url)) return callback(null, url)

  datDns.resolveName(url)
    .then(key => callback(null, key))
    .catch(err => callback(err))
}

function stripDatProtocol (link) {
  return link.replace(/^dat:\/\//, '')
}

function stripTrailingSlash (link) {
  return link.replace(/\/$/, '')
}
