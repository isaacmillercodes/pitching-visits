(function() {

  'use strict';

  angular
    .module('mlbApp.components.main')
    .service('MainService', MainService);

  MainService.$inject = ['$http'];

  function MainService($http) {
    /*jshint validthis: true */
    let baseUrl = 'http://gd2.mlb.com/';
    let calendarUrl = 'http://gd2.mlb.com/components/game/mlb/year_2016/';

    this.getGamesForDay = (month, day) => {
      return $http.get(`${calendarUrl}month_${month}/day_${day}/miniscoreboard.json`);
    };

    this.getGameStats = (gameDataUrl) => {
      return $http.get(`${baseUrl}${gameDataUrl}/game_events.json`);
    };
  }

})();
