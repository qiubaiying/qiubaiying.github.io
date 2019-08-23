const smoothstep = function (edge0, edge1, x) {
    let t = (x - edge0) / (edge1 - edge0);
    t = Math.min(Math.max(t, 0), 1);
    return t * t * (3.0 - 2.0 * t);
  };
  class Particle {
    constructor(position, velocity) {
      this._canvas = document.createElement('canvas');
      this.canvas.width = this.dimensions.width + 2;
      this.canvas.width = this.dimensions.height + 2;
      this.ctx = this.canvas.getContext('2d');
  
      this.position = position;
      this.velocity = velocity;
  
      this.render();
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.lineWidth = 1.;
      this.ctx.strokeStyle = "#000000";
      this.ctx.arc(this.halfDims.width + 1, this.halfDims.height + 1, this.halfDims.width, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.arc(this.halfDims.width + 1, this.halfDims.height + 1, this.halfDims.width - this.ringWidth, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  
    solve() {
  
      const acceleration = new Vector(0, 0);
      let l = mousepos.subtractNew(this.position);
      let sqD = l.lengthSquared;
      let d = Math.sqrt(sqD);
      let force = 5000. / (sqD * d);
      force *= smoothstep(300, 0, d);
      acceleration.subtract(l.scale(force));
  
      this.render();
  
      const checkParticle = particle => {
        const l = particle.position.subtractNew(this.position);
        const sqD = l.lengthSquared; // The distance squared (cheaper than calculating actual distance, see: Pythagoras)
        d = Math.sqrt(sqD);
  
        const force = 20000. / d / (sqD * d);
  
        if (d < 200) {
          let a = smoothstep(200, 50, d) * .5;
          const s = this.position.clone();
          const offset = new Vector(this.halfDims.width - 5., 0).rotate(l.angle);
          s.add(offset);
          this.controller.ctx.beginPath();
          this.controller.ctx.moveTo(s.x, s.y);
          this.controller.ctx.strokeStyle = `rgba(0,0,0,${a})`;
          s.resetToVector(particle.position);
          s.subtract(offset);
          this.controller.ctx.lineTo(s.x, s.y);
          this.controller.ctx.stroke();
  
          a = smoothstep(200, 50, d);
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0,0,0,${a})`;
          this.ctx.lineWidth = this.ringWidth;
          this.ctx.arc(this.halfDims.width + 1, this.halfDims.height + 1, this.halfDims.width - this.ringWidth * .5, l.angle - a, l.angle + a);
          this.ctx.stroke();
        }
  
        acceleration.subtract(l.scale(force));
      };
  
      this.controller.particles.forEach(particle => {
        if (particle === this) return;
        checkParticle(particle);
      });
      this.velocity.add(acceleration);
      if (this.velocity.length > 5.) this.velocity.length = 5.;
      this.velocity.scale(.995);
  
      this.position.add(this.velocity);
      if (this.position.x > this.controller.dimensions.x + this.dimensions.x * 4) {
        this.position.x = -this.dimensions.x;
      } else if (this.position.x < -this.dimensions.x * 4) {
        this.position.x = this.controller.dimensions.x + this.dimensions.x;
      }
      if (this.position.y > this.controller.dimensions.y + this.dimensions.y * 4) {
        this.position.y = -this.dimensions.y;
      } else if (this.position.y < -this.dimensions.y * 4) {
        this.position.y = this.controller.dimensions.y + this.dimensions.y;
      }
    }
  
    get canvas() {
      return this._canvas;
    }
  
    set position(value) {
      if (value instanceof Vector) {
        this._position = value;
      }
    }
    get position() {
      if (!(this._position instanceof Vector)) this.position = new Vector(0, 0);
      return this._position;
    }
  
    set velocity(value) {
      if (value instanceof Vector) {
        this._velocity = value;
      }
    }
    get velocity() {
      if (!(this._velocity instanceof Vector)) this.velocity = new Vector(0, 0);
      return this._velocity;
    }
  
    set dimensions(value) {
      if (value instanceof Vector) {
        this._dimensions = value;
        this._halfDims = value.multiplyScalarNew(.5);
        this.canvas.width = this.dimensions.width + 2;
        this.canvas.height = this.dimensions.height + 2;
      }
    }
    get dimensions() {
      if (!(this._dimensions instanceof Vector)) this.dimensions = new Vector(50, 50);
      return this._dimensions;
    }
    get halfDims() {
      return this._halfDims;
    }
  
    get ringWidth() {
      return 10;
    }}
  
  
  class Stage {
    constructor(w, h) {
      this._canvas = document.createElement('canvas');
      this.resize(w, h);
      this.ctx = this.canvas.getContext('2d');
  
      this.run = this.run.bind(this);
    }
  
    run() {
      if (this.running === true) requestAnimationFrame(this.run);
      this.render();
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach(particle => {
        particle.solve();
        const pos = particle.position.subtractNew(particle.halfDims);
        this.ctx.drawImage(particle.canvas, pos.x, pos.y);
      });
    }
  
    resize(w, h) {
      this.dimensions = new Vector(w, h);
    }
  
    addParticle(particle) {
      if (particle instanceof Particle && particle.controller !== this) {
        if (particle.controller) particle.controller.removeParticle(particle);
        particle.controller = this;
        this.particles.push(particle);
      }
    }
    removeParticle(particle) {
      this.particles.forEach((_particle, i) => {
        if (_particle === particle) this.particles.splice(i, 1);
      });
    }
  
    set dimensions(value) {
      if (value instanceof Vector) {
        this._dimensions = value;
        this._halfDims = value.multiplyScalarNew(.5);
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;
      }
    }
    get dimensions() {
      if (!(this._dimensions instanceof Vector)) this.dimensions = new Vector(50, 50);
      return this._dimensions;
    }
    get halfDims() {
      return this._halfDims;
    }
  
    get canvas() {
      return this._canvas;
    }
  
    get particles() {
      if (!this._particles) this._particles = [];
      return this._particles;
    }
  
    set running(value) {
      if (this.running === false && value === true) {
        this._running = true;
        requestAnimationFrame(this.run);
      }
    }
    get running() {
      return this._running === true;
    }}
  
  
  const app = new Stage(window.innerWidth, window.innerHeight);
  
  const numParticles = window.innerWidth * window.innerHeight * .00008;
  
  for (let i = 0; i < numParticles; i++) {
    app.addParticle(new Particle(new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight), new Vector(0, 0)));
  }
  
  const mousepos = new Vector(-1000, 0);
  window.addEventListener('pointermove', e => {
    mousepos.x = e.clientX;
    mousepos.y = e.clientY;
  });
  
  document.body.appendChild(app.canvas);
  window.addEventListener('resize', e => {
    app.resize(window.innerWidth, window.innerHeight);
  });
  
  app.running = true;