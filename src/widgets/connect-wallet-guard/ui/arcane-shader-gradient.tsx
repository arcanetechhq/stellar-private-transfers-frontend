import { useEffect, useRef } from "react";
import {
  ARCANE_CONNECT_FRAGMENT_SHADER,
  ARCANE_CONNECT_VERTEX_SHADER,
} from "./arcane-connect-shaders";

export function ArcaneShaderGradient() {
  const canvasReference = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasReference.current;
    if (!canvas) {
      return undefined;
    }

    let animationFrame = 0;
    let isDisposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let disposeRenderer: (() => void) | undefined;

    async function createShader() {
      const THREE = await import("three");
      if (isDisposed) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });

      renderer.setClearColor(0xf4fbff, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: ARCANE_CONNECT_FRAGMENT_SHADER,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
        },
        vertexShader: ARCANE_CONNECT_VERTEX_SHADER,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      const startTime = performance.now();

      function resize() {
        const { clientWidth, clientHeight } = canvas;
        const width = Math.max(1, clientWidth);
        const height = Math.max(1, clientHeight);
        renderer.setSize(width, height, false);
        material.uniforms.uResolution.value.set(width, height);
      }

      function renderFrame(now = startTime) {
        if (isDisposed) {
          return;
        }

        material.uniforms.uTime.value = (now - startTime) / 1000;
        renderer.render(scene, camera);

        if (!prefersReducedMotion) {
          animationFrame = window.requestAnimationFrame(renderFrame);
        }
      }

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();
      renderFrame();

      disposeRenderer = () => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }

    void createShader();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      disposeRenderer?.();
    };
  }, []);

  return (
    <canvas
      className="arcane-connect-webgl"
      ref={canvasReference}
      aria-hidden="true"
    />
  );
}
