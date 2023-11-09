'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


function countNegMines(mat,cell){
    var count = 0
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i > mat.length-1) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (j < 0 || j > mat.length-1) continue
            if (i === cell.i && j === cell.j) continue
            if (mat[i][j].isMine) count++
        }
    }
    return count
    
}