import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_flowSpeed;
uniform float u_colorIntensity;
uniform vec2 u_mouse;

#define PI 3.14159265359

vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 permute(vec3 x) { return mod289v3(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, float t) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency + t * 0.3);
    frequency *= 2.1;
    amplitude *= 0.5;
    p += vec2(1.7, 9.2);
  }
  return value;
}

float warpedFbm(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0), t), fbm(p + vec2(5.2, 1.3), t));
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2), t * 1.2),
    fbm(p + 4.0 * q + vec2(8.3, 2.8), t * 1.2)
  );
  return fbm(p + 3.5 * r, t * 0.8);
}

vec3 smoothColor(vec2 uv, float t) {
  vec3 c1 = vec3(0.04, 0.04, 0.06);
  vec3 c2 = vec3(0.88, 0.11, 0.28);
  vec3 c3 = vec3(0.83, 0.44, 0.45);
  vec3 palette[4];
  palette[0] = c1;
  palette[1] = c2;
  palette[2] = c3;
  palette[3] = c2;

  float n1 = warpedFbm(uv * 1.5, t);
  float n2 = fbm(uv * 2.5 + vec2(100.0), t * 0.7);
  float blend = n1 * 0.5 + 0.5;
  float idx = blend * 3.0;
  float i0 = floor(idx);
  float f = fract(idx);
  f = f * f * (3.0 - 2.0 * f);

  vec2 i = mod(i0 + vec2(0.0, 1.0), 3.0);

  vec3 color0 = mix(palette[int(i.x)], palette[int(mod(i.x + 1.0, 3.0))], fract(i.x));
  vec3 color1 = mix(palette[int(i.y)], palette[int(mod(i.y + 1.0, 3.0))], fract(i.y));

  return mix(color0, color1, f) + n2 * 0.08;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
  float t = u_time * u_flowSpeed;
  uv += u_mouse * 0.15;
  vec3 col = smoothColor(uv, t);
  float bright = 0.8 + 0.2 * sin(t * 0.5);
  col *= bright;
  float vig = 1.0 - 0.3 * length(uv);
  col *= vig;
  gl_FragColor = vec4(col * u_colorIntensity, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ObsidianFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, "a_pos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uFlowSpeed = gl.getUniformLocation(program, "u_flowSpeed");
    const uColorIntensity = gl.getUniformLocation(program, "u_colorIntensity");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    gl.uniform1f(uFlowSpeed, 0.3);
    gl.uniform1f(uColorIntensity, 1.2);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let animationId = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uRes, canvas.width, canvas.height);
    }

    function handleMouseMove(e: MouseEvent) {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    }

    function render() {
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      gl!.uniform1f(uTime, performance.now() * 0.001);
      gl!.uniform2f(uMouse, mouseX, mouseY);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      animationId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
