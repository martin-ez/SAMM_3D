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
      this.animations = [];
      this.camera = new Camera(60.0, 1.0);
      this.size = {
        width: 0,
        height: 0
      };
      this.activeUsers = {
        drums: false,
        bass: false,
        melody: false
      }
    }
    return graphicInstance;
  }

  SetContext(canvas) {
    this.gl = Utils.GetContext(canvas);
  }

  CreateScene(instrument) {
    //Get Shader
    var shaderProgram = ShaderFactory.GetSimpleShader(this.gl);

    //Create Room
    for(var i = 0; i<3; i++) {
      var room_piece = new Entity('Room_'+i, this.origin);
      room_piece.Initialize(this.gl, shaderProgram, Meshes.room_piece, [0.3, 0.3, 0.3]);
      room_piece.Rotate(i*120, [0.0, 1.0, 0.0]);
      this.entities.push(room_piece);
    }

    var instruments = ['drums', 'bass', 'melody'];
    instruments.map((instr, i) => {
      var room_piece = new Entity(instr+'_room', this.origin);
      room_piece.Initialize(this.gl, shaderProgram, Meshes.room_piece, [0.1, 0.1, 0.1]);
      room_piece.Rotate(i*120 + 60, [0.0, 1.0, 0.0]);
      this.entities.push(room_piece);
    });

    var synthStandDrums = new Entity('drums_synth', this.origin);
    synthStandDrums.Initialize(this.gl, shaderProgram, Meshes.stand, [0.1, 0.1, 0.1]);
    synthStandDrums.Translate([6.73, 0, 11.67]);
    synthStandDrums.Rotate(30, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandDrums);

    switch(instrument) {
      case 'drums':
        this.camera.Initialize([7.45, 3.0, 12.9], [0.0, 0.0, 0.0]);
        break;
      case 'bass':
        this.camera.Initialize([4.0, 4.0, 4.0], [0.0, 0.0, 0.0]);
        break;
      case 'melody':
        this.camera.Initialize([-4.0, 4.0, 4.0], [0.0, 0.0, 0.0]);
        break;
    }
  }

  UpdateScene(time, song) {
    //Repaint room pieces
    var instruments = ['drums', 'bass', 'melody'];
    instruments.map((instr) => {
      if(song[instr].user !== '' && !this.activeUsers[instr]) {
        this.activeUsers[instr] = true;
        var piece = this.FindEntityByName(instr+'_room');
        var finalColor = [0.87, 0.13, 0.18];
        switch (instr) {
          case 'bass':
          finalColor = [0.07, 0.53, 0.16];
          break;
          case 'melody':
          finalColor = [0.47, 0.12, 0.78];
          break;
        }
        this.RemoveAnimationByName(instr+'_room_off');
        var ani = new Animation(instr+'_room_on', piece, 'color',
          [0.1, 0.1, 0.1], finalColor, 1500, time);
        this.animations.push(ani);
      }
      else if(song[instr].user === '' && this.activeUsers[instr]) {
        this.activeUsers[instr] = false;
        var piece = this.FindEntityByName(instr+'_room');
        var finalColor = [0.87, 0.13, 0.18];
        switch (instr) {
          case 'bass':
          finalColor = [0.07, 0.53, 0.16];
          break;
          case 'melody':
          finalColor = [0.47, 0.12, 0.78];
          break;
        }
        this.RemoveAnimationByName(instr+'_room_on');
        var ani = new Animation(instr+'_room_off', piece, 'color',
          finalColor, [0.1, 0.1, 0.1], 1000, time);
        this.animations.push(ani);
      }
    });
  }

  CanvasDimensions(w, h) {
    this.size = {
      width: w,
      height: h
    };
    var aspect = w / h;
    this.camera.SetAspectRatio(aspect);
  }

  FindEntityByName(name) {
    for(var i = 0; i<this.entities.length; i++) {
      if (this.entities[i].name === name) {
        return this.entities[i];
      }
    }
    return null;
  }

  RemoveAnimationByName(name) {
    for(var i = 0; i<this.animations.length; i++) {
      if (this.animations[i].name === name) {
        this.animations.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  CameraMovement(x, y) {
    this.camera.HandleMovement(x, y);
  }

  CalculateAnimations(time, deltaTime) {
    var toRemove = [];
    for(var i = 0; i<this.animations.length; i++) {
      if(this.animations[i].CalculateFrame(time)) {
        toRemove.push(this.animations[i].name);
      }
    }
    for(var i = 0; i<toRemove.length; i++) {
      this.RemoveAnimationByName(toRemove[i]);
    }

    //Update entities
    this.origin.Update(null);
  }

  DrawScene() {
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
}

class Entity {
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

class Animation {
  constructor(name, entity, type, start, end, time, now) {
    this.name = name;
    this.entity = entity;
    this.type = type;
    this.start = start;
    this.end = end;
    this.time = time;
    this.startTime = now;
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

  }
}

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
}
