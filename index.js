'use strict'

const nba = require('nba');
var express = require('express');

var app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Running on port ' + PORT);
});

function get_shot_area(shot) {
	if (shot.shotZoneBasic == 'Above the Break 3') {
		if (shot.shotZoneRange == '24+ ft.') {
			if (shot.shotZoneArea == 'Center(C)') {
				return 1;
			}
			else if (shot.shotZoneArea == 'Left Side Center(LC)') {
				return 2;
			}
			else if (shot.shotZoneArea == 'Right Side Center(RC)') {
				return 3;
			}
		}
		else {
			return 0;
		}
	}
	else if (shot.shotZoneBasic == 'Backcourt') {
		return 4;
	}
	else if (shot.shotZoneBasic == 'In The Paint (Non-RA)') {
		if (shot.shotZoneRange == '8-16 ft.') {
			if (shot.shotZoneArea == 'Center(C)') {
				return 5;
			}
			else if (shot.shotZoneArea == 'Left Side(L)') {
				return 7;
			}
			else if (shot.shotZoneArea == 'Right Side(R)') {
				return 8;
			}
		}
		else {
			return 6;
		}
	}
	else if (shot.shotZoneBasic == 'Left Corner 3') {
		return 9;
	}
	else if (shot.shotZoneBasic == 'Mid-Range') {
		if (shot.shotZoneRange == '8-16 ft.') {
			if (shot.shotZoneArea == 'Center(C)') {
				return 10;
			}
			else if (shot.shotZoneArea == 'Left Side(L)') {
				return 14;
			}
			else if (shot.shotZoneArea == 'Right Side(R)') {
				return 17;
			}
		}
		else if (shot.shotZoneRange == '16-24 ft.') {
			if (shot.shotZoneArea == 'Center(C') {
				return 11;
			}
			else if (shot.shotZoneArea == 'Left Side Center(LC)') {
				return 12;
			}
			else if (shot.shotZoneArea == 'Left Side(L)') {
				return 13;
			}
			else if (shot.shotZoneArea == 'Right Side Center(RC)') {
				return 15;
			}
			else if (shot.shotZoneArea == 'Right Side(R)') {
				return 16;
			}
		}
	}
	else if (shot.shotZoneBasic == 'Restricted Area') {
		return 18;
	}
	else {
		return 19;
	}
}

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

		let team_abbr;

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
			for (let i = 0; i < nba.teams.length; ++i) {
				if (nba.teams[i].teamId == teamId) {
					team_abbr = nba.teams[i].abbreviation;
				}
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

			// map each x,y pair to one of the cells
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
					heat_map[region].area = get_shot_area(shot);
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
				let headshot = 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/' + player.teamId + '/2018/260x190/' + player.playerId + '.png';

				nba.stats.playerInfo(params)
				.then((nba_res) => {
					res.send({heat_map: heat_map, league_averages: league_averages, chart_type: chart_type, headshot: headshot, player_info: nba_res});
				})
			}
			else {
				let logo = 'https://stats.nba.com/media/img/teams/logos/' + team_abbr + '_logo.svg'
				res.send({heat_map: heat_map, league_averages: league_averages, chart_type: chart_type, logo: logo});

			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Could not create shot chart at this time');
		});
	}
});
