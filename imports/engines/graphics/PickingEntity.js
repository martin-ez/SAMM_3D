import {vec3} from 'gl-matrix';

export default class PickingEntity {
  constructor(code, entity, aabb) {
    this.code = code;
    this.entity = entity;
    this.aabb_max = aabb;
    this.aabb_min = vec3.create();
    vec3.scale(this.aabb_min, aabb, -1.0);
    this.distance = 100000.0;
  }

  TestForPicking(pos, dir) {
    var tMin = 0.0;
    var tMax = 100000.0;
    this.distance = tMax;

    var wm = this.entity.worldMatrix;
    var obbPos = vec3.fromValues(wm[12], wm[13], wm[14]);
    var delta = vec3.create();
    vec3.subtract(delta, obbPos, pos);

    var xAxis = vec3.fromValues(wm[0], wm[1], wm[2]);
    var ex = vec3.dot(xAxis, delta);
    var fx = vec3.dot(dir, xAxis);

    if(Math.abs(fx)>0.001) {
      var t1x = (ex+this.aabb_min[0])/fx;
      var t2x = (ex+this.aabb_max[0])/fx;
      if (t1x>t2x) {
        var temp=t1x;
        t1x=t2x;
        t2x=temp;
      }
      if ( t2x < tMax ) tMax = t2x;
      if ( t1x > tMin ) tMin = t1x;
      if ( tMax < tMin ) return false;
    }
    else if(-ex+this.aabb_min[0] > 0.0 || -ex+this.aabb_max[0] < 0.0) {
      return false;
    }

    var yAxis = vec3.fromValues(wm[4], wm[5], wm[6]);
    var ey = vec3.dot(yAxis, delta);
    var fy = vec3.dot(dir, yAxis);

    if(Math.abs(fy)>0.001) {
      var t1y = (ey+this.aabb_min[1])/fy;
      var t2y = (ey+this.aabb_max[1])/fy;
      if (t1y>t2y) {
        var temp=t1y;
        t1y=t2y;
        t2y=temp;
      }
      if ( t2y < tMax ) tMax = t2y;
      if ( t1y > tMin ) tMin = t1y;
      if ( tMax < tMin ) return false;
    }
    else if(-ey+this.aabb_min[1] > 0.0 || -ey+this.aabb_max[1] < 0.0) {
      return false;
    }

    var zAxis = vec3.fromValues(wm[8], wm[9], wm[10]);
    var ez = vec3.dot(zAxis, delta);
    var fz = vec3.dot(dir, zAxis);

    if(Math.abs(fz)>0.001) {
      var t1z = (ez+this.aabb_min[2])/fz;
      var t2z = (ez+this.aabb_max[2])/fz;
      if (t1z>t2z) {
        var temp=t1z;
        t1z=t2z;
        t2z=temp;
      }
      if ( t2z < tMax ) tMax = t2z;
      if ( t1z > tMin ) tMin = t1z;
      if ( tMax < tMin ) return false;
    }
    else if(-ez+this.aabb_min[2] > 0.0 || -ez+this.aabb_max[2] < 0.0) {
      return false;
    }

    this.distance = tMin;
    return true;
  }
}
