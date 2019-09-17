let map = document.getElementById('map');

for (let i = 0; i < 10; ++i) {
    let row = document.createElement('tr');
    for (let j = 0; j < 10; ++j) {
        let cell = document.createElement('td');
        let img = document.createElement('img');
        let index = i*10 + j + 1;
        img.src = 'court_parts/' + index + '.png';
        cell.appendChild(img);
        row.appendChild(cell);
    }
    map.appendChild(row);
}