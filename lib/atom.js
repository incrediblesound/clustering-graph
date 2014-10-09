var Atom = function(value, connections){
  this.value = value;
  this.connections = [];
  if(connections !== undefined && connections !== null){
    for(var i = 0; i < connections.length; i++){
      this.connections.push(connections[i]); 
    };
  };
};

var Edge = function(value, id){
  // id is the id of the foreign cluster
  this.value = value;
  this.id = id;
};

Atom.prototype.addConnection = function(connection){
  this.connections.push(connection);
};