var fishes;
var num_fishes = 10;
var foods;
var num_food = 0;

var deadcount = 0;
var killed = 0;

var t = 0;

MAX_ENERGY = 5000;

var DEBUG = 0;

var border_w = 10;

var hist = [];
var energy_loss = 10000;
var total_energy = 0;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB);
  fishes = [];
  for (i = 0; i < num_fishes; i++) {
    fishes.push(new Fish(new DNA([0, random(1), random(1), random(1)])));
  }

  foods = [];
  for (i = 0; i < num_food; i++) {
    foods.push(new Food());
  }
  //frameRate(20);
}

function mouseClicked() {
  DEBUG++;
  if (DEBUG > 3) {
    DEBUG = 0;
  }
}

function graph() {
  strokeWeight(1);
  maxVal = height/2;
  stroke(0);
  for (i = 1; i < height; i+=100) {
    var y = map(i, 0, 100, height, height-100);
    line(width, y, width-10, y);
  }

  for (var i = hist.length-1; i >= 0; i--) {
    if (width-(hist.length-i) < 0) {
      hist.splice(i,1);
    } else {
      if (DEBUG == 2) {
        stroke(0, .2);
        line(width-(hist.length-i), height, width-(hist.length-i), height-hist[i][0]);
        stroke(60, 100, 100, .6);
        line(width-(hist.length-i), height, width-(hist.length-i), height-hist[i][1]);
        stroke(0, 100, 100, .6);
        line(width-(hist.length-i), height, width-(hist.length-i), height-hist[i][2]);
      }
    }
  }
  if ((DEBUG == 3) && (hist.length > 0)) {
    for (var i = 1; i < min(5, hist.length); i++) {
      var d = hist[hist.length-i][3];
      for (var j in d) {
        noStroke();
        fill(0, 0.05*i);
        rect(width/10.*j, height-d[j]*10, width/10., d[j]*10);
      }
    }
  }
}

function totalE() {
  total_energy = 0;
  for (var i in fishes) {
    total_energy += fishes[i].energy;
  }
  for (var i in foods) {
    total_energy += foods[i].energy;
  }

  return total_energy+energy_loss;
}

function draw() {
  background(210, 90, 61);

  t++;
  if (t >= 60) {
    total_energy = 0;

    var min_mass = 100;
    var max_mass = 0;
    var min_speed = 100;
    var max_speed = 0;
                      //1+ 2+ 3+ 4+ 5+ 6+ 7+ 8+ 9+ 10+
    var distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var i in fishes) {
      total_energy += fishes[i].energy;
      f_mass = fishes[i].mass;
      if (f_mass > max_mass) {
        max_mass = fishes[i].mass;
      } else
      if (f_mass < min_mass) {
        min_mass = fishes[i].mass;
      }
      if (fishes[i].maxVel > max_speed) {
        max_speed = fishes[i].maxVel;
      } else
      if (fishes[i].maxVel < min_speed) {
        min_speed = fishes[i].maxVel;
      }
      distribution[floor(f_mass)-1] += 1;
    }

    for (var i in foods) {
      total_energy += foods[i].energy;
    }

    hist.push([fishes.length, deadcount, killed, distribution.slice()]);
    killed = 0;
    deadcount = 0;

    // console.log(floor(total_energy + energy_loss));

    t = 0;
  }

  for (i = foods.length-1; i >= 0; i--) {
    foods[i].update();
    foods[i].show();
    if (foods[i].energy <= 1) {
      energy_loss += foods[i].energy;
      foods.splice(i, 1);
    }
  }

  var threshold = 2000;
  if (energy_loss > threshold) {
    foods.push(new Food(threshold));
    energy_loss -= threshold;
  }

  for (i = fishes.length-1; i >= 0; i--) {
    if (fishes[i].dead) {
      fishes.splice(i, 1);
      deadcount++;
    } else {
      energy_loss += fishes[i].age();
      fishes[i].look();
      if (fishes[i].enemies.length > 0) {
        fishes[i].repulsion();
      } else if ((fishes[i].preys.length == 0) && (fishes[i].foods_list.length == 0)) {
        fishes[i].separate();
        fishes[i].align();
        fishes[i].cohesion();
      } else {
        fishes[i].hunt();
        fishes[i].find_food();
      }

      fishes[i].eat();

      fishes[i].update();
      fishes[i].show();
    }
  }

  if (fishes.length <= 0) {
    fishes.push(new Fish(new DNA([0, random(1), random(1), random(1)]), createVector(random(width), random(height)), energy_loss));
  }

  id = floor(random(fishes.length));
  fishes[id].reproduce();

  if (DEBUG >= 2) {
    graph();
  }
}

function distSquared(p1, p2) {
  if (p2) {
    return ((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
  } else {
    return (p1.x * p1.x) + (p1.y * p1.y);
  }

}
