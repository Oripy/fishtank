function Food (energy, pos) {
	this.pos = pos || createVector(random(width), random(height));
  this.vel = createVector(random(-1, 1), random(-1, 1));
  this.vel.setMag(0.5);

	this.energy = energy || 2000;
  this.radius = 2;

	this.show = function() {
		noStroke();
		fill(64, 100, this.energy*10);
		ellipse(this.pos.x, this.pos.y, this.radius*2);
	}

  this.update = function() {
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
  }
}
