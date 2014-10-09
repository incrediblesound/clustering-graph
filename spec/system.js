/* global system, describe, it, expect, should */

describe('system()', function () {
  'use strict';
  var sys;
  beforeEach(function () {
    sys = new System();
  });

  it('exists', function () {
    expect(System).to.be.a('function');
    expect(Cluster).to.be.a('function');
    expect(Atom).to.be.a('function');
  });

  it('creates a single cluster from a group of novel inputs', function () {
    sys.insert('James', ['Phillip','Ryan','Fred']);
    expect(sys.clusters.length).to.equal(1);
    expect(sys.clusters[0].atoms.length).to.equal(4);
  });

  it('makes a new cluster when two clusters become interconnected', function () {
    sys.insert('Mary', 'John');
    sys.insert('Jack', 'Dave');
    sys.connect('Mary', 'Jack');
    sys.connect('Mary', 'Dave');
    sys.connect('John', 'Jack');
    sys.connect('John', 'Dave');
    expect(sys.clusters.length).to.equal(1);
    expect(sys.getCluster('Mary').atoms.length).to.equal(4);
  });

  // Add more assertions here
});
