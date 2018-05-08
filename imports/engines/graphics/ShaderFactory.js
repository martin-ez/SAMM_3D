import Utils from './WebGL-Utils.js';

export default class ShaderFactory {

  static GetSimpleShader(gl) {
    var vertex = `
    precision mediump float;

    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_projectionMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_worldMatrix;

    varying vec3 f_norm;

    void main() {
      vec3 pos = (u_worldMatrix * vec4(a_position, 1.0)).xyz;
      f_norm = (u_worldMatrix * vec4(a_normal, 0.0)).xyz;
      gl_Position = u_projectionMatrix * u_viewMatrix * vec4(pos, 1.0);
    }
    `;
    var fragment = `
    precision mediump float;

    varying vec3 f_norm;

    uniform vec3 u_lightDirection;
    uniform vec3 u_diffuseColor;
    uniform float u_ambientFactor;

    void main() {
      vec3 en = normalize(f_norm);
      vec3 ln = normalize(u_lightDirection);
      float df = max(0.0, dot(en, ln));

      vec3 ambient = vec3(u_ambientFactor, u_ambientFactor, u_ambientFactor);
      vec3 color = ambient + df * u_diffuseColor;
      gl_FragColor = vec4(color, 1.0);
    }
    `;
    var shaderProgram = Utils.CreateProgram(gl, vertex, fragment);
    const programInfo = {
      program: shaderProgram,
      attributes: {
        a_position: {
          'location': gl.getAttribLocation(shaderProgram, 'a_position'),
          'numComponents': 3,
          'type': gl.FLOAT,
        },
        a_normal: {
          'location': gl.getAttribLocation(shaderProgram, 'a_normal'),
          'numComponents': 3,
          'type': gl.FLOAT,
        },
      },
      uniforms: {
        u_projectionMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
          'type': 'matrix4',
        },
        u_viewMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_viewMatrix'),
          'type': 'matrix4',
        },
        u_worldMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_worldMatrix'),
          'type': 'matrix4',
        },
        u_lightDirection: {
          'location': gl.getUniformLocation(shaderProgram, 'u_lightDirection'),
          'type': 'vec3',
        },
        u_diffuseColor: {
          'location': gl.getUniformLocation(shaderProgram, 'u_diffuseColor'),
          'type': 'vec3',
        },
        u_ambientFactor: {
          'location': gl.getUniformLocation(shaderProgram, 'u_ambientFactor'),
          'type': 'float',
        },
      },
    };
    return programInfo;
  }

  static GetTestShader(gl) {
    var vertex = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_worldMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    varying lowp vec4 f_color;

    void main() {
      gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
      f_color = a_color;
    }
    `;
    var fragment = `
    varying lowp vec4 f_color;

    void main() {
      gl_FragColor = f_color;
    }
    `;
    var shaderProgram = Utils.CreateProgram(gl, vertex, fragment);
    const programInfo = {
      program: shaderProgram,
      attributes: {
        a_position: {
          'location': gl.getAttribLocation(shaderProgram, 'a_position'),
          'numComponents': 3,
          'type': gl.FLOAT,
        },
        a_color: {
          'location': gl.getAttribLocation(shaderProgram, 'a_color'),
          'numComponents': 4,
          'type': gl.FLOAT,
        },
      },
      uniforms: {
        u_projectionMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
          'type': 'matrix4',
        },
        u_viewMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_viewMatrix'),
          'type': 'matrix4',
        },
        u_worldMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_worldMatrix'),
          'type': 'matrix4',
        },
      },
    };
    return programInfo;
  }
}
