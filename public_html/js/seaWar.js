function yvSeaWar()
{
    this.humanField = this.getEmptyField();
    this.computerField = this.getEmptyField();
    
    this.setShips(this.humanField);
    console.log(this.cellExist(3, 3));
    console.log(this.cellExist(3, 9));    
}

yvSeaWar.prototype = 
{
    FIELD_WIDTH : 10,
    FIELD_HEIGHT : 10,
    SHIPS : [4, 3, 3, 2, 2, 2, 1, 1, 1, 1],
    
    getEmptyField : function()
    {
        var field = new Array();
        
        for (var y = 0; y < this.FIELD_HEIGHT; y++)
        {
            field[y] = new Array();
            
            for (var x = 0; x < this.FIELD_WIDTH; x++)
                {field[y][x] = 0;}
        }       
        return field;
    },
    
    getCell : function(field, posX, posY)
    {
        if (!this.cellExist(posX, posY))
            {return -1;}
            
        return field[posY][posX];
    },
    
    cellExist : function(posX, posY)
    {
        return (posX >= 0 && posY >= 0 && 
                posX < this.FIELD_WIDTH && 
                posY < this.FIELD_HEIGHT);
    },
    
    setShips : function(field)
    {
        for (var count = 0; count < this.SHIPS.length; count++)
        {
            var ship = this.SHIPS[count];
            var direction = Math.round(Math.random());
            this.setShip(field, ship, direction);
        }
    },
    
    setShip : function(field, ship, direction)
    {
        console.log(String(ship));
    }
};

var sw = new yvSeaWar();