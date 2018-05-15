let graphicInstance = null;
import Utils from './WebGL-Utils.js';
import PrimitiveTorus from 'primitive-torus';
import PrimitiveCube from 'primitive-cube';
import {mat4, vec3, quat} from 'gl-matrix';
import ShaderFactory from './ShaderFactory.js';

//Import 3D models
import Meshes from './Models.json';

export default class GraphicEngine {
  constructor() {
    if (!graphicInstance) {
      graphicInstance = this;
      this.gl = null;
      this.origin = new Entity('Origin', null);
      this.entities = [];
      this.light = [];
      this.camera = new Camera(45.0, 1.0);
      this.size = {
        width: 0,
        height: 0
      };
    }
    this.then = 0;
    this.SetContext = this.SetContext.bind(this);
    this.CanvasDimensions = this.CanvasDimensions.bind(this);
    this.CreateScene = this.CreateScene.bind(this);
    this.CalculateAnimations = this.CalculateAnimations.bind(this);
    this.DrawScene = this.DrawScene.bind(this);
    this.Render = this.Render.bind(this);
    return graphicInstance;
  }

  SetContext(canvas) {
    this.gl = Utils.GetContext(canvas);
  }

  CreateScene(instrument) {
    var cubeMesh = PrimitiveCube();
    var shaderProgram = ShaderFactory.GetSimpleShader(this.gl);
    var testEntity = new Entity('TestEntity', this.origin);
    testEntity.Initialize(this.gl, shaderProgram,
      cubeMesh.positions.flatten(),
      cubeMesh.normals.flatten(),
      [1.0, 0.0, 1.0],
      cubeMesh.cells.flatten());
    testEntity.Translate([0.0, 2.0, 0.0]);
    testEntity.Rotate(45, [0.0, 1.0, 0.0]);
    this.entities.push(testEntity);

    var mesh = PrimitiveTorus();
    var torus = new Entity('Torus', this.origin);
    torus.Initialize(this.gl, shaderProgram,
      mesh.positions.flatten(),
      mesh.normals.flatten(),
      [0.0, 1.0, 0.5],
      mesh.cells.flatten());
    torus.Translate([0.0, 4.0, 0.0]);
    this.entities.push(torus);

    console.log(Meshes.room);
    var room = new Entity('Room', this.origin);
    room.Initialize(this.gl, shaderProgram,
      Meshes.room.vertices,
      Meshes.room.normals,
      [0.5, 0.5, 0.5],
      Meshes.room.faces.flatten());
    this.entities.push(room);

    switch(instrument) {
      case 'drums':
        this.camera.Initialize([-0.0, 4.0, -6.0], [-0.0, 0.0, -7.0]);
        break;
      case 'bass':
        this.camera.Initialize([4.0, 4.0, 4.0], [-0.0, 0.0, -7.0]);
        break;
      case 'melody':
        this.camera.Initialize([-4.0, 4.0, 4.0], [-0.0, 0.0, -7.0]);
        break;
    }
  }

  CanvasDimensions(w, h) {
    this.size = {
      width: w,
      height: h
    };
    var aspect = w / h;
    this.camera.SetAspectRatio(aspect);
  }

  CameraMovement(x, y) {
    this.camera.HandleMovement(x, y);
  }

  CalculateAnimations(time, deltaTime) {
    this.entities[0].Rotate(1, [0.0, 0.0, 1.0]);

    //Update entities
    this.origin.Update(null);
  }

  DrawScene(time) {
    //Prepare context
    this.gl.canvas.width = this.size.width;
    this.gl.canvas.height = this.size.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //Get camera matrix
    var viewMatrix = this.camera.GetViewMatrix();
    var projMatrix = this.camera.GetProjectionMatrix();

    //Program Uniforms
    var programUniforms = {
      'u_viewMatrix': viewMatrix,
      'u_projectionMatrix': projMatrix,
      'u_lightDirection': [0.0, -1.0, -0.25],
      'u_ambientFactor': 0.3,
    };

    //Draw Objects
    var lastUsedProgram = null;
    this.entities.forEach(entity => {
      var programInfo = entity.programInfo;

      //Bind attributes
      Utils.BindBuffers(this.gl, programInfo.attributes, entity.buffers);

      //Set program
      if (programInfo !== lastUsedProgram) {
        lastUsedProgram = programInfo;
        this.gl.useProgram(programInfo.program);
      }

      //Set uniforms
      Utils.SetUniforms(this.gl, programInfo.uniforms, entity.GetUniforms(), programUniforms);

      //Draw entity
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer);
      const vertexCount = entity.numComponents;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    });
  }

  Render(now) {
    now *= 0.001;
    const deltaTime = now - this.then;
    this.then = now;

    this.CalculateAnimations(now, deltaTime);
    this.DrawScene(now);

    requestAnimationFrame(this.Render);
  }
}

class Entity {
  constructor(name, parent) {
    this.name = name;
    this.SetParent(parent);
    this.children = [];
    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  Initialize(gl, programInfo, positions, normals, color, indices) {
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

class Animation {
  constructor(entity, op) {
    this.entity = entity;
  }
}

class Light {}

class Camera {
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
      mat4.perspective(this.projectionMatrix, this.fov, this.aspect, 0.1, 1000);
      this.projNeedsUpdate = false;
    }
    return this.projectionMatrix;
  }
}
