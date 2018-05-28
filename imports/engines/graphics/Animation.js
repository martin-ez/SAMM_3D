import {vec3} from 'gl-matrix';

export default class Animation {
  constructor(name, entity, type, start, end, time) {
    this.name = name;
    this.entity = entity;
    this.type = type;
    this.start = start;
    this.end = end;
    this.time = time;
    this.startTime = 0;
    this.needStart = true;
  }

  SetStart(now) {
    this.needStart = false;
    this.startTime = now;
    switch (this.type) {
      case 'color':
        this.entity.ChangeColor(this.start);
        break;
      case 'position':
        //TODO
        break;
    }
  }

  CalculateFrame(now) {
    switch (this.type) {
      case 'color':
        return this.HandleColorAnimation(now);
        break;
      case 'position':
        return this.HandlePositionAnimation(now);
        break;
    }
  }

  HandleColorAnimation(now) {
    var i = (now - this.startTime) / this.time;
    if (i<1) {
      var color = vec3.create();
      vec3.lerp(color, this.start, this.end, i);
      this.entity.ChangeColor(color);
      return false;
    }
    else {
      this.entity.ChangeColor(this.end);
      return true;
    }
  }

  HandlePositionAnimation(now) {
    //TODO
  }
}
