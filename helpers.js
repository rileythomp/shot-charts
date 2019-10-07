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

function get_shot_area(basic, area, range) {
	if (basic == 'Above the Break 3' && area == 'Back Court Shot' && range == 'Back Court(BC)') {
		return 0;
	}
	if (basic == 'Above the Break 3' && area == '24+ ft.' && range == 'Center(C)') {
		return 1;
	}
	if (basic == 'Above the Break 3' && area == '24+ ft.' && range == 'Left Side Center(LC)') {
		return 2;
	}
	if (basic == 'Above the Break 3' && area == '24+ ft.' && range == 'Right Side Center(RC)') {
		return 3;
	}
	if (basic == 'Backcourt' && area == 'Back Court Shot' && range == 'Back Court(BC)') {
		return 4;
	}
	if (basic == 'In The Paint (Non-RA)' && area == '8-16 ft.' && range == 'Center(C)') {
		return 5;
	}
	if (basic == 'In The Paint (Non-RA)' && area == 'Less Than 8 ft.' && range == 'Center(C)') {
		return 6;
	}
	if (basic == 'In The Paint (Non-RA)' && area == '8-16 ft.' && range == 'Left Side(L)') {
		return 7;
	}
	if (basic == 'In The Paint (Non-RA)' && area == '8-16 ft.' && range == 'Right Side(R)') {
		return 8;
	}
	if (basic == 'Left Corner 3' && area == '24+ ft.' && range == 'Left Side(L)') {
		return 9;
	}
	if (basic == 'Mid-Range' && area == '8-16 ft.' && range == 'Center(C)') {
		return 10;
	}
	if (basic == 'Mid-Range' && area == '16-24 ft.' && range == 'Center(C)') {
		return 11;
	}
	if (basic == 'Mid-Range' && area == '16-24 ft.' && range == 'Left Side Center(LC)') {
		return 12;
	}
	if (basic == 'Mid-Range' && area == '16-24 ft.' && range == 'Left Side(L)') {
		return 13;
	}
	if (basic == 'Mid-Range' && area == '8-16 ft.' && range == 'Left Side(L)') {
		return 14;
	}
	if (basic == 'Mid-Range' && area == '16-24 ft.' && range == 'Right Side Center(RC)') {
		return 15;
	}
	if (basic == 'Mid-Range' && area == '16-24 ft.' && range == 'Right Side(R)') {
		return 16;
	}
	if (basic == 'Mid-Range' && area == '8-16 ft.' && range == 'Right Side(R)') {
		return 17;
	}
	if (basic == 'Restricted Area' && area == 'Less Than 8 ft.' && range == 'Center(C)') {
		return 18;
	}
	if (basic == 'Right Corner 3' && area == '24+ ft.' && range == 'Right Side(R)') {
		return 19;
	}
}

function headshot(player) {
	return 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/' + player.teamId + '/2018/260x190/' + player.playerId + '.png';
}

function logo(id) {
	return 'https://stats.nba.com/media/img/teams/logos/' + team_abbreviations[id] + '_logo.svg'
}

exports.get_shot_area = get_shot_area;
exports.headshot = headshot;
exports.logo = logo;
