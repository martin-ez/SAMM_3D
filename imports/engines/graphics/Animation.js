import {vec3} from 'gl-matrix';

export default class Animation {
  constructor(name, entity, type, start, end, time, delay) {
    this.name = name;
    this.entity = entity;
    this.type = type;
    this.start = start;
    this.end = end;
    this.time = time;
    this.startTime = 0;
    this.needStart = true;
    this.delay = delay;
  }

  SetStart(now) {
    this.needStart = false;
    this.startTime = now;
    switch (this.type) {
      case 'color':
        this.entity.ChangeColor(this.start);
        break;
      case 'position':
        this.entity.ResetLocalMatrix();
        this.entity.Translate(this.start);
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
    if(now < this.startTime + this.delay) {
      return;
    }
    var i = (now - this.startTime + this.delay) / this.time;
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
    if(now < this.startTime + this.delay) {
      return;
    }
    var i = (now - this.startTime + this.delay) / this.time;
    if (i<1) {
      var pos = vec3.create();
      vec3.lerp(pos, this.start, this.end, i);
      this.entity.ResetLocalMatrix();
      this.entity.Translate(pos);
      return false;
    }
    else {
      this.entity.ResetLocalMatrix();
      this.entity.Translate(this.end);
      return true;
    }
  }
}
