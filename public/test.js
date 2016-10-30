function setup() {
  var food = 500;
  for (var mass = 1; mass <= 11; mass++) {
    var maxi = map(mass, 0, 11, 0, 5000);
    var cur = 0;
    console.log(min(food/max(1, exp(mass-5)), maxi-cur));
  }
}
