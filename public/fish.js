function Fish (dna, pos, energy) {
  this.dna = dna || new DNA();
  this.mass = 1+this.dna.code[0]*10;
  this.maxVel = this.dna.code[1]*2+this.mass/5.;//*this.mass/3.; //*this.mass/3.;  //*(11-this.mass/2.)/3; //*3;
  this.sight = 50*this.dna.code[2];
  this.sightAngle = HALF_PI*(1-this.dna.code[3]);

  this.eatcount = 0;

  this.selected = false;

  this.minVel = this.maxVel/2.; // /5.;
  this.maxForce = this.mass;
  this.radius = pow(PI*this.mass, 0.5);

  this.pos = pos || createVector(random(width), random(height));
  this.vel = createVector(random(-1, 1), random(-1, 1));
  this.vel.setMag(this.maxVel);
  this.acc = createVector(0, 0);
  this.maxEnergy = map(this.mass, 0, 11, 0, MAX_ENERGY);
  if (energy) {
    this.energy = energy;
  } else if (dna) {
    this.energy = this.maxEnergy;
  } else {
    this.energy = random(this.maxEnergy);
  }

  this.dead = false;
  this.neighboors = [];
  this.friends = [];
  this.enemies = [];
  this.preys = [];
  this.foods_list = [];

  this.update = function() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxVel);
    if (distSquared(this.vel) < this.minVel*this.minVel) {
      this.vel.setMag(this.minVel);
    }
    this.pos.add(this.vel);
    if (this.pos.x > width + border_w) {
      this.pos.x -= width + 2*border_w;
    } else if (this.pos.x < -border_w) {
      this.pos.x += width + 2*border_w;
    }
    if (this.pos.y > height + border_w) {
      this.pos.y -= height + 2*border_w;
    } else if (this.pos.y < -border_w) {
      this.pos.y += height + 2*border_w;
    }
    this.acc.mult(0);
   }

  this.applyForce = function(force) {
    // Newton's second law
    // F = m*a or a = F/m
    this.acc.add(force.limit(this.maxForce).mult(1/(this.mass*.5)));
  }

  this.seek = function(target) {
    desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxVel);
    steer = p5.Vector.sub(desired, this.vel);

    this.applyForce(steer);
  }

  this.flee = function(target) {
    desired = p5.Vector.sub(this.pos, target);
    desired.setMag(this.maxVel);
    steer = p5.Vector.sub(desired, this.vel);

    this.applyForce(steer);
  }

  this.look = function() {
    this.neighboors = [];
    this.friends = [];
    this.enemies = [];
    this.preys = [];
    this.foods_list = [];
    food_energy = 0;
    prey_energy = 0;
    for (var i in foods) {
      var diff = foods[i].pos.copy().sub(this.pos);
      var a = p5.Vector.angleBetween(this.vel, diff);
      var d = distSquared(diff);
      if ((d < this.sight*this.sight) && (a < this.sightAngle || a > TWO_PI-this.sightAngle)) {
        this.foods_list.push(foods[i]);
        this.food_energy += this.foodValue(foods[i]);
      }
    }
    for (var i in fishes) {
      if (fishes[i] != this) {
        var diff = fishes[i].pos.copy().sub(this.pos);
        var a = p5.Vector.angleBetween(this.vel, diff);
        var d = distSquared(diff);
        if (d < this.sight*this.sight) {
          this.neighboors.push(fishes[i]);
          if (a < this.sightAngle || a > TWO_PI-this.sightAngle) {
            if (fishes[i].mass >= this.mass+3) {
              this.enemies.push(fishes[i]);
            } else if (fishes[i].mass < this.mass-3) {
              this.preys.push(fishes[i]);
              prey_energy += fishes[i].energy;
            } else if (abs(fishes[i].mass - this.mass) < 2) {
              this.friends.push(fishes[i]);
            }
          }
        }
      }
    }
    if (food_energy < .1) {
      //this.foods_list = [];
    } else if (prey_energy > food_energy) {
      this.foods_list = [];
      this.friends = [];
    } else {
      this.preys = [];
    }
  }

  //separate from all fishes around
  this.separate = function() {
    var sum = createVector(0, 0);
    var count = 0;
    if (this.neighboors.length > 0) {
      for (var i in this.neighboors) {
        var d = distSquared(this.pos, this.neighboors[i].pos);
        if (d < 4*(this.radius+this.neighboors[i].radius)*(this.radius+this.neighboors[i].radius)) {
          var diff = this.pos.copy().sub(this.neighboors[i].pos);
          diff.normalize();
          sum.add(diff);
          count++;
        }
      }
      sum.div(count);
      sum.setMag(this.maxVel);
      sum.sub(this.vel);
      this.applyForce(sum);
    }
  }

  //align with friends in front
  this.align = function() {
    var sum = createVector(0, 0);
    if (this.friends.length > 0) {
      for (var i in this.friends) {
        sum.add(this.friends[i].vel);
      }
      sum.div(this.friends.length);
      sum.setMag(this.maxVel);
      sum.sub(this.vel);
      this.applyForce(sum);
    }
  }

  // keep together between friends in front
  this.cohesion = function() {
    var sum = createVector(0, 0);
    if (this.friends.length > 0) {
      for (var i in this.friends) {
        sum.add(this.friends[i].pos);
        if (DEBUG) {
          stroke(120, 100, 100);
          line(this.pos.x, this.pos.y, this.friends[i].pos.x, this.friends[i].pos.y);
        }
      }
      sum.div(this.friends.length);
      this.seek(sum);
    }
  }

  // flee from enemies in front
  this.repulsion = function() {
    var sum = createVector(0, 0);
    if (this.enemies.length > 0) {
      for (var i in this.enemies) {
        sum.add(this.enemies[i].pos);
        if (DEBUG) {
          stroke(0, 0, 0);
          line(this.pos.x, this.pos.y, this.enemies[i].pos.x, this.enemies[i].pos.y);
        }
      }
      sum.div(this.enemies.length);
      this.flee(sum);
    }
  }

  // hunt the closest prey
  this.hunt = function() {
    // var sum = createVector(0, 0);
    if (this.preys.length > 0) {
      var min_d = (this.sight*this.sight)+1;
      var closest;// = this.preys[0];
      for (var i in this.preys) {
        //sum.add(this.preys[i].pos);
        var d = distSquared(this.preys[i].pos, this.pos);
        if (d < min_d) {
          min_d = d;
          closest = this.preys[i];
        }
        // if (DEBUG) {
        //   stroke(0, 100, 100);
          // line(this.pos.x, this.pos.y, this.preys[i].pos.x, this.preys[i].pos.y);
        // }
      }
      //sum.div(this.preys.length);
      //this.seek(sum);
      this.seek(closest.pos);
      if (DEBUG) {
        stroke(0, 100, 100);
        line(this.pos.x, this.pos.y, closest.pos.x, closest.pos.y);
      }
    }
  }

  // hunt for food
  this.find_food = function() {
    if (this.foods_list.length > 0) {
      var min_d = (this.sight*this.sight)+1;
      var closest;// = this.foods_list[0];
      for (var i in this.foods_list) {
        var d = distSquared(this.foods_list[i].pos, this.pos);
        if (d < min_d) {
          min_d = d;
          closest = this.foods_list[i];
        }
      }
      this.seek(closest.pos);
      if (DEBUG) {
        stroke(40, 100, 100);
        line(this.pos.x, this.pos.y, closest.pos.x, closest.pos.y);
      }
    }
  }

  this.foodValue = function(food) {
    return food.energy/max(1, exp(this.mass-5));
  }

  this.eat = function() {
    if (!this.dead) {
      for (var i in this.preys) {
        var d = distSquared(this.preys[i].pos, this.pos);
        if ((d < this.radius*this.radius) && (!this.preys[i].dead)) {
          this.preys[i].dead = true;
          killed++;
          this.energy += this.preys[i].energy;
          this.grow(this.preys[i].energy);
          this.preys[i].energy = 0;
          this.eatcount++;
        }

      }
      for (var i in foods) {
        var d = distSquared(foods[i].pos, this.pos);
        if (d < (foods[i].radius+this.radius)*(foods[i].radius+this.radius)) {
          var qtt = this.foodValue(foods[i]);
          this.energy += qtt;
          foods[i].energy -= qtt;
          this.grow(qtt);
          foods[i].vel = createVector(random(-1, 1), random(-1, 1));
          foods[i].vel.setMag(0.5);
        }
      }
      // while (this.energy - this.maxEnergy > 0) {
      //   this.reproduce();
      // }
      if (this.energy > this.maxEnergy) {
        energy_loss += this.energy - this.maxEnergy;
        this.energy = this.maxEnergy;
      }
    }
  }

  this.reproduce = function() {
    if (this.energy > 6*this.maxEnergy/10) {
      if (random(this.mass*this.mass) < 10) {
        this.energy /= 2.;
        fishes.push(new Fish(this.dna.mutate(), this.pos.copy().sub(this.vel.copy().setMag(2*this.maxVel)), this.energy));
      }
    }
  }

  this.grow = function(value) {
    this.mass += value/(1000+this.mass*500);
    this.maxVel = this.dna.code[1]*2+this.mass/5.;
    this.maxForce = this.mass;
    this.radius = pow(PI*this.mass, 0.5);
    this.maxEnergy = map(this.mass, 0, 11, 0, MAX_ENERGY);
  }

  this.age = function() {
    if (!this.dead) {
      var value = min(max(0, random((this.mass-1)/5.)), this.energy);
      this.energy -= value;
      if (this.energy <= 0) {
        this.dead = true;
      }
      return value;
    } else {
      return 0;
    }
  }

  this.show = function(basic) {
    if ((this.selected) && DEBUG)   {
      strokeWeight(2);
      stroke(0, 100, 100);
    } else {
      noStroke();
    }

    if (DEBUG) {
      fill(map(this.energy, 0, map(this.mass, 0, 10, 0, MAX_ENERGY), 0, 240), 100, 100);
    } else {
      fill(map(this.mass, 0, 10, 0, 360), 100, 100);
    }

    if (basic) {
      ellipse(this.pos.x, this.pos.y, this.radius*2);
    } else {
      angle = this.vel.heading();
      p = this.vel.mag();

      anchor1 = createVector(this.pos.x+3*this.radius*cos(angle+PI+sin(p*t*.05)/5.),
                             this.pos.y+3*this.radius*sin(angle+PI+sin(p*t*.05)/5.));
      anchor2 = createVector(this.pos.x+this.radius*cos(angle+3*HALF_PI),
                             this.pos.y+this.radius*sin(angle+3*HALF_PI));
      anchor3 = createVector(this.pos.x+this.radius*cos(angle),
                             this.pos.y+this.radius*sin(angle));
      anchor4 = createVector(this.pos.x+this.radius*cos(angle+HALF_PI),
                             this.pos.y+this.radius*sin(angle+HALF_PI));

      control1 = createVector(this.pos.x+1.6*this.radius*cos(angle+PI),
                              this.pos.y+1.6*this.radius*sin(angle+PI));
      control2 = createVector(this.pos.x+1.2*this.radius*cos(angle+5*QUARTER_PI),
                            this.pos.y+1.2*this.radius*sin(angle+5*QUARTER_PI));
      control3 = createVector(this.pos.x+1.2*this.radius*cos(angle+6.5*QUARTER_PI),
                              this.pos.y+1.2*this.radius*sin(angle+6.5*QUARTER_PI));
      control4 = createVector(this.pos.x+1.2*this.radius*cos(angle+7.5*QUARTER_PI),
                              this.pos.y+1.2*this.radius*sin(angle+7.5*QUARTER_PI));
      control5 = createVector(this.pos.x+1.2*this.radius*cos(angle+0.5*QUARTER_PI),
                              this.pos.y+1.2*this.radius*sin(angle+0.5*QUARTER_PI));
      control6 = createVector(this.pos.x+1.2*this.radius*cos(angle+1.5*QUARTER_PI),
                              this.pos.y+1.2*this.radius*sin(angle+1.5*QUARTER_PI));
      control7 = createVector(this.pos.x+1.2*this.radius*cos(angle+3*QUARTER_PI),
                              this.pos.y+1.2*this.radius*sin(angle+3*QUARTER_PI));


      beginShape();
      vertex(anchor1.x, anchor1.y);
      bezierVertex(control1.x, control1.y, control2.x, control2.y, anchor2.x, anchor2.y);
      bezierVertex(control3.x, control3.y, control4.x, control4.y, anchor3.x, anchor3.y);
      bezierVertex(control5.x, control5.y, control6.x, control6.y, anchor4.x, anchor4.y);
      bezierVertex(control7.x, control7.y, control1.x, control1.y, anchor1.x, anchor1.y);
      endShape();

      if (DEBUG) {
        fill(0, 0, 100, 0.2);
        arc(this.pos.x, this.pos.y, this.sight*2, this.sight*2, angle-this.sightAngle, angle-TWO_PI+this.sightAngle);
      }
    }
  }
}
