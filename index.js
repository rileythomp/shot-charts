'use strict'

let helpers = require('./helpers');
let nba = require('nba');
let express = require('express');

let app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Running on port ' + PORT);
});

app.post('/newshotchart', function(req, res) {
	let player = nba.findPlayer(req.body.name);
	let teamId = nba.teamIdFromName(req.body.name);
	let season = req.body.season;
	let season_type = req.body.season_type;
	let chart_type = req.body.chart_type;

	if (player == undefined && teamId == undefined) {
		res.status(406).send('No player or team with that name was found');
	}
	else {
		const court_length = 500;
		const partitions = 50;
		const partition_length = court_length/partitions;
		const num_cells = partitions*partitions;
		const topY = 450;
		const leftX = -250;
		const bottomY = -50;
		const rightX = 250;
		
		let params;
		if (player != undefined) {
			params = {
				PlayerID: player.playerId,
				Season: season,
				SeasonType: season_type
			}
		}
		else {
			params = {
				TeamID: teamId,
				Season: season,
				SeasonType: season_type
			}
		}
	
		let heat_map = {shot_count: 0};
		for (let i = 1; i <= num_cells; ++i) {
			heat_map[i] = {made: 0, missed: 0, total: 0, area: -1};
		}
	
		nba.stats.shots(params)
		.then((response) => {
			let league_averages = response.leagueAverages;
			let shots = response.shot_Chart_Detail;
			let num_shots = shots.length;

			if (num_shots == 0) {
				res.status(406).send('Player did not play in the chosen season');
				return;
			}

			// map each x,y pair to one of the regions
			for (let i = 0; i < num_shots; ++i) {
				let shot = shots[i];
				let yLoc = shot.locY;
				let xLoc = shot.locX;
		
				if (yLoc > topY) {
					yLoc = topY;
				}
				else if (yLoc < bottomY) {
					yLoc = bottomY;
				}
		
				if (xLoc > rightX) {
					xLoc = rightX;
				}
				else if (xLoc < leftX) {
					xLoc = leftX;
				}
		
				// 0 is far left
				let col = Math.floor(Math.abs((leftX - xLoc)/partition_length));
		
				// 0 is top
				let row = Math.floor(Math.abs((topY - yLoc)/partition_length));
		
				let region = row * partitions + col + 1;
	
				if (heat_map[region].area == -1) {
					heat_map[region].area = nba_stats.get_shot_area(shot);
				}
				if (shot.shotMadeFlag == 1) {
					heat_map[region].made += 1;
				}
				else {
					heat_map[region].missed += 1;
				}
				heat_map[region].total += 1;
				heat_map.shot_count += 1;
			}

			if (player != undefined) {
				nba.stats.playerInfo(params)
				.then((nba_res) => {
					res.send({
						heat_map: heat_map,
						league_averages: league_averages,
						chart_type: chart_type,
						headshot: helpers.headshot(player),
						player_info: nba_res});
				})
			}
			else {
				res.send({
					heat_map: heat_map,
					league_averages: league_averages,
					chart_type: chart_type,
					logo: helpers.logo(teamId)
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Could not create shot chart at this time');
		});
	}
});
