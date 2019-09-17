'use strict'

const shell = require('shelljs');
const nba = require('nba');
const replaceColor = require('replace-color');

var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function() {
    console.log('Running on localhost:' + PORT);
});

const length = 500;

const partitions = 30;

const partition_length = length/partitions;

const num_cells = partitions*partitions;

const topY = 450;
const leftX = -250;
const bottomY = -50;
const rightX = 250;

const player = nba.findPlayer('Russell Westbrook');

let params = {
	PlayerID: player.playerId
}

let heatMap = {};

for (let i = 1; i <= num_cells; ++i) {
	heatMap[i] = {made: 0, missed: 0};
}

function replace_color(image, replace) {
	replaceColor({
		image: './public/court_bits/' + image + '.png',
		colors: {
			type: 'rgb',
			targetColor: [255, 255, 255],
			replaceColor: replace
		},
		deltaE: 10
	})
	.then((jimpObject) => {
		jimpObject.write('./public/court_bits/' + image + '.png', (err) => {
			if (err) { return console.log(err) }
		})
	})
	.catch((err) => {
		console.log(err);
	})
}

function colorFromPercent(percent) {
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
		return [222, 184, 135];
	}
}

function updateMap(region, shot) {
	if (shot.shotMadeFlag == 1) {
		heatMap[region].made += 1;
	}
	else {
		heatMap[region].missed += 1;
	}
}

function abs(x) {
	return (x >= 0 ? x : -1*x);
}



nba.stats.shots(params).then((res) => {
	let shots = res.shot_Chart_Detail;
	let num_shots = shots.length;

	// shell.exec('./move_pics_script', function(code, stdout, stderr) {
	// 	console.log('Exit code:', code);
	// 	console.log('Program output:', stdout);
	// 	console.log('Program stderr:', stderr);
	// });

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

		// 0 is far right, 9 is far left
		let col = Math.floor(abs((leftX - xLoc)/partition_length));

		// 0 is top, 9 is bottom
		let row = Math.floor(abs((topY - yLoc)/partition_length));

		let index = row * partitions + col + 1;
		updateMap(index, shot);
	}

	for (let i = 1; i <= num_cells; ++i) {
		let percent = heatMap[i].made / (heatMap[i].made + heatMap[i].missed);

		replace_color(i, colorFromPercent(percent));
	}
});

