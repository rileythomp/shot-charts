const team_colors = {
  'ATL': '226,26,55',
  'BOS': '0,97,27',
  'BKN': '0,0,0',
  'CHA': '0,132,142',
  'CHI': '176,2,3',
  'CLE': '134,0,56',
  'DAL': '0,107,182',
  'DEN': '254,185,39',
  'DET': '250,0,44',
  'GSW': '0,51,153',
  'HOU': '205,33,43',
  'IND': '255,181,23',
  'LAC': '237,23,75',
  'LAL': '253,186,51',
  'MEM': '93,118,169',
  'MIA': '152,0,46',
  'MIL': '0,71,27',
  'MIN': '43,98,145',
  'NOP': '12,35,64',
  'NYK': '245,132,38',
  'OKC': '0,45,98',
  'ORL': '0,119,192',
  'PHI': '239,0,34',
  'PHX': '231,98,33',
  'POR': '204,0,0',
  'SAC': '81,56,138',
  'SAS': '149,145,145',
  'TOR': '189,27,33',
  'UTA': '249,161,30',
  'WAS': '207,20,43'
}

function get_team_color(data) {
    if (data.display_info.commonPlayerInfo == undefined) {
        return team_colors[data.display_info.teamInfoCommon[0].teamAbbreviation];
    }
    return team_colors[data.display_info.commonPlayerInfo[0].teamAbbreviation];
}

function color_from_absolute(percent) {
  if (percent < 0) {
      return 'rgb(222, 184, 135)';
  } else if (percent >= 0.6) {
      return 'rgb(0, 255, 0)';
  } else if (percent >= 0.5 && percent <= 0.6) {
      return 'rgb(71, 255, 0)';
  } else if (percent >= 0.4 && percent <= 0.5) {
      return 'rgb(159, 255, 86)';
  } else if (percent >= 0.3 && percent <= 0.4) {
      return 'rgb(255, 255, 0)';
  } else if (percent >= 0.2 && percent <= 0.3) {
      return 'rgb(255, 175, 0)';
  } else if (percent >= 0.1 && percent <= 0.2) {
      return 'rgb(255, 87, 0)';
  } else if (percent >= 0 && percent <= 0.1) {
      return 'rgb(255, 0, 0)';
  }
}

function color_from_relative(percent, league_avg) {
  if (league_avg == undefined || percent < 0) {
      return 'rgb(222, 184, 135)';
  }

  let diff = percent - league_avg.fgPct;

  if (diff >= 0.15) {
      return 'rgb(0, 255, 0)';
  } else if (diff >= 0.1) {
      return 'rgb(71, 255, 0)';
  } else if (diff >= 0.05) {
      return 'rgb(159, 255, 86)';
  } else if (Math.abs(diff) < 0.05) {
      return 'rgb(255, 255, 0)';
  } else if (diff >= -0.1) {
      return 'rgb(255, 175, 0)';
  } else if (diff >= -0.15) {
      return 'rgb(255, 87, 0)';
  } else if (diff < -0.2) {
      return 'rgb(255, 0, 0)';
  }
}

function color_from_frequency(avg_num_shots, max, min, total_shots) {
  let upper_third_len = Math.floor((max - avg_num_shots) / 3);
  let lower_third_len = Math.floor((avg_num_shots - min) / 3);

  if (total_shots == 0) {
      return 'rgb(222, 184, 135)';
  } else if (total_shots >= avg_num_shots + 2 * upper_third_len) {
      return 'rgb(0, 255, 0)';
  } else if (total_shots >= avg_num_shots + upper_third_len) {
      return 'rgb(71, 255, 0)';
  } else if (total_shots >= avg_num_shots) {
      return 'rgb(159, 255, 86)';
  } else if (total_shots == Math.floor(avg_num_shots)) {
      return 'rgb(0, 255, 255)';
  } else if (total_shots >= avg_num_shots - lower_third_len) {
      return 'rgb(0, 200, 255)';
  } else if (total_shots >= avg_num_shots - 2 * lower_third_len) {
      return 'rgb(0, 150, 255)';
  } else if (total_shots >= avg_num_shots - 3 * lower_third_len) {
      return 'rgb(0, 100, 255)';
  } else {
      return 'rgb(222, 184, 135)';
  }
}

function set_cell_color(chart_type, percent, avg_shots_per_region, max, min, shots_total, league_avg) {
  if (chart_type == 'absolute') {
      return color_from_absolute(percent);
  } else if (chart_type == 'frequency') {
      return color_from_frequency(avg_shots_per_region, max, min, shots_total);
  }
  return color_from_relative(percent, league_avg);
}