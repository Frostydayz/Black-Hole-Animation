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
        
        if (collision) {
            const angle = Math.atan2(dy, dx);
            const acceleration = (mouse.radius - distance) / mouse.radius;

            // Spiraling effect
            this.directionX += Math.cos(angle) * acceleration * 0.7;
            this.directionY += Math.sin(angle) * acceleration * 0.7;

            // Tangential velocity for spiraling
            this.directionX += Math.sin(angle) * acceleration * 0.4;
            this.directionY -= Math.cos(angle) * acceleration * 0.4;
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();

    }

}

function createParticles() {
    const starColors = ['#FFFFFF', '#FFFFED', '#FFF8DC', '#FFFACD', '#F0FFF0', '#F5FFFA', '#F0FFFF', '#F0F8FF', '#E6E6FA', '#DDDFFF'];
    numberOfParticles = (canvas.height * canvas.width) / 20000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = Math.random() * (canvas.width - size * 2) + size;
        let y = Math.random() * (canvas.height - size * 2) + size;
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = starColors[Math.floor(Math.random() * starColors.length)];
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

let accretionDiskParticles = [];

function createAccretionDisk() {
    const diskColors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500', '#FF6347'];
    for (let i = 0; i < 300; i++) {
        accretionDiskParticles.push(new AccretionDiskParticle(diskColors));
    }
}

class AccretionDiskParticle {
    constructor(colors) {
        this.radius = Math.random() * 30 + 30;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.x = mouse.x + Math.cos(this.angle) * this.radius;
        this.y = mouse.y + Math.sin(this.angle) * this.radius;
    }

    update() {
        this.angle += this.speed;
        this.x = mouse.x + Math.cos(this.angle) * this.radius;
        this.y = mouse.y + Math.sin(this.angle) * this.radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initialize() {
    particlesArray = [];
    createParticles();
    createAccretionDisk();
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

    accretionDiskParticles.forEach(p => {
        p.update();
        p.draw();
    });

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius / 4, 0, Math.PI * 2, false);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(count, mouse.x, mouse.y + 7);
}


initialize();
animate();

