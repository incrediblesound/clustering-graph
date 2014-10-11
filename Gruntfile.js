module.exports = function(grunt){

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      visual: {
        src: [
          'lib/atom.js',
          'lib/cluster.js',
          'lib/system.js'
        ],
        dest: '3dVisual/lib/cluster-graph.js'
      }
    },
    uglify: {
      index: {
        options: {
        },
        files: {
          '3dVisual/lib/cluster.min.js':['3dVisual/lib/cluster-graph.js'],
        },
      },
    },

    jshint: {
      files: [
        'lib/atom.js',
        'lib/system.js',
        'lib/cluster.js'
      ],
      options: {
        // force: 'true',
      },
    },

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('check', ['jshint']);
  grunt.registerTask('build', ['concat:visual', 'uglify']);

};