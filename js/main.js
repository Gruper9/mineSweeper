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
var gIsWin = false
var gBoard = []

function onInit() {
    var elSpan = document.querySelector('.endgame')
    elSpan.innerText = ''

    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.isOn = true
    gIsWin = false

    gBoard = buildBoard()
    renderBoard(gBoard)
}

//DONE:create game board on difficulty level. 
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
    placeMines(board)
    setMinesNegsCount(board)
    printBoard(board)
    return board
}
//Done: return location {i,j} of random cell that is not a mine on the board
function getNoneMineCell(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                emptyCells.push({ i, j })
            }
        }
    }
    var randomCell = emptyCells.splice(getRandomInt(0, emptyCells.length), 1)[0]
    return randomCell
}
//Done: place mines at random locations on the board
function placeMines(board) {
    for (var i = 0; i < gLevel.numOfMines; i++) {
        var cell = getNoneMineCell(board)
        board[cell.i][cell.j].isMine = true
    }
    return board
}
//Done:render the game board onto the HTML
function renderBoard(board) {
    if (gLevel.size === 0) return
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var classlist = (board[i][j].isMine) ? `is-mine` : `is-${board[i][j].minesAroundCount}`
            strHTML += `<button data-i="${i}" data-j="${j}" class="${classlist}" oncontextmenu="onCellMarked(this)" onclick="onCellClick(this, ${i}, ${j})" "></button> `
        }
    }
    var elGame = document.querySelector('.game')
    elGame.innerHTML = strHTML
    elGame.style.gridTemplateColumns = `repeat(${Math.sqrt(gLevel.size)}, 0fr)`
}

function onCellClick(elCell, idx, jdx) {
    if (!gGame.isOn) return

    if (gBoard[idx][jdx].isMine) {
        gameOver(gIsWin)
        elCell.style.backgroundColor = 'red';
    }

    expandShown(elCell, idx, jdx)

    if (gGame.markedCount === gLevel.numOfMines || gGame.shownCount === (gLevel.size - gLevel.numOfMines)) {
        gIsWin = true
        gameOver(gIsWin)
    }

}

function expandShown(elCell, idx, jdx) {
    if (gBoard[idx][jdx].isMine || gBoard[idx][jdx].isShown || gBoard[idx][jdx].isMarked) return

    gBoard[idx][jdx].isShown = true
    gGame.shownCount++
    elCell.setAttribute('disabled', '')
    elCell.innerText = gBoard[idx][jdx].minesAroundCount
    if (gBoard[idx][jdx].minesAroundCount !== 0) return

    for (var i = idx - 1; i <= idx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = jdx - 1; j <= jdx + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            const negCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            onCellClick(negCell, i, j)
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
        case 'Medium':
            gLevel.size = 64
            gLevel.numOfMines = 14
            break
        case 'Expert':
            gLevel.size = 144
            gLevel.numOfMines = 32
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
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegMines(board, { i, j })
        }
    }
}
//Done:mark\unmark cell on rightclick
function onCellMarked(elCell) {
    event.preventDefault()
    if (!gGame.isOn) return
    var pos = elCell.dataset
    if (gBoard[pos.i][pos.j].isShown) return

    if (!gBoard[pos.i][pos.j].isMarked) {
        elCell.innerText = '🚩'
        elCell.classList.add('marked')
        gBoard[pos.i][pos.j].isMarked = true
        if (gBoard[pos.i][pos.j].isMine) gGame.markedCount++
    }
    else {
        elCell.innerText = ''
        elCell.classList.remove('marked')
        gBoard[pos.i][pos.j].isMarked = false
        if (gBoard[pos.i][pos.j].isMine) gGame.markedCount--
    }
}
//Done: print board layout to console
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

function gameOver(isWin) {
    gGame.isOn = false
    var elSpan = document.querySelector('.endgame')

    if (!isWin) {
        showMines(gBoard)
        
    }
    elSpan.innerText = (isWin) ? "You Win" : "You Lose"
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