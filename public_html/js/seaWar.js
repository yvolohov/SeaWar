/* Объект хранит данные игры */
function yvSeaWar()
{     
    this.fieldWidth = 10;
    this.fieldHeight = 10;
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    this.humanField = this.mCommon.getEmptyField(this);
    this.computerField = this.mCommon.getEmptyField(this);
    
    this.mShipSetting.setShips(this, this.humanField);
    console.log("0 -----");
    this.vTest.showField(this, this.humanField);  
        
    for (var i = 0; i < 20; i++) 
    {
        this.mAI.doFirstAttack(this, this.humanField);
        console.log((i + 1) + " -----");
        this.vTest.showField(this, this.humanField);
    }    
}

/* Константы состояний ячеек поля */
yvSeaWar.prototype = 
{
    NOT_EXIST_CELL : -1,
    CLOSED_EMPTY_CELL : 0,
    CLOSED_SHIP_CELL : 1,
    OPEN_EMPTY_CELL : 2,
    OPEN_SHIP_CELL : 3
};

/* Общий код (модель) */
yvSeaWar.prototype.mCommon =
{
    getEmptyField : function(cont)
    {
        var field = new Array();

        for (var y = 0; y < cont.fieldHeight; y++)
        {
            field[y] = new Array();

            for (var x = 0; x < cont.fieldWidth; x++)
                {field[y][x] = cont.CLOSED_EMPTY_CELL;}
        }       
        return field;
    },

    cellExist : function(cont, posX, posY)
    {
        return (posX >= 0 && posY >= 0 && 
                posX < cont.fieldWidth && 
                posY < cont.fieldHeight);
    },

    getCell : function(cont, field, posX, posY)
    {
        if (!(cont.mCommon.cellExist(cont, posX, posY)))
            {return cont.NOT_EXIST_CELL;}

        return field[posY][posX];
    },
    
    setCell : function(cont, field, posX, posY, value)
    {
        if (!(cont.mCommon.cellExist(cont, posX, posY)))
            {return;}
        
        field[posY][posX] = value;
    },
    
    setCells : function(cont, field, position, value)
    {
        for (var y = position.y1; y <= position.y2; y++)
        {
            for (var x = position.x1; x <= position.x2; x++)
            {
                cont.mCommon.setCell(cont, field, x, y, value);
            }
        }        
    }
};

/* Код автоматической расстановки кораблей (модель) */
yvSeaWar.prototype.mShipSetting = 
{
    setShips : function(cont, field)
    {
        for (var count = 0; count < cont.ships.length; count++)
        {
            var ship = cont.ships[count];
            var direction = Math.round(Math.random());
            cont.mShipSetting.setShip(cont, field, ship, direction);
        }
    },

    setShip : function(cont, field, ship, direction)
    {
        var offsetX = (direction === 1) ? ship - 1 : 0;
        var offsetY = (direction === 0) ? ship - 1 : 0;
        var width = cont.fieldWidth - offsetX;
        var height = cont.fieldHeight - offsetY;
        var shipBody = {x1 : 0, y1 : 0, x2 : offsetX, y2 : offsetY};
        var shipSpace = {x1 : 0, y1 : 0, x2 : 0, y2 : 0};
        var positions = [];
        
        for (var y = 0; y < height; y++)
        {           
            for (var x = 0; x < width; x++)
            {
                if (cont.mShipSetting.checkShipSpace(cont, field, shipBody, shipSpace))
                {
                    positions[positions.length] = 
                    {
                        x1 : shipBody.x1, 
                        y1 : shipBody.y1, 
                        x2 : shipBody.x2, 
                        y2 : shipBody.y2
                    };
                }
                shipBody.x1++;
                shipBody.x2++;                
            }          
            shipBody.y1++;
            shipBody.y2++;
            shipBody.x2 = shipBody.x2 - shipBody.x1;
            shipBody.x1 = 0;            
        }
        
        if (positions.length === 0)
            {return;}
        
        var index = Math.floor(Math.random() * positions.length);
        var position = positions[index];
        cont.mCommon.setCells(cont, field, position, cont.CLOSED_SHIP_CELL);
    },
    
    checkShipSpace : function(cont, field, shipBody, shipSpace)
    {        
        shipSpace.x1 = shipBody.x1 - 1;
        shipSpace.y1 = shipBody.y1 - 1;
        shipSpace.x2 = shipBody.x2 + 1;
        shipSpace.y2 = shipBody.y2 + 1;
        
        for (var y = shipSpace.y1; y <= shipSpace.y2; y++)
        {
            for (var x = shipSpace.x1; x <= shipSpace.x2; x++)
            {
                if (cont.mCommon.getCell(cont, field, x, y) > 0)
                    {return false;}
            }
        }
        return true;
    }    
};

/* Код игрового интеллекта (модель) */
yvSeaWar.prototype.mAI = 
{        
    /* Выстрел в случайную ячейку */
    doFirstAttack : function(cont, field)
    {
        var positions = [];
        
        for (var y = 0; y < cont.fieldHeight; y++)
        {
            for (var x = 0; x < cont.fieldWidth; x++)
            {
                var cellValue = cont.mCommon.getCell(cont, field, x, y);
                
                /* Атакуемая ячейка должна быть закрыта */
                if (!(cellValue === cont.CLOSED_EMPTY_CELL ||
                        cellValue === cont.CLOSED_SHIP_CELL))
                    {continue;};
                    
                /* В соседних ячейках не должно быть открытых кораблей */                    
                if (cont.mAI.checkNeighbours(cont, field, x, y)) 
                    {positions[positions.length] = {x : x, y : y};}
            }
        }
        
        if (positions.length === 0)
            {return null;}
            
        var index = Math.floor(Math.random() * positions.length);
        var position = positions[index];
        var cellValue = cont.mCommon.getCell(cont, field, position.x, position.y);
        cont.mCommon.setCell(cont, field, position.x, position.y, cellValue + 2);
        
        return position;
    },
    
    checkNeighbours : function(cont, field, posX, posY)
    {
        var coords = {x1 : posX - 1, x2 : posX + 1, y1 : posY - 1, y2 : posY + 1};
    
        for (var y = coords.y1; y <= coords.y2; y++)
        {
            for (var x = coords.x1; x < coords.x2; x++)
            {
                if (x === posX && y === posY)
                    {continue;}
                    
                var value = cont.mCommon.getCell(cont, field, x, y);
                
                if (value === cont.OPEN_SHIP_CELL)
                    {return false;}
            }
        }
        return true;
    },

    /* Выстрел по частично подбитому кораблю */
    doNextAttack : function(cont, field)
    {
        
    }
};

/* Код тестового отображения (вид) */
yvSeaWar.prototype.vTest = 
{
    /* test view */
    showField : function(cont, field)
    {
        var str = "";
        
        for (var y = 0; y < cont.fieldHeight; y++)
        {
            for (var x = 0; x < cont.fieldWidth; x++)
            {                
                str = str + "  " + cont.mCommon.getCell(cont, field, x, y);                       
            }
            console.log(y + " : " + str);
            str = "";
        }        
    }
};

var sw = new yvSeaWar();