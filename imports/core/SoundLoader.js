function SoundLoader(context) {
  this.context = context;
}

SoundLoader.prototype.loadDrumsBuffer = function(callback) {
  var DrumsSounds = require('../sounds/DrumsSounds.js');
  var Binary64Binary = require('./base64-binary.js');
  var sources = [];
  sources.push(DrumsSounds.default.kick);
  sources.push(DrumsSounds.default.snare);
  sources.push(DrumsSounds.default.hihat_close);
  sources.push(DrumsSounds.default.hihat_open);
  sources.push(DrumsSounds.default.clap);
  var names = ["kick", "snare", "hihat_close", "hihat_open", "clap"];
  var loader = this;
  var buffers = {
    "kick": null,
    "snare": null,
    "hihat_close": null,
    "hihat_open": null,
    "clap": null
  };
  sources.map((source, index) => {
    var byteArray = Base64Binary.decodeArrayBuffer(source);
    loader.context.decodeAudioData(byteArray, function(buffer) {
      if(!buffer) {
        alert('Error loading drums sounds.');
        return;
      }
      buffers[names[index]] = buffer;
      var finish = true;
      for(var i = 0; i<5 && finish; i++) {
        finish = !(buffers[names[i]] === null);
      }
      if(finish) {
        callback(buffers);
      }
    });
  });
}

export default SoundLoader;
