'use strict'


const gLevel = {
    size: 0,
    numOfMines: 0
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gBoard = []

function onInit() {
    var elGame = document.querySelector('.game')
    elGame.addEventListener("contextmenu", e => { e.preventDefault() })
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.isOn = true

    gBoard = buildBoard()
    renderBoard(gBoard)

}

//DONE:create game board on difficulty level. place a number of mines according to dificulty at random positions and set mine negs num at correct cells
function buildBoard() {
    if (gLevel.size === 0) return
    var boardSize = Math.sqrt(gLevel.size)
    var board = []
    for (var i = 0; i < boardSize; i++) {
        board[i] = []
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                emptyCells.push({ i, j })
            }
        }
    }
    for (var i = 0; i < gLevel.numOfMines; i++) {
        var randomCell = emptyCells.splice(getRandomInt(0, emptyCells.length), 1)[0]
        board[randomCell.i][randomCell.j].isMine = true
    }
    setMinesNegsCount(board)
    printBoard(board)
    return board
}
//Done:render the game board onto the HTML
function renderBoard(board) {
    if (gLevel.size === 0) return
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) var classlist = `is-mine`
            else var classlist = `is-${board[i][j].minesAroundCount}`
            strHTML += `<button data-i="${i}" data-j="${j}" class="${classlist}"  onclick="onCellClick(this, ${i}, ${j})" "></button> `
        }
    }
    var elGame = document.querySelector('.game')
    elGame.innerHTML = strHTML
    elGame.style.gridTemplateColumns = `repeat(${Math.sqrt(gLevel.size)}, 0fr)`
}

function onCellClick(elCell, idx, jdx) {
    if (!gGame.isOn || gBoard[idx][jdx].isShown) return

    if (gBoard[idx][jdx].isMine) {
        gameOver()
        elCell.style.backgroundColor = 'red';
    }

    expandShown(elCell, idx, jdx)

}

function expandShown(elCell, idx, jdx) {
    if (gBoard[idx][jdx].isMine || gBoard[idx][jdx].isShown) return

    gBoard[idx][jdx].isShown = true
    gGame.shownCount++
    elCell.setAttribute('disabled', '')
    elCell.innerText = gBoard[idx][jdx].minesAroundCount

    if (gBoard[idx][jdx].minesAroundCount === 0) {
        for (var i = idx - 1; i <= idx + 1; i++) {
            if (i < 0 || i > gBoard.length) continue
            for (var j = jdx - 1; j <= jdx + 1; j++) {
                if (j < 0 || j > gBoard.length) continue
                const negCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                onCellClick(negCell, i, j)
            }
        }

    }
}

//DONE:set board size and number of mines according to dificulty
function selectDificulty(elBtn) {
    var level = elBtn.innerText
    switch (level) {
        case 'Begginer':
            gLevel.size = 16
            gLevel.numOfMines = 2
            break
        case 'Intermidiet':
            gLevel.size = 25
            gLevel.numOfMines = 5
            break
        case 'Expert':
            gLevel.size = 100
            gLevel.numOfMines = 10
            break
        default:
            gLevel.size = 0
            gLevel.numOfMines = 0
            break
    }
    onInit()
}

//DONE:set the num of mine negs around cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegs(board, { i, j })
        }
    }


}

function onCellMarked(elCell) {



}

function printBoard(board) {
    const mat = []
    for (var i = 0; i < board.length; i++) {
        mat[i] = []
        for (var j = 0; j < board[i].length; j++) {
            mat[i][j] = (board[i][j].isMine) ? '*' : board[i][j].minesAroundCount
        }
    }
    console.table(mat)
}

function gameOver() {
    showMines(gBoard)
    gGame.isOn = false
}

//Done: Show all mines on screen
function showMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.innerText = '*'
            }

        }

    }
}