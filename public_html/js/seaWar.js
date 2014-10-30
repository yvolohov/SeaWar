/* Объект хранит данные игры */
function yvSeaWar(canvas)
{
    var self = this;    
    this.cont2d = canvas.getContext("2d");
    this.shipCellsCount = this.mCommon.getArraySum(this, this.SHIPS);
    
    this.player1 = 
    {
        type : this.HUMAN,
        numField : 1,
        typeField : this.OWN_FIELD,
        field : this.mCommon.getEmptyField(this),
        motion : this.mHuman.getMotionStruct(this)        
    };
    
    this.player2 = 
    {
        type : this.COMPUTER,
        numField : 2,
        typeField : this.ENEMY_FIELD,
        field : this.mCommon.getEmptyField(this),
        motion : this.mAI.getMotionStruct(this)
    };
    
    this.activePlayer = this.player1;
    this.mShipSetting.setShips(this, this.player1.field);
    this.mShipSetting.setShips(this, this.player2.field); 
    this.vFields.redrawField(this, this.player1.field, 
        this.player1.numField, this.player1.typeField, this.cont2d);
    this.vFields.redrawField(this, this.player2.field, 
        this.player2.numField, this.player2.typeField, this.cont2d);
    
    this.gameCycleID = setInterval(function()
        {self.cCommon.gameCycle(self);}, 500);
    canvas.onclick = function()
        {self.cCommon.onClickHandler(self, event);};
}

/* Константы состояний ячеек поля */
yvSeaWar.prototype = 
{
    FIELD_WIDTH : 10,
    FIELD_HEIGHT : 10,
    SHIPS : [4, 3, 3, 2, 2, 2, 1, 1, 1, 1],
    
    /* Виды игроков */
    HUMAN : 0,
    COMPUTER : 1,
    
    /* Виды игровых полей */
    OWN_FIELD : 0,
    ENEMY_FIELD : 1,
    
    /* Состояния ячеек */
    NOT_EXIST_CELL : -1,
    CLOSED_EMPTY_CELL : 0,
    CLOSED_SHIP_CELL : 1,
    OPENED_EMPTY_CELL : 2,
    OPENED_SHIP_CELL : 3,
    
    /* Результаты выстрелов по ячейке */
    FAILED_ATTACK : 0,
    SUCCESSFUL_ATTACK : 1,
    IMPOSSIBLE_ATTACK : 2,
    END_OF_GAME : 3,
    
    /* Константы view */
    CELL_SIZE_PX : 30,
    FIELD_MARGIN : 10,
    CLOSED_CELL_COLOR : "#696969",
    EMPTY_CELL_COLOR : "#778899",
    SHIP_CELL_COLOR : "#FF6347",
    ATTACKED_EMPTY_CELL_COLOR : "#6495ED",
    ATTACKED_SHIP_CELL_COLOR : "#FF0000"
};

/* Общий код (модель) */
yvSeaWar.prototype.mCommon =
{
    getEmptyField : function(cont)
    {
        var field = new Array();

        for (var y = 0; y < cont.FIELD_HEIGHT; y++)
        {
            field[y] = new Array();

            for (var x = 0; x < cont.FIELD_WIDTH; x++)
                {field[y][x] = cont.CLOSED_EMPTY_CELL;}
        }       
        return field;
    },

    cellExist : function(cont, posX, posY)
    {
        return (posX >= 0 && posY >= 0 && 
                posX < cont.FIELD_WIDTH && 
                posY < cont.FIELD_HEIGHT);
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
        for (var count = 0; count < cont.SHIPS.length; count++)
        {
            var ship = cont.SHIPS[count];
            var direction = Math.round(Math.random());
            cont.mShipSetting.setShip(cont, field, ship, direction);
        }
    },

    setShip : function(cont, field, ship, direction)
    {
        var offsetX = (direction === 1) ? ship - 1 : 0;
        var offsetY = (direction === 0) ? ship - 1 : 0;
        var width = cont.FIELD_WIDTH - offsetX;
        var height = cont.FIELD_HEIGHT - offsetY;
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

yvSeaWar.prototype.mHuman = 
{
    humanMove : function(cont, field, motion)
    {
        /* Новый ход еще не сделан */
        if (!motion.newMove)
        {
            motion.state = cont.IMPOSSIBLE_ATTACK;
            return;
        }
        
        var cellValue = cont.mCommon.getCell(cont, field, motion.nx, motion.ny);
        
        /* Попытка сделать ход в несуществующую или открытую ячейку */
        if (!(cellValue === cont.CLOSED_EMPTY_CELL 
                || cellValue === cont.CLOSED_SHIP_CELL))
        {
            motion.state = cont.IMPOSSIBLE_ATTACK;
            motion.newMove = false;
            return;
        }
        
        motion.x = motion.nx;
        motion.y = motion.ny;
        cont.mCommon.setCell(cont, field, motion.x, motion.y, cellValue + 2);
        
        if (cellValue === cont.CLOSED_SHIP_CELL) 
        {
            motion.state === cont.SUCCESSFUL_ATTACK;
            motion.shipCellsDestroyed++;
        }
        else if (cellValue === cont.CLOSED_EMPTY_CELL) 
            {motion.state = cont.FAILED_ATTACK;}
         
        /* Если подбит последний корабль, игра закончилась */
        if (motion.shipCellsDestroyed === cont.shipCellsCount)
            {motion.state = cont.END_OF_GAME;}
        
        /* Новый ход обработан */
        motion.newMove = false;
    },
    
    getMotionStruct : function(cont)
    {
        return {
            state : cont.IMPOSSIBLE_ATTACK,
            newMove : false,       // признак нового хода
            nx : 0, ny : 0,        // координаты нового хода
            x : 0, y : 0,          // позиция последнего сделанного хода
            shipCellsDestroyed : 0 // сколько корабельных ячеек уничтожено
        };
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
        if (motion.state === cont.END_OF_GAME)
            {return;}
        
        /* Получаем список позиций для атаки */
        var positions = cont.mAI.getPositions(cont, field, motion);        
                
        /* Если позиций для выстрела нет, игра закончилась */
        if (positions.length === 0)
        {
            motion.state = cont.END_OF_GAME;
            return;
        }
        
        /* Проводим атаку */
        cont.mAI.doAttack(cont, field, motion, positions);
        motion.redraw = true;
        
        /* Если подбит последний корабль, игра закончилась */
        if (motion.shipCellsDestroyed === cont.shipCellsCount)
        {
            motion.state = cont.END_OF_GAME;
            return;
        }        
        
        /* Меняем тип атаки */
        if (motion.state === cont.SUCCESSFUL_ATTACK)
        {
            if (motion.typeAttack === 1 || motion.typeAttack === 2)
                {motion.typeAttack++;}
        }
    },
    
    getPositions : function(cont, field, motion)
    {
        var positions = [];
        
        do
        {
            var tryAgain = false;
            
            if (motion.typeAttack === 1)
                {positions = cont.mAI.getPositionsOne(cont, field, motion);}
            else if (motion.typeAttack === 2)
                {positions = cont.mAI.getPositionsTwo(cont, field, motion);}
            else if (motion.typeAttack === 3)
                {positions = cont.mAI.getPositionsThree(cont, field, motion);}
            
            if (positions.length === 0 && motion.typeAttack > 1)
            {
                motion.state = cont.IMPOSSIBLE_ATTACK;
                motion.x1 = motion.y1 = motion.x2 = motion.y2 = 0;
                motion.typeAttack = 1;
                tryAgain = true;                   
            }
        }
        while (tryAgain);
        
        return positions;
    },
    
    /* Выстрел в случайную ячейку */
    getPositionsOne : function(cont, field, motion)
    {
        var positions = [];
        
        for (var y = 0; y < cont.FIELD_HEIGHT; y++)
        {
            for (var x = 0; x < cont.FIELD_WIDTH; x++)
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
        return positions;
    },
    
    checkNeighbours : function(cont, field, posX, posY)
    {
        var coords = {x1 : posX - 1, x2 : posX + 1, y1 : posY - 1, y2 : posY + 1};
    
        for (var y = coords.y1; y <= coords.y2; y++)
        {
            for (var x = coords.x1; x <= coords.x2; x++)
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

    doAttack : function(cont, field, motion, positions)
    {   
        var index = Math.floor(Math.random() * positions.length);
        var position = positions[index];
        var cellValue = cont.mCommon.getCell(cont, field, position.x, position.y);
        cont.mCommon.setCell(cont, field, position.x, position.y, cellValue + 2);
        motion.x = position.x;
        motion.y = position.y;

        if (cellValue === cont.CLOSED_EMPTY_CELL) 
        {
            motion.state = cont.FAILED_ATTACK;
            return;
        }
        
        motion.state = cont.SUCCESSFUL_ATTACK;
        motion.shipCellsDestroyed++;
        
        if (motion.typeAttack > 1)
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
    getPositionsTwo : function(cont, field, motion)
    {
        var rawPositions = 
        [
            {x : motion.x1 - 1, y: motion.y1},
            {x : motion.x1 + 1, y: motion.y1},
            {x : motion.x1, y: motion.y1 - 1},
            {x : motion.x1, y: motion.y1 + 1}            
        ];
              
        return cont.mAI.checkTargets(cont, field, rawPositions);
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
    getPositionsThree : function(cont, field, motion)
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
        return cont.mAI.checkTargets(cont, field, rawPositions);
    },

    getMotionStruct : function(cont)
    {
        return {
            state : cont.IMPOSSIBLE_ATTACK,
            x : 0, y : 0,
            x1 : 0, y1 : 0,
            x2 : 0, y2 : 0,
            typeAttack : 1,
            shipCellsDestroyed : 0
        };
    }
};

/* Код отображения игровых полей и ячеек (вид) */
yvSeaWar.prototype.vFields = 
{
    redrawField : function(cont, field, numField, typeField, cont2D)
    {                      
        for (var y = 0; y < cont.FIELD_HEIGHT; y++)
        {
            for (var x = 0; x < cont.FIELD_WIDTH; x++)
                {cont.vFields.redrawCell(cont, x, y, field, numField, typeField, cont2D);}
        }        
    },
    
    getCellPixelPositionX : function(cont, posX, numField)
    {
        var margin = cont.FIELD_MARGIN * numField;
        var previousFields = (cont.CELL_SIZE_PX + 1) * 
                (numField - 1) * cont.FIELD_WIDTH;
        var currentField = posX * (cont.CELL_SIZE_PX + 1);       
        return margin + previousFields + currentField; 
    },
    
    getCellPixelPositionY : function(cont, posY)
    {
        var margin = cont.FIELD_MARGIN;
        var currentField = posY * (cont.CELL_SIZE_PX + 1);
        return margin + currentField;
    },
       
    redrawCell : function(cont, posX, posY, field, numField, typeField, cont2D)
    {
        var pxPosX = cont.vFields.getCellPixelPositionX(cont, posX, numField);
        var pxPosY = cont.vFields.getCellPixelPositionY(cont, posY);
        var cell = cont.mCommon.getCell(cont, field, posX, posY);
        
        cont2D.fillStyle = cont.vFields.getCellColor(cont, cell, typeField);
        cont2D.fillRect(pxPosX, pxPosY, cont.CELL_SIZE_PX, cont.CELL_SIZE_PX);
    },
    
    getCellColor : function(cont, cell, typeField)
    {
        var result;
        
        switch (cell)
        {
            case cont.CLOSED_EMPTY_CELL:               
                if (typeField === cont.OWN_FIELD) 
                    {result = cont.EMPTY_CELL_COLOR;} 
                else 
                    {result = cont.CLOSED_CELL_COLOR;}
                break;
            
            case cont.CLOSED_SHIP_CELL:
                if (typeField === cont.OWN_FIELD) 
                    {result = cont.SHIP_CELL_COLOR;} 
                else 
                    {result = cont.CLOSED_CELL_COLOR;}
                break;
                
            case cont.OPENED_EMPTY_CELL:
                result = cont.ATTACKED_EMPTY_CELL_COLOR;
                break;
                
            case cont.OPENED_SHIP_CELL:
                result = cont.ATTACKED_SHIP_CELL_COLOR;
                break;
                
            default:
                result = cont.CLOSED_CELL_COLOR;
        }
        return result;
    }
};

/* Код контроллера (контроллер) */
yvSeaWar.prototype.cCommon = 
{
    gameCycle : function(cont)
    {
        var attackingPlayer = cont.activePlayer;
        var attackedPlayer = (attackingPlayer === cont.player1) 
            ? cont.player2 : cont.player1;
        
        cont.cCommon.doMove(cont, attackingPlayer, attackedPlayer);
  
        if (attackingPlayer.motion.state === cont.FAILED_ATTACK)
        {
            cont.activePlayer = (attackingPlayer === cont.player1) 
                ? cont.player2 : cont.player1;
        }        
        else if (attackingPlayer.motion.state === cont.END_OF_GAME)
            {clearInterval(cont.gameCycleID);}
    },
    
    doMove : function(cont, attackingPlayer, attackedPlayer)
    {
            var attackingPrevious = 
                {x : attackingPlayer.motion.x, y : attackingPlayer.motion.y};
            var attackedPrevious = 
                {x : attackedPlayer.motion.x, y : attackedPlayer.motion.y}; 
            
            if (attackingPlayer.type === cont.COMPUTER)
                {cont.mAI.aiMove(cont, attackedPlayer.field, attackingPlayer.motion);}
            else if (attackingPlayer.type === cont.HUMAN)
                {cont.mHuman.humanMove(cont, attackedPlayer.field, attackingPlayer.motion);}
            
            if (attackedPlayer.motion.state === cont.IMPOSSIBLE_ATTACK)
                {return;}
                
            cont.vFields.redrawCell(cont, attackingPlayer.motion.x,
                attackingPlayer.motion.y, attackedPlayer.field, 
                attackedPlayer.numField, attackedPlayer.typeField, cont.cont2d);
            cont.vFields.redrawCell(cont, attackingPrevious.x,
                attackingPrevious.y, attackedPlayer.field, 
                attackedPlayer.numField, attackedPlayer.typeField, cont.cont2d);
            cont.vFields.redrawCell(cont, attackedPrevious.x,
                attackedPrevious.y, attackingPlayer.field, 
                attackingPlayer.numField, attackingPlayer.typeField, cont.cont2d);    
    },
       
    onClickHandler : function(cont, event)
    {
        var attackingPlayer = cont.activePlayer;
        var attackedPlayer = (attackingPlayer === cont.player1) 
            ? cont.player2 : cont.player1;        

        if (attackingPlayer.type !== cont.HUMAN)
            {return;}            
        
        var cellX = cont.cCommon.getCellByPixelPositionX(cont, event.offsetX, 
            attackedPlayer.numField);    
        var cellY = cont.cCommon.getCellByPixelPositionY(cont, event.offsetY);
        
        if (cellX >=0 && cellY >= 0)
        {
            cont.player1.motion.nx = cellX;
            cont.player1.motion.ny = cellY;
            cont.player1.motion.newMove = true;            
        }     
    },
    
    getCellByPixelPositionX : function(cont, x, numField)
    {
        var beginField = cont.vFields.getCellPixelPositionX(cont, 0, numField);
        var endField =  cont.vFields.getCellPixelPositionX(cont, 
            cont.FIELD_WIDTH, numField);
            
        if (x < beginField || x >= endField)
            {return -1;}
            
        var pixelsX = x - beginField + 1;
        var cellX = Math.floor(pixelsX / (cont.CELL_SIZE_PX + 1));
        
        return cellX;
    },
    
    getCellByPixelPositionY : function(cont, y)
    {
        var beginField = cont.vFields.getCellPixelPositionY(cont, 0);
        var endField =  cont.vFields.getCellPixelPositionY(cont, 
            cont.FIELD_HEIGHT);
            
        if (y < beginField || y >= endField)
            {return -1;}
            
        var pixelsY = y - beginField + 1;
        var cellY = Math.floor(pixelsY / (cont.CELL_SIZE_PX + 1));
        
        return cellY;
    }
};