let graphicInstance = null;
import {context, program, uniform, texture, attribute} from 'gl-util';
import OBJ from 'webgl-obj-loader';
import {mat4, vec3, quat} from 'gl-matrix';

export default class GraphicEngine {
  constructor(canvas) {
    if (!graphicInstance) {
      graphicInstance = this;
      this.gl = context({canvas, preserveDrawingBuffer: false});
      this.origin = new Entity();
      this.entities = [];
      this.light = [];
      this.camera = new Camera(60, 1.0);
      this.size = {
        width: 0,
        height: 0
      };
    }
    return graphicInstance;
  }

  CreateScene(instrument) {
    
  }

  CanvasDimensions(w, h) {
    this.size = {
      width: w,
      height: h
    };
    var aspect = w / h;
    this.camera.SetAspectRatio(aspect);
  }

  DrawScene() {
    var gl = this.gl;

    //Prepare context
    gl.canvas.width = this.size.width;
    gl.canvas.height = this.size.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Update entities
    this.origin.Update();

    //Get camera matrix
    var viewMatrix = this.camera.GetViewMatrix();
    var projMatrix = this.camera.GetProjectionMatrix();

    //Program Uniforms
    var programUniforms = {
      'viewMatrix': viewMatrix,
      'projectionMatrix': projMatrix
    };

    //Draw Objects
    var lastUsedProgram = null;
    this.entities.forEach(entity => {

      //Set program
      if(entity.program !== lastUsedProgram) {
        lastUsedProgram = entity.program;
        program(gl, entity.program);
      }

      //Set attributes
      for (var att in entity.attributes) {
        if (entity.attributes.hasOwnProperty(att)) {
          attribute(gl, att, entity.attributes[att]);
        }
      }

      //Set uniforms
      for (var uni in programUniforms) {
        if (programUniforms.hasOwnProperty(uni)) {
          uniform(gl, uni, programUniforms[uni]);
        }
      }

      //Set world matrix
      unifrom(gl, 'worldMatrix', entity.worldMatrix);

      //Draw entity
      gl.drawArrays(gl.TRIANGLES, 0, entity.numElements);
    });
    requestAnimationFrame(DrawScene);
  }
}

class Entity {
  constructor(parent) {
    this.parent = parent;
    this.children = [];
    this.transform = {
      position: vec3.create(),
      rotation: quat.create(),
      scale: vec3.create()
    }
    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
    this.program = null;
    this.attributes = {};
    this.numElements = 0;
  }

  SetPosition(x, y, z) {
    this.transform.position = vec3.fromValues(x, y, z);
  }

  SetRotation(x, y, z) {
    quat.fromEuler(this.transform.rotation, x, y, z)
  }

  SetScale(x, y, z) {
    this.transform.scale = vec3.fromValues(x, y, z);
  }

  Translate(x, y, z) {
    vec3.add(this.transform.position, this.transform.position, vec3.fromValues(x, y, z));
  }

  Rotate(deg, axis) {
    var rad = deg * Math.PI / 180;
    switch (axis) {
      case 'x':
        quat.rotateX(this.transform.rotation, this.transform.rotation, rad);
        break;
      case 'y':
        quat.rotateY(this.transform.rotation, this.transform.rotation, rad);
        break;
      case 'z':
        quat.rotateZ(this.transform.rotation, this.transform.rotation, rad);
        break;
    }
  }

  Scale(x, y, z) {
    vec3.add(this.transform.scale, this.transform.scale, vec3.fromValues(x, y, z));
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
    mat4.fromRotationTranslationScale(this.localMatrix, this.transform.rotation, this.transform.position, this.transform.scale);

    if (parentWorldMatrix) {
      mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
    } else {
      mat4.copy(this.worldMatrix, this.localMatrix);
    }

    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
      child.Update(worldMatrix);
    });
  }
}

class Light {}

class Camera {
  constructor(fov, aspect) {
    this.position = vec3.create();
    this.target = vec3.create();
    this.viewMatrix = mat4.create();
    this.viewNeedsUpdate = true;
    this.projectionMatrix =mat4.create();
    this.projNeedsUpdate = true;
    this.aspect = aspect;
    this.fov = fov * Math.PI / 180;
  }

  SetPosition(x, y, z) {
    this.transform.position = vec3.fromValues(x, y, z);
    this.viewNeedsUpdate = true;
  }

  SetTarget(x, y, z) {
    this.transform.target = vec3.fromValues(x, y, z);
    this.viewNeedsUpdate = true;
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
    if(this.viewNeedsUpdate) {
      mat4.lookAt(this.viewMatrix, this.position, this.target, vec3.fromValues(0.0, 1.0, 0.0));
      mat4.invert(this.viewMatrix, this.viewMatrix);
      this.viewNeedsUpdate = false;
    }
    return this.viewMatrix;
  }

  GetProjectionMatrix() {
    if(this.projNeedsUpdate) {
      mat4.perspective(this.projectionMatrix, this.fov, this.aspect, 1, 2000);
      this.projNeedsUpdate = false;
    }
    return this.projectionMatrix;
  }
}
