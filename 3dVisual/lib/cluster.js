var Cluster = function(id){
  this.id = id;
  this.atoms = [];
  this.index = {};
};

Cluster.prototype.insert = function(value, connections){
  var atom = new Atom(value, connections);
  this.atoms.push(atom);
  this.index[value] = true;
};

Cluster.prototype.insertAtom = function(atom){
  this.atoms.push(atom);
  this.index[atom.value] = true;
};

Cluster.prototype.getAtom = function(value){
  for(var a = 0; a < this.atoms.length; a++){
    if(this.atoms[a].value === value){
      return this.atoms[a];
    }
  };
};

Cluster.prototype.atomHasEdgeTo = function(atomA, atomB){
  var result = false;
  var self = this;
  forEach(atomB.connections, function(edge){
    if(edge.id === self.id && edge.value === atomA.value){
      result === true;
    }
  })
  return result;
}

Cluster.prototype.addAtom = function(atom){
  this.atoms.push(atom);
  this.index[atom.value] = true;
};

Cluster.prototype.isAtomic = function(){
  return (this.atoms.length === 1);
};