module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'chai'],

    files: [
      // libraries
      'bower_components/jquery/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/ez-object2array/dist/ez-object2array.min.js',

      // our app
      'src/ez-select.js',
      'dist/ez-select.tpl.js',

      // tests
      'test/*Spec.js',
    ],

    port: 1244,

    browsers: ['Chrome']
  });
};
