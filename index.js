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

let rows = 12
let circleRadius = 5
let verticalGap = 50
let horizontalGap = 50

ballList = []
pegList = []
triggerList = []
triggerPositions = []
// add 120 for the rows or just (gap + radius) * 2 of pegs

const silver = (that = {position: {x:halfway, y:distanceFromTop}}, randomVelocity = {x:50, y:30}) => {
    // that is the trigger it came form
    return {position: {
        x: that.position.x,
        y: that.position.y
    },

    velocity:{
        x:0,
        y:-150
    },
    color: "silver",
    randomVelocity: randomVelocity,
    collision: false,
    ghostTime: 0.5
}
}

// TK Change collision to be based on pegs and triggers isntead of just pegs like it is now

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
    constructor({position, radius = 20, color = 'red', enabled = true, cooldown}) {
        this.position = position
        this.radius = radius
        this.color = color
        this.currentColor = color
        this.enabled = enabled
        this.cooldown = cooldown
        this.ballsInside = new Set()
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = this.currentColor; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()
    }


}

class healthTrigger extends trigger {
    

    constructor({position, radius, color, enabled, cooldown, maxHealth, health}) {
        super({position, radius, color, enabled, cooldown})
        this.maxHealth = maxHealth
        this.health = health
    }

    act() {
        this.health = this.maxHealth
        this.ballsInside.add(spawnBall(silver(this)).id)
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Full circle (0 to 2π)
        c.fillStyle = this.currentColor; // Set fill color
        c.fill(); // Fill the circle
        c.stroke()
    }

}

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
        if(ballList[ball].position.y > canvas.height || ballList[ball].position.y < 0){
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
    c.clearRect(0,0,canvas.width, canvas.height)
    c.fillStyle = "grey"
    c.fillRect(0,0, canvas.width, canvas.height)
    updateGame()    
}

const disableTrigger = (trigger) => {
    trigger.enabled = false
    trigger.currentColor = `dark${trigger.color}`
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

const healthTriggerCollisionHelper = (ball, trigger) => {

            console.log("hit")
            trigger.health -= ball.damage
            if(trigger.health <= 0) {trigger.act()}
         
        
}

const handleTriggerCollision = (ball, triggerList) => {
    for(let trigger in triggerList){
        
        trigger = triggerList[trigger]
        if(trigger.enabled){

        
            if (getDistance(ball, trigger) <= trigger.radius + ball.radius ) { 
                if(!trigger.ballsInside.has(ball.id)){
                    trigger.ballsInside.add(ball.id);
                    if(trigger instanceof healthTrigger){
                        healthTriggerCollisionHelper(ball, trigger)
                    
                    } 
                    else {
                        disableTrigger(trigger)
                    }
                } 
                if(trigger.ballsInside.size > 0){
                    trigger.currentColor = `dark${trigger.color}`
                }
            } else {
                if(trigger.ballsInside.has(ball.id)){
                    console.log(trigger.ballsInside)
                    trigger.ballsInside.delete(ball.id) //left
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





animate()


    
for (let row = 1; row < rows; row++) {
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
}
    }
  }
  


canvas.addEventListener('click', event=> {
    spawnBall()
    console.log(ballList)
})


triggerList.push(new healthTrigger({
    position: {
        x: halfway + (2 * circleRadius + horizontalGap) * 0,
        y: distanceFromTop + (2*circleRadius + verticalGap) + (2*circleRadius + verticalGap) * 0,
    },
    cooldown: 1,
    maxHealth: 5,
    health: 5
}))

triggerList.push(new healthTrigger({
    position: {
        x: halfway +(2 * circleRadius + horizontalGap) * -1,
        y: distanceFromTop + (2*circleRadius + verticalGap) + (2*circleRadius + verticalGap)* 1,
    },
    cooldown: 1,
    maxHealth: 5,
    health: 5
}))

triggerList.push(new healthTrigger({
    position: {
        x: halfway  + (2 * circleRadius + horizontalGap) * 1, 
        y: distanceFromTop + (2*circleRadius + verticalGap) + (2*circleRadius + verticalGap) * 1,
    },
    cooldown: 1,
    maxHealth: 5,
    health: 5
}))
