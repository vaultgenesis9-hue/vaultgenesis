import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function RealisticSun() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 2.5;

    // Create hyper-realistic sun texture
    const createSunTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Base gradient
      const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
      gradient.addColorStop(0, "#FFFF99");
      gradient.addColorStop(0.3, "#FFEB3B");
      gradient.addColorStop(0.6, "#FFC107");
      gradient.addColorStop(1, "#FF9800");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add surface detail
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const noise = (x: number, y: number, scale: number) => {
        const n =
          Math.sin(x * scale) * Math.cos(y * scale) +
          Math.sin(y * scale * 0.5) * Math.cos(x * scale * 0.5);
        return (n + 1) / 2;
      };

      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);

        const dx = x - 1024;
        const dy = y - 1024;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1024) {
          const n1 = noise(x, y, 0.005) * 0.4;
          const n2 = noise(x, y, 0.02) * 0.3;
          const n3 = noise(x, y, 0.05) * 0.2;
          const variation = n1 + n2 + n3;

          const baseR = 255;
          const baseG = 235;
          const baseB = 59;

          const r = Math.min(255, Math.max(100, baseR - variation * 60));
          const g = Math.min(255, Math.max(100, baseG - variation * 40));
          const b = Math.max(0, baseB - variation * 80);

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add bright flares
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 800 + 300;
        const x = 1024 + Math.cos(angle) * radius;
        const y = 1024 + Math.sin(angle) * radius;
        const size = Math.random() * 200 + 80;

        const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        flareGradient.addColorStop(0, "rgba(255, 255, 200, 0.8)");
        flareGradient.addColorStop(0.5, "rgba(255, 200, 100, 0.4)");
        flareGradient.addColorStop(1, "rgba(255, 150, 0, 0)");
        ctx.fillStyle = flareGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      return texture;
    };

    const sunTexture = createSunTexture();

    // Create sun
    const geometry = new THREE.IcosahedronGeometry(1, 64);
    const material = new THREE.MeshPhongMaterial({
      map: sunTexture,
      emissive: 0xFFEB3B,
      emissiveIntensity: 0.6,
      shininess: 10,
    });

    const sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // Add glow layers
    const glowGeometry = new THREE.IcosahedronGeometry(1.08, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFC107,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Create fire rays
    const createFireRays = () => {
      const raysGroup = new THREE.Group();
      const rayCount = 12;

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLength = 1.5;

        // Ray geometry
        const rayGeometry = new THREE.BoxGeometry(0.15, rayLength, 0.15);
        const rayMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.08, 1, 0.5 + Math.random() * 0.3),
          transparent: true,
          opacity: 0.8,
        });

        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        ray.position.y = rayLength / 2;
        ray.rotation.z = angle;

        raysGroup.add(ray);
      }

      return raysGroup;
    };

    const fireRays = createFireRays();
    scene.add(fireRays);

    // Create single rocket
    const createRocket = () => {
      const rocketGroup = new THREE.Group();

      // Body
      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a2e });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      rocketGroup.add(body);

      // Nose cone
      const noseGeometry = new THREE.ConeGeometry(0.08, 0.25, 16);
      const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6B35 });
      const nose = new THREE.Mesh(noseGeometry, noseMaterial);
      nose.position.z = 0.4;
      rocketGroup.add(nose);

      // Fins
      for (let i = 0; i < 3; i++) {
        const finGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.12);
        const finMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4500 });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.z = -0.1;
        fin.rotation.y = (i / 3) * Math.PI * 2;
        fin.position.x = Math.cos((i / 3) * Math.PI * 2) * 0.1;
        fin.position.y = Math.sin((i / 3) * Math.PI * 2) * 0.1;
        rocketGroup.add(fin);
      }

      // Flame
      const flameGeometry = new THREE.ConeGeometry(0.1, 0.4, 16);
      const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xFF8C00 });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.z = -0.35;
      rocketGroup.add(flame);

      // Inner flame
      const innerFlameGeometry = new THREE.ConeGeometry(0.05, 0.25, 8);
      const innerFlameMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
      const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
      innerFlame.position.z = -0.2;
      rocketGroup.add(innerFlame);

      // Rocket light
      const rocketLight = new THREE.PointLight(0xFF8C00, 0.8);
      rocketLight.position.z = -0.3;
      rocketGroup.add(rocketLight);

      return rocketGroup;
    };

    const rocket = createRocket();
    scene.add(rocket);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    const sunLight = new THREE.PointLight(0xFFEB3B, 0.8);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate sun
      sun.rotation.y += 0.0002;
      glow.rotation.y += 0.0001;

      // Animate fire rays
      fireRays.rotation.z += 0.01;
      fireRays.children.forEach((ray, index) => {
        const scale = 1 + Math.sin(Date.now() * 0.005 + index) * 0.2;
        ray.scale.y = scale;
      });

      // Animate rocket
      const time = Date.now() * 0.0005;
      const angle = time % (Math.PI * 2);
      const distance = 2.2 - (angle / (Math.PI * 2)) * 1.2;

      rocket.position.x = Math.cos(angle) * distance;
      rocket.position.y = Math.sin(angle * 0.5) * 0.3;
      rocket.position.z = Math.sin(angle) * distance * 0.3;

      // Point rocket toward sun
      const sunDir = new THREE.Vector3(0, 0, 0).sub(rocket.position).normalize();
      rocket.lookAt(rocket.position.clone().add(sunDir));

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      glowMaterial.dispose();
      sunTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
