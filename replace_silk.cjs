const fs = require('fs');

const path = 'index.html';
const content = fs.readFileSync(path, 'utf8');

const startIndex = content.lastIndexOf('// --- DARK VEIL VANILLA JS PORT ---');
const endIndex = content.lastIndexOf('</script>');

if (startIndex !== -1 && endIndex !== -1) {
  const newScript = `// --- SILK BACKGROUND VANILLA JS PORT ---
const vertex = \`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
\`;

const fragment = \`
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
\`;

const container = document.getElementById('darkveil-container');
if (container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'darkveil-canvas';
  container.appendChild(canvas);

  // Silk Props (adapted for the theme)
  const speed = 2.0;
  const scale = 1.0;
  // A subtle dark blue that fits the project's aesthetic (from #020b1f theme)
  const color = [10/255, 25/255, 47/255]; 
  const noiseIntensity = 1.5;
  const rotation = 0;

  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio, 2),
    canvas
  });

  const gl = renderer.gl;
  const geometry = new Triangle(gl);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: color },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uRotation: { value: rotation },
      uNoiseIntensity: { value: noiseIntensity }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
  };

  window.addEventListener('resize', resize);
  resize();

  let lastTime = performance.now();

  const loop = () => {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    
    program.uniforms.uTime.value += 0.1 * delta;
    
    renderer.render({ scene: mesh });
    requestAnimationFrame(loop);
  };

  loop();
}
`;

  const newContent = content.substring(0, startIndex) + newScript + content.substring(endIndex);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Successfully replaced the background animation script.');
} else {
  console.log('Could not find the markers to replace the script.');
}
