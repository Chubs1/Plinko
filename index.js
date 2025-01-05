const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1920*0.9
canvas.height = 1080*0.8
const halfway = canvas.width / 2
let distanceFromTop = canvas.height / 10
c.fillRect(0,0,canvas.width,canvas.height);
const FIXED_TIMESTEP = 1 / 60; // 60 updates per second
let accumulator = 0;
let lastTime = null;
let id = 0

class ball {
    constructor({position, radius, color, gravity,velocity, bouncy, randomPosition,
        randomVelocity,damage, id, collision, ghostTime}) {
        this.position = position
        this.radius = radius
        this.color = color
        this.currentColor = color
        this.gravity = gravity * 2
        this.velocity = velocity
        this.bouncy = bouncy
        this.randomPosition = randomPosition
        this.randomVelocity = randomVelocity
        this.damage = damage
        this.id = id
        this.collision = collision
        this.ghostTime = ghostTime
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = this.currentColor; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()
    }

    update(deltaTime = 0) {
        this.velocity.y += this.gravity
        this.position.x += (this.velocity.x * deltaTime)
        this.position.y += (this.velocity.y * deltaTime)
        handlePegCollision(this, pegList)
        handleTriggerCollision(this, triggerList)
        }


}

class peg {
    constructor({position, radius, color}) {
        this.position = position
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = this.color; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()
    }


}

class trigger {
    constructor({position, radius, color, disabledColor, enabled, cooldown, maxHealth}) {
        this.position = position
        this.radius = radius
        this.color = color
        this.disabledColor = disabledColor
        this.currentColor = color
        this.enabled = enabled
        this.cooldown = cooldown
        this.ballsInside = new Set()
        this.maxHealth = maxHealth
        this.health = maxHealth
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = this.currentColor; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()
    }

    defaultAct() {
        this.health = this.maxHealth
        disableTrigger(this)
    }

    

}

class silverMineTrigger extends trigger {
    constructor ({position, radius, color, disabledColor, enabled, cooldown, maxHealth}) {
        super({position, radius, color, disabledColor,enabled , cooldown, maxHealth})
    
    }  

    act() {
        this.ballsInside.add(spawnBall(silver({position: this.position})).id)
    }

    
    
}


class exampleTrigger extends trigger { 
    constructor ({position, radius, color, disabledColor, enabled, cooldown, maxHealth}) {
        super({position, radius, color, disabledColor,enabled , cooldown, maxHealth})
    
    }   

    act() {
        
    }
}

ballList = []
pegList = []
triggerList = []
triggerPositions = []
triggerPositions[0] = []


allTriggers = {
    silverMineTrigger,

}

allBalls = {

}

const silver = ({position = {x:halfway, y:distanceFromTop}, randomVelocity = {x:50, y:30}, velocity = {x:0, y:-150}, color = "silver", collision = false, ghostTime = 0.5}) => {
    return {position, 
    velocity, 
    color,
    randomVelocity,
    collision,
    ghostTime
}
}

// TK Change collision to be based on pegs and triggers isntead of just pegs like it is now


const updateBalls = () => {
    for (let ball in ballList){
        ballList[ball].update(FIXED_TIMESTEP)
        ballList[ball].draw(FIXED_TIMESTEP)
    }
}

const updatePegs = () => {
    for(let peg in pegList){
        //pegList[peg].update(FIXED_TIMESTEP)
        pegList[peg].draw(FIXED_TIMESTEP)
    }

}

const updateTriggers = () => {
    for(let trigger in triggerList){
        //triggerList[trigger].update(FIXED_TIMESTEP)
        triggerList[trigger].draw(FIXED_TIMESTEP)
    }
}

const updateGame = () => {
    updateBalls()
    updatePegs()
    updateTriggers()
    cleanUp()
}

const cleanUp = () => {
    for(let ball in ballList){
        if(ballList[ball].position.y > canvas.height || ballList[ball].position.y < 0 || ballList[ball].position.x > canvas.width || ballList[ball].position.x < 0){
            ballList.splice(ball,1)
        }
    }
   
}

const animate = (time) => {
    window.requestAnimationFrame(animate)
    if (lastTime != null) {
        const deltaTime = (time - lastTime) / 1000
        lastTime = time
       
        accumulator += deltaTime;
       

        while (accumulator >= FIXED_TIMESTEP) {
            updateGame()
            accumulator -= FIXED_TIMESTEP;
        }

        renderGame()
    }
    else
    {
        lastTime = time
    }
   
}

const renderGame = () => {
    c.fillStyle = "grey"
    c.fillRect(0,0, canvas.width, canvas.height)
    updateGame()
}

const disableTrigger = (trigger) => {
    trigger.enabled = false
    trigger.currentColor = trigger.disabledColor
    setTimeout(() => {
        trigger.enabled = true
        trigger.currentColor = trigger.color

    }, trigger.cooldown * 1000);
}

const getDistance = (obj1, obj2) => {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    return distance = Math.sqrt(dx * dx + dy * dy);
}

const triggerCollisionHelper = (ball, trigger) => {

            trigger.health -= ball.damage
            if(trigger.health <= 0) {
                trigger.act()
                trigger.defaultAct()
            }
         
       
}

const handleTriggerCollision = (ball, triggerList) => {
    for(let trigger in triggerList){
       
        trigger = triggerList[trigger]
        if(trigger.enabled){

       
            if (getDistance(ball, trigger) <= trigger.radius + ball.radius ) {
                if(!trigger.ballsInside.has(ball.id)){
                    trigger.ballsInside.add(ball.id);
                        triggerCollisionHelper(ball, trigger)
                }
                if(trigger.ballsInside.size > 0){
                    
                    //TK it is being hit so animation of somekind
                }
            } else {
                if(trigger.ballsInside.has(ball.id)){
                    console.log(trigger.ballsInside)
                    trigger.ballsInside.delete(ball.id)
                    if(trigger.ballsInside.size == 0){
                        trigger.currentColor = trigger.color
                    }
                }
            }
        }
    }
       
}


const handlePegCollision = (ball, pegList) => {
   
    for(let peg in pegList){
        peg = pegList[peg]
        const dx = ball.position.x - peg.position.x;
        const dy = ball.position.y - peg.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= peg.radius + ball.radius && ball.collision) {
            // Normalize the collision vector
            const normalX = dx / distance;
            const normalY = dy / distance;
     
            // Reflect the velocity
           
            const dotProduct = ball.velocity.x * normalX + ball.velocity.y * normalY;
            ball.velocity.x -= 2 * dotProduct * normalX * ball.bouncy.x;
            ball.velocity.y -= 2 * dotProduct * normalY * ball.bouncy.y
     
            // Reposition moving circle to prevent overlap
            const overlap = peg.radius + ball.radius - distance;
            ball.position.x += normalX * overlap;
            ball.position.y += normalY * overlap;
          }
    }



}

const spawnBall = ({position = {x:halfway, y:distanceFromTop}, radius = 25, color = "green",
    gravity = 0.7, velocity = {x:0,y:0},
    bouncy = {x:0.75, y:0.75}, randomPosition = {x:20, y:0},
    randomVelocity = {x:0,y:0}, damage = 1, collision = true,
    ghostTime = 0.5
} = {}
) => {
        let randomPosX = Math.random() * randomPosition.x - (randomPosition.x/2);
        let randomPosY = Math.random() * randomPosition.y - (randomPosition.y/2);
        let randomVelX = Math.random() * randomVelocity.x - (randomVelocity.x/2);
        let randomVelY = Math.random() * randomVelocity.y - (randomVelocity.y/2);
        const currentBall = new ball(
            {
                position: {
                    x: position.x + randomPosX,
                    y: position.y + randomPosY
                },
                radius,
                color,
                gravity,
                velocity: {
                    x: velocity.x + randomVelX,
                    y: velocity.y + randomVelY
                },
                bouncy: {
                    x: bouncy.x,
                    y: bouncy.y
                },
                randomPosition,
                randomVelocity,
                damage,
                id: id++,
                collision,
            }
           
        )
    ballList.push(currentBall)
    setTimeout(() => {

        currentBall.collision = true
    }, ghostTime * 1000)
   
   
   return currentBall
}

const showTriggerSpots = () => {

let currentPositions = triggerPositions.map(array => array.filter(obj => !obj.occupied))

currentPositions.forEach((row, rowIndex) => {

row.forEach((value, colIndex) => {
position = currentPositions[rowIndex][colIndex].position
       c.beginPath();
        c.arc(position.x, this.position.y, 10, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = "black"; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()


})


})

}

const createTrigger = ({positionIndex, radius = 20, color = 'red', disabledColor = 'darkred', enabled = true, cooldown = 5, maxHealth = 1, trigger = "silverMineTrigger"}) => {
    const TriggerClass = allTriggers[trigger]
    triggerList.push(new TriggerClass({
    position: triggerPositions[positionIndex.row][positionIndex.col].position,
    radius,
    color,
    disabledColor,
    enabled,
    cooldown,
    maxHealth,
    health: maxHealth


}))
triggerPositions[positionIndex.row][positionIndex.col].occupied = true
}

const createPegs = ({rows, circleRadius, verticalGap, horizontalGap, pegMap}) => {
    if(pegMap == "triangle") {
    for (let row = 1; row < rows; row++) {
        triggerPositions[row] = []
            const numCircles = 1 + row * 2; // 1, 3, 5, 7, 9...
            const rowY =  distanceFromTop + row * (2 * circleRadius + verticalGap); // Calculate the y position for the row
            const rowWidth = numCircles * (2 * circleRadius + horizontalGap) - horizontalGap; // Total width of the row
            const startX = halfway - rowWidth / 2 + circleRadius; // Starting x position for the row
        
            for (let col = 0; col < numCircles; col++) {
              let circleX = startX + col * (2 * circleRadius + horizontalGap);
                if(col % 2 == 0){
              pegList.push(new peg(
                {
                    position: {
                        x:circleX,
                        y:rowY
                    },
                    radius: circleRadius,
                    color: "blue",
        
                }
               
            ))
        } else {
        triggerPositions[row-1][Math.floor(col/2)] = ({position: {
                        x:circleX,
                        y:rowY
                           },
        occupied: false
        }
           )
        
        }
            }
          }
    }
}



canvas.addEventListener('click', event=> {
    spawnBall()
})


createPegs({rows: 12, circleRadius: 5, verticalGap: 50 , horizontalGap: 50, pegMap: "triangle"})
createTrigger({
    positionIndex: {
        row: 1, 
        col: 0
    }, 
    cooldown: 5, 
    maxHealth: 5,
    trigger: "silverMineTrigger"
})
animate()