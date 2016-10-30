(function() {

  'use strict';

  angular
    .module('mlbApp.components.main')
    .controller('mainController', mainController);

  mainController.$inject = ['MainService', 'moment'];

  function mainController(MainService, moment) {
    /*jshint validthis: true */
    const vm = this;

    class ResultObject {
      constructor(name, league) {
        this.name = name;
        this.league = league;

        this.totalAllVisits = 0;

        this.totalChangesOnly = 0;

        this.totalPureVisits = 0;
      }
    }

    let getTeams = initTeams();

    Promise.all([
      getTeams
    ])
    .then(results => {
      console.log(results[0]);
      return calcSeasonTotals(results[0]);
    })
    .then(finalResults => {
      console.log(finalResults);
      vm.finalResults = finalResults;
    });

    //helper functions

    function calcSeasonTotals(inputArray) {
      return new Promise((resolve, reject) => {

        let gameCounter = 0;

        for (var i = moment("20160403", "YYYYMMDD"); i < moment("20161003", "YYYYMMDD"); i.add(1, 'days')) {

          let date = i.format().split('-');
          let dayTime = date[2].split('T');

          let month = date[1];

          let day = dayTime[0];

          MainService.getGamesForDay(month, day)
            .then(results => {
              let gamesArray = results.data.data.games.game;

              if (gamesArray) {

                gamesArray.forEach((game, index) => {

                  if (game.game_type !== 'R' || game.status !== 'Final') {
                    gamesArray.splice(index, 1);
                  }

                  let gameDataUrl = gamesArray[index].game_data_directory;

                  let gameHomeTeam = gamesArray[index].home_team_name;

                  let gameAwayTeam = gamesArray[index].away_team_name;

                  MainService.getGameStats(gameDataUrl)
                    .then(gameData => {
                      let game = gameData.data.data.game;

                      let homeTeam;
                      let awayTeam;
                      let homeLeague;
                      let awayLeague;

                      for (var i = 0; i < inputArray.length; i++) {
                        if (inputArray[i].name === gameHomeTeam) {
                          homeTeam = inputArray[i];
                        }
                        if (inputArray[i].name === gameAwayTeam) {
                          awayTeam = inputArray[i];
                        }
                      }

                      if (homeTeam.league === 'AL') {
                        homeLeague = inputArray[1];
                      } else {
                        homeLeague = inputArray[2];
                      }

                      if (awayTeam.league === 'AL') {
                        awayLeague = inputArray[1];
                      } else {
                        awayLeague = inputArray[2];
                      }

                      game.inning.forEach(inning => {
                        let actionBot = inning.bottom.action;
                        let actionTop = inning.top.action;

                        if (actionBot) {
                          if (!actionBot.length) {
                            translateAction(inputArray[0], awayTeam, awayLeague, actionBot);
                          } else {
                            actionBot.forEach(action => {
                              translateAction(inputArray[0], awayTeam, awayLeague, action);
                            });

                          }
                        }

                        if (actionTop) {
                          if (!actionTop.length) {
                            translateAction(inputArray[0], homeTeam, homeLeague, actionTop);
                          } else {
                            actionTop.forEach(action => {
                              translateAction(inputArray[0], homeTeam, homeLeague, action);
                            });

                          }
                        }

                      });

                    });

                });
              }

            });

          }

        resolve(inputArray);
      });

    }

    function initTeams() {
      return new Promise((resolve, reject) => {
        let finalResults = [new ResultObject('Major League Baseball', 'MLB'), new ResultObject('American League', 'AL'), new ResultObject('National League', 'NL')];
        MainService.getGamesForDay('10', '02')
        .then(results => {

          let gamesArray = results.data.data.games.game;

          if (gamesArray.length) {
            gamesArray.forEach(game => {

              let leagueInfo = game.league;

              let homeTeamLeague;
              let awayTeamLeague;

              if (leagueInfo[1] === 'A') {
                homeTeamLeague = 'AL';
              } else {
                homeTeamLeague = 'NL';
              }

              if (leagueInfo[0] === 'A') {
                awayTeamLeague = 'AL';
              } else {
                awayTeamLeague = 'NL';
              }

              let homeTeam = game.home_team_name;
              let awayTeam = game.away_team_name;

              finalResults.push(new ResultObject(homeTeam, homeTeamLeague));
              finalResults.push(new ResultObject(awayTeam, awayTeamLeague));

            });
          }

        });
        resolve(finalResults);
      });
    }

  }

  function translateAction(mlb, team, teamLeague, action) {
    let des = action.des;
    if (des.includes('Pitching Change')) {
      mlb.totalAllVisits++;
      mlb.totalChangesOnly++;
      teamLeague.totalAllVisits++;
      teamLeague.totalChangesOnly++;
      team.totalAllVisits++;
      team.totalChangesOnly++;

    }

    if (des.includes('Coaching visit')) {
      mlb.totalAllVisits++;
      mlb.totalPureVisits++;
      teamLeague.totalAllVisits++;
      teamLeague.totalPureVisits++;
      team.totalAllVisits++;
      team.totalPureVisits++;

    }

  }
})();
