Clustering Graph
================
Clustering graph is similar to a normal graph data structure but it automatically manages highly clustered nodes. In a typical graph the fundamental unit is the node or vertex, and a cluster would simply be a subset of nodes where every node was connected to every other node in the subset. 

The clustering graph is defined by a space, which I call a system, that contains cluster objects which are arrays of atoms that are by definition mutually interconnected. You can add atoms into the system and connect atoms already in the system and the system will automatically manage clusters. Unconnected atoms in the system are stored in a cluster of one atom called an atomic cluster. Finding highly connected clusters is as trivial for the cluster graph as getting all the nodes in a regular graph.

Methods
-------

A new clustering graph is instantiated with the system constructor function:
```javascript
var system = new System();
```
The only methods that should be used to input data are insert and connect. Getting data out can be done with getCluster and findCluster. Insert has a few possible use cases which are demonstrated below along with other useful methods:
```javascript
// inserting a single value into the system will create an atomic cluster
system.insert('Bob');
// system now contains one cluster with one atom, we can get the cluster using the value we passed in:
var myCluster = system.getCLuster('Bob');
myCluster.id //=> 0;
myCluster.getAtom('Bob') //=> Atom: { value: 'Bob', connections: [] }

// if we insert another value, we get another atomic cluster
system.insert('Mary');
var cluster = system.getCluster('Mary');
// the isAtomic method return true if there is only one atom in the cluster
cluster.isAtomic() //=> true

// the smallest cluster is three nodes, it will be automatically formed 
// if we connect three atomic clusters
system.connect('Bob', 'Mary');
system.insert('John');
system.connect('John', 'Bob');
system.connect('John', 'Mary');
// the merged cluster is no longer atomic, and the members do not have connections because
// atoms in a cluster are by definition interconnected:
var cluster = system.getCluster('Bob');
cluster.isAtomic() //=> false
cluster.getAtom('Mary') //=> Atom: {value: 'Mary', connections: []}
cluster.atoms.length //=> 3
system.clusters.length //=> 1

// subsequent atomic clusters will not be merge in unless they are connected to
// every atom in an existing non-atomic cluster, or they become part of a triad
```
3D Visualization
----------------
There is a webGL visualization of the graph in the 3DVisual folder that was adapted from [Daivid Piegza's graph visualization](https://github.com/davidpiegza/Graph-Visualization). To use it, first run grunt build in the console, which creates a minified version of the source code for the web app. Then load index_example.html in the browser. Make sure the browser you are using supports webGL or else the app wont work.

Because there are many layers of nested data it can be toilsome to examine the internals of the graph for testing. The visualization provides a simple user interface for experimenting and testing that allows you to see the results of each process.

Inserting data: enter any value into the form labeled "insert data" and click "insert".    
Connecting data: enter two values <strong>that have already been inserted</strong> into the form labelled "connect values" and click "Connect".

Each time a value is inserted or a connection is made the scene is re-rendered with the current state of the graph. Clusters are rendered as colored boxes. Atom values are rendered as text and connected to clusters with blue lines. Connections between atoms are rendered as red lines connecting the clusters where the atoms are located.
