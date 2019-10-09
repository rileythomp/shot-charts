let team_abbreviations = {
	1610612737: 'ATL',
	1610612738: 'BOS',
	1610612751: 'BKN',
	1610612766: 'CHA',
	1610612741: 'CHI',
	1610612739: 'CLE',
	1610612742: 'DAL',
	1610612743: 'DEN',
	1610612765: 'DET',
	1610612744: 'GSW',
	1610612745: 'HOU',
	1610612754: 'IND',
	1610612746: 'LAC',
	1610612747: 'LAL',
	1610612763: 'MEM',
	1610612748: 'MIA',
	1610612749: 'MIL',
	1610612750: 'MIN',
	1610612740: 'NOP',
	1610612752: 'NYK',
	1610612760: 'OKC',
	1610612753: 'ORL',
	1610612755: 'PHI',
	1610612756: 'PHX',
	1610612757: 'POR',
	1610612758: 'SAC',
	1610612759: 'SAS',
	1610612761: 'TOR',
	1610612762: 'UTA',
	1610612764: 'WAS'
}

function get_image_url(player, id) {
	if (player == undefined) {
		return 'https://stats.nba.com/media/img/teams/logos/' + team_abbreviations[id] + '_logo.svg'
	}
	return 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/' + player.playerId + '.png';
}

function get_shot_area(shot) {
	let basic = shot.shotZoneBasic;
	let range = shot.shotZoneRange;
	let area = shot.shotZoneArea;

	if (basic == 'Above the Break 3' && range == 'Back Court Shot' && area == 'Back Court(BC)') {
		return 0;
	} else if (basic == 'Above the Break 3' && range == '24+ ft.' && area == 'Center(C)') {
		return 1;
	} else if (basic == 'Above the Break 3' && range == '24+ ft.' && area == 'Left Side Center(LC)') {
		return 2;
	} else if (basic == 'Above the Break 3' && range == '24+ ft.' && area == 'Right Side Center(RC)') {
		return 3;
	} else if (basic == 'Backcourt' && range == 'Back Court Shot' && area == 'Back Court(BC)') {
		return 4;
	} else if (basic == 'In The Paint (Non-RA)' && range == '8-16 ft.' && area == 'Center(C)') {
		return 5;
	} else if (basic == 'In The Paint (Non-RA)' && range == 'Less Than 8 ft.' && area == 'Center(C)') {
		return 6;
	} else if (basic == 'In The Paint (Non-RA)' && range == '8-16 ft.' && area == 'Left Side(L)') {
		return 7;
	} else if (basic == 'In The Paint (Non-RA)' && range == '8-16 ft.' && area == 'Right Side(R)') {
		return 8;
	} else if (basic == 'Left Corner 3' && range == '24+ ft.' && area == 'Left Side(L)') {
		return 9;
	} else if (basic == 'Mid-Range' && range == '8-16 ft.' && area == 'Center(C)') {
		return 10;
	} else if (basic == 'Mid-Range' && range == '16-24 ft.' && area == 'Center(C)') {
		return 11;
	} else if (basic == 'Mid-Range' && range == '16-24 ft.' && area == 'Left Side Center(LC)') {
		return 12;
	} else if (basic == 'Mid-Range' && range == '16-24 ft.' && area == 'Left Side(L)') {
		return 13;
	} else if (basic == 'Mid-Range' && range == '8-16 ft.' && area == 'Left Side(L)') {
		return 14;
	} else if (basic == 'Mid-Range' && range == '16-24 ft.' && area == 'Right Side Center(RC)') {
		return 15;
	} else if (basic == 'Mid-Range' && range == '16-24 ft.' && area == 'Right Side(R)') {
		return 16;
	} else if (basic == 'Mid-Range' && range == '8-16 ft.' && area == 'Right Side(R)') {
		return 17;
	} else if (basic == 'Restricted Area' && range == 'Less Than 8 ft.' && area == 'Center(C)') {
		return 18;
	} else if (basic == 'Right Corner 3' && range == '24+ ft.' && area == 'Right Side(R)') {
		return 19;
	}
}

function create_heat_map(shots) {
	const court_length = 500;
	const partitions = 50;
	const partition_length = court_length/partitions;
	const num_cells = partitions*partitions;
	const topY = 450;
	const leftX = -250;
	const bottomY = -50;
	const rightX = 250;

	let heat_map = {shot_count: 0};
	for (let i = 1; i <= num_cells; ++i) {
		heat_map[i] = {made: 0, missed: 0, total: 0, area: -1};
	}

	for (let i = 0; i < shots.length; ++i) {
		let shot = shots[i];
		let yLoc = shot.locY;
		let xLoc = shot.locX;

		if (yLoc > topY) {
			yLoc = topY;
		} else if (yLoc < bottomY) {
			yLoc = bottomY;
		}

		if (xLoc > rightX) {
			xLoc = rightX;
		} else if (xLoc < leftX) {
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
		} else {
			heat_map[region].missed += 1;
		}

		heat_map[region].total += 1;
		heat_map.shot_count += 1;
	}

	return heat_map;
}

function set_stats_params(player, teamId, season, season_type) {
	if (player != undefined) {
		return {
			PlayerID: player.playerId,
			Season: season,
			SeasonType: season_type
		}
	} else {
		return {
			TeamID: teamId,
			Season: season,
			SeasonType: season_type
		}
	}
}

exports.get_image_url = get_image_url;
exports.create_heat_map = create_heat_map;
exports.set_stats_params = set_stats_params;