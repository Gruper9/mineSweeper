'use strict'


const gLevel = {
    size: 0,
    numOfMines: 0,
    liveCount: 0
}
const gGame = {
    isOn: false,
    liveCount: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isWin: false,
}

var gTimerInterval = 0
var gBoard = []

function onInit() {
    gGame.liveCount = gLevel.liveCount
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.isOn = true
    gGame.isWin = false

    clearInterval(gTimerInterval)

    gBoard = buildBoard()
    renderBoard(gBoard)
    updateText()

    resetHints()
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
            // var classlist = (board[i][j].isMine) ? `is-mine` : `is-${board[i][j].minesAroundCount}`
            strHTML += `<button data-i="${i}" data-j="${j}" class="" oncontextmenu="onCellMarked(this)" onclick="onCellClick(this, ${i}, ${j})" "></button> `
        }
    }
    var elGame = document.querySelector('.game')
    elGame.innerHTML = strHTML
    createClass(board)
    elGame.style.gridTemplateColumns = `repeat(${Math.sqrt(gLevel.size)}, 0fr)`
}
//Done: create and add class to every cell
function createClass(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var classlist = (board[i][j].isMine) ? `is-mine` : `is-${board[i][j].minesAroundCount}`
            var cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

            cell.className = classlist
        }
    }

}
function onCellClick(elCell, idx, jdx) {
    if (!gGame.isOn) return

    if (!gGame.markedCount && !gGame.shownCount)
        firstClick(elCell)

    if (gBoard[idx][jdx].isMine) {
        gotHit(elCell)
        if (!gGame.liveCount)
            gameOver(gGame.isWin)
        return
    }

    expandShown(elCell, idx, jdx)

    if (gGame.markedCount === gLevel.numOfMines || gGame.shownCount === (gLevel.size - gLevel.numOfMines)) {
        gGame.isWin = true
        gameOver(gGame.isWin)
    }

}
//Done: start timer interval, deal with first click on mine
function firstClick(elCell) {
    gTimerInterval = setInterval(gameRun, 1000)

    var pos = elCell.dataset
    console.log(pos);
    if (gBoard[pos.i][pos.j].isMine) {
        var cell = getNoneMineCell(gBoard)

        gBoard[pos.i][pos.j].isMine = false
        gBoard[cell.i][cell.j].isMine = true
        setMinesNegsCount(gBoard)
        createClass(gBoard)
        printBoard(gBoard)
    }

}
function gameRun() {
    var elTimer = document.querySelector('.time')
    elTimer.classList.remove('hide')
    liveCounter()
    gGame.secsPassed++
    elTimer.innerText = gGame.secsPassed
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
    if (gGame.isHint) {
        showHint(elCell)
    }

}

//DONE:set board size and number of mines according to dificulty
function selectDificulty(elBtn) {
    var level = elBtn.innerText
    switch (level) {
        case 'Begginer':
            gLevel.size = 16
            gLevel.numOfMines = 2
            gLevel.liveCount = 1
            break
        case 'Medium':
            gLevel.size = 64
            gLevel.numOfMines = 14
            gLevel.liveCount = 3
            break
        case 'Expert':
            gLevel.size = 144
            gLevel.numOfMines = 32
            gLevel.liveCount = 3
            break
        default:
            gLevel.size = 0
            gLevel.numOfMines = 0
            gLevel.liveCount = 3
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

    if (!isWin) {
        showMines(gBoard)
    }
    clearInterval(gTimerInterval)

    updateText()
}

//Done: Show all mines on screen
function showMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.style.fontSize = '20px'
                elCell.innerText = '*'
                elCell.removeAttribute('disabled', '')
            }
        }
    }
}
//Done: update the text and smily emoji on screen arrording to game progress
function updateText() {
    var elSpan = document.querySelector('.endgame')
    var elSmily = document.querySelector('.smily')
    var elTimer = document.querySelector('.time')
    if (gLevel.size === 0) return
    elTimer.innerText = gGame.secsPassed

    if (gGame.liveCount > 0 && gGame.isOn) {
        liveCounter()
        elSpan.innerText = ''
        elSmily.innerText = '🤪'
        return
    }

    elSpan.innerText = (gGame.isWin) ? "You Win" : "You Lose"
    elSmily.innerText = (gGame.isWin) ? "😎" : "😵"
}

function gotHit(elCell) {
    elCell.setAttribute('disabled', '')
    elCell.style.backgroundColor = 'red'
    elCell.style.fontSize = '10px'
    elCell.innerText = '💣'
    gGame.liveCount--
    gGame.markedCount++
    liveCounter()
}


function liveCounter() {
    var elLives = document.querySelector('.livecount')
    var strHTML = ''
    for (var i = 0; i < gGame.liveCount; i++)
        strHTML += '❤️'
    elLives.innerText = strHTML
}
//Done: return none mine cell that is not shown
function getSafeClick() {
    var safeCell = getNoneMineCell(gBoard)
    while(gBoard[safeCell.i][safeCell.j].isShown){
        var safeCell = getNoneMineCell(gBoard)
     }

    return safeCell
}
//Done: use a hint to find a safe cell to click
function getHint(elBtn) {
    if (gGame.isHint) return
    elBtn.setAttribute('disabled', '')
    elBtn.innerHTML = '<svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 	 viewBox="0 0 55.254 55.254" xml:space="preserve"><g>	<g>		<path style="fill:#010002;" d="M27.629,0C17.876,0,9.941,7.934,9.941,17.687c0,4.73,1.856,9.179,5.225,12.525			c0.106,0.108,0.266,0.476,0.273,0.677c0.057,1.468,0.466,4.837,2.841,7.472c-0.127,0.182-0.241,0.376-0.329,0.59			c-0.399,0.979-0.302,2.069,0.202,2.919c-0.372,0.971-0.262,2.043,0.22,2.858c-0.001,0.003-0.003,0.007-0.004,0.01			c-0.58,1.429-0.106,3.093,1.093,3.865c0.064,0.042,0.976,0.628,2.535,1.186c-0.017,0.219-0.121,2.186,1.306,3.746			c1.018,1.113,2.491,1.691,4.381,1.718c0.043,0,0.085,0.001,0.128,0.001c1.816-0.001,3.23-0.545,4.204-1.621			c1.386-1.529,1.269-3.484,1.234-3.844c1.47-0.526,2.376-1.077,2.533-1.18c1.213-0.782,1.685-2.449,1.099-3.873			c-0.002-0.004-0.003-0.008-0.005-0.012c0.487-0.822,0.594-1.885,0.226-2.844c0.499-0.843,0.602-1.943,0.2-2.935			c-0.081-0.195-0.185-0.373-0.298-0.541c2.351-2.639,2.767-6.031,2.827-7.512c0.008-0.198,0.175-0.577,0.281-0.685			c3.354-3.355,5.2-7.802,5.2-12.521C45.314,7.934,37.381,0,27.629,0z M29.793,51.618c-0.396,0.435-1.114,0.651-2.067,0.635			c-1.017-0.014-1.754-0.258-2.192-0.725c-0.277-0.295-0.412-0.656-0.479-0.953c0.482,0.079,0.99,0.141,1.523,0.181			c0.516,0.04,0.926,0.048,1.009,0.049c0.014,0,0.027,0,0.041,0s0.027,0,0.041,0c0.084-0.001,0.494-0.01,1.009-0.049			c0.55-0.042,1.068-0.108,1.563-0.189C30.194,50.887,30.081,51.3,29.793,51.618z M34.256,43.202			c-0.39,0.226-0.682,0.648-0.753,1.092c-0.122,0.755,0.327,1.262,0.603,1.578c0.041,0.1-0.016,0.232,0.049,0.217			c-0.021,0.014-2.235,1.413-5.706,1.675c-0.401,0.031-0.726,0.039-0.822,0.04c-0.097-0.002-0.421-0.01-0.822-0.04			c-3.426-0.259-5.624-1.625-5.647-1.625c0,0,0,0-0.001,0c-0.024-0.039-0.049-0.17,0.046-0.333c0.218-0.245,0.672-0.755,0.551-1.512			c-0.071-0.445-0.363-0.867-0.753-1.093L20.967,43.2c-0.024-0.038-0.05-0.167,0.022-0.313c0.216-0.271,0.618-0.774,0.484-1.499			c-0.055-0.295-0.204-0.576-0.415-0.794c1.167,0.546,3.356,1.345,6.24,1.388h0.677c1.194-0.018,2.262-0.17,3.193-0.376			c0.17-0.035,0.333-0.074,0.495-0.114c0.31-0.079,0.599-0.162,0.869-0.249c0.19-0.061,0.382-0.122,0.562-0.191			c0.426-0.155,0.792-0.31,1.088-0.448c-0.206,0.217-0.352,0.493-0.405,0.784c-0.134,0.72,0.26,1.215,0.516,1.548			c0.04,0.095,0.02,0.216,0.048,0.216h0.001L34.256,43.202z M37.993,28.087c-0.644,0.643-1.12,1.747-1.158,2.685			c-0.098,2.462-0.992,6.266-5.324,7.644c-0.053,0.016-0.101,0.032-0.155,0.048c-1.003,0.3-2.182,0.475-3.574,0.475h-0.14			c-7.739-0.064-9.089-5.142-9.204-8.165c-0.037-0.957-0.501-2.037-1.156-2.688c-2.799-2.78-4.34-6.473-4.34-10.398			c0-8.098,6.589-14.687,14.688-14.687c8.098,0,14.686,6.588,14.686,14.687C42.314,21.605,40.779,25.298,37.993,28.087z"/>		<path style="fill:#010002;" d="M34.148,21.562c-6.43,5.259-12.773,0.216-13.04,0c-0.161-0.131-0.384-0.147-0.564-0.047			c-0.179,0.102-0.277,0.303-0.248,0.507l2.042,13.867c0.041,0.274,0.29,0.466,0.568,0.422c0.272-0.04,0.462-0.294,0.422-0.567			L21.452,23c2.064,1.254,7.105,3.549,12.285,0.108l-2.381,12.614c-0.052,0.271,0.127,0.533,0.398,0.584			c0.031,0.006,0.062,0.009,0.094,0.009c0.235,0,0.445-0.168,0.49-0.407l2.617-13.867c0.039-0.207-0.056-0.416-0.236-0.523			C34.54,21.412,34.312,21.429,34.148,21.562z"/>	</g></g></svg>'

    var safeCell = getSafeClick()
    var cell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`)
    cell.classList.add('is-safe')

    setTimeout(() => { cell.classList.remove('is-safe') }, 3000)
}
//Done: reset number of hints
function resetHints() {
    var elBtn = document.querySelectorAll('.hints button')
    for (var i = 0; i < elBtn.length; i++) {
        elBtn[i].innerText = '💡'
        elBtn[i].removeAttribute('disabled', '')
    }
}

