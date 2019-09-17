'use strict'

const nba = require('nba');
const replaceColor = require('replace-color');

var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function() {
    console.log('Running on localhost:', PORT);
});

const player = nba.findPlayer('Lebron James');

let params = {
	PlayerID: player.playerId
}

function replace_color(image, replace) {
	replaceColor({
		image: './public/court_parts/' + image + '.png',
		colors: {
			type: 'rgb',
			targetColor: [255, 255, 255],
			replaceColor: replace
		},
		deltaE: 10
	})
	.then((jimpObject) => {
		jimpObject.write('./public/court_parts/' + image + '.png', (err) => {
			if (err) { return console.log(err) }
		})
	})
	.catch((err) => {
		console.log(err);
	})
}

function colorFromPercent(percent) {
	if (percent <= 0.1) {
		return [130, 224, 170];
	}
	else if (percent >= 0.1 && percent <= 0.2) {
		return [88, 214, 141];
	}
	else if (percent >= 0.2 && percent <= 0.3) {
		return [46, 204, 113];
	}
	else if (percent >= 0.3 && percent <= 0.4) {
		return [40, 180, 99];
	}
	else if (percent >= 0.4 && percent <= 0.5) {
		return [35, 155, 86];
	}
	else if (percent >= 0.5 && percent <= 0.6) {
		return [29, 131, 72];
	}
	else if (percent >= 0.6) {
		return [24, 106, 59];
	}
	else {
		return [255, 255, 255];
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

let heatMap = {
	1: {made: 0, missed: 0},
	2: {made: 0, missed: 0},
	3: {made: 0, missed: 0},
	4: {made: 0, missed: 0},
	5: {made: 0, missed: 0},
	6: {made: 0, missed: 0},
	7: {made: 0, missed: 0},
	8: {made: 0, missed: 0},
	9: {made: 0, missed: 0}
}

nba.stats.shots(params).then((res) => {
	let shots = res.shot_Chart_Detail;
	let num_shots = shots.length;

	for (let i = 0; i < num_shots; ++i) {
		let shot = shots[i];

		if (shot.locX >= -250 && shot.locX <= -83) {
			// left side
			if (shot.locY >= -50 && shot.locY <= 116) {
				// low 
				updateMap(3, shot)
			}
			else if (shot.locY >= 116 && shot.locY <= 283) {
				// mid
				updateMap(6, shot);
			}
			else if (shot.locY >= 283 && shot.locY <= 450) {
				// deep
				updateMap(9, shot);
			}
		}
		else if (shot.locX >= -83 && shot.locX <= 83) {
			// middle
			if (shot.locY >= -50 && shot.locY <= 116) {
				// low 
				updateMap(2, shot);

			}
			else if (shot.locY >= 116 && shot.locY <= 283) {
				// mid
				updateMap(5, shot);
			}
			else if (shot.locY >= 283 && shot.locY <= 450) {
				// deep
				updateMap(8, shot);
			}
		}
		else if (shot.locX >= 83 && shot.locX <= 250) {
			// right side
			if (shot.locY >= -50 && shot.locY <= 116) {
				// low 
				updateMap(1, shot);
			}
			else if (shot.locY >= 116 && shot.locY <= 283) {
				// mid
				updateMap(4, shot);
			}
			else if (shot.locY >= 283 && shot.locY <= 450) {
				// deep
				updateMap(7, shot);
			}
		}
	}

	for (let i = 1; i <= 9; ++i) {
		let percent = heatMap[i].made / (heatMap[i].made + heatMap[i].missed);

		replace_color(i, colorFromPercent(percent));

		console.log(i, heatMap[i].made / (heatMap[i].made + heatMap[i].missed));
	}
});

