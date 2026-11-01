/* ===== TAGLINE GAME: SETUP ===== */

const questions = [
    { answer: "INSTAGRAM", hint: "A popular social media platform." },
    { answer: "BANANA", hint: "A yellow fruit loved by monkeys." },
    { answer: "TESLA", hint: "An electric car company." },
    { answer: "PYTHON", hint: "A famous programming language." },
    { answer: "EVEREST", hint: "The world's highest mountain." },
    { answer: "CRICKET", hint: "A popular bat-and-ball sport." },
    { answer: "CHOCOLATE", hint: "A sweet treat made from cocoa." },
    { answer: "INTERNET", hint: "A worldwide network connecting computers." },
    { answer: "ELEPHANT", hint: "A large animal with a trunk." },
    { answer: "RAINBOW", hint: "A colourful arc seen after rain." }
];

let currentQuestion = 0;
let score = 0;
let mistakes = 0;
let hintUsed = false;
let correctAnswers = 0;
let skippedQuestions = 0;
let selectedLetters = [];
let gameFinished = false;

const scoreEl = document.getElementById("score");
const mistakesEl = document.getElementById("mistakes");
const hintText = document.getElementById("question-hint");
const answerBoxes = document.getElementById("answer-boxes");
const letterWheel = document.getElementById("letter-wheel");
const feedback = document.getElementById("feedback");

const hintBtn = document.getElementById("hint-btn");
const clearBtn = document.getElementById("clear-btn");
const submitBtn = document.getElementById("submit-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const nextBtn = document.getElementById("next-btn");

const gamePage = document.getElementById("game-page");
const resultsPage = document.getElementById("results-page");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateScore() {
    scoreEl.textContent = score;
    mistakesEl.textContent = mistakes;
}

function showFeedback(message, type = "") {
    feedback.textContent = message;
    feedback.className = "feedback " + type;
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    const question = questions[currentQuestion];

    mistakes = 0;
    hintUsed = false;
    selectedLetters = [];

    hintText.textContent = question.hint;
    document.getElementById("level").textContent = currentQuestion + 1;
    document.getElementById("total-levels").textContent = questions.length;

    feedback.textContent = "";
    feedback.className = "feedback";

    nextBtn.hidden = true;
    submitBtn.disabled = false;
    clearBtn.disabled = false;
    shuffleBtn.disabled = false;
    hintBtn.disabled = false;

    createAnswerBoxes(question.answer.length);
    createLetterWheel(question.answer);
    updateScore();
}

function createAnswerBoxes(length) {
    answerBoxes.innerHTML = "";

    for (let i = 0; i < length; i++) {
        const box = document.createElement("div");
        box.className = "answer-box";
        box.dataset.index = i;
        answerBoxes.appendChild(box);
    }
} 
/* ===== LETTER WHEEL ===== */

function createLetterWheel(answer) {
    letterWheel.innerHTML = "";

    const letters = answer.split("");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    while (letters.length < answer.length + 3) {
        letters.push(
            alphabet[Math.floor(Math.random() * alphabet.length)]
        );
    }

    shuffleArray(letters);

    letters.forEach((letter, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "letter-btn";
        button.textContent = letter;
        button.setAttribute("aria-label", "Letter " + letter);

        const angle =
            (2 * Math.PI * index / letters.length) - Math.PI / 2;
        const radius = 40;

        button.style.left =
            (50 + radius * Math.cos(angle)) + "%";
        button.style.top =
            (50 + radius * Math.sin(angle)) + "%";

        button.addEventListener("click", () => {
            selectLetter(button, letter);
        });

        letterWheel.appendChild(button);
    });
}

function selectLetter(button, letter) {
    if (gameFinished || !nextBtn.hidden || button.disabled) return;

    const boxes = Array.from(
        answerBoxes.querySelectorAll(".answer-box")
    );

    const emptyBox = boxes.find(box => box.textContent === "");

    if (!emptyBox) return;

    emptyBox.textContent = letter;
    emptyBox.classList.add("filled");

    selectedLetters.push({
        button: button,
        letter: letter,
        box: emptyBox
    });

    button.disabled = true;
}

function clearAnswer() {
    selectedLetters.forEach(item => {
        item.button.disabled = false;
        item.box.textContent = "";
        item.box.classList.remove("filled", "correct", "wrong");
    });

    selectedLetters = [];
    showFeedback("");
}

clearBtn.addEventListener("click", clearAnswer);

shuffleBtn.addEventListener("click", () => {
    if (gameFinished || !nextBtn.hidden) return;

    const answer = questions[currentQuestion].answer;
    clearAnswer();
    createLetterWheel(answer);
}); 
/* ===== HINT SYSTEM ===== */

hintBtn.addEventListener("click", () => {
    if (gameFinished || hintUsed || !nextBtn.hidden) return;

    const answer = questions[currentQuestion].answer;

    clearAnswer();

    const buttons = Array.from(
        letterWheel.querySelectorAll(".letter-btn")
    );

    for (let i = 0; i < Math.min(2, answer.length); i++) {
        const button = buttons.find(
            btn => btn.textContent === answer[i] && !btn.disabled
        );

        if (button) selectLetter(button, answer[i]);
    }

    hintUsed = true;
    score = Math.max(0, score - 2);
    hintBtn.disabled = true;

    updateScore();
    showFeedback("Two letters revealed! 2 points deducted.");
});

/* ===== CHECK ANSWER ===== */

submitBtn.addEventListener("click", () => {
    if (gameFinished || !nextBtn.hidden) return;

    const answer = questions[currentQuestion].answer;
    const guess = selectedLetters.map(item => item.letter).join("");

    if (guess.length !== answer.length) {
        showFeedback("Select all the letters before submitting.", "error");
        return;
    }

    if (guess === answer) {
        score += 10;
        correctAnswers++;

        updateScore();

        answerBoxes.querySelectorAll(".answer-box").forEach(box => {
            box.classList.add("correct");
        });

        showFeedback("Correct! You earned 10 points.", "success");
        finishQuestion();
    } else {
        mistakes++;
        score = Math.max(0, score - 1);

        updateScore();

        answerBoxes.querySelectorAll(".answer-box").forEach(box => {
            box.classList.add("wrong");
        });

        if (mistakes >= 4) {
            skippedQuestions++;
            showFeedback("Four mistakes! Answer: " + answer);
            finishQuestion();
        } else {
            showFeedback(
                "Not quite! Try again. Mistake " + mistakes + " of 4.",
                "error"
            );
        }
    }
});

function finishQuestion() {
    nextBtn.hidden = false;

    submitBtn.disabled = true;
    clearBtn.disabled = true;
    shuffleBtn.disabled = true;
    hintBtn.disabled = true;

    letterWheel.querySelectorAll("button").forEach(button => {
        button.disabled = true;
    });
}

nextBtn.addEventListener("click", () => {
    if (gameFinished) return;

    currentQuestion++;
    loadQuestion();
}); 
/* ===== RESULTS PAGE ===== */

function showResults() {
    gameFinished = true;

    gamePage.hidden = true;
    resultsPage.hidden = false;

    document.getElementById("final-score").textContent = score;
    document.getElementById("correct-count").textContent = correctAnswers;
    document.getElementById("skipped-count").textContent = skippedQuestions;
}

/* ===== RESTART GAME ===== */

document.getElementById("play-again-btn").addEventListener(
    "click", restartGame
);

document.getElementById("home-btn").addEventListener("click", () => {
    resultsPage.hidden = true;
    gamePage.hidden = false;
    restartGame();
});

function restartGame() {
    currentQuestion = 0;
    score = 0;
    mistakes = 0;
    hintUsed = false;
    correctAnswers = 0;
    skippedQuestions = 0;
    selectedLetters = [];
    gameFinished = false;

    resultsPage.hidden = true;
    gamePage.hidden = false;

    loadQuestion();
}

/* ===== SIDEBAR NAVIGATION ===== */

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;

        document.querySelectorAll(".page").forEach(section => {
            section.hidden = true;
        });

        const target = document.getElementById(page + "-page");

        if (target) target.hidden = false;

        document.querySelectorAll(".nav-btn").forEach(nav => {
            nav.classList.remove("active");
        });

        button.classList.add("active");
    });
});

/* ===== BACK TO GAME ===== */

document.querySelectorAll(".back-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".page").forEach(section => {
            section.hidden = true;
        });

        gamePage.hidden = false;

        document.querySelectorAll(".nav-btn").forEach(nav => {
            nav.classList.remove("active");
        });

        document.querySelector(
            '.nav-btn[data-page="game"]'
        ).classList.add("active");
    });
});

/* ===== SOUND BUTTON ===== */

const soundBtn = document.getElementById("sound-btn");

soundBtn.addEventListener("click", () => {
    const soundOn = soundBtn.dataset.sound !== "off";

    soundBtn.dataset.sound = soundOn ? "off" : "on";
    soundBtn.textContent = soundOn ? "🔇" : "🔊";
});

/* ===== START GAME ===== */

loadQuestion();
