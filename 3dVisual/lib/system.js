// Helper functions
var forEach = function(array, fn){
  for(var i = 0; i < array.length; i++){
    fn(array[i], i);
  }
}

var map = function(array, func){
  var result = [];
  forEach(array, function(item){
    result.push(func(item));
  })
  return result;
};


var atomNames = function(atoms){
  return map(atoms, function(atom){
    return atom.value;
  })
};

var isSubsetOf = function(arrayA, arrayB){
  var result = true;
  forEach(arrayB, function(item) {
    if(arrayA.indexOf(item) === -1){
      result = false;
    }
  })
  return result;
};
// End helper functions

var System = function(){
  this.clusters = [];
  this.counter = 0;
};

System.prototype.insert = function(value, connections){
  if(connections === undefined){
    this.newCluster(value);
  }
  else if(!Array.isArray(connections)){
    this.newCluster(value);
    this.newCluster(connections);
    this.connect(value, connections);
    return;
  }
  else {
    if(connections.length === 1){
      var connection = connections.pop();
      return this.insert(value, connection);
    }
    var clusterConnections = [];
    var atomicClusters = [];
    var items = [];
    for(var i = 0; i < connections.length; i++){
      var current = connections[i];
      var location = this.getCluster(current);
      if(location === undefined){
        items.push(current);
      } else {
        location = this.findCluster(location.id);
        if(location.isAtomic()){
          atomicClusters.push(location.id);
        } else {
          clusterConnections.push(new Edge(current, location.id));
        }
      }
    }
    //if no atomic clusters make new cluster and add connections
    if(!atomicClusters.length){
      // make new cluster with inserted value and newly added connections
      var insertedCluster = this.newCluster(value, clusterConnections);
      for(var i = 0; i < items.length; i++){
        insertedCluster.insert(items[i]);
      }
    }
      // if there is one atomic cluster, add new items to it
    else if(atomicClusters.length === 1){
      var atomic = this.findCluster(atomicClusters[0]);
      // only adding connections from insert query to the main value...
      atomic.insert(value, clusterConnections);
      // other new inserts get added to the cluster without other connections
      for(var i = 0; i < items.length; i++){
        atomic.insert(items[i]);
      }
    }
    else if(atomicClusters.length > 1){
      var base = atomicClusters.pop();
      var others = this.destroyAtomicClusters[atomicClusters];
      var baseCluster = this.findCluster(base);
      baseCluster.insert(value, clusterConnections);
      for(var o = 0; o < other.length; o++){
        baseCluster.addAtom(others[o]);
      }
    } 
  }
};

System.prototype.getCluster = function(value){ //get cluster via value of an atom
  var results = [];
  forEach(this.clusters, function(cluster){
    if(cluster.index[value] !== undefined){
      results.push(cluster);
    };
  })
  if(results.length === 1){
    return results.pop();
  }
  else if(results.length === 0){
    return;
  } 
  else {
    return results;
  }
};

System.prototype.findCluster = function(id){
  var result;
  forEach(this.clusters, function(cluster, i){
    if(cluster.id === id){
      result = cluster;
    }
  })
  return result;
}

System.prototype.newCluster = function(value, connections){
  connections = connections || null;
  var index = this.counter;
  this.counter++;
  var cluster = new Cluster(index);
  cluster.insert(value, connections);
  this.clusters.push(cluster);
  return cluster;
};

System.prototype.destroyAtomicClusters = function(array){
  var atoms = [], current, index;
  var self = this;
  forEach(array, function(id){
    current = self.findCluster(id);
    atoms.push(current.atoms[0]);
    index = self.getClusterIndex(id);
    self.clusters.splice(index, 1);
  })
  return atoms;
};

System.prototype.getClusterIndex = function(id){
  var result;
  forEach(this.clusters, function(cluster, i){
    if(cluster.id === id){
      result = i;
    }
  })
  return result;
}

System.prototype.connect = function(source, target){
  var sourceCluster = this.getCluster(source);
  var targetCluster = this.getCluster(target);
  var sourceAtom = sourceCluster.getAtom(source);
  var targetAtom = targetCluster.getAtom(target);
  if(sourceCluster.atomHasEdgeTo(sourceAtom, targetAtom)){
    return;
  }
  sourceAtom.addConnection(new Edge(target, targetCluster.id));
  targetAtom.addConnection(new Edge(source, sourceCluster.id));
  if(!this.checkForMerge(sourceCluster, targetCluster)){
    if(!targetCluster.isAtomic()){
      this.checkForOverlap(sourceAtom, targetCluster);
    }
    if(!sourceCluster.isAtomic()){
      this.checkForOverlap(targetAtom, sourceCluster);
    }
  };
}

System.prototype.sharesAtomicWith = function(clusterA, clusterB){
  var self = this;
  var atomA = clusterA.atoms[0];
  var atomics = [];
  var atomB = clusterB.atoms[0];
  var result;
  forEach(atomA.connections, function(edge){
    var cluster = self.findCluster(edge.id);
    if(cluster.isAtomic()){
      atomics.push(cluster);
    }
  })
  if(atomics.length){
    forEach(atomB.connections, function(edge){
      forEach(atomics, function(atomicCluster){
        if(edge.id === atomicCluster.id){
          result = atomicCluster;
        }
      });
    });
    return result;
  };
};

System.prototype.checkForMerge = function(clusterA, clusterB){
  var triad;
  if(clusterA.isAtomic() && clusterB.isAtomic()){
    if(clusterA.atoms[0].connections.length === 1 || clusterB.atoms[0].connections.length === 1){
      return false;
    } else {
      var third = this.sharesAtomicWith(clusterA, clusterB);
      if(third !== undefined){
        this.mergeTriad(clusterA, clusterB, third);
        return true;
      } else {
        return false;
      }
    }
  }
  var thoseAtoms = atomNames(clusterB.atoms);
  var merge = true;
  forEach(clusterA.atoms, function(atom){
    var atomEdges = atomNames(atom.connections);
    merge = merge && isSubsetOf(atomEdges, thoseAtoms);
  })
  if(merge){
    return this.mergeClusters(clusterA, clusterB);
  } else {
    return false;
  }
};

System.prototype.mergeClusters = function(clA, clB){
  var location = this.findCluster(clB.id);
  var index = this.getClusterIndex(location.id);
  this.clusters.splice(index, 1);
  var atomsB = clB.atoms;
  var atomsA = clA.atoms;
  forEach(atomsA, function(atom){
    forEach(atom.connections, function(edge, i){
      if(edge.id === clB.id){
        atom.connections.splice(i, 1);
      }
    })
  })
  forEach(atomsB, function(atom){
    forEach(atom.connections, function(edge, i){
      if(edge.id === clA.id){
        atom.connections.splice(i, 1);
      }
    })
    clA.addAtom(atom);
  })
  return clA;
};

System.prototype.checkForOverlap = function(atom, cluster){
  var clusterMembers = atomNames(cluster.atoms);
  var edges = atomNames(atom.connections);
  if(isSubsetOf(edges, clusterMembers)){
    cluster.insertAtom(atom);
  }
}

System.prototype.mergeTriad = function(one, two, three){
  var indices = [one.id, two.id, three.id];
  one = this.mergeClusters(one, two);
  one = this.mergeClusters(one, three);
  forEach(one.atoms, function(atom){
    forEach(atom.connections, function(edge, i){
      if(indices.indexOf(edge.id) !== -1){
        atom.connections.splice(i, 1);
      }
    });
  });
};
