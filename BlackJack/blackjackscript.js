let suits = ["H", "C", "D", "S"];
let values = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
let deck = [];
let playerHand = [];
let dealerHand = [];

const newGameButton = document.getElementById("new-game-button");
const hitVar = document.getElementById("hit");
const stayVar = document.getElementById("stay");
const textArea1 = document.getElementById("text-area1");
const textArea2 = document.getElementById("text-area2");
const textArea3 = document.getElementById("text-area3");

function createDeck() {
    for (let i = 0; i < values.length; i++) {
        for (let y = 0; y < suits.length; y++) {
            let weight = parseInt(values[i]);
            if (values[i] == "J" || values[i] == "Q" || values[i] == "K") {
                weight = 10;
            }
            if (values[i] == "A") {
                weight = 11;
            }
            let card = {Value: values[i], Suit: suits[y], Weight: weight};
            deck.push(card);
        }
    }
}

function shuffle() {
    for (let i = 0; i < 1000; i++) {
        let location1 = Math.floor(Math.random() * deck.length);
        let location2 = Math.floor(Math.random() * deck.length);
        let tmp = deck[location1];

        deck[location1] = deck[location2],
        deck[location2] = tmp;
    }
}

function handLayout() {
    for (let i = 0; i < 2; i++) {
        playerHand.push(deck.pop());
        dealerHand.push(deck.pop());
    }

    let sumDealer = dealerHand.reduce((s, card) => {return s + card.Weight}, 0);

    if (sumDealer === 21) {
        textArea1.innerText = "Dealer has: " + dealerHand[0].Suit + dealerHand[0].Value + " " + dealerHand[1].Suit + dealerHand[1].Value;
        textArea2.innerText = "Dealer won (21)";
        hitVar.disabled = true;
        stayVar.disabled = true;
    }
    else {
        textArea1.innerText = "Dealer has: * " + dealerHand[1].Suit + dealerHand[1].Value;
        textArea2.innerText = "You have: " + playerHand[0].Suit + playerHand[0].Value + " " + playerHand[1].Suit + playerHand[1].Value;
        hitVar.disabled = false;
        stayVar.disabled = false;
    }
}

function hit() {
    let sumPlayer = playerHand.reduce((s, card) => {return s + card.Weight}, 0);

    playerHand.push(deck.pop());
    sumPlayer += playerHand[playerHand.length - 1].Weight;
    textArea2.innerText = "You have:"
    for (let i = 0; i < playerHand.length; i++) {
        textArea2.innerText += " " + playerHand[i].Suit + playerHand[i].Value;
    }

    for (let i = 0; i < playerHand.length; i++) {
        if (playerHand[i].Value === "A") {
            if (sumPlayer > 21) {
                playerHand[i].Weight.splice;
            }
        }
    }

    if (sumPlayer > 21) {
        aTester();
    }
}

function stay() {
    let sumDealer = dealerHand.reduce((s, card) => {return s + card.Weight}, 0);

    textArea1.innerText = "Dealer has:";
    if (sumDealer > 16) {
            textArea1.innerText += " " + dealerHand[0].Suit + dealerHand[0].Value + " " + dealerHand[1].Suit + dealerHand[1].Value;
            aTester();
        }
    else {
        while (sumDealer <= 16) {
            dealerHand.push(deck.pop());
            sumDealer += dealerHand[dealerHand.length - 1].Weight;
            for (let i = 0; i < dealerHand.length; i++) {
                if (dealerHand[i].Value === "A") {
                    if (sumDealer > 21) {
                        dealerHand[i].Weight = 1;
                    }
                }
            }
        }

        for (let i = 0; i < dealerHand.length; i++) {
            textArea1.innerText += " " + dealerHand[i].Suit + dealerHand[i].Value;
        }

        aTester();
    }
}

function aTester() {
    let sumDealer = dealerHand.reduce((s, card) => {return s + card.Weight}, 0);
    let sumPlayer = playerHand.reduce((s, card) => {return s + card.Weight}, 0);

    for (let i = 0; i < dealerHand.length; i++) {
        if (dealerHand[i].Value === "A") {
            if (sumDealer > 21) {
                dealerHand[i].Weight = 1;
            }
            else {
                gameWinner();
            }
        }
        else {
            gameWinner();
        }
    }

    for (let i = 0; i < playerHand.length; i++) {
        if (playerHand[i].Value === "A") {
            if (sumPlayer > 21) {
                playerHand[i].Weight.splice;
            }
            else {
                gameWinner();
            }
        }
        else {
            gameWinner();
        }
    }
}

function gameWinner() {
    let sumDealer = dealerHand.reduce((s, card) => {return s + card.Weight}, 0);
    let sumPlayer = playerHand.reduce((s, card) => {return s + card.Weight}, 0);

    if (sumPlayer > 21) {
        textArea3.innerText = "You lose";
    }
    else if (sumPlayer > sumDealer || sumDealer > 21) {
        textArea3.innerText = "You win";
    }
    else if (sumPlayer === sumDealer) {
        textArea3.innerText = "It's a draw";
    }
    else {
        textArea3.innerText = "You lose";
    }

    hitVar.disabled = true;
    stayVar.disabled = true;
};

function clear() {
    textArea1.innerText = "";
    textArea2.innerText = "";
    textArea3.innerText = "";
    deck = [];
    playerHand = [];
    dealerHand = [];
}

function startGame() {
    clear();
    createDeck();
    shuffle();
    handLayout();
}

newGameButton.addEventListener("click", startGame);
hitVar.addEventListener("click", hit);
stayVar.addEventListener("click", stay);