/* Объект хранит данные игры */
function yvSeaWar()
{     
    this.fieldWidth = 10;
    this.fieldHeight = 10;
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    this.humanField = this.mCommon.getEmptyField(this);
    this.computerField = this.mCommon.getEmptyField(this);
    this.computerMotion = this.mAI.getMotionStruct(this); 

    this.mShipSetting.setShips(this, this.humanField);
    this.vTest.showField(this, this.humanField);
    
    for (var count = 1; count < 40; count++)
        {this.mAI.aiMove(this, this.humanField, this.computerMotion);}
    
    console.log("----------");
    this.vTest.showField(this, this.humanField);
}

/* Константы состояний ячеек поля */
yvSeaWar.prototype = 
{
    /* Состояния ячеек */
    NOT_EXIST_CELL : -1,
    CLOSED_EMPTY_CELL : 0,
    CLOSED_SHIP_CELL : 1,
    OPENED_EMPTY_CELL : 2,
    OPENED_SHIP_CELL : 3,
    
    /* Результаты выстрелов по ячейке */
    FAILED_ATTACK : 0,
    SUCCESSFUL_ATTACK : 1,
    IMPOSSIBLE_ATTACK : 2
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
    },

    getArraySum : function(cont, arr)
    {
        var sum = 0;
        
        for (var count = 0; count < arr.length; count++)
            {sum += arr[count];}
        
        return sum;
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
    /* Игровой интеллект делает один ход
     * cont - контекст;
     * field - игровое поле противника;
     * motion - объект с данными уже сделанных ходов; */
    aiMove : function(cont, field, motion)
    {      
        /* Стратегии атаки: наугад - 1, если открыта одна клетка - 2,
         * если открыты две или больше клеток - 3 */
        if (motion.typeAttack === 1) 
            {cont.mAI.doFirstAttack(cont, field, motion);}
        else if (motion.typeAttack === 2) 
            {cont.mAI.doSecondAttack(cont, field, motion);}
        else if (motion.typeAttack === 3) 
            {cont.mAI.doThirdAttack(cont, field, motion);}
        
        /* После атаки корабль полностью уничтожен */
        if (motion.state === cont.IMPOSSIBLE_ATTACK)
        {
            motion.state = cont.IMPOSSIBLE_ATTACK;
            motion.x1 = motion.y1 = motion.x2 = motion.y2 = 0;
            motion.typeAttack = 1;
            return;
        }
        
        /* После атаки корабль частично подбит */
        if (motion.state === cont.SUCCESSFUL_ATTACK)
        {
            if (motion.typeAttack === 1 || motion.typeAttack === 2)
                {motion.typeAttack++;}
        }
    },
            
    /* Выстрел в случайную ячейку */
    doFirstAttack : function(cont, field, motion)
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
        cont.mAI.doAttack(cont, field, motion, positions, 1);
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
                
                if (value === cont.OPENED_SHIP_CELL)
                    {return false;}
            }
        }
        return true;
    },

    doAttack : function(cont, field, motion, positions, type)
    {       
        if (positions.length === 0)
        {
            motion.state = cont.IMPOSSIBLE_ATTACK;
            return;
        }    
        
        var index = Math.floor(Math.random() * positions.length);
        var position = positions[index];
        var cellValue = cont.mCommon.getCell(cont, field, position.x, position.y);
        cont.mCommon.setCell(cont, field, position.x, position.y, cellValue + 2);

        if (cellValue === cont.CLOSED_EMPTY_CELL) 
        {
            motion.state = cont.FAILED_ATTACK;
            return;
        }
        
        motion.state = cont.SUCCESSFUL_ATTACK;
        
        if (type > 1)
        {
            motion.x1 = (position.x <= motion.x1) ? position.x : motion.x1;
            motion.x2 = (position.x >= motion.x2) ? position.x : motion.x2;
            motion.y1 = (position.y <= motion.y1) ? position.y : motion.y1;
            motion.y2 = (position.y >= motion.y2) ? position.y : motion.y2;
        }
        else 
        {
            motion.x1 = motion.x2 = position.x;
            motion.y1 = motion.y2 = position.y;
        }
    },

    /* Второй выстрел после первого попадания в корабль */
    doSecondAttack : function(cont, field, motion)
    {
        var rawPositions = 
        [
            {x : motion.x1 - 1, y: motion.y1},
            {x : motion.x1 + 1, y: motion.y1},
            {x : motion.x1, y: motion.y1 - 1},
            {x : motion.x1, y: motion.y1 + 1}            
        ];
              
        var positions = cont.mAI.checkTargets(cont, field, rawPositions);       
        cont.mAI.doAttack(cont, field, motion, positions, 2);
    },
    
    checkTargets : function(cont, field, rawPositions)
    {
        var positions = [];
        
        for (var count = 0; count < rawPositions.length; count++)
        {
            var cellValue = cont.mCommon.getCell(cont, field, 
                rawPositions[count].x, rawPositions[count].y);
                
            if (cellValue === cont.CLOSED_EMPTY_CELL || 
                    cellValue === cont.CLOSED_SHIP_CELL)
                {positions[positions.length] = rawPositions[count];}    
        }
        return positions;
    },
    
    /* Третий и следующие выстрелы, после второго попадания в корабль */
    doThirdAttack : function(cont, field, motion)
    {
        var rawPositions = [{x : 0, y : 0}, {x : 0, y : 0}];
        
        if (motion.x1 !== motion.x2)
        {
            rawPositions[0].x = motion.x1 - 1;
            rawPositions[0].y = motion.y1;
            rawPositions[1].x = motion.x2 + 1;
            rawPositions[1].y = motion.y2;
        }
        
        if (motion.y1 !== motion.y2)
        {
            rawPositions[0].x = motion.x1;
            rawPositions[0].y = motion.y1 - 1;
            rawPositions[1].x = motion.x2;
            rawPositions[1].y = motion.y2 + 1;
        }
        var positions = cont.mAI.checkTargets(cont, field, rawPositions);
        cont.mAI.doAttack(cont, field, motion, positions, 3);
    },

    getMotionStruct : function(cont)
    {
        return {
            state : cont.IMPOSSIBLE_ATTACK,
            x1 : 0,
            y1 : 0,
            x2 : 0,
            y2 : 0,
            typeAttack : 1       
        };
    }
};

/* Код тестового отображения (вид) */
yvSeaWar.prototype.vTest = 
{
    /* test */
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