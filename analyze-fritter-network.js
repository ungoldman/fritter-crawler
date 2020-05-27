const fs = require('fs')
const path = require('path')
const createGraph = require('ngraph.graph')
const mkdirp = require('mkdirp')
const { getDatId } = require('./utils')

mkdirp.sync('./graph')

const nid = '71b4951cd41b604bff8b6ceb6841d0364b7342afe6fbf0319627c84dc1067015'

async function analyze () {
  const dir = await fs.promises.opendir('./fritters')
  const files = []
  const profiles = []
  const nodes = []
  const edges = []

  const g = createGraph()

  for await (const dirent of dir) { //eslint-disable-line
    files.push(dirent.name)
  }


  files.forEach(async file => {
    // relish the blasphemy
    const content = require(`./fritters/${file}`)
    const id = getDatId(file)

    g.addNode(id, content)

    content.follows.forEach(follow => {
      g.addLink(id, getDatId(follow.url))
    })
  })


  profiles.forEach(profile => {
    console.log(profile)
  })

  g.forEachNode(function (node) {
    // console.log('node', node)
    const n = {
      id: node.id
    }
    if (node.data) {
      n.label = node.data.name
      if (node.data.bio) n.title = node.data.bio + '<br>' + node.id
      else node.title = node.id
      nodes.push(n)
    } else {
      // nodes.push({
      //   label: node.id.substring(0, 5),
      //   title: node.id
      // })
      // console.log(node.id, 'skipping, no data')
    }

  })

  g.forEachLink(function (link) {
    if (
      nodes.find(n => link.fromId === n.id) ||
      nodes.find(n => link.toId === n.id)
    ) {
      edges.push({from: link.fromId, to: link.toId})
    }
  })

  console.log('nodes', nodes.length)
  console.log('edges', edges.length)

  return { nodes, edges }
}

analyze()
  .then(async ({ nodes, edges }) => {
    fs.promises.writeFile('./graph/nodes.js', 'module.exports = ' + JSON.stringify(nodes, null, 2))
    fs.promises.writeFile('./graph/edges.js', 'module.exports = ' + JSON.stringify(edges, null, 2))
    console.log(nodes[0], edges[0])
  })
  .catch(console.error)
