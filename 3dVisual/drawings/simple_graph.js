/**
  @author David Piegza

  Implements a simple graph drawing with force-directed placement in 2D and 3D.

  It uses the force-directed-layout implemented in:
  https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js

  Drawing is done with Three.js: http://github.com/mrdoob/three.js

  To use this drawing, include the graph-min.js file and create a SimpleGraph object:

  <!DOCTYPE html>
  <html>
    <head>
      <title>Graph Visualization</title>
      <script type="text/javascript" src="path/to/graph-min.js"></script>
    </head>
    <body onload="new Drawing.SimpleGraph({layout: '3d', showStats: true, showInfo: true})">
    </bod>
  </html>

  Parameters:
  options = {
    layout: "2d" or "3d"

    showStats: <bool>, displays FPS box
    showInfo: <bool>, displays some info on the graph and layout
              The info box is created as <div id="graph-info">, it must be
              styled and positioned with CSS.


    selection: <bool>, enables selection of nodes on mouse over (it displays some info
               when the showInfo flag is set)


    limit: <int>, maximum number of nodes

    numNodes: <int> - sets the number of nodes to create.
    numEdges: <int> - sets the maximum number of edges for a node. A node will have
              1 to numEdges edges, this is set randomly.
  }


  Feel free to contribute a new drawing!

 */

var Drawing = Drawing || {};

Drawing.SimpleGraph = function(options) {
  var options = options || {};

  this.layout = options.layout || "2d";
  this.layout_options = options.graphLayout || {};
  this.show_stats = options.showStats || false;
  this.show_info = options.showInfo || false;
  this.show_labels = options.showLabels || false;
  this.selection = options.selection || false;
  this.limit = options.limit || 10;
  this.nodes_count = options.numNodes || 20;
  this.edges_count = options.numEdges || 10;

  var camera, controls, scene, renderer, interaction, geometry, object_selection;
  var stats;
  var info_text = {};
  var graph = new System();

  var geometries = [];
  var edges = {};

  var that=this;

  init();
  animate();

  function init() {
    // Three.js initialization
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 1000000);
    camera.position.z = 5000;

    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 5.2;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    controls.addEventListener('change', render);

    scene = new THREE.Scene();

    // Create node selection, if set
    if(that.selection) {
      object_selection = new THREE.ObjectSelection({
        domElement: renderer.domElement,
        selected: function(obj) {
          // display info
          if(obj != null) {
            info_text.select = "Object " + obj.id;
          } else {
            delete info_text.select;
          }
        },
        clicked: function(obj) {
        }
      });
    }

    document.body.appendChild( renderer.domElement );

    // Stats.js
    if(that.show_stats) {
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      document.body.appendChild( stats.domElement );
    }

    // Create info box
    if(that.show_info) {
      var info = document.createElement("div");
      var id_attr = document.createAttribute("id");
      id_attr.nodeValue = "graph-info";
      info.setAttributeNode(id_attr);
      document.body.appendChild( info );
    }
  }


  /**
   *  Creates a graph with random nodes and edges.
   *  Number of nodes and edges can be set with
   *  numNodes and numEdges.
   */
  this.insert = function(value) {
    $('.atoms').empty();
    graph.insert(value);
    renderGraph();
  }

  this.connect = function(string){
    $('.atoms').empty();
    string = string.split(' ');
    var source = string[0];
    var target = string[1];
    console.log('connect string: ', string);
    graph.connect(source, target);
    renderGraph();
  }

  function renderGraph(){
    edges = {};
    for(var i = scene.children.length-1; i > 0; i--){
      var obj = scene.children[i];
      if(obj !== camera){
        scene.remove(obj);
      }
    }
    var clusters = graph.clusters;
    for(var c = 0; c < clusters.length; c++){
      var cluster = clusters[c];
      cluster.data = {};
      drawNode(cluster, cluster.atoms.length * 100);
    }
    for(var k = 0; k < clusters.length; k++){
      var cluster = clusters[k];
      renderAtoms(cluster);
    }
  }


  /**
   *  Create a node object and add it to the scene.
   */
  function drawNode(node, size) {
    geometry = new THREE.CubeGeometry( size, size, size );
    var draw_object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {  color: Math.random() * 0xffffff, opacity: 0.5 } ) );

    if(that.show_labels) {
      if(node.data.title != undefined) {
        var label_object = new THREE.Label(node.data.title);
      } else {
        var label_object = new THREE.Label(node.id);
      }
      node.data.label_object = label_object;
      scene.add( node.data.label_object );
    }

    var area = 5000;
    draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
    draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

    if(that.layout === "3d") {
      draw_object.position.z = Math.floor(Math.random() * (area + area + 1) - area);
    }

    draw_object.id = node.id;
    node.data.draw_object = draw_object;
    node.position = draw_object.position;
    camera.lookAt(draw_object.position);
    scene.add( node.data.draw_object );
  }

  function renderAtoms(cluster){
    for(var i = 0, l = cluster.atoms.length; i < l; i++){
      var atom = cluster.atoms[i];
      renderText(cluster, atom);
      renderEdges(cluster.id, atom);
    }
  }

  function renderEdges(clusterId, atom){
    var source = graph.findCluster(clusterId);
    console.log('render edges atom: ', atom);

    for(var i = 0; i < atom.connections.length; i++){
      var edge = atom.connections[i];
      var target = graph.findCluster(edge.id);
      //if(!edges[atom.value] && !edges[edge.value]){
        edges[atom.value] = true;
        edges[edge.value] = true;
        drawEdge(source, target);
      //}
    }

  }

  function renderText(cluster, atom){
    var text = atom.value;
    $('.atoms').append('<p>'+text+'</p>');
    var materialFront = new THREE.MeshBasicMaterial( { color: 'Black' } );
    var textGeom = new THREE.TextGeometry( text, {
      size: 36, height: 4, curveSegments: 3,
      font: "helvetiker", weight: "bold", style: "normal",
      bevelEnabled: false, material: 0
      });
    var textMesh = new THREE.Mesh(textGeom, materialFront );
    textGeom.computeBoundingBox();
    var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
    textMesh.position.set( cluster.position.x*(1+rnd(0.4)), cluster.position.y*(1+rnd(0.4)), cluster.position.z*(1+rnd(0.4)) );
    textMesh.lookAt(camera.position);
    scene.add(textMesh);
    drawEdge(cluster, textMesh, 'blue');
  }

  function rnd(x){
    return (Math.random() * x);
  }
  /**
   *  Create an edge object (line) and add it to the scene.
   */
  function drawEdge(source, target, color) {
      color = color || 'red';
      material = new THREE.LineBasicMaterial({ color: color, opacity: 1, linewidth: 1.5 });
      var source = source.data ? source.data.draw_object.position : source.position;
      var target = target.data ? target.data.draw_object.position : target.position;
      var tmp_geo = new THREE.Geometry();
      tmp_geo.vertices.push(source);
      tmp_geo.vertices.push(target);

      line = new THREE.Line( tmp_geo, material, THREE.LinePieces );
      line.scale.x = line.scale.y = line.scale.z = 1;
      line.originalScale = 1;

      geometries.push(tmp_geo);

      scene.add( line );
  }


  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
    if(that.show_info) {
      printInfo();
    }
  }


  function render() {
    // Generate layout if not finished
    // if(!graph.layout.finished) {
    //   info_text.calc = "<span style='color: red'>Calculating layout...</span>";
    //   graph.layout.generate();
    // } else {
    //   info_text.calc = "";
    // }

    // Update position of lines (edges)
    for(var i=0; i<geometries.length; i++) {
      geometries[i].verticesNeedUpdate = true;
    }


    // Show labels if set
    // It creates the labels when this options is set during visualization
    // if(that.show_labels) {
    //   var length = graph.nodes.length;
    //   for(var i=0; i<length; i++) {
    //     var node = graph.nodes[i];
    //     if(node.data.label_object != undefined) {
    //       node.data.label_object.position.x = node.data.draw_object.position.x;
    //       node.data.label_object.position.y = node.data.draw_object.position.y - 100;
    //       node.data.label_object.position.z = node.data.draw_object.position.z;
    //       node.data.label_object.lookAt(camera.position);
    //     } else {
    //       if(node.data.title != undefined) {
    //         var label_object = new THREE.Label(node.data.title, node.data.draw_object);
    //       } else {
    //         var label_object = new THREE.Label(node.id, node.data.draw_object);
    //       }
    //       node.data.label_object = label_object;
    //       scene.add( node.data.label_object );
    //     }
    //   }
    // } else {
    //   var length = graph.nodes.length;
    //   for(var i=0; i<length; i++) {
    //     var node = graph.nodes[i];
    //     if(node.data.label_object != undefined) {
    //       scene.remove( node.data.label_object );
    //       node.data.label_object = undefined;
    //     }
    //   }
    // }

    // render selection
    if(that.selection) {
      object_selection.render(scene, camera);
    }

    // update stats
    if(that.show_stats) {
      stats.update();
    }

    // render scene
    renderer.render( scene, camera );
  }

  /**
   *  Prints info from the attribute info_text.
   */
  function printInfo(text) {
    var str = '';
    for(var index in info_text) {
      if(str != '' && info_text[index] != '') {
        str += " - ";
      }
      str += info_text[index];
    }
    document.getElementById("graph-info").innerHTML = str;
  }

  // Generate random number
  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  // Stop layout calculation
  this.stop_calculating = function() {
    graph.layout.stop_calculating();
  }
}
