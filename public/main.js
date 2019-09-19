let map = document.getElementById('map');
const partitions = 30;

String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

$('#loader').hide();

for (let i = 7; i < partitions-2; ++i) {
    let row = document.createElement('tr');
    for (let j = 0; j < partitions; ++j) {
        let cell = document.createElement('td');
        let img = document.createElement('img');

        let index = i*partitions + j + 1;

        img.src = 'court_bits/' + index + '.png';

        cell.appendChild(img);
        row.appendChild(cell);
    }
    map.appendChild(row);
}

$('#nameform').submit(function(e){  
    e.preventDefault();
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
            localStorage.setItem('player_name', pname);
            $('#loader').hide();
            $('#load-msg').show();
            location = location;
        }
        , error: function(jqXHR, textStatus, err){
            console.error("Error: ", textStatus, err);
        }
    })
});  

$(window).on('load', function() {
    $('#chart-description').html(localStorage.getItem('player_name'));
})

$('#save-button').on('click', function(e) {
    e.preventDefault();

    $('#load-msg').html('Saving chart...');
    $('#load-msg').show();

    $('#loader').show();

    html2canvas($('#map').get(0))
    .then(function(canvas) {
        function save_chart(uri, file_name){
            let link = $('<a>')
            .attr('href', uri)
            .attr('download', file_name)
            .appendTo("body");

            link.get(0).click();

            link.remove();

            $('#loader').hide();
            $('#load-msg').hide();
        };

        let img = canvas.toDataURL("image/png")
        let uri = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

        save_chart(uri, localStorage.getItem('player_name') + ' shot chart.png');
    });
}); 