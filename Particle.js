const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray; 
let numberOfParticles;
let particlesNeeded = 150;
let explosions = [];
//mouse position
let mouse = {
    x: null,
    y: null,
    radius: (canvas.height/80) * (canvas.width/80)
}

let blackhole = {
    height: 100,
    width: 100,
    radius: 50
}


window.addEventListener ('mousemove',
    function(event) {
        mouse.x = event.x;
        mouse.y = event.y;

        //Make cursor blackhole
        const blackHoleCursor = document.getElementById('blackHoleCursor');
        blackHoleCursor.style.left = event.clientX + 'px';
        blackHoleCursor.style.top = event.clientY + 'px';
    }
)

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowColor = 'rgb(255, 255, 255)';
        ctx.shadowBlur = 1;
    }

    update() {
        let outOfBoundsX = this.x >= canvas.width || this.x <= 0;
        let outOfBoundsY = this.y >= canvas.height || this.y <=0;
        if (outOfBoundsX) {
            this.directionX = -this.directionX;
        }

        if (outOfBoundsY) {
            this.directionY = -this.directionY 
        }
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let collision = distance < mouse.radius + this.size;
        
        const gatherParticles = () => {
            let gatherSpeedX = dx / distance * 0.5;
            let gatherSpeedY = dy / distance * 0.5; 


            this.x += gatherSpeedX;    
            this.y += gatherSpeedY;
        }

        if (collision) {
            gatherParticles.call(this);
        } 

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();

    }

}

function createParticles() {
    numberOfParticles = (canvas.height * canvas.width) / 20000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = Math.random() * 5 + 1;
        let x = Math.random() * (canvas.width - size * 2) + size;
        let y = Math.random() * (canvas.height - size * 2) + size;
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = 'rgb(240, 240, 240)';
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function initialize() {
    particlesArray = [];
    createParticles();
}

function connectDots() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = 
            ((particlesArray[a].x - particlesArray[b].x) * 
            (particlesArray[a].x - particlesArray[b].x)) + 
            ((particlesArray[a].y - particlesArray[b].y) * 
            (particlesArray[a].y - particlesArray[b].y));

            if (distance < (canvas.height/10) * (canvas.width/10)) {
                ctx.strokeStyle="rgba(205, 167, 255, 0.14)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }    
        }
    }
}


class ExplosionParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10;
        this.color = 'rgb(255, 123, 0)';

        // Circular direction
        const angle = Math.random() * Math.PI * 2; // random angle in radians
        const speed = 4;       // random speed (2 to 6)
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;

        this.life = 300 + Math.random() * 30; // how long the particle lives
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = this.life / 300;
        this.size *= 0.995;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, ${this.opacity})`;
        ctx.fill();
    }
}

  
  function createExplosion(x, y, particleCount = 30) {
    let explosionParticles = [];
    for(let i = 0; i < particleCount; i++) {
      explosionParticles.push(new ExplosionParticle(x, y));
    }
    return explosionParticles;
  }

  
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let count = 0;
    let particlesInside = []; 

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();

        let dx = mouse.x - particlesArray[i].x;
        let dy = mouse.y - particlesArray[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < blackhole.radius) {
            count++;
            particlesInside.push(i);
        }
    }
    
    explosions.forEach((explosion, index) => {
        explosion.forEach((p, i) => {
          p.update();
          p.draw(ctx);
          if (p.life <= 0 || p.size < 0.1) {
            explosion.splice(i, 1);
          }
        });
        if (explosion.length === 0) {
          explosions.splice(index, 1);
        }
      });

    if (particlesInside.length >= particlesNeeded) {
        for(let i = particlesInside.length - 1; i >= 0; i--) {
            let p = particlesArray[particlesInside[i]];
            explosions.push(createExplosion(p.x, p.y)); 
            particlesArray.splice(particlesInside[i], 1); 
        }
        explosions.push(createExplosion(mouse.x, mouse.y));
        particlesNeeded += (particlesArray.length / 5) + 1; // Increase particlesNeeded based on remaining particles
        setTimeout(() => {
            createParticles();
        }, 500);
    }


    const blackHoleCursor = document.getElementById('blackHoleCursor');
    blackHoleCursor.textContent = count;
    blackHoleCursor.style.color = "white";
    blackHoleCursor.style.fontSize = "20px";
    connectDots();
}


initialize();
animate();

