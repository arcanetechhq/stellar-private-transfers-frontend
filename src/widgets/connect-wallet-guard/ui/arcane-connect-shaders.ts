export const ARCANE_CONNECT_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const ARCANE_CONNECT_FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  const float PI = 3.14159265359;

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float archStroke(vec2 q, float radius, float leg, float stroke, float softness) {
    float topMask = smoothstep(-0.04, 0.025, q.y);
    float top = mix(10.0, abs(length(q) - radius), topMask);
    float left = sdSegment(q, vec2(-radius, -leg), vec2(-radius, 0.02));
    float right = sdSegment(q, vec2(radius, -leg), vec2(radius, 0.02));
    float d = min(top, min(left, right));
    return 1.0 - smoothstep(stroke, stroke + softness, d);
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (uv - 0.5) * aspect;
    float t = uTime;

    vec3 porcelain = vec3(0.925, 0.974, 1.0);
    vec3 frost = vec3(0.805, 0.915, 1.0);
    vec3 sky = vec3(0.43, 0.705, 0.98);
    vec3 blue = vec3(0.075, 0.31, 0.74);
    vec3 ice = vec3(0.68, 0.875, 1.0);

    float horizontal = smoothstep(-0.2, 1.05, uv.x);
    float vertical = smoothstep(0.02, 1.0, uv.y);
    vec3 color = mix(porcelain, frost, horizontal * 0.74);
    color = mix(color, vec3(0.845, 0.94, 1.0), vertical * 0.16);

    float rightField = smoothstep(0.2, 0.92, uv.x);
    float washA = 1.0 - smoothstep(
      0.0,
      1.1,
      length((p - vec2(0.55 + sin(t * 0.055) * 0.05, 0.08 + cos(t * 0.04) * 0.04)) * vec2(0.72, 1.0))
    );
    float washB = 1.0 - smoothstep(
      0.0,
      1.0,
      length((p - vec2(0.25 + cos(t * 0.045) * 0.04, -0.32 + sin(t * 0.05) * 0.035)) * vec2(0.9, 0.72))
    );
    float quietCurrent = 0.5 + 0.5 * sin(p.x * 1.3 + p.y * 0.8 + t * 0.12);

    color = mix(color, sky, washA * rightField * 0.18);
    color = mix(color, ice, washB * rightField * 0.08);
    color = mix(color, blue, quietCurrent * rightField * 0.025);

    vec2 archDrift = vec2(sin(t * 0.18) * 0.018, cos(t * 0.13) * 0.014);
    vec2 archCenter = vec2(0.4, -0.06) + archDrift;
    vec2 archPoint = p - archCenter;
    float archFade = smoothstep(0.24, 0.64, uv.x) * smoothstep(0.05, 0.24, uv.y) * (1.0 - smoothstep(0.72, 1.0, uv.y));
    float breathe = 1.0 + sin(t * 0.42) * 0.018;
    float glowPulse = 0.76 + sin(t * 0.5) * 0.24;

    float archHalo = archStroke(archPoint / (1.2 * breathe), 0.38, 0.52, 0.03, 0.13);
    float archLarge = archStroke(archPoint / (1.16 * breathe), 0.38, 0.5, 0.006, 0.034);
    float archMiddle = archStroke((archPoint - vec2(0.012, 0.01)) / (0.82 * breathe), 0.38, 0.48, 0.007, 0.04);
    float archSmall = archStroke((archPoint - vec2(0.025, 0.022)) / (0.56 * breathe), 0.38, 0.43, 0.008, 0.045);

    color += vec3(0.62, 0.86, 1.0) * archHalo * archFade * 0.105 * glowPulse;
    color += vec3(0.68, 0.89, 1.0) * archLarge * archFade * 0.14;
    color = mix(color, vec3(0.22, 0.56, 0.92), archMiddle * archFade * 0.08);
    color += vec3(0.82, 0.94, 1.0) * archSmall * archFade * 0.065;

    vec2 archFlowPoint = (archPoint - vec2(0.012, 0.01)) / 0.82;
    float archAngle = atan(archFlowPoint.y, archFlowPoint.x);
    float archCoord = clamp(archAngle / PI, 0.0, 1.0);
    float archTopMask = smoothstep(-0.03, 0.08, archFlowPoint.y);
    float archShimmer = pow(0.5 + 0.5 * sin(archCoord * 5.0 - t * 0.72), 3.0);
    float archEnergy = archMiddle * archFade * archTopMask * (0.36 + archShimmer * 0.64);
    color += vec3(0.42, 0.8, 1.0) * archEnergy * 0.12;

    float airyGlow = 1.0 - smoothstep(0.08, 1.0, length((p - vec2(0.48, 0.12)) * vec2(0.82, 1.08)));
    color += vec3(0.06, 0.16, 0.26) * airyGlow * 0.014;

    float edge = 1.0 - smoothstep(0.32, 1.35, length(p * vec2(0.74, 1.04)));
    color = mix(color * 0.94, color, edge);
    color.r = min(color.r, color.g * 0.985);
    color.r = min(color.r, color.b * 0.94);
    color.g = min(color.g, color.b * 0.995);

    gl_FragColor = vec4(color, 1.0);
  }
`;
