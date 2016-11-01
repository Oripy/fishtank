var mut_rate = .2;

function DNA (code) {
                    // mass   ,   maxVel,    sight,     sightAngle
  this.code = code || [random(1), random(1), random(1), random(1)];

  this.mutate = function () {
    id = 1+floor(random(this.code.length-1));
    out = this.code.slice();
    out[id] = abs(out[id]+randomGaussian(0, mut_rate));
    if (out[id] > 1) {
      out[id] = 2-out[id];
    }
    return new DNA(out);
  }
}
