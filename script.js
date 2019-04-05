let renderer = {
    renderField(wrapper, field) {
        let fieldDiv = document.createElement("div");
        fieldDiv.className = "field";
        wrapper.appendChild(fieldDiv);
        //в поле div объекта field сохраняем ссылку на html-эл-нт(div с классом field) , чтобы
        //было удобно обращаться к эл-ту 
        field.div = fieldDiv;
        //циклом проходим по логическим клеткам поля
        for (let i = 0; i < field.cells.length; i++) {
            let cell = field.cells[i];
            //создаем для них div-ы 
            let cellDiv = document.createElement("div");
            //в св-во div помещаем ссылку на html эл-т
            cell.div = cellDiv;
            //добавляем div-ы с клетками поля на страницу
            fieldDiv.appendChild(cellDiv);
            cellDiv.className = cell.class;

            if (cellDiv.className == "cell") {
                cellDiv.addEventListener("dragover", function(event) {
                    event.preventDefault();
                });
                cellDiv.addEventListener("drop", function(event) {
                    let ship = shipsCreator.getShipByDiv(game.dragged);
                });
            }
            cellDiv.innerHTML = cell.content;
        }
    },
    //метод для позиционирования и отрисовки кораблей
    placeShips(ships, field) {
        //проходим циклом по массиву кораблей
        for (let i = 0; i < ships.length; i++) {
            //создаем div для каждого корабля
            let div = document.createElement("div");
            //добавляем в игровое поле div-ы с кораблями (спозиционированные абсолютно)
            //чтобы они добавлялись поверх div-ов игрового поля
            field.div.appendChild(div);

            let ship = this.getShipGeometry(ships[i]);
            //задаем размеры в пикселях (исп-ем приведение типов - число+строка=строка)
            div.style.width = ship.width + "px";
            div.style.height = ship.height + "px";
            //координаты корабля так же задаем в пикселях
            div.style.left = ship.x + "px";
            div.style.top = ship.y + "px";
            //новым добавленным div-ам кораблей присваиваем класс
            div.className = "ship";
            div.draggable = "true";

            div.addEventListener("dragstart", function(event) {
                game.dragged = div;
                this.style.backgroundColor = "red";
            });
            ships[i].div = div;
        }
    },
    //вычисляем размеры и координаты кораблей
    getShipGeometry(ship) {
        let startPoint = ship.startPoint.div;
        //определяем начало отсчета от верхнего левого угла игрового поля
        let shipX = startPoint.offsetLeft;
        let shipY = startPoint.offsetTop;
        let cellSize = 30;
        let shipWidth = cellSize;
        let shipHeight = cellSize;
        //проходим по массиву координат клеток каждого корабля
        if (ship.cells.length > 1) {
            if (ship.orientation == "vertical") {
                shipHeight *= ship.cells.length;
            } else {
                shipWidth *= ship.cells.length;
            }
        };
        return {width: shipWidth, height: shipHeight, x: shipX, y: shipY};
    }
};

//конструктор игрового поля
function Field() {
    this.colsCount = 10;
    this.rowsCount = 10;
    this.columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    this.cells = [];
    //проходим по строкам и колонкам и добавляем по 2 ед. на границы поля
    for(let row = 0; row < this.rowsCount + 2; row++) {
        for(let col = 0; col < this.colsCount + 2; col++) {
            let cell = {};
            cell.content = "";
            //если это первая или посл. строка, за исключением угловых клеток поля
            if ((row == 0 || row == this.rowsCount + 1) && (col != 0 && col != this.colsCount + 1)) {
                //то в кач-ве содержимого назначаем ей букву из массива
                cell.content = this.columns[col - 1];
                //то же со столбцами 
            } else if ((col == 0 || col == this.colsCount + 1) && (row != 0 && row != this.rowsCount + 1)) {
                cell.content = row;
            }
            //если строка 1-я или посл, или колонка первая или последняя - значит это граница
            if (row == 0 || row == this.rowsCount + 1 || col == 0 || col == this.colsCount + 1) {
                cell.class = "border";
            } else {
                //всем остальным клеткам задаем имена и координаты
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
        //считаем кл-ки соседними, если их координаты отличаются не более, чем на 1
        for (let y = cell.y - 1; y <= cell.y + 1; y++) {
            for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                //если координата х = х.самой клетки И
                //у = у.самой клетки, то это и есть сама клетка, по-этому ее не вкл-ем
                //в массив соседей
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

    //получаем объект клетки, зная только ее координаты
    this.getCellByCoordinates = function(x, y) {
        let cell = this.cells.find(function (elem) {
            return elem.x == x && elem.y == y;
        });
        return cell;
    };

    //получаем объект клетки, зная ее имя
    this.getCellByName = function(name) {
        let cell = this.cells.find(function (elem) {
            return elem.name == name;
        });
        return cell;
    };

    return this;
};

//объект создания кораблей
let shipsCreator = {
    ships: [],

    //метод, определяющий размер и кол-во кораблей
    createAllShips(field) {
        //задаем размер каждого корабля
        for (let size = 4; size > 0; size--) {
            //задаем кол-во кораблей данного размера в кажд.итерации
            let count = 5 - size;
            while (count > 0) {
                //создаем нужное кол-во кораблей
                this.ships.push(this.createAShip(size, field));
                count--;
            }
        }
        return this.ships;
    },

    //метод для создания одного корабля
    createAShip(size, field) {
        let shipOrientaiton = this.orientShip();
        while (true) {
            let shipCells = [];
            let startPoint = field.getRandomCell();
            let x = startPoint.x;
            let y = startPoint.y;
            //если корабль гориз. и он не выходит за правую границу поля, то создаем его
            if (shipOrientaiton == "horizontal" && field.colsCount - startPoint.x >= size - 1) {
                shipCells.push(startPoint.name);
                //пока длина кор. меньше требуемой, удлинняем его
                while (shipCells.length < size) {
                    x++;
                    shipCells.push(field.getCellByCoordinates(x, y).name);
                }
                if (this.validateShip(shipCells, field)) {
                    return {startPoint: startPoint, orientation: shipOrientaiton, cells: shipCells};
                }
                //аналогично с вертик. кораблями
            } else if (shipOrientaiton == "vertical" && field.rowsCount - startPoint.y >= size - 1) {
                shipCells.push(startPoint.name);
                while (shipCells.length < size) {
                    y++;
                    shipCells.push(field.getCellByCoordinates(x, y).name);
                }
                if (this.validateShip(shipCells, field)) {
                    return {startPoint: startPoint, orientation: shipOrientaiton, cells: shipCells};
                }
            }
        }
    },
    //в массиве кораблей находим корабль, соответствующий данному div и возвращаем его в виде обьекта
    getShipByDiv(div) {
        return this.ships.find((element) => {
            if (element.div == div) {
                return element;
            }
        });
    },

    orientShip() {
        let random = Math.random();
        if (random < 0.5) {
            return "horizontal"
        } else {
            return "vertical"
        }
    },

    //проверяем не пересекается ли корабль с другими кор.
    validateShip(ship, field) {
        //создаем массив клеток, соседних с кораблем
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
            let currentShip = this.ships[i].cells;
            for (let j = 0; j < currentShip.length; j++) {
                if (shipNeighbours.includes(currentShip[j]) || ship.includes(currentShip[j])) {
                    return false;
                }
            }
        }
        return true;
    }
};

let game = {
    renderer,
    userField: new Field(),
    rivalField: new Field(),
    shipsCreator,
    startGame() {
        //после нажатия кнопки "Играть" очищаем страницу для отрисовки игрового пространства
        var div = document.querySelector(".container");
        div.innerHTML = "";
        var gameWrap = document.createElement("div");
        gameWrap.className = "gameWrap";
        document.body.appendChild(gameWrap);
        this.renderer.renderField(gameWrap, this.userField);
        this.renderer.renderField(gameWrap, this.rivalField);
        this.userShips = this.shipsCreator.createAllShips(this.userField);
        this.renderer.placeShips(this.userShips, this.userField);
    },
};


function startGame() {
    game.startGame();
};
