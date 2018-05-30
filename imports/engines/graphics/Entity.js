import Utils from './WebGL-Utils.js';
import {mat4} from 'gl-matrix';

export default class Entity {
  constructor(name, parent) {
    this.name = name;
    this.SetParent(parent);
    this.children = [];
    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  Initialize(gl, programInfo, mesh, color) {
    var positions = mesh.vertices.flatten();
    var normals = mesh.normals.flatten();
    var indices = mesh.faces.flatten();
    this.programInfo = programInfo;
    this.meshColor = color;
    this.numComponents = indices.length;
    var attributes = {
      'a_position': positions,
      'a_normal': normals
    };
    this.buffers = Utils.CreateAttributesBuffers(gl, attributes);
    this.indexBuffer= Utils.CreateIndexBuffer(gl, indices);
  }

  ResetLocalMatrix() {
    this.localMatrix = mat4.create();
  }

  Translate(v) {
    mat4.translate(this.localMatrix, this.localMatrix, v);
  }

  Rotate(deg, axis) {
    var rad = deg * Math.PI / 180;
    mat4.rotate(this.localMatrix, this.localMatrix, rad, axis);
  }

  Scale(v) {
    mat4.scale(this.localMatrix, this.localMatrix, v);
  }

  ChangeColor(newColor) {
    this.meshColor = newColor;
  }

  SetParent(parent) {
    if (this.parent) {
      var ndx = this.parent.children.indexOf(this);
      if (ndx >= 0) {
        this.parent.children.splice(ndx, 1);
      }
    }
    if (parent) {
      parent.children.push(this);
    }
    this.parent = parent;
  }

  Update(parentWorldMatrix) {
    if (parentWorldMatrix) {
      mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
    } else {
      mat4.copy(this.worldMatrix, this.localMatrix);
    }

    var worldMatrix = this.worldMatrix;
    this.children.forEach(child => {
      child.Update(worldMatrix);
    });
  }

  GetUniforms() {
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, this.worldMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    var uniforms = {
      u_worldMatrix: this.worldMatrix,
      u_normalMatrix: normalMatrix,
      u_diffuseColor: this.meshColor,
    }
    return uniforms;
  }
}
