export default class Utils {

  static GetContext(canvas) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Unable to initialize WebGL.");
      return;
    }
    return gl;
  }

  static CreateProgram(gl, vSource, fSource) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the vertex shader: ' +
        gl.getShaderInfoLog(shader));
      gl.deleteShader(vertexShader);
      return null;
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the fragment shader: ' +
        gl.getShaderInfoLog(shader));
      gl.deleteShader(fragmentShader);
      return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  static CreateAttributesBuffers(gl, attributes) {
    var buffers = {};
    for (var att in attributes) {
      if (attributes.hasOwnProperty(att)) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes[att]),
          gl.STATIC_DRAW);
        buffers[att] = buffer;
      }
    }
    return buffers;
  }

  static CreateIndexBuffer(gl, indices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Float16Array(indices),
      gl.STATIC_DRAW);
    return buffer;
  }

  static BindBuffers(gl, programAttributes, buffers) {
    for (var att in buffers) {
      if (buffers.hasOwnProperty(att)) {
        const numComponents = programAttributes['numComponents'];
        const type = programAttributes['type'];
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[att]);
        gl.vertexAttribPointer(programAttributes[att]['location'],
          numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programAttributes[att]['location']);
      }
    }
  }

  static SetUniforms(gl, programUniforms, uniforms, otherU) {
    for (var uni in uniforms) {
      if (uniforms.hasOwnProperty(uni)) {
        switch (programUniforms[uni]['type']) {
          case 'float':
            gl.uniform1f(programUniforms[uni]['location'], uniforms[uni]);
            break;
          case 'vec2':
            gl.uniform2fv(programUniforms[uni]['location'], uniforms[uni]);
            break;
          case 'vec3':
            gl.uniform3fv(programUniforms[uni]['location'], uniforms[uni]);
            break;
          case 'vec4':
            gl.uniform4fv(programUniforms[uni]['location'], uniforms[uni]);
            break;
          case 'matrix4':
            gl.uniformMatrix4fv(programUniforms[uni]['location'], uniforms[uni]);
            break;
        }
      }
    }

    for (var uni in otherU) {
      if (otherU.hasOwnProperty(uni)) {
        switch (programUniforms[uni]['type']) {
          case 'float':
            gl.uniform1f(programUniforms[uni]['location'], otherU[uni]);
            break;
          case 'vec2':
            gl.uniform2fv(programUniforms[uni]['location'], otherU[uni]);
            break;
          case 'vec3':
            gl.uniform3fv(programUniforms[uni]['location'], otherU[uni]);
            break;
          case 'vec4':
            gl.uniform4fv(programUniforms[uni]['location'], otherU[uni]);
            break;
          case 'matrix4':
            gl.uniformMatrix4fv(programUniforms[uni]['location'], otherU[uni]);
            break;
        }
      }
    }
  }
}
