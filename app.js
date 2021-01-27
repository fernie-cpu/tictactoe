//factory function
const players = (name, move) => {
    return {name, move};
};

//module
let displayController = (function() {
    const resultDiv = document.querySelector('.result');
    const playersDiv = document.querySelector('.players');

    player1 = players('Player 1', 'X');
    player2 = players('Player 2', 'O');

    player1info = document.querySelector('#player1info');
    player2info = document.querySelector('#player2info');

    player1info.addEventListener('keyup', () => {
        name = player1info.value == '' ? 'Player 2' : player1info.value;
        player2 = players(name, 'x')
    });

    player2info.addEventListener('keyup', () => {
        name = player2info.value == '' ? 'Player 2' : player1info.value;
        player2 = players(name, 'O')
    });

    computerTurn = false;
    smartComputerTurn = false;

    //select player
    const AI = document.getElementById('AI');
    AI.addEventListener('click', () => {
        player2 = players('Dummy', 'O');
        player2info.value = 'Dummy';
        computerTurn = true;
        smartComputerTurn = false;
        game.replayGame();
    });

    const hardAI = document.getElementById('AI-hard');
    hardAI.addEventListener('click', () => {
        player2 = players('Unbeatable', 'O');
        player2info.value = 'Unbeatable';
        computerTurn = false;
        smartComputerTurn = true;
        game.replayGame();
    });

    const twoPlayers = document.getElementById('two-players');
    twoPlayers.addEventListener('click', () => {
        player2 = players('', 'O');
        player2info.value = '';
        computerTurn = false;
        smartComputerTurn = false;
        game.replayGame();
    });

    let displayResult = (result) => {
        playersDiv.style.display = 'none';
        resultDiv.style.display = 'flex';
        if (result == 'tie') {
            resultDiv.textContent = 'It\'s a tie!';
        } else {
            resultDiv.textContent = `${result.name} (${result.move}) wins!`;
        };
    }

    let clearBoard = () => {
        for (let i = 0; i < 9; i++) {
            game.gameCells[i].textContent = '';
        }
    };

    return { player1, player2, resultDiv, playersDiv, displayResult, clearBoard };
})();

let game = (function () {
    const gameCells = document.querySelectorAll('.cell'); //try change to data-cell later
    const replayBtn = document.querySelector('.replay-btn');
    replayBtn.addEventListener('click',replayGame);

    let gameBoard = Array(9).fill('');
    let xMove = true;
    let gameOn = true;

    gameCells.forEach(gameCell => {
        gameCell.addEventListener('click', handleClick);
    });

    function handleClick(e) {
        const gameCell = e.target;
        if (gameOn && gameCell.textContent == '') {
            let cellId = gameCell.id.replace(/[^0-9]/g, '');
            const currentPlayer = xMove ? player1 : player2;
            
            gameBoard[cellId] = currentPlayer.move;
            gameCells[cellId].textContent = currentPlayer.move;
            checkWinner(currentPlayer);
            xMove = !xMove;
        }

        //random AI
        if (computerTurn && gameOn) {
            let computerMove;
            function getEmptyCells() {
                return gameBoard.filter(el => {
                    return el == '';
                })
            };
            
            function setComputerMove() {
                while (gameBoard[computerMove] != '' && getEmptyCells().length != 0) {
                    computerMove = Math.floor(Math.random() * 9);
                }
            };

            setComputerMove();
            xMove = !xMove;
            gameBoard[computerMove] = 'O';
            gameCells[computerMove].textContent = 'O';
            checkWinner(player2);
        }

        //smart AI
        if (smartComputerTurn && gameOn) {
            let bestScore = -Infinity;
            let bestMove;
            for (let i = 0; i < gameBoard.length; i++) {
                if (gameBoard[i] == '') {
                    gameBoard[i] = 'O';
                    let score = minimax(gameBoard, 0, false);
                    gameBoard[i] = '';

                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                }
            }
            xMove = !xMove;
            gameBoard[bestMove] = 'O';
            gameCells[bestMove].textContent = 'O';
            checkWinner(player2);
        }

        function minimax(gameBoard, depth, isMaximizing) {
            // 'x' : -1; 'o' : 1; 'tie' : 0
            if (checkWin('X')) { return -1 };
            if (checkWin('O')) { return 1 };
            if (checkTie()) { return 0 };

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < gameBoard.length; i++) {
                    if (gameBoard[i] == '') {
                        gameBoard[i] = 'O';
                        let score = minimax(gameBoard, depth +1, false);
                        gameBoard[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < gameBoard.length; i++) {
                    if (gameBoard[i] == '') {
                        gameBoard[i] = 'X';
                        let score = minimax(gameBoard, depth + 1, true);
                        gameBoard[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }
    }

    function checkWinner(currentPlayer) {
        if (checkTie()) {
            displayController.displayResult('tie');
            gameOn = false;
        }
        if (checkWin(currentPlayer.move)) {
            displayController.displayResult(currentPlayer);
            gameOn = false;
        }
    };

    function checkWin(move) {
        let winCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [2, 4, 6],
            [0, 4, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8]
        ]    
            return winCombinations.some(combination => {
                return combination.every(index => {
                return gameBoard[index] == move;
            });
        });
    }

    function checkTie() {
            return gameBoard.every(index => {
                return index == 'X' || index == 'O';
            })
    }

    function replayGame() {
        displayController.resultDiv.style.display = 'none';
        displayController.playersDiv.style.display = 'flex';
        gameBoard = Array(9).fill('');
        gameOn = true;
        xMove = true;
        displayController.clearBoard();
    };

    return { replayGame, gameCells, gameBoard };
})();