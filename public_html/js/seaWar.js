function yvSeaWar()
{     
    this.fieldWidth = 10;
    this.fieldHeight = 10;
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    
    this.humanField = this.model.getEmptyField(this);
    this.computerField = this.model.getEmptyField(this);
    this.model.setShips(this, this.computerField);
    this.view.showField(this, this.computerField);
}

yvSeaWar.prototype = {};

yvSeaWar.prototype.model =
{
    getEmptyField : function(cont)
    {
        var field = new Array();

        for (var y = 0; y < cont.fieldHeight; y++)
        {
            field[y] = new Array();

            for (var x = 0; x < cont.fieldWidth; x++)
                {field[y][x] = 0;}
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
        if (!(cont.model.cellExist(cont, posX, posY)))
            {return -1;}

        return field[posY][posX];
    },
    
    setCell : function(cont, field, posX, posY, value)
    {
        if (!(cont.model.cellExist(cont, posX, posY)))
            {return;}
        
        field[posY][posX] = value;
    },
    
    setCells : function(cont, field, position, value)
    {
        for (var y = position.y1; y <= position.y2; y++)
        {
            for (var x = position.x1; x <= position.x2; x++)
            {
                cont.model.setCell(cont, field, x, y, value);
            }
        }        
    },

    setShips : function(cont, field)
    {
        for (var count = 0; count < cont.ships.length; count++)
        {
            var ship = cont.ships[count];
            var direction = Math.round(Math.random());
            cont.model.setShip(cont, field, ship, direction);
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
                if (cont.model.checkShipSpace(cont, field, shipBody, shipSpace))
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
        var index = Math.floor(Math.random() * positions.length);
        var position = positions[index];
        cont.model.setCells(cont, field, position, 1);
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
                if (cont.model.getCell(cont, field, x, y) > 0)
                    {return false;}
            }
        }
        return true;
    }
};             

yvSeaWar.prototype.view = 
{
    /* test view */
    showField : function(cont, field)
    {
        var str = "";
        
        for (var y = 0; y < cont.fieldHeight; y++)
        {
            for (var x = 0; x < cont.fieldWidth; x++)
            {                
                str = str + "  " + cont.model.getCell(cont, field, x, y);                       
            }
            console.log(y + " : " + str);
            str = "";
        }        
    }
};

var sw = new yvSeaWar();