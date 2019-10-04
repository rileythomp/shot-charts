$('#loader').hide();

let map = document.getElementById('map');
const partitions = 50;

for (let i = 7; i < partitions-2; ++i) {
    let row = document.createElement('tr');
    for (let j = 0; j < partitions; ++j) {
        let cell = document.createElement('td');
        cell.style.backgroundColor = 'burlywood';
        cell.style.opacity = '0.5';
        row.appendChild(cell);
    }
    map.appendChild(row);
}

String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

$('#nameform').submit(function(ev) {  
    ev.preventDefault();
    $('#loader').show();
    $('#load-msg').html('Creating chart...');
    $('#load-msg').show();

    let pname = $('#playername').val().capitalize(true);
    
    $.ajax({ 
        url: '/newplayerchart',
        type: 'POST',
        cache: false, 
        data: {name: pname}, 
        success: function(data){
            $('#loader').hide();
            $('#load-msg').show();

            for (let i = 0; i < map.children.length; ++i) {
                let row = map.children[i];
                for (let j = 0; j < row.children.length; ++j) {
                    let cell = row.children[j];
                    cell.style.backgroundColor = data[i*partitions + j + 1];
                }
            }

            $('#load-msg').hide();
            $('#chart-description').html(pname);
        }
        , error: function(jqXHR, textStatus, err){
            console.error("Error: ", jqXHR.status, jqXHR.responseText, textStatus, err);
            $('#loader').hide();
            $('#load-msg').html(jqXHR.responseText);
        }
    })
});  

function save_chart(uri, file_name) {
    let link = $('<a>')
    .attr('href', uri)
    .attr('download', file_name)
    .appendTo("body");

    link.get(0).click();
    link.remove();

    $('#loader').hide();
    $('#load-msg').hide();
};

$('#save-button').on('click', function(e) {
    e.preventDefault();

    let pname = $('#chart-description').text();

    if (pname == '') {
        $('#load-msg').html('No player selected');
        $('#load-msg').show();
        return;
    }

    $('#load-msg').html('Saving chart...');
    $('#load-msg').show();
    $('#loader').show();

    html2canvas($('#map').get(0))
    .then(function(canvas) {
        let img = canvas.toDataURL("image/png")
        let uri = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

        save_chart(uri, $('#chart-description').text() + ' shot chart.png');
    });
}); 