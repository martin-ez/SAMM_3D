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
    var testEntity = new Entity('TestEntity', this.origin);

    const positions = [
      // Front face
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,

      // Back face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,

      // Top face
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,

      // Bottom face
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,

      // Right face
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,

      // Left face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0
    ];
    const faceColors = [
      [
        1.0, 1.0, 1.0, 1.0
      ], // Front face: white
      [
        1.0, 0.0, 0.0, 1.0
      ], // Back face: red
      [
        0.0, 1.0, 0.0, 1.0
      ], // Top face: green
      [
        0.0, 0.0, 1.0, 1.0
      ], // Bottom face: blue
      [
        1.0, 1.0, 0.0, 1.0
      ], // Right face: yellow
      [
        1.0, 0.0, 1.0, 1.0
      ], // Left face: purple
    ];

    // Convert the array of colors into a table for all the vertices.

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];

      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }

    const indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ];

    var shaderProgram = ShaderFactory.GetTestShader(this.gl);
    testEntity.Initialize(this.gl, shaderProgram, positions, colors, indices);
    this.entities.push(testEntity);
    this.camera.SetTarget(-0.0, 0.0, -7.0);
    this.camera.SetPosition(-0.0, 0.0, -6.0);
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
    }
    var shaderProgram = ShaderFactory.GetSimpleShaderInfo(this.gl);
    var mesh = PrimitiveTorus();
    var torus = new Entity(this.origin);
    torus.Initialize(this.gl, shaderProgram, mesh, [0.0, 0.0, 0.0]);
    torus.SetPosition(0.0,-1.0,0.0);
    this.entities.push(torus);*/
  }

  CanvasDimensions(w, h) {
    this.size = {
      width: w,
      height: h
    };
    var aspect = w / h;
    this.camera.SetAspectRatio(aspect);
  }

  CalculateAnimations(time, deltaTime) {
    this.entities[0].Rotate(1, [0.5, 1.0, 1.0]);

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
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //Get camera matrix
    var viewMatrix = this.camera.GetViewMatrix();
    var projMatrix = this.camera.GetProjectionMatrix();

    //Program Uniforms
    var programUniforms = {
      'u_viewMatrix': viewMatrix,
      'u_projectionMatrix': projMatrix,
      /*'u_lightDirection': [0.0, -1.0, 1.0],
      'u_ambientFactor': 0.6,*/
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
      const vertexCount = 36;
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
    this.flag = true;
    this.Update = this.Update.bind(this);
    this.Initialize = this.Initialize.bind(this);
    this.Translate = this.Translate.bind(this);
    this.Rotate = this.Rotate.bind(this);
    this.Scale = this.Scale.bind(this);
    this.SetParent = this.SetParent.bind(this);
    this.GetUniforms = this.GetUniforms.bind(this);
  }

  Initialize(gl, programInfo, positions, colors, indices) {
    this.programInfo = programInfo;
    //this.meshColor = color;
    var attributes = {
      'a_position': positions,
      'a_color': colors
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

  ProcessMesh(gl, mesh) {
    var attributes = {
      'a_position': mesh.positions.flatten(),
      'a_normal': mesh.normals.flatten()
    };
    this.buffers = Utils.CreateAttributesBuffers(gl, attributes);

    var indices = mesh.cells.flatten();
    this.numComponents = indices.length;
    this.indexBuffer = Utils.CreateIndexBuffer(gl, indices);
  }

  GetUniforms() {
    var uniforms = {
      'u_worldMatrix': this.worldMatrix,
      //'u_diffuseColor': this.meshColor,
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
    this.target = vec3.create();
    this.viewMatrix = mat4.create();
    this.viewNeedsUpdate = true;
    this.projectionMatrix = mat4.create();
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
    if (this.viewNeedsUpdate) {
      mat4.lookAt(this.viewMatrix, this.position, this.target, vec3.fromValues(0.0, 1.0, 0.0));
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
