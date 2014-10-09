Clustering Graph
================
Clustering graph is a data structure similar to a normal graph data structure with that difference that it automatically manages a kind of object called the cluster. In a typical graph the fundamental unit is the node, or vertex, and a cluster would simply be a subset of nodes where every node was connected to every other node in the subset. 

The clustering graph is defined by a space, which I call a system, that contains cluster objects which are arrays of atoms that are understood to be mutually interconnected. You can add atoms into the system and connect atoms already in the system and the system will automatically manage the clusters. Unconnected atoms in the system are stored in a cluster of one atom called an atomic cluster.

Methods
-------

A new clustering graph is instantiated with the system constructor function:
```javascript
var sys = new System();
```
The only methods that should be used to input data are insert and connect. Getting data out can be done with getCluster and findCluster. Insert has a few possible use cases which are demonstrated below along with other useful methods:
```javascript
// inserting a single value into the system will create an atomic cluster
sys.insert('Bob');
// sys now contains one cluster with one atom, we can get the cluster using the value we passed in:
var myCluster = sys.getCLuster('Bob');
myCluster.id = 0;
myCluster.getAtom('Bob') //=> Atom: { value: 'Bob', connections: [] }

// if we insert another value, we get another atomic cluster
sys.insert('Mary');
var cluster = sys.getCluster('Mary');
// the isAtomic method return true if there is only one atom in the cluster
cluster.isAtomic() //=> true

// for now connections are automatically two-way, so connecting Bob and Mary will merge their clusters
sys.connect('Bob', 'Mary');
var cluster = sys.getCluster('Bob');
// the merged cluster is no longer atomic, and the members do not have connections because
// atoms in a cluster are by definition interconnected
cluster.isAtomic() //=> false
cluster.getAtom('Mary') //=> Atom: {value: 'Mary', connections: []}
```