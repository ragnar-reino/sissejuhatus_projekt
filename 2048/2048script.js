/* Muutujad  */
var board;
var score = 0;
var rows = 4;
var columns = 4;

window.onload = function() {
    setGame();
}

/* 2048 üles seadmine */
function setGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    let rowBuffer = [...board];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // Loo div element iga kasti jaoks
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").appendChild(tile);
        }
    }

    setTwo();
    setTwo();
}

/* vaatab, kas lauas on tühi kast */
function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) {
                return true;
            }
        }
    }
    return false;
}



function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }

    let found = false;
    while (!found) {
        // genereeri juhuslikud read ja veerud, kuhu seada number 2
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);

        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
}

// Uuenda numbreid
function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = ""; // Eemalda kõik klassid, et uus lisada
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x" + num.toString());
        } else {
            tile.classList.add("x8192");
        }
    }
}
/* kutsub funktsiooni kui klahv lahti lastakse, mitte peale vajutamisel, et vältida peal hoidmist */
document.addEventListener("keyup", (e) => {
    let rowBuffer = board.map(function(arr) {
        return arr.slice();
    });

    if (e.code == "ArrowLeft") {
        slideLeft();
        setTwo();
    } else if (e.code == "ArrowRight") {
        slideRight();
        setTwo();
    } else if (e.code == "ArrowUp") {
        slideUp();
        setTwo();
    } else if (e.code == "ArrowDown") {
        slideDown();
        setTwo();
    }

    console.log(rowBuffer.toString());
    console.log(board.toString());
    if (rowBuffer.toString() == board.toString() && !hasEmptyTile()) {
        console.log("game over");
        if (document.getElementById("board").children.length <= 16) {
            let gameOverMessage = document.createElement("h2");
            gameOverMessage.innerText = "Mäng läbi!";
            document.getElementById("board").appendChild(gameOverMessage);
        }
    }
    document.getElementById("score").innerText = score;
});

function filterZero(row) {
    return row.filter(num => num !== 0);
}

// ühenda ruudud
function slide(row) {
    row = filterZero(row);

    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] == row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }

    row = filterZero(row);

    // lisa nullid tagasi
    while (row.length < columns) {
        row.push(0);
    }

    return row;
}

/* lükka vasakule */
function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;

        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

/* lükka paremale, saab kasutada vasakule lükkamise funktsiooni kui pöörata rea numbrid ümber, lükata kokku ja siis uuesti ümber pöörata */
function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row.reverse()).reverse(); 
        board[r] = row;

        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        /* Võtame read ja teeme ühe veeru, millest tekib uus "rida" */
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        board[0][c] = row[0];
        board[1][c] = row[1];
        board[2][c] = row[2];
        board[3][c] = row[3];
        
        for (let r = 0; r < rows; r++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

/* sama loogika, mis vasakule ja paremale lükkamisel, rea ümber pöörates saab kasutada sama funktsiooni */
function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row.reverse()).reverse();
        board[0][c] = row[0];
        board[1][c] = row[1];
        board[2][c] = row[2];
        board[3][c] = row[3];
        
        for (let r = 0; r < rows; r++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}