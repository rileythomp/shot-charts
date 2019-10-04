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

app.post('/newplayerchart', function(req, res) {
	let player = nba.findPlayer(req.body.name);
	let season = req.body.season;
	let season_type = req.body.season_type

	if (player === undefined) {
		res.status(406).send('No player with that name was found');
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
		
		let params = {
			PlayerID: player.playerId,
			Season: season,
			SeasonType: season_type
		}
	
		let heat_map = {};
		for (let i = 1; i <= num_cells; ++i) {
			heat_map[i] = {made: 0, missed: 0};
		}
	
		nba.stats.shots(params)
		.then((response) => {
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
	
				if (shot.shotMadeFlag == 1) {
					heat_map[region].made += 1;
				}
				else {
					heat_map[region].missed += 1;
				}
			}

			res.send(heat_map);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Could not create shot chart at this time');
		});
	}
});
