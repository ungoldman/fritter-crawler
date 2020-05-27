/* global vis */

import nodes from './graph/nodes'
import edges from './graph/edges'

function draw() {
  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {
    nodes: {
      shape: 'dot',
      size: 16
    },
    layout: {
      randomSeed: 34
    },
    physics: {
      forceAtlas2Based: {
        gravitationalConstant: -100,
        centralGravity: 0.005,
        springLength: 230,
        springConstant: 0.18
      },
      maxVelocity: 146,
      solver: 'forceAtlas2Based',
      timestep: 0.35,
      stabilization: {
        enabled: true,
        iterations: 300,
        updateInterval: 1
      }
    }
  }
  var network = new vis.Network(container, data, options)

  network.on('stabilizationProgress', function(params) {
    const value = Math.round(params.iterations / params.total * 100)
    console.log(value + '%')
    document.getElementById('loading').value = value
    document.getElementById('percent').innerText = value
  })

  network.once('stabilizationIterationsDone', function() {
    document.getElementById('wrapper').style.display = 'none'
  })
}

window.addEventListener('load', () => {
  draw()
})
