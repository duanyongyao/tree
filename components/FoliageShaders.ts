/**
 * Vertex Shader
 * Interpolates between scattered position and tree position based on uMix.
 * Adds sine-wave based wind movement.
 */
export const foliageVertexShader = `
  uniform float uTime;
  uniform float uMix;
  
  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aSize;
  attribute float aRandom;

  varying float vAlpha;
  varying vec3 vPos;

  // Cubic Ease In Out for smoother transitions in shader
  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = cubicInOut(uMix);
    
    // Interpolate position
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add "Breathing" / Wind effect
    // More intense when in scattered mode, subtle in tree mode
    float movementIntensity = mix(0.2, 0.05, t);
    pos.x += sin(uTime * 1.5 + pos.y * 2.0) * movementIntensity;
    pos.z += cos(uTime * 1.2 + pos.x * 2.0) * movementIntensity;
    pos.y += sin(uTime * 2.0 + aRandom * 10.0) * movementIntensity * 0.5;

    vPos = pos;
    
    // Size attenuation
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Fade particles slightly during transition for effect
    vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment Shader
 * Creates a soft circular glow with gold/emerald gradient.
 */
export const foliageFragmentShader = `
  uniform vec3 uColor1; // Deep Emerald
  uniform vec3 uColor2; // Gold Highlight

  varying float vAlpha;
  varying vec3 vPos;

  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft edge glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Color mixing based on height and randomness
    float mixFactor = (sin(vPos.y * 0.5) + 1.0) * 0.5;
    vec3 finalColor = mix(uColor1, uColor2, mixFactor * 0.3); // Mostly green, slight gold hints

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;