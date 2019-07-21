function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffle(array) {
  var m = array.length,
    t,
    i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

class Game {
  constructor() {
    this.winningNumber = generateRandomInt(1, 100);
    this.pastGuesses = [];
    this.pastGuessCloseness = [];
    this.playersGuess = null;
    this.hintMin = 1;
    this.hintMax = 100;
    this.message = '';
    this.message2 = '';
    this.hintTaken = false;
    this.gameOver = false;
  }
  difference() {
    return Math.abs(this.playersGuess - this.winningNumber);
  }

  isLower() {
    return this.playersGuess < this.winningNumber;
  }

  checkGuess() {
    // invalid guess
    if (
      this.playersGuess < 1 ||
      this.playersGuess > 100 ||
      isNaN(this.playersGuess)
    ) {
      this.message = `That's not a valid guess.`;
      this.message2 = `Guess a number between 1 and 100.`;

      // duplicate guess
    } else if (this.pastGuesses.includes(this.playersGuess)) {
      this.message = ` `;
      this.message2 = `You've already guessed that number.`;

      // valid guesses
    } else {
      this.pastGuesses.push(this.playersGuess);
      let direction;
      if (this.isLower(this.playersGuess)) {
        direction = 'higher';
        this.hintMin = this.playersGuess + 1;
      } else {
        direction = 'lower';
        this.hintMax = this.playersGuess - 1;
      }

      // 1 winning guess:
      if (this.playersGuess === this.winningNumber) {
        this.message = `You win!`;
        this.message2 = ` `;
        this.pastGuessCloseness.push(1);
        this.gameOver = true;
      }
      // 0 losing guess
      else if (this.pastGuesses.length === 5) {
        this.message = `You lose.`;
        this.message2 = `(The number was ${this.winningNumber})`;
        this.pastGuessCloseness.push(0);
        this.gameOver = true;
      }
      // 2 burning up
      else if (this.difference() < 10) {
        this.message = `You're burning up!`;
        this.message2 = `Guess a little ${direction} than ${
          this.playersGuess
        }.`;
        this.pastGuessCloseness.push(2);
      }
      // 3 lukewarm
      else if (this.difference() < 25) {
        this.message = `You're lukewarm.`;
        this.message2 = `Guess ${direction} than ${this.playersGuess}.`;
        this.pastGuessCloseness.push(3);
      }
      // 4 chilly
      else if (this.difference() < 50) {
        this.message = `You're a bit chilly.`;
        this.message2 = `Guess ${direction} than ${this.playersGuess}.`;
        this.pastGuessCloseness.push(4);
      }
      // 5 ice cold
      else {
        this.message = `You're ice cold!`;
        this.message2 = `Guess a lot ${direction} than ${this.playersGuess}.`;
        this.pastGuessCloseness.push(5);
      }
    }
  }

  provideHint() {
    return shuffle([
      this.winningNumber,
      generateRandomInt(this.hintMin, this.hintMax),
      generateRandomInt(this.hintMin, this.hintMax),
    ]);
  }
}

function newGame() {
  return new Game();
}

function playGame() {
  const guessInput = document.getElementById('guess-input');
  const hintButton = document.getElementById('hint-button');
  const arrow = document.getElementById('arrow');
  const resetButton = document.getElementById('reset-button');
  const hint = document.getElementById('hint-text');
  const message = document.getElementById('message');
  const message2 = document.getElementById('message2');
  const className = {
    0: 'lose',
    1: 'win',
    2: 'burning-up',
    3: 'lukewarm',
    4: 'chilly',
    5: 'ice-cold',
  };

  const game = newGame();
  hintButton.disabled = true;
  arrow.hidden = true;
  guessInput.focus();

  // ***** SUBMIT GUESS *****
  function submitGuess() {
    game.playersGuess = Number(guessInput.value);
    game.checkGuess();

    // reset input / set cursor
    guessInput.value = null;
    guessInput.focus();

    // game messages
    message.innerHTML = `${game.message}`;
    message2.innerHTML = `${game.message2}`;

    // game over (input disabled, hints removed)
    if (game.gameOver) {
      guessInput.disabled = true;
      arrow.hidden = true;
      hintButton.disabled = true;
      game.playersGuess === game.winningNumber
        ? (message.className = 'message-win')
        : (message.className = 'message-lose');
      hint.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        let id = document.getElementById(`hint-${i + 1}`);
        id.innerHTML = '';
      }
    }

    // hint button
    if (game.gameOver) hintButton.disabled = true;
    else if (game.hintTaken) hintButton.disabled = true;
    else if (game.pastGuesses.length === 4) arrow.hidden = false;
    else if (game.pastGuesses.length >= 3) hintButton.disabled = false;

    // past guess boxes
    for (let i = 0; i < 5; i++) {
      let id = document.getElementById(`past-guess-${i}`);
      let j = game.pastGuessCloseness[i];

      // game continues (all guesses are colored)
      if (game.pastGuesses[i] && !game.gameOver) {
        id.innerHTML = game.pastGuesses[i];
        id.className = `past-guess ${className[j]}`;
      }
      // game over (all but last guess are grayed-out)
      if (game.pastGuesses[i] && game.gameOver) {
        id.innerHTML = game.pastGuesses[i];
        if (j <= 1) {
          id.className = `past-guess ${className[j]}`;
        } else {
          id.className = `past-guess empty`;
        }
      }
    }
  }

  // ***** GET HINT *****
  function getHint() {
    game.hintTaken = !game.hintTaken;
    let arr = game.provideHint();
    hint.innerHTML = `It's one of these:`;
    for (let i = 0; i < 3; i++) {
      let id = document.getElementById(`hint-${i + 1}`);
      id.innerHTML = arr[i];
    }
    hintButton.disabled = true;
    arrow.hidden = true;
    guessInput.focus();
  }

  // ***** NEW GAME *****
  function resetGame() {
    window.location.reload(true);
  }

  // ***** EVENT LISTENERS *****
  // guess input
  guessInput.addEventListener('keyup', function() {
    if (event.which === 13) {
      submitGuess();
    }
  });

  // hint button
  hintButton.addEventListener('click', function() {
    getHint();
  });

  // new game button
  resetButton.addEventListener('click', function() {
    resetGame();
  });
}

playGame();
