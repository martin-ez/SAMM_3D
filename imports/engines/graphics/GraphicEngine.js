let graphicInstance = null;
import Utils from './WebGL-Utils.js';
import {vec3} from 'gl-matrix';
import PrimitiveTorus from 'primitive-torus';
import PrimitiveCube from 'primitive-cube';
import ShaderFactory from './ShaderFactory.js';

//Import engine classes
import Entity from './Entity.js';
import PickingEntity from './PickingEntity.js';
import Camera from './Camera.js';
import Animation from './Animation.js';

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
      this.pickingEntities = [];
      this.pads = {};
      this.offPad = [0.75, 0.75, 0.75];
      this.drumsColor = [0.87, 0.13, 0.18];
      this.bassColor = [0.07, 0.53, 0.16];
      this.melodyColor = [0.47, 0.12, 0.78];
      this.blackColor = [0.1, 0.1, 0.1];
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
      this.instrument = '';
    }
    return graphicInstance;
  }

  SetContext(canvas) {
    this.gl = Utils.GetContext(canvas);
  }

  CreateScene(instrument) {
    this.instrument = instrument;
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
      room_piece.Initialize(this.gl, shaderProgram, Meshes.room_piece, this.blackColor);
      room_piece.Rotate(i*120 + 60, [0.0, 1.0, 0.0]);
      this.entities.push(room_piece);
    });

    //Create synth stands
    var synthStandDrums = new Entity('drums_synth', this.origin);
    synthStandDrums.Initialize(this.gl, shaderProgram, Meshes.stand, this.blackColor);
    synthStandDrums.Translate([13.476, 0.0, 0.0]);
    synthStandDrums.Rotate(90, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandDrums);

    var synthStandBass = new Entity('bass_synth', this.origin);
    synthStandBass.Initialize(this.gl, shaderProgram, Meshes.stand, this.blackColor);
    synthStandBass.Translate([-6.74, 0.0, -11.67]);
    synthStandBass.Rotate(210, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandBass);

    var synthStandMelody = new Entity('melody_synth', this.origin);
    synthStandMelody.Initialize(this.gl, shaderProgram, Meshes.stand, this.blackColor);
    synthStandMelody.Translate([-6.74, 0.0, 11.67]);
    synthStandMelody.Rotate(-30, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandMelody);

    //Setup camera and synth controls
    switch(instrument) {
      case 'drums':
        this.camera.Initialize([14.905, 3.0, 0.0], [0.0, 0.0, 0.0]);
        this.CreateDrumsControl(synthStandDrums, shaderProgram);
        break;
      case 'bass':
        this.camera.Initialize([-7.45, 3.0, -12.9], [0.0, 0.0, 0.0]);
        break;
      case 'melody':
        this.camera.Initialize([-7.45, 3.0, 12.9], [0.0, 0.0, 0.0]);
        break;
    }
  }

  CreateDrumsControl(stand, shaderProgram) {
    var cube = PrimitiveCube(0.08, 0.1, 0.18, 1, 1, 1);
    var beatCube = PrimitiveCube(0.131, 0.05, 1.2, 1, 1, 1);
    var mesh = {
      'vertices': cube.positions,
      'normals': cube.normals,
      'faces': cube.cells
    }
    var beatMesh = {
      'vertices': beatCube.positions,
      'normals': beatCube.normals,
      'faces': beatCube.cells
    }
    var sin45 = Math.sin(45 * Math.PI / 180.0);
    var cos45 = Math.cos(45 * Math.PI / 180.0);
    var wHalf = 2.23 / 2.0;
    var w = 2.23 / 17.0;
    var l = 1.23 / 5.0;
    for(var i = 0; i<4; i++) {
      for(var j = 0; j<16; j++) {
        var x = -wHalf + (w*(j+1));
        var y = 1.565 + (sin45*(l*(i+1)));
        var z = 0.435 - (cos45*(l*(i+1)));
        var pad = new Entity('drumPad_'+i+':'+j, stand);
        pad.Initialize(this.gl, shaderProgram, mesh, this.offPad);
        pad.Translate([x, y, z]);
        pad.Rotate(45, [1.0, 0.0, 0.0]);
        this.entities.push(pad);
        this.pads[i+':'+j] = pad;
        var pickingEntity = new PickingEntity(i+':'+j, pad, [0.08, 0.02, 0.18]);
        this.pickingEntities.push(pickingEntity);
      }
    }
    var pos = wHalf - (w*8);
    var beatSelector = new Entity('BeatIndicator', stand);
    beatSelector.Initialize(this.gl, shaderProgram, beatMesh, [0.81, 0.153, 0.204]);
    beatSelector.Translate([pos, 2.0, 0.0]);
    beatSelector.Rotate(45, [1.0, 0.0, 0.0]);
    beatSelector.Translate([w*5, 0.0, 0.0]);
    this.entities.push(beatSelector);
  }

  BeatUpdate(beat, bar, timeBetween) {
    var beatIndicator = this.FindEntityByName('BeatIndicator');
    var wHalf = 2.23 / 2.0;
    var w = 2.23 / 17.0;
    switch(this.instrument) {
      case 'drums':
        var x = -wHalf + (w*(beat+1));
        beatIndicator.ResetLocalMatrix();
        beatIndicator.Translate([x, 2.0, 0.0]);
        beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
        break;
      case 'bass':
        //TODO
        break;
      case 'melody':
        //TODO
        break;
    }
  }

  UpdateScene(song) {
    //Repaint room pieces
    var instruments = ['drums', 'bass', 'melody'];
    instruments.map((instr) => {
      if(song[instr].user !== '' && !this.activeUsers[instr]) {
        this.activeUsers[instr] = true;
        var piece = this.FindEntityByName(instr+'_room');
        var finalColor = this.drumsColor;
        switch (instr) {
          case 'bass':
          finalColor = this.bassColor;
          break;
          case 'melody':
          finalColor = this.melodyColor;
          break;
        }
        this.RemoveAnimationByName(instr+'_room_off');
        var ani = new Animation(instr+'_room_on', piece, 'color',
          this.blackColor, finalColor, 1500);
        this.animations.push(ani);
      }
      else if(song[instr].user === '' && this.activeUsers[instr]) {
        this.activeUsers[instr] = false;
        var piece = this.FindEntityByName(instr+'_room');
        var finalColor = this.drumsColor;
        switch (instr) {
          case 'bass':
          finalColor = this.bassColor;
          break;
          case 'melody':
          finalColor = this.melodyColor;
          break;
        }
        this.RemoveAnimationByName(instr+'_room_on');
        var ani = new Animation(instr+'_room_off', piece, 'color',
          finalColor, this.blackColor, 1000);
        this.animations.push(ani);
      }
    });

    //Update pads
    var pattern = song[this.instrument].pattern;
    switch(this.instrument) {
      case 'drums':
        for (var i = 0; i<4; i++) {
          for (var j = 0; j<16; j++) {
            var on = (pattern[i][j] === 'x');
            if (on) {
              this.pads[i+':'+j].meshColor = this.drumsColor;
            }
            else {
              this.pads[i+':'+j].meshColor = this.offPad;
            }
          }
        }
        break;
      case 'bass':
        //TODO
        break;
      case 'melody':
        //TODO
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

  HandleClick(song, callback) {
    var position = this.camera.position;
    var direction = this.camera.GetPickingRay();
    var collisions = [];
    for(var i = 0; i<this.pickingEntities.length; i++) {
      if (this.pickingEntities[i].TestForPicking(position, direction)) {
        collisions.push(this.pickingEntities[i]);
      }
    }
    var min = 100000.0;
    var index = -1;
    for(var i = 0; i<collisions.length; i++) {
      if (collisions[i].distance < min) {
        index = i;
      }
    }
    if (index !== -1) {
      var code = collisions[index].code;
      var pad = code.split(':');
      this.UpdatePattern(pad, song, callback);
    }
  }

  UpdatePattern(p, song, callback) {
    var i = p[0];
    var j = p[1];
    var instr = song[this.instrument];
    switch(this.instrument) {
      case 'drums':
        instr.pattern[i][j] = (instr.pattern[i][j]==='-'?"x":"-");
        if(i==2 && instr.pattern[i][j]==='x') {
          instr.pattern[3][j] = '-';
        } else if (i==3 && instr.pattern[i][j]==='x') {
          instr.pattern[2][j] = '-';
        }
        break;
      case 'bass':
        instr.pattern[j] = i;
        break;
      case 'melody':
        instr.pattern[this.melodyBar][i] = (solo.pattern[this.melodyBar][i]===j?'-':j);
        break;
    }
    callback(instr, this.instrument);
  }

  CalculateAnimations(time, deltaTime) {
    var toRemove = [];
    for(var i = 0; i<this.animations.length; i++) {
      if(this.animations[i].needStart) {
        this.animations[i].SetStart(time);
      }
      else if(this.animations[i].CalculateFrame(time)) {
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
    this.gl.clearColor(0.898, 0.898, 0.898, 1.0);
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
