const { vec2 } = require("gl-matrix");

class Bounds2D {
  constructor(topLeft, size) {
    this.topLeft = vec2.clone(topLeft);
    this.size = vec2.clone(size);
  }

  translate(offset) {
    vec2.add(this.topLeft, this.topLeft, offset);
  }

  getPosition() {
    return this.topLeft;
  }

  getCenter() {
    const center = vec2.create();
    vec2.add(center, this.topLeft, vec2.scale(vec2.create(), this.size, 0.5));
    return center;
  }

  intersects(other) {
    return !(
      (
        this.topLeft[0] + this.size[0] <= other.topLeft[0] || // this is left of other
        other.topLeft[0] + other.size[0] <= this.topLeft[0] || // this is right of other
        this.topLeft[1] + this.size[1] <= other.topLeft[1] || // this is below other
        other.topLeft[1] + other.size[1] <= this.topLeft[1]
      ) // this is above other
    );
  }
}

module.exports = { Bounds2D };
