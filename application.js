class SnakeGame {
    constructor() {
        this.fillField();

        this.setParams();

        this.drawSnake();
        this.placeApple();
    }

    setParams() {
        let middle = {
            x: 25,
            y: 25
        }

        this.clearPos = {
            x: 25,
            y: 25
        }

        this.snakePos = [
            {x: middle.x, y: middle.y},
            {x: middle.x + 1, y: middle.y},
            {x: middle.x + 2, y: middle.y}
        ];

        this.snakePosSet = new Set();

        this.snakePosSet.add(this.genSqID(middle.x, middle.y));
        this.snakePosSet.add(this.genSqID(middle.x + 1, middle.y));
        this.snakePosSet.add(this.genSqID(middle.x + 2, middle.y));

        this.vec2 = {
            x: 1,
            y: 0
        }

        this.applePos = {
            x: 0,
            y: 0
        }

        this.snakeLength = 3;

        let highStored = localStorage.getItem("snakeHS");
        if (highStored != null) {
            this.highscore = highStored;
        } else {
            this.highscore = 0;
        }

        this.currentKey = 39;
        this.eventKey = 39;

        this.otb = false; // out of bounds
        this.gameOverStatus = false;
    }

    randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    genSqID(x, y) {
        let id = (x << 16) + y;
        return id.toString();
    }

    createCell(x, y) {
        let cell = document.createElement("div");
        cell.id = this.genSqID(x, y);
        cell.className = "cell";

        return cell;
    }

    appleCollision() {
        let last = this.snakePos[this.snakePos.length - 1];

        if (last.x == this.applePos.x && last.y == this.applePos.y) {
            let newPos = {x: last.x + this.vec2.x, y: last.y + this.vec2.y};
            this.snakePos.push(newPos);
            this.snakePosSet.add(this.genSqID(newPos.x, newPos.y));
            this.getCell(this.applePos.x, this.applePos.y).style.backgroundColor = "white";
            this.placeApple();

            ++this.snakeLength;
        }
    }

    placeApple() {
        let aX = this.randInt(0, 49);
        let aY = this.randInt(0, 49);

        while (this.snakePosSet.has(this.genSqID(aX, aY))) {
            ++aX;

            if (aX > 49) {
                aX = 0;
                ++aY;
            }

            if (aY > 49) {
                aY = 0;
            }
        }

        this.applePos.x = aX;
        this.applePos.y = aY;

        let apple = this.getCell(aX, aY);
        apple.style.visibility = "visible";
        apple.style.backgroundColor = "red";
    }

    getCell(x, y) {
        return document.getElementById(this.genSqID(x, y));
    }

    fillField() {
        let game_field = document.getElementById("field");

        for (let y = 0; y < 50; ++y) {
            for (let x = 0; x < 50; ++x) {
                game_field.appendChild(this.createCell(x, y));
            }
        }
    }

    checkBounds() {
        this.appleCollision();

        let last = this.snakePos[this.snakePos.length - 1];

        if (last.x < 0 || last.y < 0 || last.x > 49 || last.y > 49) {
            //console.log("otb");
            this.otb = true;
            this.stop();
        }

        if (this.snakePosSet.size < this.snakeLength) {
            //console.log("inter");
            this.otb = true;
            this.stop();
        }
    }

    drawSnake() {
        if (this.otb) {
            return
        }
        for (let index = 0; index < this.snakePos.length; ++index) {
            let cell = this.getCell(this.snakePos[index].x, this.snakePos[index].y);

            cell.style.visibility = "visible";
        }
    }

    moveSnake() {
        if (this.otb) {
            return;
        }

        this.getCell(this.clearPos.x, this.clearPos.y).style.visibility = "hidden";
        this.snakePosSet.delete(this.genSqID(this.clearPos.x, this.clearPos.y));

        let last = this.snakePos[this.snakePos.length - 1];
        this.snakePos.push({
            x: last.x + this.vec2.x,
            y: last.y + this.vec2.y
        });
        this.snakePosSet.add(this.genSqID(last.x + this.vec2.x, last.y + this.vec2.y));

        this.snakePos.shift();


        this.clearPos.x = this.snakePos[0].x;
        this.clearPos.y = this.snakePos[0].y;
    }

    userInput() {
        if (38 == this.currentKey) {
            this.vec2.y = -1;
            this.vec2.x = 0;
            this.eventKey = this.currentKey;
        } else if (40 == this.currentKey) {
            this.vec2.y = 1;
            this.vec2.x = 0;
            this.eventKey = this.currentKey;
        } else if (37 == this.currentKey) {
            this.vec2.y = 0;
            this.vec2.x = -1;
            this.eventKey = this.currentKey;
        } else if (39 == this.currentKey) {
            this.vec2.y = 0;
            this.vec2.x = 1;
            this.eventKey = this.currentKey;
        }
    }

    assignKey(e) {
        if (e.keyCode != this.eventKey + 2 && e.keyCode != this.eventKey - 2) {
            this.currentKey = e.keyCode;
        }

    }

    game(method) {
        if (method == "user") {
            this.userInput();
        } else {
            this.hamiltonianInput();
        }

        this.moveSnake();

        this.checkBounds();
        this.drawSnake();
    }

    play(method) {
        this.gameInterval = setInterval(() => this.game(method), 200);

        document.addEventListener("keydown", (e) => this.assignKey(e), false);
    }

    restart() {
        document.getElementById("field").style.display = "grid";

        this.fillField();
        this.setParams();
        this.drawSnake();
        this.placeApple();

        this.play("user");
    }

    keyOver(e) {
        if (e.keyCode == 13 && this.gameOverStatus) {
            document.getElementById("gameover").remove();
            this.restart();
            this.otb = false;
        }
    }

    manageHighscore() {
        let score = this.snakeLength - 3;

        if (score > this.highscore) {
            localStorage.setItem("snakeHS", score);

            return [true, score, this.highscore]
        } else {
            return [false, score, this.highscore];
        }
    }

    gameOverScreen() {
        this.gameOverStatus = true;

        let field = document.getElementById("field");
        field.style.display = "none";

        field.innerHTML = "";

        let gos = document.createElement("div");
        gos.id = "gameover";

        let got = document.createElement("div");
        got.id = "gameovertext";
        got.innerHTML = "<p>Game Over!</p>";
        gos.appendChild(got);

        let applesEatenText = document.createElement("div");
        applesEatenText.id = "appleseatentext";

        let [passed, score, hs] = this.manageHighscore();

        if (passed) {
            applesEatenText.innerHTML = `<p>New Highscore: ${score}</p>`;
        } else {
            applesEatenText.innerHTML = `<p>Apples Eaten: ${score}, Highscore: ${hs}</p>`;
        }

        gos.appendChild(applesEatenText);

        let playAgain = document.createElement("div");
        playAgain.id = "playagain";
        playAgain.innerHTML = "Press Enter to restart!";
        gos.appendChild(playAgain);

        document.querySelector("body").appendChild(gos);

        document.addEventListener("keydown", (e) => this.keyOver(e), false);
    }

    stop() {
        clearInterval(this.gameInterval);
        this.gameOverScreen();
    }

    hamiltonianInput() {
    }

};