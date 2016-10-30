(function() {

  'use strict';

  angular
    .module('mlbApp.config', [])
    .config(appConfig)
    .run(function($templateCache) {
      $templateCache.removeAll();
    });

  function appConfig() {}

})();
