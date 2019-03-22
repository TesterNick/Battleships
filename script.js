let renderer = {
    renderField(wrapper, field) {
        let fieldDiv = document.createElement("div");
        fieldDiv.className = "field";
        wrapper.appendChild(fieldDiv);
        field.div = fieldDiv;
        for (let i = 0; i < field.cells.length; i++) {
            let cell = field.cells[i];
            let cellDiv = document.createElement("div");
            cell.div = cellDiv;
            fieldDiv.appendChild(cellDiv);
            cellDiv.className = cell.class;
            cellDiv.innerHTML = cell.content;
        }
    },

    placeShips(ships, field) {
        for (let i = 0; i < ships.length; i++) {
            let div = document.createElement("div");
            let cellSize = 30;
            let shipWidth = cellSize;
            let shipHeight = cellSize;
            let startPoint = field.getCellByName(ships[i][0]).div;
            let shipX = startPoint.offsetLeft;
            let shipY = startPoint.offsetTop;
            if (ships[i].length > 1) {
                let cells = [];
                for (let j = 0; j < ships[i].length; j++) {
                    let cell = field.getCellByName(ships[i][j]);
                    cells.push(cell);
                }
                if (cells[0].x == cells[1].x) {
                    shipHeight *= cells.length;
                } else {
                    shipWidth *= cells.length;
                }
            }
            div.style.width = shipWidth + "px";
            div.style.height = shipHeight + "px";
            field.div.appendChild(div);
            field.div.position = "relative";
            div.style.position = "absolute";
            div.style.left = shipX + "px";
            div.style.top = shipY + "px";
            div.className = "ship";
        }
    }
};

function Field() {
    this.colsCount = 10;
    this.rowsCount = 10;
    this.columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    this.cells = [];
    
    for(let row = 0; row < this.rowsCount + 2; row++) {
        for(let col = 0; col < this.colsCount + 2; col++) {
            let cell = {};
            cell.content = "";
            if ((row == 0 || row == this.rowsCount + 1) && (col != 0 && col != this.colsCount + 1)) {
                cell.content = this.columns[col - 1];
            } else if ((col == 0 || col == this.colsCount + 1) && (row != 0 && row != this.rowsCount + 1)) {
                cell.content = row;
            }
            if (row == 0 || row == this.rowsCount + 1 || col == 0 || col == this.colsCount + 1) {
                cell.class = "border";
            } else {
                cell.name = this.columns[col - 1] + row;
                cell.class = "cell";
                cell.x = col;
                cell.y = row;
            }
            this.cells.push(cell);
        }
    };
    
    this.getRandomCell = function() {
        while (true) {
            let rndPoint = this.cells[Math.floor(Math.random() * this.cells.length)];
            if (rndPoint.class == "cell") {
                return rndPoint;
            }
        }
    };

    this.getNeighbours = function(cell) {
        neighbours = [];
        for (let y = cell.y - 1; y <= cell.y + 1; y++) {
            for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                if (!(x == cell.x && y == cell.y)) {
                    neighbour = this.getCellByCoordinates(x, y);
                    if (neighbour) {
                        neighbours.push(neighbour);
                    }
                }
            }
        }
        return neighbours;
    };

    this.getCellByCoordinates = function(x, y) {
        let cell = this.cells.find(function (elem) {
            return elem.x == x && elem.y == y;
        });
        return cell;
    };

    this.getCellByName = function(name) {
        let cell = this.cells.find(function (elem) {
            return elem.name == name;
        });
        return cell;
    };

    return this;
};

let shipsCreator = {
    ships: [],

    createShips(field) {
        for (let size = 4; size > 0; size--) {
            let count = 5 - size;
            while (count > 0) {
                this.ships.push(this.createAShip(size, field));
                count--;
            }
        }
        return this.ships;
    },

    createAShip(size, field) {
        let shipOrientaiton = this.orientShip();
        while (true) {
            let ship = [];
            let startPoint = field.getRandomCell();
            let x = startPoint.x;
            let y = startPoint.y;
            if (shipOrientaiton == "horizontal" && field.colsCount - startPoint.x >= size - 1) {
                ship.push(startPoint.name);
                while (ship.length < size) {
                    x++;
                    ship.push(field.getCellByCoordinates(x, y).name);
                }
                if (this.validateShip(ship, field)) {
                    return ship;
                }
            } else if (shipOrientaiton == "vertical" && field.rowsCount - startPoint.y >= size - 1) {
                ship.push(startPoint.name);
                while (ship.length < size) {
                    y++;
                    ship.push(field.getCellByCoordinates(x, y).name);
                }
                if (this.validateShip(ship, field)) {
                    return ship;
                }
            }
        }
    },

    orientShip() {
        let random = Math.random();
        if (random < 0.5) {
            return "horizontal"
        } else {
            return "vertical"
        }
    },

    validateShip(ship, field) {
        let shipNeighbours = [];
        for (let i = 0; i < ship.length; i++) {
            let cellNeighbours = field.getNeighbours(field.getCellByName(ship[i]));
            for (let j = 0; j < cellNeighbours.length; j++) {
                let currentCell = cellNeighbours[j].name;
                if (!shipNeighbours.includes(currentCell) && !ship.includes(currentCell)) {
                    shipNeighbours.push(currentCell);
                }
            }
        }
        for (let i = 0; i < this.ships.length; i++) {
            let currentShip = this.ships[i];
            for (let j = 0; j < currentShip.length; j++) {
                if (shipNeighbours.includes(currentShip[j]) || ship.includes(currentShip[j])) {
                    return false;
                }
            }
        }
        return true;
    },

    dragDropShips() {
       let placeShips = document.querySelectorAll(div, ".ship");
       let  newPlaceShips = document.querySelectorAll(div, ".cell");
       
       placeShips.addEventListener("dragstart", function() {
        this.style.borderColor = "black";
       })
    }
};

let game = {
    renderer,
    userField: new Field(),
    rivalField: new Field(),
    shipsCreator,
    startGame() {
        var div = document.querySelector(".container");
        div.innerHTML = "";
        var gameWrap = document.createElement("div");
        gameWrap.className = "gameWrap";
        document.body.appendChild(gameWrap);
        this.renderer.renderField(gameWrap, this.userField);
        this.renderer.renderField(gameWrap, this.rivalField);
        this.userShips = this.shipsCreator.createShips(this.userField);
        //this.shipsCreator.dragDropShips();
        this.renderer.placeShips(this.userShips, this.userField);
    },
};


function startGame() {
    game.startGame();
};
