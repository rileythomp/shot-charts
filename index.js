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

let color_from_percent = function(percent) {
    if (percent > 0 && percent <= 0.1) {
		return [255, 0, 0];
	}
	else if (percent >= 0.1 && percent <= 0.2) {
		return [255, 87, 0];
	}
	else if (percent >= 0.2 && percent <= 0.3) {
		return [255, 175, 0];
	}
	else if (percent >= 0.3 && percent <= 0.4) {
		return [255, 255, 0];
	}
	else if (percent >= 0.4 && percent <= 0.5) {
		return [159, 255, 86];
	}
	else if (percent >= 0.5 && percent <= 0.6) {
		return [71, 255, 0];
	}
	else if (percent >= 0.6) {
		return [0, 255, 0];
	}
	else {
		return [222, 184, 135]; // burlywood
	}
}

app.post('/newplayerchart', function(req, res) {
	let player = nba.findPlayer(req.body.name);

	if (player === undefined) {
		res.status(500).send('Player not defined');
	}
	else {
		const court_length = 500;
		const partitions = 30;
		const partition_length = court_length/partitions;
		const num_cells = partitions*partitions;
		const topY = 450;
		const leftX = -250;
		const bottomY = -50;
		const rightX = 250;
		
		let params = {
			PlayerID: player.playerId
		}
	
		let heatMap = {};
		for (let i = 1; i <= num_cells; ++i) {
			heatMap[i] = {made: 0, missed: 0};
		}
	
		nba.stats.shots(params).then((response) => {
			let shots = response.shot_Chart_Detail;
			let num_shots = shots.length;
		
			// map each x,y pair to one of the 900 cells
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
					heatMap[region].made += 1;
				}
				else {
					heatMap[region].missed += 1;
				}
			}

			let color_array = [];
	
			for (let i = 210; i <= num_cells-60; ++i) {
				let percent = heatMap[i].made / (heatMap[i].made + heatMap[i].missed);
				color_array.push(color_from_percent(percent));
			}

			res.send(color_array);
		});
	}

});
