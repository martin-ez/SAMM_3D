export default SimpleShader = {
  'vertex': '
  precision mediump float;

  attribute vec3 a_position;
  attribute vec3 a_normal;

  uniform mat4 projectionMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 worldMatrix;

  varying vec3 f_pos;
  varying vec3 f_norm;

  void main() {
    f_pos = (mWorld * vec4(a_position, 1.0)).xyz;
    f_norm = (mWorld * vec4(a_normal, 0.0)).xyz;

    gl_Position = mProj * mView * vec4(f_pos, 1.0);
  }
  ',
 'fragment': '
  precision mediump float;

  varying vec3 f_norm;

  uniform vec3 lightDirection;
  uniform vec3 diffuseColor;
  uniform vec3 ambientFactor;

  void main() {
    vec3 en = normalize(f_norm);
    vec3 ln = normalize(lightDirection);

    float df = max(0.0, dot(en, ln));

    vec3 color = ambientFactor + df * diffuseColor;
    gl_FragColor = vec4(color, 1.0);
  }
  '
};
