'use strict'

let helpers = require('./helpers');
let nba = require('nba');
let express = require('express');

let app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Running on port ' + PORT);
});

app.post('/shotchart', (req, res) => {
    let player = nba.findPlayer(req.body.name);
    let teamId = nba.teamIdFromName(req.body.name);
    let season = req.body.season;
    let season_type = req.body.season_type;
    let chart_type = req.body.chart_type;

    if (player == undefined && teamId == undefined) {
        res.status(406).send('No player or team with that name was found');
    } else {
        let params = helpers.set_stats_params(player, teamId, season, season_type);

        nba.stats.shots(params)
            .then((response) => {
                let league_averages = response.leagueAverages;
                let shots = response.shot_Chart_Detail;

                if (shots.length == 0) {
                    res.status(406).send('Player did not play in the chosen season');
                    return;
                }

                let heat_map = helpers.create_heat_map(shots);

                let info_fn = (player != undefined) ? nba.stats.playerInfo : nba.stats.teamInfoCommon;

                info_fn(params)
                    .then((nba_res) => {
                        res.send({
                            heat_map: heat_map,
                            league_averages: league_averages,
                            chart_type: chart_type,
                            img_url: helpers.get_image_url(player, teamId),
                            display_info: nba_res
                        });
                    })
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('Could not create shot chart at this time');
            });
    }
});