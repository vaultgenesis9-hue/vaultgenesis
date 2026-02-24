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

    // Create sun geometry with high detail
    const geometry = new THREE.IcosahedronGeometry(1, 64);

    // Create sun material with realistic appearance
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create sun texture with Perlin-like noise
    ctx.fillStyle = "#FDB813";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add surface details with gradients
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Generate Perlin-like noise for surface details
    const noise = (x: number, y: number, scale: number) => {
      const n = Math.sin(x * scale) * Math.cos(y * scale);
      return (n + 1) / 2;
    };

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);

      // Create surface variation
      const n1 = noise(x, y, 0.01) * 0.5;
      const n2 = noise(x, y, 0.05) * 0.3;
      const n3 = noise(x, y, 0.1) * 0.2;
      const variation = n1 + n2 + n3;

      // Base color with variation
      const baseR = 253;
      const baseG = 184;
      const baseB = 19;

      const r = Math.min(255, baseR + variation * 30);
      const g = Math.min(255, baseG + variation * 20);
      const b = Math.max(0, baseB - variation * 10);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    // Add darker regions for sunspots
    ctx.fillStyle = "rgba(200, 100, 0, 0.3)";
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 30;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(150, 50, 0, 0.6)");
      gradient.addColorStop(1, "rgba(200, 100, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add bright regions
    ctx.fillStyle = "rgba(255, 255, 150, 0.2)";
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 80 + 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255, 255, 200, 0.4)");
      gradient.addColorStop(1, "rgba(255, 255, 150, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;

    // Create sun material
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 0xFDB813,
      emissiveIntensity: 0.6,
      shininess: 5,
      wireframe: false,
    });

    const sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // Add glow effect using a larger sphere with transparent material
    const glowGeometry = new THREE.IcosahedronGeometry(1.05, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Add outer glow
    const outerGlowGeometry = new THREE.IcosahedronGeometry(1.15, 16);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF8C00,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-5, -3, -5);
    scene.add(directionalLight);

    // Create 3D Rocket
    const createRocket = () => {
      const rocketGroup = new THREE.Group();

      // Rocket body
      const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6B35 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.z = 0;
      rocketGroup.add(body);

      // Rocket nose
      const noseGeometry = new THREE.ConeGeometry(0.15, 0.4, 16);
      const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
      const nose = new THREE.Mesh(noseGeometry, noseMaterial);
      nose.position.z = 0.6;
      rocketGroup.add(nose);

      // Rocket fins
      for (let i = 0; i < 3; i++) {
        const finGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.3);
        const finMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4500 });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.z = -0.3;
        fin.rotation.y = (i / 3) * Math.PI * 2;
        fin.position.x = Math.cos((i / 3) * Math.PI * 2) * 0.2;
        fin.position.y = Math.sin((i / 3) * Math.PI * 2) * 0.2;
        rocketGroup.add(fin);
      }

      // Rocket flame
      const flameGeometry = new THREE.ConeGeometry(0.12, 0.3, 8);
      const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xFF8C00 });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.z = -0.5;
      rocketGroup.add(flame);

      // Rocket glow
      const glowGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6B35,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      rocketGroup.add(glow);

      return rocketGroup;
    };

    const rocket = createRocket();
    scene.add(rocket);

    // Rocket trail particles
    const trailParticles: THREE.Mesh[] = [];
    const createTrailParticle = (position: THREE.Vector3) => {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF8C00,
        transparent: true,
        opacity: 0.6,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(position);
      scene.add(particle);
      trailParticles.push(particle);

      // Fade out and remove
      let life = 30;
      const fadeInterval = setInterval(() => {
        life--;
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = (life / 30) * 0.6;
        }
        if (life <= 0) {
          scene.remove(particle);
          particleGeometry.dispose();
          particleMaterial.dispose();
          clearInterval(fadeInterval);
        }
      }, 50);
    };

    // Animation loop
    let animationId: number;
    let rocketAngle = 0;
    let rocketDistance = 2.5;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate sun
      sun.rotation.x += 0.0005;
      sun.rotation.y += 0.0008;
      glow.rotation.x += 0.0003;
      glow.rotation.y += 0.0006;
      outerGlow.rotation.x += 0.0002;
      outerGlow.rotation.y += 0.0004;

      // Animate rocket flying towards sun
      rocketAngle += 0.005;
      rocketDistance = Math.max(1.2, 2.5 - (rocketAngle / (Math.PI * 4)) * 1.3);

      // Calculate rocket position (orbiting and spiraling towards sun)
      const rocketX = Math.cos(rocketAngle) * rocketDistance;
      const rocketY = Math.sin(rocketAngle * 0.5) * 0.5;
      const rocketZ = Math.sin(rocketAngle) * rocketDistance;

      rocket.position.set(rocketX, rocketY, rocketZ);

      // Point rocket towards sun
      const sunDirection = new THREE.Vector3(0, 0, 0).sub(rocket.position).normalize();
      rocket.lookAt(rocket.position.clone().add(sunDirection));

      // Create trail particles
      if (Math.random() < 0.3) {
        createTrailParticle(rocket.position.clone());
      }

      // Remove old trail particles
      if (trailParticles.length > 50) {
        const oldParticle = trailParticles.shift();
        if (oldParticle) scene.remove(oldParticle);
      }

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
      outerGlowMaterial.dispose();
      trailParticles.forEach((p) => {
        scene.remove(p);
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
