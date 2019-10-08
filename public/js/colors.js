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
    let upper_third_len = Math.floor((max - avg_num_shots)/3);
    let lower_third_len = Math.floor((avg_num_shots - min)/3);
    
    if (total_shots == 0) {
		return 'rgb(222, 184, 135)'; 
    } else if (total_shots >= avg_num_shots + 2*upper_third_len) {
		return 'rgb(0, 255, 0)';
    } else if (total_shots >= avg_num_shots + upper_third_len) {
		return 'rgb(71, 255, 0)';
    } else if (total_shots >= avg_num_shots) {
		return 'rgb(159, 255, 86)';
    } else if (total_shots == Math.floor(avg_num_shots)) {
		return 'rgb(0, 255, 255)';
    } else if (total_shots >= avg_num_shots - lower_third_len) {
		return 'rgb(0, 200, 255)';
    } else if (total_shots >= avg_num_shots - 2*lower_third_len) {
		return 'rgb(0, 150, 255)';
	} else if (total_shots >= avg_num_shots - 3*lower_third_len) {
		return 'rgb(0, 100, 255)';
    } else {
        return 'rgb(222, 184, 135)'; 
    }
}