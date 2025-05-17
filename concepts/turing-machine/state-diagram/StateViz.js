'use strict';

// *** Arrays as vectors ***
function addV(array1, array2) {
  return array1.map(function (x, i) { return x + array2[i]; });
}

function negateV(array) {
  return array.map(function (x) { return -x; });
}

function subtractV(array1, array2) {
  return addV(array1, negateV(array2));
}

function multiplyV(array, scalar) {
  return array.map(function (x) { return scalar*x; });
}

function normSqV(array) {
  function sq(x) { return x*x; }
  function add(x, y) { return x + y; }
  return array.map(sq).reduce(add, 0);
}

function normV(array) { return Math.sqrt(normSqV(array)); }

function unitV(array) {
  var n = normV(array);
  return array.map(function (x) { return x / n; });
}

// *** 2D Vectors ***
function angleV(array) {
  var x = array[0], y = array[1];
  return Math.atan2(y, x);
}

function vectorFromLengthAngle(length, angle) {
  return [Math.cos(angle) * length, Math.sin(angle) * length];
}

// *** Edge Counter ***
function EdgeCounter(edges) {
  edges.forEach(function (e) {
    var key = e.source.index +','+ e.target.index;
    this[key] = (this[key] || 0) + 1;
  }, this);
}

EdgeCounter.prototype.numEdgesFromTo = function (src, target) {
  return this[String(src)+','+String(target)] || 0;
};

var EdgeShape = Object.freeze({
  loop: {},     // self-loop: a->a
  arc: {},      // curved arc: a->b when b->a exists
  straight: {}  // straight edge: a->b when b->a does not exist
});

EdgeCounter.prototype.shapeForEdge = function (e) {
  if (e.target.index === e.source.index) {
    return EdgeShape.loop;
  } else if (this.numEdgesFromTo(e.target.index, e.source.index)) {
    return EdgeShape.arc;
  } else {
    return EdgeShape.straight;
  }
};

// *** Edge Path Generation ***
function edgePathFor(nodeRadius, shape, d) {
  if (shape === EdgeShape.loop) {
    var loopEndOffset = vectorFromLengthAngle(nodeRadius, -15 * Math.PI/180);
    var loopArc = ' a 19,27 45 1,1 ' + loopEndOffset[0] + ',' + (loopEndOffset[1]+nodeRadius);
    return function () {
      var x1 = d.source.x,
          y1 = d.source.y;
      return 'M ' + x1 + ',' + (y1-nodeRadius) + loopArc;
    };
  }
  
  if (shape === EdgeShape.arc) {
    return function () {
      var p1 = [d.source.x, d.source.y];
      var p2 = [d.target.x, d.target.y];
      var offset = subtractV(p2, p1);
      var radius = 6/5*normV(offset);
      var angle = angleV(offset);
      var sep = -Math.PI/2/2;
      var source = addV(p1, vectorFromLengthAngle(nodeRadius, angle+sep));
      var target = addV(p2, vectorFromLengthAngle(nodeRadius, angle+Math.PI-sep));
      return (p1[0] <= p2[0])
        ? 'M '+source[0]+' '+source[1]+' A '+radius+' '+radius+' 0 0,1 '+target[0]+' '+target[1]
        : 'M '+target[0]+' '+target[1]+' A '+radius+' '+radius+' 0 0,0 '+source[0]+' '+source[1];
    };
  } else if (shape === EdgeShape.straight) {
    return function () {
      var p1 = [d.source.x, d.source.y];
      var p2 = [d.target.x, d.target.y];
      var offset = subtractV(p2, p1);
      if (offset[0] === 0 && offset[1] === 0) { return null; }
      var target = subtractV(p2, multiplyV(unitV(offset), nodeRadius));
      return 'M '+p1[0]+' '+p1[1]+' L '+ target[0] +' '+ target[1];
    };
  }
}

// *** State Diagram Visualization ***
function StateViz(container, nodes, linkArray) {
  var w = 800;
  var h = 500;
  var linkDistance = 140;
  var nodeRadius = 20;

  var svg = container.append('svg')
    .attr({
      'viewBox': [0, 0, w, h].join(' '),
      'version': '1.1',
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    });

  // Force Layout
  var nodeArray = Array.isArray(nodes) ? nodes : Object.values(nodes);
  this.__stateMap = nodes;

  var force = d3.layout.force()
    .nodes(nodeArray)
    .links(linkArray)
    .size([w, h])
    .linkDistance(linkDistance)
    .charge(-500)
    .theta(0.1)
    .gravity(0.05)
    .start();

  var drag = force.drag()
    .on('dragstart', function(d) {
      d.fixed = true;
      svg.transition().style('box-shadow', 'inset 0 0 1px gold');
    })
    .on('dragend', function() {
      svg.transition().style('box-shadow', null);
    });

  // Create edges
  var edgeCounter = new EdgeCounter(linkArray);
  var edge = svg.selectAll('.edge')
    .data(linkArray)
    .enter().append('g')
    .attr('class', 'edge');

  edge.append('path')
    .attr('class', 'transition')
    .attr('d', function(d) {
      return edgePathFor(nodeRadius, edgeCounter.shapeForEdge(d), d)();
    });

  edge.append('text')
    .attr('class', 'transition-label')
    .attr('dy', -5)
    .append('textPath')
    .attr('xlink:href', function(d, i) { return '#edge-'+i; })
    .attr('startOffset', '50%')
    .text(function(d) { return d.label; });

  // Create nodes
  var node = svg.selectAll('.node')
    .data(nodeArray)
    .enter().append('g')
    .attr('class', 'node')
    .call(drag);

  node.append('circle')
    .attr('class', 'state')
    .attr('r', nodeRadius);

  node.append('text')
    .attr('dy', '.35em')
    .text(function(d) { return d.label; });

  // Update positions
  force.on('tick', function() {
    edge.selectAll('path')
      .attr('d', function(d) {
        return edgePathFor(nodeRadius, edgeCounter.shapeForEdge(d), d)();
      });

    node.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  });

  // Store references
  this.svg = svg;
  this.force = force;
  this.node = node;
  this.edge = edge;
}

// Export for use in other modules
window.StateViz = StateViz; 