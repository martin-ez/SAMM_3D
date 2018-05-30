import Utils from './WebGL-Utils.js';

export default class ShaderFactory {

  static GetSimpleShader(gl) {
    var vertex = `
    attribute vec4 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_projectionMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_worldMatrix;
    uniform mat4 u_normalMatrix;

    uniform vec3 u_lightDirection;
    uniform vec3 u_diffuseColor;
    uniform float u_ambientFactor;

    varying highp vec3 f_lighting;

    void main() {
      gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;

      highp vec3 ambientLight = vec3(u_ambientFactor, u_ambientFactor, u_ambientFactor);
      highp vec3 lightDirection = normalize(u_lightDirection);

      highp vec4 transformedNormal = u_normalMatrix * vec4(a_normal, 1.0);
      highp float light = max(dot(transformedNormal.xyz, -1.0 * lightDirection), 0.0);
      f_lighting = (u_ambientFactor * u_diffuseColor) + (light * u_diffuseColor);
    }
    `;
    var fragment = `
    varying highp vec3 f_lighting;

    void main() {
      gl_FragColor = vec4(f_lighting, 1.0);
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
        u_normalMatrix: {
          'location': gl.getUniformLocation(shaderProgram, 'u_normalMatrix'),
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
