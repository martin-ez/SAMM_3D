function SongGenerator() {
}

SongGenerator.prototype.CreateNewSong = function() {
  var newSong = {
    tempo: 0,
    key: "",
    minor: false,
    progression: [],
    progressionName: [],
    backgroundSound: "",
    band: "",
    drums: {
      user: "",
      pattern: [
        ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-']
      ],
      volume: [1, 1, 1, 1]
    },
    bass: {
      user: "",
      pattern: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
      mode: 16
    },
    keys: {
      user: "Disabled"
    },
    solo: {
      user: "",
      pattern: [
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-']
      ]
    }
  };
  var tempos = [75, 80, 85, 90, 95, 100];
  newSong.tempo = tempos[Math.floor(Math.random() * tempos.length)];
  var keys = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  newSong.key = keys[Math.floor(Math.random() * keys.length)];
  newSong.progression = this.CreateProgression();
  newSong.minor = newSong.progression[0] < 0;
  newSong.progressionName = this.ConvertProgression(newSong.progression, newSong.key, newSong.minor);
  newSong.backgroundSound = this.RandomBGSound();
  newSong.band = this.CreateBandName();
  return newSong;
}

SongGenerator.prototype.CreateProgression = function() {
  var progressions = [
    [1, 4, 5, 1],
    [1, -2, 5, 1],
    [1, -6, 4, 5],
    [1, -6, -2, 5],
    [1, 4, -6, 5],
    [1, 5, -6, 4],
    [-1, -4,-5,-1],
    [-1, 6, 7, 7],
    [-1, -4, 7, 7],
    [-1, -4, -5, -4],
    [-1, 6, 3, 7],
    [-1, 7, 6, 7]
  ];

  return progressions[Math.floor(Math.random() * progressions.length)];
}

SongGenerator.prototype.ConvertProgression = function(progression, key, minor) {
  import { Octavian, Note } from 'octavian';
  var rootStr = key+"4";
  return progression.map(function(c, bar){
    var note = new Note(rootStr);
    var chord = Math.abs(progression[bar]);
    switch(chord) {
      case 2:
      note = note.majorSecond();
      break;
      case 3:
      if(!minor) {
        note = note.majorThird();
      } else {
        note = note.minorThird();
      }
      break;
      case 4:
      note = note.perfectFourth();
      break;
      case 5:
      note = note.perfectFifth();
      break;
      case 6:
      if(!minor) {
        note = note.majorSixth();
      } else {
        note = note.minorSixth();
      }
      break;
      case 7:
      if(!minor) {
        note = note.majorSeventh();
      } else {
        note = note.minorSeventh();
      }
      break;
    }
    return note.letter+(note.modifier?"#":"")+(c<0?"m":"");
  });
}

SongGenerator.prototype.CreateBandName = function() {
  var colors =
  ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure",
  "Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood",
  "CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan",
  "DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue",
  "FireBrick","FloralWhite","ForestGreen","Fuchsia",
  "Gainsboro","GhostWhite",
  "Gold","GoldenRod","Gray","Grey","Green","GreenYellow",
  "HoneyDew","HotPink",
  "IndianRed","Indigo","Ivory",
  "Khaki",
  "Lavender","LavenderBlush","LawnGreen","LemonChiffon","Lime","LimeGreen","Linen",
  "Magenta",
  "Maroon","MidnightBlue","MintCream","MistyRose","Moccasin",
  "NavajoWhite","Navy",
  "OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid",
  "PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple",
  "Red","RosyBrown","RoyalBlue",
  "SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue",
  "Tan","Teal","Thistle","Tomato","Turquoise",
  "Violet",
  "Wheat","White","WhiteSmoke",
  "Yellow","YellowGreen"];
  var animals = require('animals');
  var a = animals();
  return "The " +colors[Math.floor(Math.random() * colors.length)] +" "+a.charAt(0).toUpperCase() + a.slice(1)+"s";
}

SongGenerator.prototype.RandomBGSound = function() {
  var sounds =
  ["pad_1_new_age","pad_2_warm","pad_3_polysynth","pad_4_choir","pad_5_bowed",
  "pad_6_metallic","pad_7_halo","synth_brass_1","synth_brass_2",
  "synth_choir","voice_oohs","reed_organ","brass_section","church_organ",
  "accordion","acoustic_guitar_nylon","acoustic_guitar_steel",
  "acoustic_grand_piano"];
  return sounds[Math.floor(Math.random() * sounds.length)];
}

export default SongGenerator;
