import {mat4, vec3, quat} from 'gl-matrix';

export default class Camera {
  constructor(fov, aspect) {
    this.position = vec3.create();
    this.yaw = 0;
    this.pitch = 0;
    this.viewMatrix = mat4.create();
    this.viewNeedsUpdate = true;
    this.projectionMatrix = mat4.create();
    this.projNeedsUpdate = true;
    this.aspect = aspect;
    this.fov = fov * Math.PI / 180;
  }

  Initialize(position, target) {
    this.viewNeedsUpdate = true;
    this.position = position;
    this.yaw = 0;
    this.pitch = 180;

    var v = vec3.create();
    vec3.subtract(v, target, position);
    var l = vec3.length(v);

    this.pitch = (Math.asin(v[1] / l) * 57.2958) + 180;
    if (Math.abs(v[2]) < 0.00001) {
      if(v[0] > 0) {
        this.yaw = 180;
      }
      else if (v[0] < 0) {
        this.yaw = -180;
      }
      else {
        this.yaw = 0;
      }
    }
    else {
      this.yaw = Math.atan2(v[0], v[2]) * 57.2958;
    }
  }

  HandleMovement(x, y) {
    this.viewNeedsUpdate = true;
    var speed = 0.25;

    this.yaw += x * speed;
    if (this.yaw < 0) this.yaw += 360;
    if (this.yaw >= 360) this.yaw -= 360;
    this.pitch += y * speed;
    if (this.pitch < 100) this.pitch = 100;
    if (this.pitch > 260) this.pitch = 260;
  }

  SetAspectRatio(aspect) {
    this.aspect = aspect;
    this.projNeedsUpdate = true;
  }

  SetFieldOfView(fov) {
    this.fov = fov;
    this.projNeedsUpdate = true;
  }

  GetViewMatrix() {
    if (this.viewNeedsUpdate) {
      var rotation = quat.create();
      quat.fromEuler(rotation, -this.pitch, this.yaw, 180.0);
      mat4.fromRotationTranslation(this.viewMatrix, rotation, this.position);
      mat4.invert(this.viewMatrix, this.viewMatrix);
      this.viewNeedsUpdate = false;
    }
    return this.viewMatrix;
  }

  GetProjectionMatrix() {
    if (this.projNeedsUpdate) {
      mat4.perspective(this.projectionMatrix, this.fov, this.aspect, 0.3, 1000);
      this.projNeedsUpdate = false;
    }
    return this.projectionMatrix;
  }

  GetPickingRay() {
    var view = mat4.create();
    mat4.copy(view, this.GetViewMatrix());
    mat4.invert(view, view);
    var ray = vec3.fromValues(view[8], view[9], view[10]);
    vec3.normalize(ray, ray);
    vec3.scale(ray, ray, -1);
    return ray;
  }
}
