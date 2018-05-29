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
      this.melodyBarPads = {};
      this.bassBars = {};
      this.drumsAnimators = {};
      this.bassAnimators = null;
      this.melodyAnimators = {};
      this.melodyBar = 0;
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
    var frontStandDrums = new Entity('drums_front', synthStandDrums);
    frontStandDrums.Initialize(this.gl, shaderProgram, Meshes.stand_front, this.blackColor);
    this.entities.push(frontStandDrums);

    var synthStandBass = new Entity('bass_synth', this.origin);
    synthStandBass.Initialize(this.gl, shaderProgram, Meshes.stand, this.blackColor);
    synthStandBass.Translate([-6.74, 0.0, -11.67]);
    synthStandBass.Rotate(210, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandBass);
    var frontStandBass = new Entity('bass_front', synthStandBass);
    frontStandBass.Initialize(this.gl, shaderProgram, Meshes.stand_front, this.blackColor);
    this.entities.push(frontStandBass);

    var synthStandMelody = new Entity('melody_synth', this.origin);
    synthStandMelody.Initialize(this.gl, shaderProgram, Meshes.melody_stand, this.blackColor);
    synthStandMelody.Translate([-6.74, 0.0, 11.67]);
    synthStandMelody.Rotate(-30, [0.0, 1.0, 0.0]);
    this.entities.push(synthStandMelody);
    var frontStandMelody = new Entity('melody_front', synthStandMelody);
    frontStandMelody.Initialize(this.gl, shaderProgram, Meshes.stand_front, this.blackColor);
    this.entities.push(frontStandMelody);

    //Setup camera and synth controls
    switch(instrument) {
      case 'drums':
        this.camera.Initialize([14.905, 3.0, 0.0], [0.0, 0.0, 0.0]);
        this.CreateDrumsControl(synthStandDrums, shaderProgram);
        break;
      case 'bass':
        this.camera.Initialize([-7.45, 3.0, -12.9], [0.0, 0.0, 0.0]);
        this.CreateBassControl(synthStandBass, shaderProgram);
        break;
      case 'melody':
        this.camera.Initialize([-7.45, 3.0, 12.9], [0.0, 0.0, 0.0]);
        this.CreateMelodyControl(synthStandMelody, shaderProgram);
        break;
    }

    //Setup animation entities
    //Drums
    var drumsBeats = PrimitiveCube(4, 10, 1, 1, 1, 1);
    var drumBeatsMesh = {
      'vertices': drumsBeats.positions,
      'normals': drumsBeats.normals,
      'faces': drumsBeats.cells
    }
    var drumsRoom = this.FindEntityByName('drums_room');
    var dOrigin = new Entity('drumsAnimators_origin', drumsRoom);
    dOrigin.Rotate(30, [0.0, 1.0, 0.0]);
    dOrigin.Translate([0.0, 0.0, 16.3]);
    for (var i = 0; i<4; i++) {
      var sound = new Entity('drumsAnimators_'+i, dOrigin);
      sound.Initialize(this.gl, shaderProgram, drumBeatsMesh, this.blackColor);
      sound.Translate([6.0 -(i*4.0), -4.0, 0.0]);
      this.entities.push(sound);
      this.drumsAnimators[i] = sound;
    }
  }

  CreateDrumsControl(stand, shaderProgram) {
    var cube = PrimitiveCube(0.08, 0.1, 0.18, 1, 1, 1);
    var beatCube = PrimitiveCube(0.131, 0.05, 1.2, 1, 1, 1);
    var guideCube = PrimitiveCube(0.524, 0.02, 1.2, 1, 1, 1);
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
    var guideMesh = {
      'vertices': guideCube.positions,
      'normals': guideCube.normals,
      'faces': guideCube.cells
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

    //Beat indicator and guides
    var pos = wHalf - (w*8);
    var beatIndicator = new Entity('BeatIndicator', stand);
    var beatColor = vec3.create();
    vec3.subtract(beatColor, this.drumsColor, [0.13, 0.13, 0.13]);
    beatIndicator.Initialize(this.gl, shaderProgram, beatMesh, beatColor);
    beatIndicator.Translate([pos, 2.0, 0.0]);
    beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
    beatIndicator.Translate([w*5, 0.0, 0.0]);
    this.entities.push(beatIndicator);

    var guide1 = new Entity('Guide1', stand);
    guide1.Initialize(this.gl, shaderProgram, guideMesh, [0.2, 0.2, 0.2]);
    guide1.Translate([w*6.0, 2.0, 0.0]);
    guide1.Rotate(45, [1.0, 0.0, 0.0]);
    this.entities.push(guide1);

    var guide2 = new Entity('Guide2', stand);
    guide2.Initialize(this.gl, shaderProgram, guideMesh, [0.2, 0.2, 0.2]);
    guide2.Translate([w*-2.0, 2.0, 0.0]);
    guide2.Rotate(45, [1.0, 0.0, 0.0]);
    this.entities.push(guide2);
  }

  CreateBassControl(stand, shaderProgram) {
    var cube = PrimitiveCube(0.08, 0.1, 0.04, 1, 1, 1);
    var beatCube = PrimitiveCube(0.131, 0.05, 1.2, 1, 1, 1);
    var guideCube = PrimitiveCube(0.524, 0.02, 1.2, 1, 1, 1);
    var bar = PrimitiveCube(1, 1, 1, 1, 1, 1);
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
    var guideMesh = {
      'vertices': guideCube.positions,
      'normals': guideCube.normals,
      'faces': guideCube.cells
    }
    var barMesh = {
      'vertices': bar.positions,
      'normals': bar.normals,
      'faces': bar.cells
    }
    var sin45 = Math.sin(45 * Math.PI / 180.0);
    var cos45 = Math.cos(45 * Math.PI / 180.0);
    var wHalf = 2.23 / 2.0;
    var w = 2.23 / 17.0;
    var l = 1.23 / 10.0;
    for(var i = 0; i<9; i++) {
      for(var j = 0; j<16; j++) {
        var x = -wHalf + (w*(j+1));
        var y = 1.565 + (sin45*(l*(i+1)));
        var z = 0.435 - (cos45*(l*(i+1)));
        var pad = new Entity('bassPad_'+i+':'+j, stand);
        pad.Initialize(this.gl, shaderProgram, mesh, this.offPad);
        pad.Translate([x, y, z]);
        pad.Rotate(45, [1.0, 0.0, 0.0]);
        this.entities.push(pad);
        this.pads[i+':'+j] = pad;
        var value = i*0.125;
        var pickingEntity = new PickingEntity(value+':'+j, pad, [0.08, 0.02, 0.04]);
        this.pickingEntities.push(pickingEntity);
      }
    }

    //Pitch indicator
    for(var k = 0; k<16; k++) {
      var bassBar = new Entity('bassBar_'+k, stand);
      var x = -wHalf + (w*(k+1));
      var y = 2;
      var z = 0;
      bassBar.Initialize(this.gl, shaderProgram, barMesh, this.bassColor);
      bassBar.Translate([x, y, z]);
      bassBar.Rotate(45, [1.0, 0.0, 0.0]);
      this.entities.push(bassBar);
      this.bassBars[k+':'] = bassBar;
    }

    //Beat indicator and guides
    var pos = wHalf - (w*8);
    var beatIndicator = new Entity('BeatIndicator', stand);
    var beatColor = vec3.create();
    vec3.subtract(beatColor, this.bassColor, [0.13, 0.13, 0.13]);
    beatIndicator.Initialize(this.gl, shaderProgram, beatMesh, beatColor);
    beatIndicator.Translate([pos, 2.0, 0.0]);
    beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
    beatIndicator.Translate([w*5, 0.0, 0.0]);
    this.entities.push(beatIndicator);

    var guide1 = new Entity('Guide1', stand);
    guide1.Initialize(this.gl, shaderProgram, guideMesh, [0.2, 0.2, 0.2]);
    guide1.Translate([w*6.0, 2.0, 0.0]);
    guide1.Rotate(45, [1.0, 0.0, 0.0]);
    this.entities.push(guide1);

    var guide2 = new Entity('Guide2', stand);
    guide2.Initialize(this.gl, shaderProgram, guideMesh, [0.2, 0.2, 0.2]);
    guide2.Translate([w*-2.0, 2.0, 0.0]);
    guide2.Rotate(45, [1.0, 0.0, 0.0]);
    this.entities.push(guide2);
  }

  CreateMelodyControl(stand, shaderProgram) {
    var wHalf = 1.275 / 2.0;
    var wHalfs = 1.4 / 2.0;
    var w = 1.275 / 11.0;
    var ls = 1.4 / 5.0;
    for (var i = 0; i<10; i++) {
      for (var j = 0; j<8; j++) {
        var x = -wHalf + (w*(j+1));
        var z = -wHalf + (w*(i+1));
        var pad = new Entity('melodyPad_'+i+':'+j, stand);
        pad.Initialize(this.gl, shaderProgram, Meshes.round_pad, this.offPad);
        pad.Translate([0, 2, 0]);
        pad.Rotate(45, [1.0, 0.0, 0.0]);
        pad.Translate([x, 0, z]);
        this.entities.push(pad);
        this.pads[i+':'+j] = pad;
        var pickingEntity = new PickingEntity(i+':'+j, pad, [0.05, 0.02, 0.05]);
        this.pickingEntities.push(pickingEntity);
      }
    }
    for (var i = 0; i<4; i++) {
      var x = -wHalf + (w*9) + w/2.0;
      var z = -wHalfs + (ls*(i+1));
      var barPad = new Entity('melodyBarPad_'+i, stand);
      barPad.Initialize(this.gl, shaderProgram, Meshes.square_pad, this.offPad);
      barPad.Translate([0, 2, 0]);
      barPad.Rotate(45, [1.0, 0.0, 0.0]);
      barPad.Translate([x, 0, z]);
      this.entities.push(barPad);
      this.melodyBarPads['bar'+i] = barPad;
      var pickingEntity = new PickingEntity('bar:'+i, barPad, [0.1, 0.02, 0.125]);
      this.pickingEntities.push(pickingEntity);
      if(i===0) {
        barPad.meshColor = this.melodyColor;
      }
    }

    //Beat indicator
    var beatCube = PrimitiveCube(w, 0.015, 1.3, 1, 1, 1);
    var beatMesh = {
      'vertices': beatCube.positions,
      'normals': beatCube.normals,
      'faces': beatCube.cells
    }
    var beatIndicator = new Entity('BeatIndicator', stand);
    var beatColor = vec3.create();
    vec3.subtract(beatColor, this.melodyColor, [0.13, 0.13, 0.13]);
    beatIndicator.Initialize(this.gl, shaderProgram, beatMesh, beatColor);
    beatIndicator.Translate([0.0, 2.0, 0.0]);
    beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
    this.entities.push(beatIndicator);
  }

  BeatUpdate(beat, bar, timeBetween, song) {
    var beatIndicator = this.FindEntityByName('BeatIndicator');
    if(this.instrument === 'drums' || this.instrument === 'bass') {
      var wHalf = 2.23 / 2.0;
      var w = 2.23 / 17.0;
      var x = -wHalf + (w*(beat+1));
      beatIndicator.ResetLocalMatrix();
      beatIndicator.Translate([x, 2.0, 0.0]);
      beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
    }
    else {
      var beatHalfs = Math.floor(beat / 2);
      var wHalf = 1.275 / 2.0;
      var w = 1.275 / 11.0;
      var x = -wHalf + (w*(beatHalfs+1));
      beatIndicator.ResetLocalMatrix();
      beatIndicator.Translate([0.0, 2.0, 0.0]);
      beatIndicator.Rotate(45, [1.0, 0.0, 0.0]);
      beatIndicator.Translate([x, 0.0, 0.0]);
      if (this.melodyBar === bar) {
        var beatColor = vec3.create();
        vec3.subtract(beatColor, this.melodyColor, [0.13, 0.13, 0.13]);
        beatIndicator.meshColor = beatColor;
      }
      else {
        beatIndicator.meshColor = this.blackColor;
      }
    }

    //Drums animators
    for (var i = 0; i<4; i++) {
      var animator = this.drumsAnimators[i];
      var next = beat + 1;
      if (next === 16) next = 0;
      var x = 6.0 -(i*4.0);
      var tBeat = timeBetween / 4.0;
      if (song.drums.pattern[i][beat] === 'x') {
        var ani = new Animation('drumsBeatAnimation_'+i, animator, 'position',
          [x, 4.0, 0.0], [x, -4.0, 0.0], tBeat * 3, 0);
        this.animations.push(ani);
      }
      if (song.drums.pattern[i][next] === 'x') {
        var preAni = new Animation('drumsBeatPreAnimation_'+i, animator, 'position',
          [x, -4.0, 0.0], [x, 4.0, 0.0], tBeat * 1, tBeat * 3);
        this.animations.push(preAni);
      }
    }
  }

  UpdateScene(song) {
    //Repaint room pieces
    var instruments = ['drums', 'bass', 'melody'];
    instruments.map((instr) => {
      if(song[instr].user !== '' && !this.activeUsers[instr]) {
        this.activeUsers[instr] = true;
        var piece = this.FindEntityByName(instr+'_room');
        var front = this.FindEntityByName(instr+'_front');
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
        this.RemoveAnimationByName(instr+'_front_off');
        var ani = new Animation(instr+'_room_on', piece, 'color',
          this.blackColor, finalColor, 1500, 0);
        var aniFront = new Animation(instr+'_front_on', front, 'color',
          this.blackColor, finalColor, 1500, 0);
        this.animations.push(ani);
        this.animations.push(aniFront);
      }
      else if(song[instr].user === '' && this.activeUsers[instr]) {
        this.activeUsers[instr] = false;
        var piece = this.FindEntityByName(instr+'_room');
        var front = this.FindEntityByName(instr+'_front');
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
        this.RemoveAnimationByName(instr+'_front_on');
        var ani = new Animation(instr+'_room_off', piece, 'color',
          finalColor, this.blackColor, 1000, 0);
        var aniFront = new Animation(instr+'_front_off', front, 'color',
          finalColor, this.blackColor, 1000, 0);
        this.animations.push(ani);
        this.animations.push(aniFront);
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
        var sin45 = Math.sin(45 * Math.PI / 180.0);
        var cos45 = Math.cos(45 * Math.PI / 180.0);
        var wHalf = 2.23 / 2.0;
        var w = 2.23 / 17.0;
        var l = 1.23 / 10.0;
        for (var i = 0; i<9; i++) {
          for (var j = 0; j<16; j++) {
            var value = pattern[j];
            if (value === '-' || value !== i*0.125) {
              this.pads[i+':'+j].meshColor = this.offPad;
            }
            else {
              var s = (Math.abs(4 - i) + 1)*l - (l-0.04);
              var c = ((6+i)*l)/2.0;
              var x = -wHalf + (w*(j+1));
              var y = 1.565 + (sin45*c);
              var z = 0.435 - (cos45*c);
              this.bassBars[j+':'].ResetLocalMatrix();
              this.bassBars[j+':'].Translate([x, y, z]);
              this.bassBars[j+':'].Rotate(45, [1.0, 0.0, 0.0]);
              this.bassBars[j+':'].Scale([0.09, 0.07, s]);
              this.pads[i+':'+j].meshColor = this.bassColor;
            }
          }
        }
        break;
      case 'melody':
        for (var i = 0; i<10; i++) {
          for (var j = 0; j<8; j++) {
            var value = pattern[this.melodyBar][j];
            if (value === '-' || value !== i) {
              this.pads[i+':'+j].meshColor = this.offPad;
            }
            else {
              this.pads[i+':'+j].meshColor = this.melodyColor;
            }
          }
        }
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
        var value = parseFloat(i);
        if (value === instr.pattern[j]) {
          instr.pattern[j] = '-';
        }
        else {
          instr.pattern[j] = value;
        }
        break;
      case 'melody':
        if(i === 'bar') {
          this.melodyBar = parseInt(j);
          for (var k = 0; k<4; k++) {
            this.melodyBarPads['bar'+k].meshColor = this.offPad;
          }
          this.melodyBarPads['bar'+this.melodyBar].meshColor = this.melodyColor;
        }
        else {
          var value = parseInt(i);
          instr.pattern[this.melodyBar][parseInt(j)] = (instr.pattern[this.melodyBar][parseInt(j)]===value?'-':value);
        }
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
