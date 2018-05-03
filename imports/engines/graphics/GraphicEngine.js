let graphicInstance = null;
import Utils from './WebGL-Utils.js';
import OBJ from 'webgl-obj-loader';
import PrimitiveTorus from 'primitive-torus';
import {mat4, vec3, quat} from 'gl-matrix';
import ShaderFactory from './ShaderFactory.js';

export default class GraphicEngine {
  constructor() {
    if (!graphicInstance) {
      graphicInstance = this;
      this.gl = null;
      this.origin = new Entity();
      this.entities = [];
      this.light = [];
      this.camera = new Camera(60.0, 1.0);
      this.size = {
        width: 0,
        height: 0
      };
    }
    this.DrawScene = this.DrawScene.bind(this);
    return graphicInstance;
  }

  SetContext(canvas) {
    this.gl = Utils.GetContext(canvas);
  }

  CreateScene(instrument) {
    this.camera.SetTarget(0.0, 0.0, 0.0);
    this.camera.SetPosition(0.0, 5.0, 0.0);
    /*switch (instrument) {
      case 'drums':
        this.camera.SetPosition(-2.0, 5.0, 0);
        break;
      case 'bass':
        this.camera.SetPosition(-1.0, 5.0, -1.0);
        break;
      case 'solo':
        this.camera.SetPosition(0.0, 5.0, -2.0);
        break;
    }*/
    var shaderProgram = ShaderFactory.GetSimpleShaderInfo(this.gl);
    var mesh = PrimitiveTorus();
    var torus = new Entity(this.origin);
    torus.Initialize(this.gl, shaderProgram, mesh, [0.0, 0.0, 0.0]);
    torus.SetPosition(0.0,-1.0,0.0);
    this.entities.push(torus);
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
    //Prepare context
    this.gl.canvas.width = this.size.width;
    this.gl.canvas.height = this.size.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //Update entities
    this.origin.Update();

    //Get camera matrix
    var viewMatrix = this.camera.GetViewMatrix();
    var projMatrix = this.camera.GetProjectionMatrix();

    //Program Uniforms
    var programUniforms = {
      'u_viewMatrix': viewMatrix,
      'u_projectionMatrix': projMatrix,
      'u_lightDirection': [0.0, -1.0, 1.0],
      'u_ambientFactor': 0.6,
    };

    //Draw Objects
    var lastUsedProgram = null;
    this.entities.forEach(entity => {
      //Set program
      var programInfo = entity.programInfo;
      if(programInfo!== lastUsedProgram) {
        lastUsedProgram = programInfo;
        this.gl.useProgram(programInfo.program);
      }

      //Bind attributes
      Utils.BindBuffers(this.gl, programInfo.attributes, entity.buffers);

      //Set uniforms
      Utils.SetUniforms(this.gl, programInfo.uniforms, entity.GetUniforms(), programUniforms);

      //Draw entity
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer);
      const vertexCount = entity.numComponents;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    });
    requestAnimationFrame(this.DrawScene);
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
  }

  Initialize(gl, programInfo, mesh, color) {
    this.programInfo = programInfo;
    this.meshColor = color;
    if(mesh) {
      this.ProcessMesh(gl, mesh);
    }
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
    vec3.add(this.transform.position, this.transform.position,
      vec3.fromValues(x, y, z));
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
    vec3.add(this.transform.scale, this.transform.scale,
      vec3.fromValues(x, y, z));
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
    mat4.fromRotationTranslationScale(this.localMatrix,
      this.transform.rotation,
      this.transform.position,
      this.transform.scale);

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

  ProcessMesh(gl, mesh) {
    var attributes = {
      'a_position': mesh.positions.flatten(),
      'a_normal': mesh.normals.flatten(),
    };
    this.buffers = Utils.CreateAttributesBuffers(gl, attributes);

    var indices = mesh.cells.flatten();
    this.numComponents = indices.length;
    this.indexBuffer = Utils.CreateIndexBuffer(gl, indices);
  }

  GetUniforms() {
    var uniforms = {
      'u_worldMatrix': this.worldMatrix,
      'u_diffuseColor': this.meshColor,
    }
    return uniforms;
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
    this.position = vec3.fromValues(x, y, z);
    this.viewNeedsUpdate = true;
  }

  SetTarget(x, y, z) {
    this.target = vec3.fromValues(x, y, z);
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
      mat4.lookAt(this.viewMatrix, this.position,
        this.target, vec3.fromValues(0.0, 1.0, 0.0));
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
