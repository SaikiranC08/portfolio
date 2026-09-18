import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  fetchAppreciationCount, 
  submitAppreciation, 
  APPRECIATION_DISPLAY_THRESHOLD 
} from './services/appreciationService';

/* ─── 3D Tech Globe Component ─── */
function TechGlobe({ activeFilter, theme }) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const globeRef = useRef(null);

  // Store references for filter updates
  const nodesRef = useRef([]);
  const arcsRef = useRef([]);
  const arcStreamsRef = useRef([]);
  const sphereMatRef = useRef(null);
  const wireMatRef = useRef(null);
  const ringMatRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tooltip = tooltipRef.current;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = width < 480 ? 275 : 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.touchAction = 'pan-y';
    container.insertBefore(renderer.domElement, container.firstChild);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeRef.current = globeGroup;

    const GLOBE_RADIUS = 75;
    const isDark = theme === 'dark';

    // Solid globe sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x202020 : 0xf7f6f3,
      transparent: true,
      opacity: 0.85
    });
    globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));
    sphereMatRef.current = sphereMat;

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x303030 : 0xdfdeda,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    globeGroup.add(new THREE.Mesh(sphereGeo, wireMat));
    wireMatRef.current = wireMat;

    // Orbital ring
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.15, GLOBE_RADIUS * 1.16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x383838 : 0xd3d1cb,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    globeGroup.add(ring);
    ringMatRef.current = ringMat;

    // Categories
    const categories = {
      backend: { name: 'Backend', color: '#d9730d', hex: 0xd9730d },
      data: { name: 'Data & Messaging', color: '#0b6e99', hex: 0x0b6e99 },
      devops: { name: 'DevOps & Infrastructure', color: '#6940a5', hex: 0x6940a5 },
      frontend: { name: 'Frontend', color: '#0f7b6c', hex: 0x0f7b6c }
    };

    // Tech nodes with primary/secondary sizing and descriptions
    const techNodes = [
      // Backend — primary cluster (largest region)
      { name: 'Java', cat: 'backend', lat: 20, lon: 40, primary: true, desc: 'Core programming language' },
      { name: 'Spring Boot', cat: 'backend', lat: 30, lon: 60, primary: true, desc: 'Java backend framework' },
      { name: 'Microservices', cat: 'backend', lat: 38, lon: 48, primary: true, desc: 'Distributed architecture pattern' },
      { name: 'Spring Security', cat: 'backend', lat: 12, lon: 55, primary: false, desc: 'Auth & authorization framework' },
      { name: 'REST APIs', cat: 'backend', lat: 25, lon: 78, primary: false, desc: 'HTTP-based service interfaces' },
      { name: 'Spring Data JPA', cat: 'backend', lat: 8, lon: 42, primary: false, desc: 'Data access abstraction layer' },
      { name: 'Hibernate', cat: 'backend', lat: 15, lon: 30, primary: false, desc: 'ORM framework for Java' },
      { name: 'Spring MVC', cat: 'backend', lat: 35, lon: 72, primary: false, desc: 'Web framework for Java' },
      { name: 'JWT', cat: 'backend', lat: 5, lon: 65, primary: false, desc: 'Token-based authentication' },
      { name: 'WebSocket', cat: 'backend', lat: 42, lon: 35, primary: false, desc: 'Real-time bidirectional comms' },

      // Data & Messaging
      { name: 'PostgreSQL', cat: 'data', lat: -22, lon: -55, primary: true, desc: 'Relational database system' },
      { name: 'Kafka', cat: 'data', lat: -15, lon: -75, primary: true, desc: 'Distributed event streaming' },
      { name: 'MySQL', cat: 'data', lat: -30, lon: -65, primary: false, desc: 'Relational database system' },
      { name: 'Redis', cat: 'data', lat: -10, lon: -45, primary: false, desc: 'In-memory data store & cache' },

      // DevOps & Infrastructure
      { name: 'Docker', cat: 'devops', lat: -18, lon: 110, primary: true, desc: 'Container runtime platform' },
      { name: 'Kong API GW', cat: 'devops', lat: -30, lon: 100, primary: false, desc: 'API gateway & management' },
      { name: 'Git', cat: 'devops', lat: -12, lon: 125, primary: false, desc: 'Distributed version control' },
      { name: 'GitHub', cat: 'devops', lat: -25, lon: 130, primary: false, desc: 'Code hosting & collaboration' },
      { name: 'GitHub Actions', cat: 'devops', lat: -35, lon: 118, primary: false, desc: 'CI/CD automation' },
      { name: 'Linux', cat: 'devops', lat: -8, lon: 95, primary: false, desc: 'Server operating system' },
      { name: 'Azure', cat: 'devops', lat: -38, lon: 108, primary: false, desc: 'Cloud computing platform' },
      { name: 'Postman', cat: 'devops', lat: -22, lon: 140, primary: false, desc: 'API testing & development' },
      { name: 'Swagger', cat: 'devops', lat: -42, lon: 125, primary: false, desc: 'API documentation (OpenAPI)' },

      // Frontend
      { name: 'React', cat: 'frontend', lat: 28, lon: -45, primary: true, desc: 'UI component library' },
      { name: 'JavaScript', cat: 'frontend', lat: 35, lon: -58, primary: false, desc: 'Web scripting language' },
      { name: 'HTML', cat: 'frontend', lat: 20, lon: -35, primary: false, desc: 'Markup structure language' },
      { name: 'CSS', cat: 'frontend', lat: 38, lon: -30, primary: false, desc: 'Styling & layout language' },
    ];

    function latLongToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }

    const interactiveMeshes = [];
    const nodeMap = {};
    const allNodeObjects = [];

    techNodes.forEach((node) => {
      const pos = latLongToVector3(node.lat, node.lon, GLOBE_RADIUS);
      const catData = categories[node.cat];
      const markerSize = node.primary ? 2.8 : 1.8;

      // Marker sphere (visible node dot)
      const markerGeo = new THREE.SphereGeometry(markerSize, 14, 14);
      const markerMat = new THREE.MeshBasicMaterial({ color: catData.hex, transparent: true, opacity: 1.0 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      globeGroup.add(marker);

      // Glow ring for primary nodes
      if (node.primary) {
        const glowGeo = new THREE.RingGeometry(markerSize * 1.2, markerSize * 1.8, 24);
        const glowMat = new THREE.MeshBasicMaterial({
          color: catData.hex,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(pos);
        glow.lookAt(0, 0, 0);
        globeGroup.add(glow);
      }

      // Invisible hit-target sprite for raycasting (no visible label)
      const hitCanvas = document.createElement('canvas');
      hitCanvas.width = 128;
      hitCanvas.height = 64;
      const hitTexture = new THREE.CanvasTexture(hitCanvas);
      hitTexture.minFilter = THREE.LinearFilter;
      const hitMat = new THREE.SpriteMaterial({ map: hitTexture, transparent: true, opacity: 0.001 });
      const hitSprite = new THREE.Sprite(hitMat);
      hitSprite.scale.set(18, 6, 1);
      const hitPos = latLongToVector3(node.lat, node.lon, GLOBE_RADIUS + 3);
      hitSprite.position.copy(hitPos);
      hitSprite.userData = { ...node, catName: catData.name, catColor: catData.color, marker, markerMat };
      globeGroup.add(hitSprite);

      interactiveMeshes.push(hitSprite);
      nodeMap[node.name] = { pos: hitPos, data: node };
      allNodeObjects.push({ marker, markerMat, hitSprite, node, catData });
    });

    nodesRef.current = allNodeObjects;

    // Connections between related tech
    const connections = [
      ['Java', 'Spring Boot'],
      ['Spring Boot', 'REST APIs'],
      ['Spring Boot', 'Microservices'],
      ['Spring Boot', 'Spring Security'],
      ['Spring Boot', 'Spring Data JPA'],
      ['Spring Boot', 'Spring MVC'],
      ['Spring Data JPA', 'Hibernate'],
      ['Spring Security', 'JWT'],
      ['Spring Boot', 'PostgreSQL'],
      ['Java', 'Hibernate'],
      ['REST APIs', 'Microservices'],
      ['PostgreSQL', 'MySQL'],
      ['Kafka', 'Microservices'],
      ['Redis', 'Kafka'],
      ['Docker', 'Microservices'],
      ['Docker', 'Kong API GW'],
      ['Git', 'GitHub'],
      ['GitHub', 'GitHub Actions'],
      ['React', 'JavaScript'],
      ['React', 'REST APIs'],
      ['WebSocket', 'Microservices'],
    ];

    function createSplineArc(p1, p2, colorHex) {
      const distance = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const midLength = mid.length();
      mid.normalize().multiplyScalar(midLength + distance * 0.25);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: colorHex || 0xc4c4c0,
        transparent: true,
        opacity: 0.3,
        linewidth: 1
      });

      const curveObject = new THREE.Line(geometry, material);
      return { curveObject, points, material };
    }

    const arcStreams = [];
    const allArcObjects = [];
    connections.forEach(([sourceName, targetName]) => {
      if (nodeMap[sourceName] && nodeMap[targetName]) {
        const p1 = nodeMap[sourceName].pos;
        const p2 = nodeMap[targetName].pos;
        const srcCat = nodeMap[sourceName].data.cat;
        const tgtCat = nodeMap[targetName].data.cat;
        const arcColor = srcCat === tgtCat ? categories[srcCat].hex : 0xc4c4c0;
        const { curveObject, points, material } = createSplineArc(p1, p2, arcColor);
        globeGroup.add(curveObject);

        const pGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: arcColor, transparent: true, opacity: 0.7 });
        const particle = new THREE.Mesh(pGeo, pMat);
        globeGroup.add(particle);

        const arcObj = { curveObject, material, particle, pMat, sourceName, targetName };
        allArcObjects.push(arcObj);
        arcStreams.push({
          particle,
          points,
          progress: Math.random()
        });
      }
    });

    arcsRef.current = allArcObjects;
    arcStreamsRef.current = arcStreams;

    // Interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let pointerMoveDistance = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredSprite = null;

    function selectNode(hit, clientX, clientY, rect) {
      if (hoveredSprite && hoveredSprite !== hit && hoveredSprite.userData.marker) {
        hoveredSprite.userData.marker.scale.set(1, 1, 1);
      }
      hoveredSprite = hit;
      container.style.cursor = 'pointer';
      if (hit.userData.marker) {
        hit.userData.marker.scale.set(1.6, 1.6, 1.6);
      }
      const data = hit.userData;
      if (tooltip) {
        tooltip.innerHTML = `<div style="font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px;margin-bottom:2px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${data.catColor}"></span>${data.name}</div><div style="font-size:11px;color:var(--muted);font-weight:500">${data.catName}</div>${data.desc ? `<div style="font-size:11px;color:var(--muted);margin-top:3px;font-family:Inter,system-ui,sans-serif;font-style:normal">${data.desc}</div>` : ''}`;
        tooltip.style.display = 'block';
        const posX = Math.min(rect.width - 150, Math.max(10, clientX - rect.left + 14));
        const posY = Math.min(rect.height - 70, Math.max(10, clientY - rect.top + 10));
        tooltip.style.left = `${posX}px`;
        tooltip.style.top = `${posY}px`;
      }
    }

    function clearSelectedNode() {
      if (hoveredSprite) {
        if (hoveredSprite.userData.marker) {
          hoveredSprite.userData.marker.scale.set(1, 1, 1);
        }
        hoveredSprite = null;
        container.style.cursor = 'default';
        if (tooltip) tooltip.style.display = 'none';
      }
    }

    function onPointerDown(e) {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
      pointerMoveDistance = 0;
    }

    function onPointerMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        pointerMoveDistance += Math.abs(deltaX) + Math.abs(deltaY);
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Hover-based inspection for desktop pointer
      if (e.pointerType !== 'touch') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);
        if (intersects.length > 0) {
          selectNode(intersects[0].object, e.clientX, e.clientY, rect);
        } else {
          clearSelectedNode();
        }
      }
    }

    function onPointerUp(e) {
      isDragging = false;
      // If tap/click without dragging, select node or toggle tooltip
      if (pointerMoveDistance < 8) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);
        if (intersects.length > 0) {
          selectNode(intersects[0].object, e.clientX, e.clientY, rect);
        } else {
          clearSelectedNode();
        }
      }
    }

    function onWheel(e) {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.12;
      camera.position.z = Math.max(140, Math.min(360, camera.position.z));
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Keyboard accessibility
    renderer.domElement.setAttribute('tabindex', '0');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D technology map showing technical skills organized by category. Drag to rotate, scroll to zoom, hover or tap nodes for details.');

    function onWindowResize() {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.position.z = w < 480 ? 275 : 240;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onWindowResize);

    const autoRotateSpeed = prefersReducedMotion ? 0 : 0.002;
    const streamSpeed = prefersReducedMotion ? 0 : 0.006;

    let reqId;
    function animate() {
      reqId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += autoRotateSpeed;
      }

      arcStreamsRef.current.forEach(stream => {
        stream.progress += streamSpeed;
        if (stream.progress > 1) stream.progress = 0;
        const index = Math.floor(stream.progress * (stream.points.length - 1));
        if (stream.points[index]) {
          stream.particle.position.copy(stream.points[index]);
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update node visibility when filter changes
  useEffect(() => {
    nodesRef.current.forEach(({ marker, markerMat, hitSprite, node }) => {
      const visible = activeFilter === 'all' || node.cat === activeFilter;
      const opacity = visible ? 1.0 : 0.12;
      markerMat.opacity = opacity;
      hitSprite.material.opacity = visible ? 0.001 : 0;
    });
    arcsRef.current.forEach(({ material, pMat, sourceName, targetName }) => {
      // Find categories for source and target
      const srcNode = nodesRef.current.find(n => n.node.name === sourceName);
      const tgtNode = nodesRef.current.find(n => n.node.name === targetName);
      if (!srcNode || !tgtNode) return;
      const srcVisible = activeFilter === 'all' || srcNode.node.cat === activeFilter;
      const tgtVisible = activeFilter === 'all' || tgtNode.node.cat === activeFilter;
      const visible = srcVisible && tgtVisible;
      material.opacity = visible ? 0.3 : 0.04;
      pMat.opacity = visible ? 0.7 : 0;
    });
  }, [activeFilter]);

  // Update 3D materials dynamically when theme changes
  useEffect(() => {
    const isDark = theme === 'dark';
    if (sphereMatRef.current) {
      sphereMatRef.current.color.setHex(isDark ? 0x202020 : 0xf7f6f3);
    }
    if (wireMatRef.current) {
      wireMatRef.current.color.setHex(isDark ? 0x303030 : 0xdfdeda);
    }
    if (ringMatRef.current) {
      ringMatRef.current.color.setHex(isDark ? 0x383838 : 0xd3d1cb);
    }
  }, [theme]);

  return (
    <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-[260px] sm:h-[360px] md:h-[440px] bg-[#faf9f6] overflow-hidden flex items-center justify-center select-none"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-xs transition-opacity duration-150 border"
          style={{ display: 'none', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        />
        {/* Bottom legend — responsive & touch-friendly */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex flex-wrap items-center gap-2 sm:gap-4 pointer-events-none bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-1 sm:gap-1.5 text-[#d9730d] font-medium"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d9730d]"></span>Backend</span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-[#0b6e99] font-medium"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0b6e99]"></span>Data &amp; Messaging</span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-[#6940a5] font-medium"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#6940a5]"></span>DevOps</span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-[#0f7b6c] font-medium"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0f7b6c]"></span>Frontend</span>
          <span className="ml-auto text-[rgba(55,53,47,0.35)] text-[10px] hidden sm:inline">Drag to rotate · Tap for details</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Technology Tag Styles (Consistent, Notion-style soft colors) ─── */
const TECH_TAG_STYLES = {
  'Java': 'bg-[#fadec9] text-[#854c1d]',
  'Spring Boot': 'bg-[#dbeddb] text-[#286644]',
  'REST APIs': 'bg-[#daf1ea] text-[#1b6e56]',
  'PostgreSQL': 'bg-[#e8deee] text-[#5c3882]',
  'Docker': 'bg-[#d3e5ef] text-[#205d86]',
  'Kong API Gateway': 'bg-[#fdecc8] text-[#8f632d]',
  'Kong API GW': 'bg-[#fdecc8] text-[#8f632d]',
  'JWT': 'bg-[#e8deee] text-[#5c3882]',
  'WebSocket': 'bg-[#daf1ea] text-[#1b6e56]',
  'Kafka': 'bg-[#fdecc8] text-[#8f632d]',
  'React': 'bg-[#d3e5ef] text-[#205d86]',
  'TypeScript': 'bg-[#d3e5ef] text-[#205d86]',
  'Python': 'bg-[#d3e5ef] text-[#205d86]',
  'Node.js': 'bg-[#dbeddb] text-[#286644]',
  'Microservices': 'bg-[#dbeddb] text-[#286644]',
};

function getTechTagClass(tech) {
  return TECH_TAG_STYLES[tech] || 'bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]';
}

/* ─── Projects Data ─── */
const PROJECTS = [
  {
    id: 'inventoryhub',
    name: 'InventoryHub',
    subtitle: 'Multi-Business Inventory Management Platform',
    category: 'Backend · Microservices',
    status: '● Live',
    description: "A microservices-based inventory platform for managing products, stock, transfers, and business operations through secure REST APIs.",
    technologies: [
      'Java',
      'Spring Boot',
      'REST APIs',
      'PostgreSQL',
      'Docker',
      'Kong API Gateway'
    ],
    liveUrl: 'https://github.com/SaikiranC08/InventoryHub',
    githubUrl: 'https://github.com/SaikiranC08/InventoryHub',
    image: null,
    imageAlt: 'InventoryHub Multi-Business Inventory Management Dashboard and Stock Table'
  }
];

/* ─── InventoryHub Product Application Visual (Primary Card Visual) ─── */
function InventoryHubProductVisual() {
  return (
    <div className="w-full h-40 sm:h-44 bg-[#fcfcfb] border-b border-[#e9e9e7] select-none flex flex-col justify-between p-2.5 sm:p-3 font-sans text-[#37352f] overflow-hidden">
      {/* App Bar / Business Tenant Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ecece9]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#2383e2] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            📦
          </div>
          <span className="text-[12px] font-semibold text-[#37352f] truncate">
            InventoryHub
          </span>
          <span className="text-[10.5px] text-[rgba(55,53,47,0.45)]">/</span>
          {/* Multi-Tenant Business Switcher */}
          <div className="flex items-center gap-1 bg-[#f1f1ef] px-1.5 py-0.5 rounded text-[10.5px] text-[#37352f] border border-[#e3e2e0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#286644]"></span>
            <span className="font-medium truncate max-w-[90px] sm:max-w-[150px]">Apex Retailers Ltd</span>
            <span className="text-[9px] text-[rgba(55,53,47,0.5)]">▾</span>
          </div>
        </div>

        {/* Live sync badge & SKU counter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex text-[10px] font-mono text-[rgba(55,53,47,0.55)] bg-white px-1.5 py-0.5 rounded border border-[#e9e9e7]">
            1,420 SKUs · 3 Warehouses
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#286644] bg-[#dbeddb] px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-[#286644] animate-pulse"></span>
            <span>Live</span>
          </span>
        </div>
      </div>

      {/* Product Stock Table Preview */}
      <div className="flex-1 my-1.5 overflow-hidden flex flex-col justify-center">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-[#f1f1ef] text-[9.5px] font-mono uppercase tracking-wider text-[rgba(55,53,47,0.45)]">
              <th className="pb-1 font-medium">SKU / Item</th>
              <th className="pb-1 font-medium hidden sm:table-cell">Warehouse</th>
              <th className="pb-1 font-medium text-right sm:text-left">Stock Level</th>
              <th className="pb-1 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f7f7f5] text-[10.5px]">
            <tr>
              <td className="py-1 font-medium text-[#37352f] truncate max-w-[160px]">
                <span className="font-mono text-[9.5px] text-[rgba(55,53,47,0.5)] mr-1">SKU-9402</span>
                Pro Barcode Scanner
              </td>
              <td className="py-1 text-[rgba(55,53,47,0.6)] text-[10px] hidden sm:table-cell">WH-North A3</td>
              <td className="py-1 font-mono text-[10px] text-right sm:text-left">
                <span className="text-[#37352f] font-medium">340</span>
                <span className="text-[rgba(55,53,47,0.4)] text-[9px]"> / 500</span>
              </td>
              <td className="py-1 text-right">
                <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-[#dbeddb] text-[#286644]">
                  In Stock
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-1 font-medium text-[#37352f] truncate max-w-[160px]">
                <span className="font-mono text-[9.5px] text-[rgba(55,53,47,0.5)] mr-1">SKU-3118</span>
                Thermal Label 4x6
              </td>
              <td className="py-1 text-[rgba(55,53,47,0.6)] text-[10px] hidden sm:table-cell">WH-Central B12</td>
              <td className="py-1 font-mono text-[10px] text-right sm:text-left">
                <span className="text-[#854c1d] font-medium">42</span>
                <span className="text-[rgba(55,53,47,0.4)] text-[9px]"> / 200</span>
              </td>
              <td className="py-1 text-right">
                <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-[#fadec9] text-[#854c1d]">
                  Low Stock
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-1 font-medium text-[#37352f] truncate max-w-[160px]">
                <span className="font-mono text-[9.5px] text-[rgba(55,53,47,0.5)] mr-1">SKU-8841</span>
                Heavy Pallet Rack
              </td>
              <td className="py-1 text-[rgba(55,53,47,0.6)] text-[10px] hidden sm:table-cell">WH-East C04</td>
              <td className="py-1 font-mono text-[10px] text-right sm:text-left">
                <span className="text-[#37352f] font-medium">180</span>
                <span className="text-[rgba(55,53,47,0.4)] text-[9px]"> / 180</span>
              </td>
              <td className="py-1 text-right">
                <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-[#dbeddb] text-[#286644]">
                  In Stock
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mini Status Footer / Inter-Warehouse Transfer Indicator */}
      <div className="pt-1.5 border-t border-[#ecece9] flex items-center justify-between text-[9.5px] text-[rgba(55,53,47,0.5)] font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[#2383e2]">⇄</span>
          <span className="truncate">Transfer #TR-8821 in-transit: WH-North → WH-Central (120 units)</span>
        </div>
        <span className="hidden sm:inline text-[rgba(55,53,47,0.4)]">Tenant Isolation ✓</span>
      </div>
    </div>
  );
}

/* ─── InventoryHub Architecture Visual ─── */
function InventoryHubArchitectureVisual() {
  return (
    <div className="w-full bg-[#fbfbfa] py-3 sm:py-4 px-3 sm:px-6 select-none flex items-center justify-center">
      <svg
        viewBox="0 0 700 170"
        className="w-full h-40 sm:h-44 max-w-[660px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="arch-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#ecebe8" />
          </pattern>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#8f8e8b" />
          </marker>
        </defs>

        <rect width="700" height="170" fill="url(#arch-grid)" rx="6" />

        {/* 1. API Clients Box */}
        <g transform="translate(18, 50)">
          <rect width="112" height="70" rx="6" fill="#ffffff" stroke="#e3e2e0" strokeWidth="1" />
          <rect x="8" y="8" width="22" height="16" rx="3" fill="#f1f1ef" />
          <text x="19" y="19" textAnchor="middle" fontSize="9" fill="#6a675e" fontFamily="monospace">API</text>
          <text x="36" y="20" fontSize="12" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">Clients</text>
          <text x="12" y="42" fontSize="10.5" fill="rgba(55,53,47,0.65)" fontFamily="system-ui, sans-serif">Web &amp; External Apps</text>
          <text x="12" y="56" fontSize="9.5" fill="rgba(55,53,47,0.45)" fontFamily="monospace">HTTPS / REST JSON</text>
        </g>

        {/* Connector: Clients -> Gateway */}
        <path d="M 130 85 L 168 85" stroke="#a5a4a1" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />

        {/* 2. Kong API Gateway Box */}
        <g transform="translate(175, 34)">
          <rect width="138" height="102" rx="6" fill="#ffffff" stroke="#37352f" strokeWidth="1.2" />
          <rect x="10" y="8" width="68" height="16" rx="3" fill="#37352f" />
          <text x="44" y="19" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#ffffff" fontFamily="monospace">API GATEWAY</text>
          <text x="12" y="42" fontSize="12.5" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">Kong Gateway</text>
          <text x="12" y="59" fontSize="10" fill="rgba(55,53,47,0.65)" fontFamily="system-ui, sans-serif">Port 8000 · Ingress</text>
          <line x1="12" y1="67" x2="126" y2="67" stroke="#f1f1ef" strokeWidth="1" />
          <text x="12" y="81" fontSize="9.5" fill="rgba(55,53,47,0.6)" fontFamily="monospace">✓ JWT Auth &amp; RBAC</text>
          <text x="12" y="93" fontSize="9.5" fill="rgba(55,53,47,0.6)" fontFamily="monospace">✓ Rate Limiting &amp; CORS</text>
        </g>

        {/* Branching Connectors: Gateway -> Microservices */}
        <path d="M 313 70 Q 338 70, 350 46" stroke="#a5a4a1" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
        <path d="M 313 85 L 350 85" stroke="#a5a4a1" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
        <path d="M 313 100 Q 338 100, 350 124" stroke="#a5a4a1" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />

        {/* 3. Microservices Cluster Box (Dashed grouping) */}
        <rect x="350" y="16" width="186" height="138" rx="6" fill="none" stroke="#d0d0cc" strokeWidth="1" strokeDasharray="4 4" />
        <text x="360" y="12" fontSize="9" fontWeight="600" fill="rgba(55,53,47,0.5)" fontFamily="monospace">SPRING BOOT MICROSERVICES</text>

        {/* Service 1: Auth & Tenant Service */}
        <g transform="translate(358, 28)">
          <rect width="170" height="34" rx="4" fill="#ffffff" stroke="#e3e2e0" strokeWidth="1" />
          <circle cx="12" cy="17" r="3.5" fill="#286644" />
          <text x="22" y="16" fontSize="11" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">Auth &amp; Tenant Service</text>
          <text x="22" y="27" fontSize="8.5" fill="rgba(55,53,47,0.5)" fontFamily="monospace">JWT · Tenant Isolation</text>
        </g>

        {/* Service 2: Product Catalog Service */}
        <g transform="translate(358, 68)">
          <rect width="170" height="34" rx="4" fill="#ffffff" stroke="#e3e2e0" strokeWidth="1" />
          <circle cx="12" cy="17" r="3.5" fill="#286644" />
          <text x="22" y="16" fontSize="11" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">Product Catalog Service</text>
          <text x="22" y="27" fontSize="8.5" fill="rgba(55,53,47,0.5)" fontFamily="monospace">SKUs · Categories · Variants</text>
        </g>

        {/* Service 3: Stock & Transfer Service */}
        <g transform="translate(358, 108)">
          <rect width="170" height="34" rx="4" fill="#ffffff" stroke="#e3e2e0" strokeWidth="1" />
          <circle cx="12" cy="17" r="3.5" fill="#286644" />
          <text x="22" y="16" fontSize="11" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">Stock &amp; Transfer Service</text>
          <text x="22" y="27" fontSize="8.5" fill="rgba(55,53,47,0.5)" fontFamily="monospace">Real-Time Balances · Audit</text>
        </g>

        {/* Connector: Microservices -> DB */}
        <path d="M 536 85 L 568 85" stroke="#a5a4a1" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />

        {/* 4. Database & Infrastructure Box */}
        <g transform="translate(574, 38)">
          <rect width="112" height="94" rx="6" fill="#ffffff" stroke="#e3e2e0" strokeWidth="1" />
          <rect x="8" y="8" width="56" height="15" rx="3" fill="#e8deee" />
          <text x="36" y="18.5" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#5c3882" fontFamily="monospace">POSTGRESQL</text>
          <text x="10" y="40" fontSize="12" fontWeight="600" fill="#37352f" fontFamily="system-ui, sans-serif">PostgreSQL</text>
          <text x="10" y="55" fontSize="9.5" fill="rgba(55,53,47,0.6)" fontFamily="system-ui, sans-serif">Relational Datastore</text>
          <line x1="10" y1="63" x2="102" y2="63" stroke="#f1f1ef" strokeWidth="1" />
          <text x="10" y="76" fontSize="9" fill="rgba(55,53,47,0.5)" fontFamily="monospace">ACID Transactions</text>
          <text x="10" y="88" fontSize="9" fill="rgba(55,53,47,0.5)" fontFamily="monospace">Docker Network</text>
        </g>
      </svg>
    </div>
  );
}

/* ─── InventoryHub Detailed Project Page ─── */
function InventoryHubDetailPage({ onNavigate }) {
  return (
    <main className="w-full overflow-y-auto pb-28">
      <div className="max-w-[760px] mx-auto px-4 sm:px-12 py-8 sm:py-14">
        {/* Back navigation */}
        <div className="mb-6">
          <button 
            onClick={() => onNavigate('portfolio', 'projects')}
            className="inline-flex items-center gap-1.5 text-[12px] text-[rgba(55,53,47,0.6)] hover:text-[#37352f] px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.06)] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Featured Projects</span>
          </button>
        </div>

        {/* Notion Page Icon & Title */}
        <div className="mb-6">
          <div className="text-[36px] mb-2 select-none">📦</div>
          <h1 className="text-[32px] sm:text-[36px] font-bold text-[#37352f] tracking-tight mb-2">
            InventoryHub
          </h1>
          <p className="text-[16px] text-[rgba(55,53,47,0.7)]">
            Multi-Business Inventory Management Platform
          </p>
        </div>

        {/* Notion Properties Table */}
        <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 mb-8 text-[13px] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-center">
            <span className="text-[rgba(55,53,47,0.55)] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">category</span>
              <span>Category</span>
            </span>
            <span className="text-[#37352f] font-mono text-[12px] bg-white px-2 py-0.5 rounded border border-[#e9e9e7] inline-block w-fit">
              Backend · Microservices
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-center">
            <span className="text-[rgba(55,53,47,0.55)] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Status</span>
            </span>
            <span className="text-[#286644] bg-[#dbeddb] px-2 py-0.5 rounded font-mono text-[12px] font-medium inline-block w-fit">
              ● Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-start">
            <span className="text-[rgba(55,53,47,0.55)] flex items-center gap-1.5 pt-0.5">
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>Tech Stack</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Java', 'Spring Boot', 'REST APIs', 'PostgreSQL', 'Docker', 'Kong API Gateway', 'JWT', 'WebSocket'].map(t => (
                <span key={t} className={`px-2 py-0.5 rounded text-[11px] font-medium ${getTechTagClass(t)}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-center">
            <span className="text-[rgba(55,53,47,0.55)] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">link</span>
              <span>Links</span>
            </span>
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/SaikiranC08/InventoryHub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2383e2] hover:underline font-medium flex items-center gap-0.5 text-[12.5px]"
              >
                <span>Live Demo ↗</span>
              </a>
              <span className="text-[rgba(55,53,47,0.3)]">·</span>
              <a 
                href="https://github.com/SaikiranC08/InventoryHub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2383e2] hover:underline font-medium flex items-center gap-0.5 text-[12.5px]"
              >
                <span>GitHub Repository ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Architecture Visual Preview */}
        <div className="rounded-lg border border-[#e9e9e7] overflow-hidden mb-8">
          <div className="bg-[#f7f7f5] px-4 py-2 border-b border-[#e9e9e7] text-[12px] font-mono text-[rgba(55,53,47,0.5)] flex items-center justify-between">
            <span>system-architecture.svg</span>
            <span>Microservices Topology</span>
          </div>
          <InventoryHubArchitectureVisual />
        </div>

        {/* Detailed Engineering Content */}
        <div className="space-y-8 text-[#37352f] text-[14.5px] leading-relaxed">
          
          {/* 1. Problem */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🎯</span>
              <span>1. Problem Statement</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              Traditional inventory systems built as monolithic applications struggle when serving multi-tenant business operations. As multiple independent businesses share a centralized inventory infrastructure, monoliths create distinct failure points:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Tenant Data Leakage:</strong> Shared database tables without automated tenant-isolation filters risk exposing confidential inventory counts and business data.</li>
              <li><strong className="text-[#37352f] font-medium">Concurrency Race Conditions:</strong> High-frequency simultaneous inventory allocations and inter-warehouse transfers cause phantom stock reads and double-allocation.</li>
              <li><strong className="text-[#37352f] font-medium">Coupled Deployments:</strong> Modifying product catalog validation or stock transfer business logic requires rebuilding and redeploying the entire system.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 2. Solution */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">💡</span>
              <span>2. Solution Overview</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              InventoryHub solves these challenges through a resilient, decoupled microservices architecture designed with Java and Spring Boot:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Domain-Driven Microservices:</strong> Deconstructed autonomous services for Authentication &amp; Tenant Management, Product Catalog, and Stock Transfers.</li>
              <li><strong className="text-[#37352f] font-medium">Centralized Kong Gateway:</strong> All ingress traffic is routed, rate-limited, and authenticated at the perimeter before hitting downstream services.</li>
              <li><strong className="text-[#37352f] font-medium">Transactional Integrity:</strong> Strict ACID transaction boundaries ensure atomic stock deductions and multi-step transfer validation.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 3. Architecture */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">📐</span>
              <span>3. System Architecture</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              The platform implements a layered microservices pattern inside a containerized Docker network:
            </p>
            <div className="bg-[#fbfbfa] p-4 rounded-lg border border-[#e9e9e7] font-mono text-[12px] text-[#37352f] space-y-1 overflow-x-auto">
              <div>[Client Apps] ──HTTPS──&gt; [Kong API Gateway (:8000)]</div>
              <div className="text-[rgba(55,53,47,0.4)]">                         │  (Route matching, Rate Limiting, JWT Validation)</div>
              <div className="text-[rgba(55,53,47,0.4)]">                         ▼</div>
              <div>├──&gt; [Auth &amp; Tenant Service]     (:8081) ──&gt; PostgreSQL (tenants, users, roles)</div>
              <div>├──&gt; [Product Catalog Service]    (:8082) ──&gt; PostgreSQL (categories, products, SKUs)</div>
              <div>└──&gt; [Stock &amp; Transfer Service]   (:8083) ──&gt; PostgreSQL (warehouses, stocks, transfers)</div>
            </div>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 4. Key Features */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">✨</span>
              <span>4. Key Features</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px]">
              <div className="p-3.5 rounded border border-[#e9e9e7] bg-[#fbfbfa]">
                <strong className="font-semibold block mb-1">Multi-Business Tenancy</strong>
                <p className="text-[rgba(55,53,47,0.65)] text-[12.5px]">Strict data partitioning per business entity with custom tenant identifier propagation across every request context.</p>
              </div>
              <div className="p-3.5 rounded border border-[#e9e9e7] bg-[#fbfbfa]">
                <strong className="font-semibold block mb-1">Product Catalog &amp; SKUs</strong>
                <p className="text-[rgba(55,53,47,0.65)] text-[12.5px]">Hierarchical category structures, SKU code generation, variant management, and attribute tagging.</p>
              </div>
              <div className="p-3.5 rounded border border-[#e9e9e7] bg-[#fbfbfa]">
                <strong className="font-semibold block mb-1">Stock Transfer Workflow</strong>
                <p className="text-[rgba(55,53,47,0.65)] text-[12.5px]">State machine for inter-warehouse inventory movements: Draft → Requested → In Transit → Received / Rejected.</p>
              </div>
              <div className="p-3.5 rounded border border-[#e9e9e7] bg-[#fbfbfa]">
                <strong className="font-semibold block mb-1">Audit Trail &amp; History</strong>
                <p className="text-[rgba(55,53,47,0.65)] text-[12.5px]">Immutable logs of all stock allocations, transfers, and threshold adjustments with timestamped actor metadata.</p>
              </div>
            </div>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 5. Authentication & Security */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🔒</span>
              <span>5. Authentication &amp; Security</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-2">
              Security is implemented with stateless authentication using Spring Security and JSON Web Tokens (JWT):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">JWT Claims:</strong> Tokens encapsulate user ID, tenant ID, and granted authorities (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_STAFF`).</li>
              <li><strong className="text-[#37352f] font-medium">Tenant Context Filter:</strong> A custom servlet filter intercepts incoming requests downstream of Kong, validates the tenant claim, and binds the tenant context to `ThreadLocal`.</li>
              <li><strong className="text-[#37352f] font-medium">Password Hashing:</strong> BCrypt algorithm with configurable work factor for user credentials.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 6. API Design */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">📡</span>
              <span>6. API Design &amp; Contracts</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              RESTful APIs follow consistent semantic conventions, strict request validation, and standard HTTP response codes:
            </p>
            <div className="bg-[#fbfbfa] p-3.5 rounded border border-[#e9e9e7] font-mono text-[12px] space-y-2">
              <div><span className="text-[#205d86] font-semibold">POST</span> /api/v1/auth/login <span className="text-[rgba(55,53,47,0.5)]">→ Authenticates user &amp; returns signed JWT</span></div>
              <div><span className="text-[#286644] font-semibold">GET</span>  /api/v1/products?page=0&amp;size=20 <span className="text-[rgba(55,53,47,0.5)]">→ Paginated product catalog</span></div>
              <div><span className="text-[#205d86] font-semibold">POST</span> /api/v1/inventory/transfers <span className="text-[rgba(55,53,47,0.5)]">→ Initiates atomic inter-warehouse transfer</span></div>
              <div><span className="text-[#854c1d] font-semibold">PATCH</span>/api/v1/inventory/transfers/:id/status <span className="text-[rgba(55,53,47,0.5)]">→ Transitions transfer lifecycle state</span></div>
            </div>
            <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-2">
              All payloads are validated using Jakarta Bean Validation (`@Valid`, `@NotNull`, `@Min`). Exceptions are caught by a global `@RestControllerAdvice` emitting uniform error envelopes with field-level details.
            </p>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 7. WebSocket Communication */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">⚡</span>
              <span>7. WebSocket Communication</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)]">
              Integrated real-time STOMP over WebSocket channels to broadcast live stock deduction and replenishment events to connected client dashboards. When warehouse operators confirm an incoming stock transfer, inventory levels update across open sessions without requiring manual page reloads or polling.
            </p>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 8. Kong API Gateway */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🚪</span>
              <span>8. Kong API Gateway</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              Kong Gateway serves as the single reverse proxy ingress for the architecture:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Service Routing:</strong> Maps external paths to internal Docker DNS service endpoints.</li>
              <li><strong className="text-[#37352f] font-medium">Rate Limiting:</strong> Enforces token bucket rate limiting (100 req/min per IP/API key) to protect against volumetric abuse.</li>
              <li><strong className="text-[#37352f] font-medium">CORS &amp; Headers:</strong> Strips internal headers and standardizes cross-origin request policies.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 9. Database Design */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🗄️</span>
              <span>9. Database Design &amp; Data Modeling</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              PostgreSQL stores relational entities with enforced foreign key integrity and transactional safety:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Tenant Partitioning:</strong> Every relational entity has a dedicated indexed `tenant_id` column ensuring zero cross-tenant query leaks.</li>
              <li><strong className="text-[#37352f] font-medium">Locking Strategies:</strong> Uses pessimistic write locks (`SELECT ... FOR UPDATE`) during stock transfer execution to prevent inventory races.</li>
              <li><strong className="text-[#37352f] font-medium">Audit Tables:</strong> Temporal tables log historical stock delta transactions with timestamps and previous balances.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 10. Docker & Deployment */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🐳</span>
              <span>10. Docker Containerization &amp; Deployment</span>
            </h2>
            <p className="text-[rgba(55,53,47,0.75)] mb-3">
              The entire application topology is containerized for seamless local execution and production parity:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Multi-Stage Dockerfiles:</strong> Maven build stage separated from lightweight Eclipse Temurin JRE runtime images.</li>
              <li><strong className="text-[#37352f] font-medium">Docker Compose:</strong> Orchestrates the Kong Gateway, PostgreSQL database instance, and all Spring Boot services within an isolated bridge network.</li>
              <li><strong className="text-[#37352f] font-medium">Health Checks:</strong> Built-in Spring Boot Actuator `/actuator/health` probes ensure services are fully initialized before traffic is routed.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 11. Testing */}
          <section>
            <h2 className="text-[19px] font-bold text-[#37352f] mb-2 flex items-center gap-2">
              <span className="text-[16px]">🧪</span>
              <span>11. Testing &amp; Quality Assurance</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-[rgba(55,53,47,0.7)] ml-2 text-[14px]">
              <li><strong className="text-[#37352f] font-medium">Unit Testing:</strong> JUnit 5 and Mockito test business logic in service classes, state machines, and validation rules.</li>
              <li><strong className="text-[#37352f] font-medium">Integration Testing:</strong> MockMvc tests HTTP status codes, JSON serialization, and Spring Security authorization filters.</li>
              <li><strong className="text-[#37352f] font-medium">API Testing:</strong> Postman test collections verify full end-to-end multi-tenant workflows through the Kong gateway.</li>
            </ul>
          </section>

          <hr className="border-[#e9e9e7]" />

          {/* 12. Links & Actions */}
          <section className="pt-2">
            <h2 className="text-[19px] font-bold text-[#37352f] mb-3 flex items-center gap-2">
              <span className="text-[16px]">🔗</span>
              <span>12. Project Links</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="https://github.com/SaikiranC08/InventoryHub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#2383e2] hover:bg-[#1a70c5] text-white font-medium text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Live Demo</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
              <a 
                href="https://github.com/SaikiranC08/InventoryHub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#f7f7f5] text-[#37352f] font-medium text-[13px] flex items-center gap-1.5 transition-colors"
              >
                <span>GitHub Repository</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
              <button 
                onClick={() => onNavigate('portfolio', 'projects')}
                className="px-4 py-2 rounded-lg border border-transparent hover:bg-[rgba(55,53,47,0.06)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] text-[13px] transition-colors"
              >
                ← Back to Featured Projects
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

/* ─── Searchable Content Data ─── */
const SEARCH_ITEMS = [
  // Projects
  {
    title: 'InventoryHub',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Multi-Business Inventory Management Platform · Java, Spring Boot, PostgreSQL, Docker, Kong API GW',
    target: 'projects',
    page: 'inventoryhub'
  },
  {
    title: 'Expense Tracker',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Full-stack application with Spring Boot, React, MySQL, REST APIs',
    target: 'projects'
  },
  {
    title: 'GitHub AI Tech Lead',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Multi-agent system with intelligent orchestration and automated code reviews',
    target: 'projects'
  },
  {
    title: 'Analytical Manager',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Kafka-based event-driven distributed data analytics pipeline',
    target: 'projects'
  },
  {
    title: 'URL Shortener',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'High-throughput URL shortening service using Redis caching & Spring Boot',
    target: 'projects'
  },
  {
    title: 'AI Chatbot',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Conversational assistant with Spring Boot backend and WebSocket streaming',
    target: 'projects'
  },
  // Technical Stack - Backend
  {
    title: 'Java',
    category: 'Technical Stack',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'Core Java, Collections, Multithreading, Streams API, OOP Principles',
    target: 'skills'
  },
  {
    title: 'Spring Boot',
    category: 'Technical Stack',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'Enterprise REST services, Dependency Injection, Microservices',
    target: 'skills'
  },
  {
    title: 'Spring Security & JWT',
    category: 'Technical Stack',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'Token-based authentication, authorization filters, role-based access control',
    target: 'skills'
  },
  {
    title: 'Microservices Architecture',
    category: 'Technical Stack',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'Service discovery, Kong API gateway, inter-service REST communication',
    target: 'skills'
  },
  {
    title: 'REST APIs',
    category: 'Technical Stack',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'RESTful API design, HTTP status standards, OpenAPI / Swagger documentation',
    target: 'skills'
  },
  // Technical Stack - Data & Messaging
  {
    title: 'PostgreSQL',
    category: 'Technical Stack',
    catColor: 'bg-[#e8deee] text-[#5c3882]',
    desc: 'Relational database design, indexes, query optimization, ACID transactions',
    target: 'skills'
  },
  {
    title: 'Apache Kafka',
    category: 'Technical Stack',
    catColor: 'bg-[#e8deee] text-[#5c3882]',
    desc: 'Distributed streaming, message brokers, pub/sub event architecture',
    target: 'skills'
  },
  {
    title: 'Redis',
    category: 'Technical Stack',
    catColor: 'bg-[#e8deee] text-[#5c3882]',
    desc: 'In-memory caching, distributed session state, fast key-value storage',
    target: 'skills'
  },
  // Technical Stack - DevOps
  {
    title: 'Docker',
    category: 'Technical Stack',
    catColor: 'bg-[#e3e2e0] text-[#32302c]',
    desc: 'Containerization, Docker Compose, isolated environment configurations',
    target: 'skills'
  },
  {
    title: 'Git & GitHub Actions',
    category: 'Technical Stack',
    catColor: 'bg-[#e3e2e0] text-[#32302c]',
    desc: 'Version control workflows, CI/CD automated build & test pipelines',
    target: 'skills'
  },
  // Technical Stack - Frontend
  {
    title: 'React',
    category: 'Technical Stack',
    catColor: 'bg-[#dbeddb] text-[#286644]',
    desc: 'Modern SPA development, state management, hooks, responsive UI',
    target: 'skills'
  },
  // Experience
  {
    title: 'Software Engineering Experience',
    category: 'Experience',
    catColor: 'bg-[#fdecc8] text-[#8f632d]',
    desc: 'Backend systems engineering, REST API development, database optimization',
    target: 'experience'
  },
  // Education
  {
    title: 'B.E. Computer Science & Design',
    category: 'Education',
    catColor: 'bg-[#d3e5ef] text-[#205d86]',
    desc: 'NHITM · Mumbai University (2022–2026) · CGPA: 8.0/10 · DSA, DBMS, OS, Networks',
    target: 'education'
  },
  // Fast-Track / Contact
  {
    title: 'Resume (PDF)',
    category: 'Fast-Track',
    catColor: 'bg-[#dbeddb] text-[#286644]',
    desc: 'Download Saikiran Chevula Resume PDF',
    target: 'resume'
  },
  {
    title: 'Get In Touch / Contact',
    category: 'Contact',
    catColor: 'bg-[#edf3f8] text-[#205d86]',
    desc: 'schevula26@gmail.com · Direct email and professional connection channels',
    target: 'contact'
  }
];

/* ─── Sidebar Component ─── */
function Sidebar({ 
  open, 
  onToggle, 
  collapsed, 
  onToggleCollapse, 
  onOpenSearch, 
  activePage, 
  activeSection = 'about',
  onNavigate 
}) {
  const isSectionActive = (sectionId) => {
    if (activePage !== 'portfolio') return false;
    if (sectionId === 'about') {
      return activeSection === 'about' || !activeSection;
    }
    return activeSection === sectionId;
  };

  const getNavItemClass = (sectionId) => {
    const active = isSectionActive(sectionId);
    const layout = collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1';
    const state = active
      ? 'bg-[rgba(55,53,47,0.08)] font-semibold text-[#37352f]'
      : 'hover:bg-[rgba(55,53,47,0.06)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] font-normal';
    return `flex items-center rounded transition-colors ${layout} ${state}`;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/25 z-40 md:hidden backdrop-blur-[1px] transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sticky / Fixed Global Sidebar */}
      <aside
        className={`bg-[#f7f7f5] border-r border-[#e9e9e7] flex flex-col justify-between select-none z-40 transition-all duration-200 ease-in-out
          fixed inset-y-0 left-0 h-screen md:static shadow-xl md:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-[56px] w-[270px] max-w-[82vw]' : 'w-[270px] max-w-[82vw] md:w-[240px] shrink-0'}
        `}
      >
        {/* Top & Navigation Area with independent scrolling */}
        <div className="p-2.5 overflow-y-auto overflow-x-hidden flex-1">
          
          {/* Header row */}
          {collapsed ? (
            /* Collapsed Header: ONLY Single Toggle Icon (›) */
            <div className="flex flex-col items-center mb-3">
              <button
                onClick={onToggleCollapse}
                className="w-9 h-9 flex items-center justify-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          ) : (
            /* Expanded Header: Workspace title + single collapse chevron (‹) */
            <div className="flex items-center justify-between p-1.5 rounded hover:bg-[rgba(55,53,47,0.08)] cursor-pointer text-[#37352f] text-[14px] font-semibold mb-2">
              <div 
                className="flex items-center gap-2 overflow-hidden flex-1"
                onClick={() => onNavigate('portfolio')}
              >
                <div className="w-5 h-5 rounded bg-[#37352f] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  S
                </div>
                <span className="truncate">Saikiran's Workspace</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse();
                }}
                className="p-1 rounded hover:bg-[rgba(55,53,47,0.12)] text-[rgba(55,53,47,0.45)] hover:text-[#37352f] transition-colors shrink-0 ml-1 hidden md:flex items-center justify-center"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={onToggle}
                className="p-1 rounded hover:bg-[rgba(55,53,47,0.12)] text-[rgba(55,53,47,0.45)] hover:text-[#37352f] transition-colors shrink-0 ml-1 md:hidden flex items-center justify-center"
                title="Close menu"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Quick Actions (Search & Updates) */}
          <div className="space-y-0.5 text-[13px] text-[#37352f]">
            <button 
              className={`w-full flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors text-left ${
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1'
              }`}
              onClick={onOpenSearch}
              title="Search (⌘K)"
              aria-label="Search portfolio"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Search</span>
                  <kbd className="text-[10px] font-mono text-[rgba(55,53,47,0.4)] border border-[#e9e9e7] px-1 py-0.2 rounded bg-white">⌘K</kbd>
                </div>
              )}
            </button>
            <button 
              className={`w-full flex items-center rounded transition-colors text-left ${
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1'
              } ${
                activePage === 'updates' ? 'bg-[rgba(55,53,47,0.08)] font-semibold text-[#37352f]' : 'hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]'
              }`}
              onClick={() => onNavigate('updates')}
              title="Updates"
              aria-label="View changelog updates"
            >
              <span className="material-symbols-outlined text-[18px]">update</span>
              {!collapsed && <span>Updates</span>}
            </button>
          </div>

          {/* Divider in collapsed mode */}
          {collapsed && <div className="my-3 border-t border-[#e9e9e7]" />}

          {/* Workspace Pages (Main sections) */}
          <div className="mt-4">
            {!collapsed && (
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)]">
                Workspace Pages
              </div>
            )}
            <nav className="mt-1 space-y-0.5 text-[13px] text-[#37352f]">
              <a 
                className={getNavItemClass('about')} 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'about');
                }}
                title="Developer Portfolio"
                aria-label="Developer Portfolio"
              >
                <span className="text-[15px] shrink-0">🎓</span>
                {!collapsed && <span className="truncate">Developer Portfolio</span>}
              </a>
              <a 
                className={getNavItemClass('projects')} 
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'projects');
                }}
                title="Projects Gallery"
                aria-label="Projects Gallery"
              >
                <span className="text-[15px] shrink-0">📁</span>
                {!collapsed && <span className="truncate">Projects Gallery</span>}
              </a>
              <a 
                className={getNavItemClass('experience')} 
                href="#experience"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'experience');
                }}
                title="Engineering Experience"
                aria-label="Engineering Experience"
              >
                <span className="text-[15px] shrink-0">🛠</span>
                {!collapsed && <span className="truncate">Engineering Experience</span>}
              </a>
              <a 
                className={getNavItemClass('skills')} 
                href="#skills"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'skills');
                }}
                title="Technical Stack"
                aria-label="Technical Stack"
              >
                <span className="text-[15px] shrink-0">🛠</span>
                {!collapsed && <span className="truncate">Technical Stack</span>}
              </a>
              <a 
                className={getNavItemClass('education')} 
                href="#education"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'education');
                }}
                title="Education"
                aria-label="Education"
              >
                <span className="text-[15px] shrink-0">🎓</span>
                {!collapsed && <span className="truncate">Education</span>}
              </a>
              <a 
                className={getNavItemClass('contact')} 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'contact');
                }}
                title="Get In Touch"
                aria-label="Get In Touch"
              >
                <span className="text-[15px] shrink-0">📬</span>
                {!collapsed && <span className="truncate">Get In Touch</span>}
              </a>
            </nav>
          </div>

          {/* Divider in collapsed mode */}
          {collapsed && <div className="my-3 border-t border-[#e9e9e7]" />}

          {/* Recruiter Fast-Track */}
          <div className="mt-5">
            {!collapsed && (
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)]">
                Recruiter Fast-Track
              </div>
            )}
            <div className="mt-1 space-y-0.5 text-[13px]">
              <a 
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'justify-between px-2 py-1'
                }`} 
                href="https://github.com/SaikiranC08"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Profile (opens in new tab)"
                aria-label="GitHub Profile"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[13px] text-[rgba(55,53,47,0.45)] shrink-0">↗</span>
                  {!collapsed && <span>GitHub Profile</span>}
                </span>
                {!collapsed && <span className="material-symbols-outlined text-[13px] text-[rgba(55,53,47,0.45)]">open_in_new</span>}
              </a>
              <a 
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'justify-between px-2 py-1'
                }`} 
                href="https://www.linkedin.com/in/saikiran-chevula/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile (opens in new tab)"
                aria-label="LinkedIn Profile"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[13px] text-[rgba(55,53,47,0.45)] shrink-0">↗</span>
                  {!collapsed && <span>LinkedIn</span>}
                </span>
                {!collapsed && <span className="material-symbols-outlined text-[13px] text-[rgba(55,53,47,0.45)]">open_in_new</span>}
              </a>
              <a 
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'justify-between px-2 py-1'
                }`} 
                href="#resume"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('portfolio', 'resume');
                }}
                title="Resume (PDF)"
                aria-label="Resume (PDF)"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)] shrink-0">description</span>
                  {!collapsed && <span>Resume (PDF)</span>}
                </span>
                {!collapsed && <span className="text-[10px] bg-[#dbeddb] text-[#286644] px-1.5 py-0.5 rounded font-medium">Updated</span>}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Profile */}
        <div className={`border-t border-[#e9e9e7] ${collapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          <div 
            className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] cursor-pointer transition-colors ${
              collapsed ? 'justify-center p-1' : 'gap-2.5 p-1'
            }`}
            onClick={() => onNavigate('portfolio')}
            title="Saikiran Chevula · Software Developer"
            aria-label="Profile: Saikiran Chevula"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#e9e9e7] bg-[#f1f1ef] flex items-center justify-center text-[10px] font-bold text-[#37352f] shrink-0">
              SC
            </div>
            {!collapsed && (
              <div className="text-[12px] truncate">
                <div className="font-medium text-[#37352f] leading-none">Saikiran Chevula</div>
                <div className="text-[10px] text-[rgba(55,53,47,0.45)] mt-0.5">Software Developer</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Main App ─── */
export default function App() {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('portfolio_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      try {
        const saved = localStorage.getItem('portfolio_theme');
        if (!saved) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {}
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [skillFilter, setSkillFilter] = useState('all');
  const [activePage, setActivePage] = useState('portfolio'); // 'portfolio' or 'updates'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const [hasAnimated, setHasAnimated] = useState(() => {
    try {
      return sessionStorage.getItem('hero_animated_seen') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        try {
          sessionStorage.setItem('hero_animated_seen', 'true');
        } catch {}
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

  // Keyboard shortcut listener: Cmd/Ctrl+K to toggle search, Escape to close search / mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const [toast, setToast] = useState({ visible: false, message: 'Email copied to clipboard!', icon: 'check_circle' });
  const toastTimerRef = useRef(null);

  const showToast = (message = 'Email copied to clipboard!', icon = 'check_circle') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, icon });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Appreciation state & micro-feedback bubble
  const [appreciationCount, setAppreciationCount] = useState(0);
  const [isAppreciated, setIsAppreciated] = useState(() => {
    try {
      return sessionStorage.getItem('portfolio_appreciated') === 'true';
    } catch {
      return false;
    }
  });
  const [isSubmittingAppreciation, setIsSubmittingAppreciation] = useState(false);
  const [isHeartPulsing, setIsHeartPulsing] = useState(false);

  // Micro speech-bubble state directly below heart
  const [bubble, setBubble] = useState({
    visible: false,
    status: 'hidden', // 'entering' | 'visible' | 'leaving' | 'hidden'
    message: ''
  });
  const bubbleTimerRef = useRef(null);
  const bubbleHideTimerRef = useRef(null);

  const triggerBubble = (message) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    if (bubbleHideTimerRef.current) clearTimeout(bubbleHideTimerRef.current);

    setBubble({
      visible: true,
      status: 'entering',
      message
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBubble(prev => ({ ...prev, status: 'visible' }));
      });
    });

    // Stay visible for ~2s, then fade out over 200ms
    bubbleTimerRef.current = setTimeout(() => {
      setBubble(prev => ({ ...prev, status: 'leaving' }));
      bubbleHideTimerRef.current = setTimeout(() => {
        setBubble({ visible: false, status: 'hidden', message: '' });
      }, 200);
    }, 2000);
  };

  useEffect(() => {
    let isMounted = true;
    fetchAppreciationCount().then((res) => {
      if (isMounted && res.success && typeof res.count === 'number') {
        setAppreciationCount(res.count);
      }
    });
    return () => {
      isMounted = false;
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (bubbleHideTimerRef.current) clearTimeout(bubbleHideTimerRef.current);
    };
  }, []);

  const handleToggleAppreciate = async () => {
    if (isSubmittingAppreciation) return;

    const nextLiked = !isAppreciated;

    // Small scale transition on heart
    setIsHeartPulsing(true);
    setTimeout(() => setIsHeartPulsing(false), 220);

    // Optimistic toggle & speech-bubble feedback
    setIsAppreciated(nextLiked);

    if (nextLiked) {
      setAppreciationCount(prev => prev + 1);
      triggerBubble("Thanks for the love!");
      try {
        sessionStorage.setItem('portfolio_appreciated', 'true');
      } catch {}
    } else {
      setAppreciationCount(prev => Math.max(0, prev - 1));
      triggerBubble("Changed your mind? No worries.");
      try {
        sessionStorage.removeItem('portfolio_appreciated');
      } catch {}
    }

    // Background sync with API
    setIsSubmittingAppreciation(true);
    const action = nextLiked ? 'like' : 'unlike';
    const res = await submitAppreciation(action);

    if (res.success && typeof res.count === 'number') {
      setAppreciationCount(res.count);
    }
    setIsSubmittingAppreciation(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Portfolio link copied to clipboard!', 'link');
    }
  };

  const [activeSection, setActiveSection] = useState('about');
  const mainScrollRef = useRef(null);

  useEffect(() => {
    if (activePage !== 'portfolio') return;
    const mainEl = mainScrollRef.current || document.querySelector('main');
    if (!mainEl) return;

    const sectionIds = ['about', 'projects', 'experience', 'skills', 'education', 'contact'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: mainEl,
        rootMargin: '-15% 0px -55% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (mainEl.scrollTop < 60) {
        setActiveSection('about');
      } else if (mainEl.scrollHeight - mainEl.scrollTop - mainEl.clientHeight < 60) {
        setActiveSection('contact');
      }
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      mainEl.removeEventListener('scroll', handleScroll);
    };
  }, [activePage]);

  const handleNavigate = (page, targetId) => {
    setActivePage(page);
    setSidebarOpen(false);
    if (targetId) {
      setActiveSection(targetId);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else if (page === 'portfolio') {
      setActiveSection('about');
      const mainEl = mainScrollRef.current || document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Filtered search results
  const filteredSearch = searchQuery.trim() === ''
    ? SEARCH_ITEMS
    : SEARCH_ITEMS.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* GLOBAL STICKY SIDEBAR */}
      <Sidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSearch={() => setSearchOpen(true)}
        activePage={activePage}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* MAIN WORKSPACE WRAPPER */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Top Breadcrumb Toolbar */}
        <header className="h-11 shrink-0 border-b border-[#e9e9e7] bg-white/95 backdrop-blur z-20 px-4 flex items-center justify-between text-[13px] text-[#37352f]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <button 
              className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] md:hidden mr-1 shrink-0" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[18px]">menu</span>
            </button>
            <span 
              className="hidden sm:inline text-[rgba(55,53,47,0.65)] hover:underline cursor-pointer truncate"
              onClick={() => handleNavigate('portfolio')}
            >
              Saikiran's Workspace
            </span>
            <span className="hidden sm:inline text-[rgba(55,53,47,0.45)]">/</span>
            {activePage === 'inventoryhub' ? (
              <>
                <span 
                  className="hidden md:inline text-[rgba(55,53,47,0.65)] hover:underline cursor-pointer truncate"
                  onClick={() => handleNavigate('portfolio', 'projects')}
                >
                  Developer Portfolio
                </span>
                <span className="hidden md:inline text-[rgba(55,53,47,0.45)]">/</span>
                <span 
                  className="font-medium text-[#37352f] truncate cursor-pointer hover:underline"
                  onClick={() => handleNavigate('inventoryhub')}
                >
                  InventoryHub
                </span>
              </>
            ) : (
              <span 
                className="font-medium text-[#37352f] truncate cursor-pointer hover:underline"
                onClick={() => handleNavigate(activePage)}
              >
                {activePage === 'updates' ? 'Updates' : 'Developer Portfolio'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 text-[rgba(55,53,47,0.65)]">
            <button 
              className="px-1.5 sm:px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1 text-[12px]"
              onClick={() => setSearchOpen(true)}
              title="Search portfolio (⌘K)"
              aria-label="Search portfolio"
            >
              <span className="material-symbols-outlined text-[15px]">search</span>
              <span className="hidden sm:inline">Search</span>
            </button>
            <button 
              className="px-1.5 sm:px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1 text-[12px] transition-colors"
              onClick={handleShare}
              title="Share portfolio link"
              aria-label="Share portfolio link"
            >
              Share
            </button>
            {/* Heart Action & Micro Speech-Bubble Container */}
            <div className="relative inline-flex items-center">
              <button 
                onClick={handleToggleAppreciate}
                disabled={isSubmittingAppreciation}
                className={`h-7 px-1.5 py-0.5 rounded flex items-center gap-1 transition-all duration-150 text-[12px] select-none ${
                  isAppreciated 
                    ? 'text-[#e03e3e] hover:bg-[#ffebee]/60' 
                    : 'text-[rgba(55,53,47,0.65)] hover:text-[#e03e3e] hover:bg-[rgba(55,53,47,0.08)]'
                } ${isSubmittingAppreciation ? 'opacity-80' : 'cursor-pointer'}`}
                aria-label={isAppreciated ? "Remove appreciation" : "Appreciate this portfolio"}
              >
                <span 
                  className={`material-symbols-outlined text-[18px] leading-none transition-transform duration-200 ease-out inline-block motion-reduce:transition-none motion-reduce:transform-none ${
                    isHeartPulsing ? 'scale-[1.14]' : 'scale-100'
                  }`}
                  style={{ fontVariationSettings: isAppreciated ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                {appreciationCount >= APPRECIATION_DISPLAY_THRESHOLD && (
                  <span className="font-medium text-[11px] leading-none text-[#37352f]">
                    {appreciationCount}
                  </span>
                )}
              </button>

              {/* Micro Speech-Bubble Feedback directly below heart */}
              {bubble.visible && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`absolute top-full right-0 mt-1 z-50 pointer-events-none select-none flex flex-col items-end transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                    bubble.status === 'entering'
                      ? 'opacity-0 -translate-y-[3px] scale-[0.98]'
                      : bubble.status === 'visible'
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 -translate-y-[2px] scale-100'
                  }`}
                >
                  {/* Tiny triangular pointer connecting to heart */}
                  <div 
                    className="w-0 h-0 border-x-[4px] border-x-transparent border-b-[5px] border-b-[#37352f] mr-[10px]"
                    aria-hidden="true"
                  />
                  {/* Bubble pill */}
                  <div className="bg-[#37352f] text-white text-[11.5px] font-medium px-2.5 py-1 rounded-[6px] shadow-md whitespace-nowrap leading-none tracking-tight">
                    {bubble.message}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-7 w-7 rounded flex items-center justify-center text-[rgba(55,53,47,0.65)] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] transition-colors select-none"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined text-[17px] leading-none">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

          </div>
        </header>

        {/* VIEW CONDITIONAL: UPDATES PAGE VS PORTFOLIO */}
        {activePage === 'updates' ? (
          <main className="w-full overflow-y-auto pb-28">
            <div className="max-w-[760px] mx-auto px-4 sm:px-12 py-8 sm:py-14">
              
              {/* Back to portfolio */}
              <div className="mb-6">
                <button 
                  onClick={() => handleNavigate('portfolio')}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[rgba(55,53,47,0.6)] hover:text-[#37352f] px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.06)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Developer Portfolio</span>
                </button>
              </div>

              {/* Page Title & Subtitle */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[26px]">🕒</span>
                <h1 className="text-[32px] sm:text-[36px] font-bold text-[#37352f] tracking-tight">
                  Updates
                </h1>
              </div>
              <p className="text-[15px] text-[rgba(55,53,47,0.65)] mb-8">
                Recent changes to my portfolio, projects, and engineering work.
              </p>

              {/* Chronological Changelog */}
              <div className="space-y-8">
                
                {/* September 2026 */}
                <div className="border-l-2 border-[#e9e9e7] pl-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#37352f] font-mono">September 2026</span>
                    <span className="text-[10px] bg-[#dbeddb] text-[#286644] px-1.5 py-0.5 rounded font-medium">Latest</span>
                  </div>
                  <ul className="space-y-3 text-[14px] text-[#37352f]">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Updated Technical Stack &amp; 3D Visualization</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Restructured skill hierarchy for Java &amp; Spring Boot backend focus, added category filters, and streamlined tech stack cards.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Added InventoryHub Project Details</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Documented microservices architecture, REST endpoints, Docker containerization, and Kong API Gateway integration.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Updated Resume &amp; Recruiter Fast-Track</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Refined direct access to updated PDF resume, LinkedIn profile, and active GitHub repositories.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Improved Portfolio Navigation &amp; Workspace Search</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Added Notion-style global search overlay (⌘K) and dedicated updates changelog page.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* August 2026 */}
                <div className="border-l-2 border-[#e9e9e7] pl-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#37352f] font-mono">August 2026</span>
                  </div>
                  <ul className="space-y-3 text-[14px] text-[#37352f]">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Added GitHub AI Tech Lead Project</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Designed multi-agent autonomous engineering workflow architecture and automated review workflows.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Updated Project Documentation &amp; Technical Specs</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Added comprehensive system design diagrams and API contracts for backend services.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[rgba(55,53,47,0.45)] select-none mt-0.5">→</span>
                      <div>
                        <strong className="font-semibold">Added Engineering Experience &amp; Academic Background</strong>
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] mt-0.5">
                          Included B.E. in Computer Science &amp; Design coursework and backend engineering internship details.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Updates Page Footer */}
              <footer className="mt-16 pt-6 border-t border-[#e9e9e7] flex items-center justify-between text-[12px] text-[rgba(55,53,47,0.45)] select-none">
                <span>Changelog maintained in Notion workspace format</span>
                <button 
                  onClick={() => handleNavigate('portfolio')}
                  className="hover:text-[#37352f] underline"
                >
                  Return to Portfolio
                </button>
              </footer>
            </div>
          </main>
        ) : activePage === 'inventoryhub' ? (
          <InventoryHubDetailPage onNavigate={handleNavigate} />
        ) : (
          /* MAIN PORTFOLIO DOCUMENT */
          <main ref={mainScrollRef} className="w-full overflow-y-auto pb-28 scroll-smooth">
          
          {/* INITIAL / HERO VIEWPORT */}
          <section id="about" className="min-h-[calc(100vh-44px)] min-h-[calc(100dvh-44px)] flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-12 text-center select-none">
            
            {/* 1. MINIMAL CIRCULAR AVATAR / PROFILE */}
            <div className={`mb-3.5 sm:mb-4 inline-block ${hasAnimated ? '' : 'hero-anim-1'}`}>
              <div className="w-[116px] h-[116px] sm:w-[136px] sm:h-[136px] rounded-full bg-[#f7f7f5] border border-[#e2e2df] p-1 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)] select-none flex items-center justify-center">
                <img 
                  src="/protofilo_Image.png" 
                  alt="Saikiran Chevula" 
                  className="w-full h-full object-cover rounded-full"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

            {/* 2. NAME */}
            <h1 className={`text-[30px] sm:text-[44px] font-bold text-[#37352f] tracking-tight leading-tight mb-1 ${hasAnimated ? '' : 'hero-anim-2'}`}>
              Saikiran Chevula
            </h1>

            {/* 3. PROFESSIONAL IDENTITY */}
            <p className={`text-[17px] sm:text-[20px] font-medium text-[#37352f] mb-1 ${hasAnimated ? '' : 'hero-anim-3'}`}>
              Software Developer
            </p>

            {/* 4. SHORT TECHNICAL IDENTITY */}
            <p className={`text-[13.5px] sm:text-[15px] text-[rgba(55,53,47,0.55)] font-normal mb-1.5 max-w-[340px] sm:max-w-none mx-auto ${hasAnimated ? '' : 'hero-anim-4'}`}>
              Java · Spring Boot · Backend &amp; Full-Stack
            </p>

            {/* 5. DOTTED ARROW */}
            <div className={`flex justify-center text-[rgba(55,53,47,0.45)] my-1 sm:my-2 ${hasAnimated ? '' : 'hero-anim-5'}`}>
              <svg width="40" height="54" viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible max-w-full hero-arrow-animated">
                <path className="hero-arrow-path" d="M14 2 C14 18, 18 28, 22 40" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
                <path d="M16 36 L23 43 L25 34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 6 & 7. WHO I AM SECTION */}
            <div className="w-full max-w-[540px] rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(55,53,47,0.05)] text-[11px] font-semibold text-[rgba(55,53,47,0.6)] uppercase tracking-wider mb-1.5 font-mono ${hasAnimated ? '' : 'hero-anim-6'}`}>
                Who I Am
              </div>
              <p className={`text-[14px] sm:text-[15px] text-[#37352f] leading-relaxed font-normal ${hasAnimated ? '' : 'hero-anim-7'}`}>
                Software developer focused on building practical backend and full-stack applications with Java and Spring Boot.
              </p>
            </div>

            {/* 8. SUBTLE SCROLL CUE */}
            <a 
              href="#projects" 
              className={`mt-6 sm:mt-8 flex flex-col items-center gap-1 text-[rgba(55,53,47,0.45)] hover:text-[#37352f] transition-colors cursor-pointer group ${hasAnimated ? '' : 'hero-anim-8'}`}
              aria-label="Explore Projects"
            >
              <div className="flex flex-col items-center gap-1 scroll-cue-animated">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                <span className="material-symbols-outlined text-[22px] leading-none transition-transform group-hover:translate-y-1">
                  arrow_downward
                </span>
              </div>
              <span className="text-[11px] font-mono tracking-wider text-[rgba(55,53,47,0.5)] group-hover:text-[#37352f] transition-colors">
                Explore
              </span>
            </a>
          </section>

          {/* MAIN WORKSPACE CONTENT (Revealed on Scroll) */}
          <div className="max-w-[920px] mx-auto px-4 sm:px-12">

            {/* ───────── PROJECTS SECTION ───────── */}
            <section className="py-10 sm:py-16 md:py-20 scroll-mt-4 sm:scroll-mt-6" id="projects">
              {/* Section Header & Subtitle */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px]">🗂️</span>
                  <h2 className="text-[20px] font-bold text-[#37352f]">Featured Projects</h2>
                </div>
                <p className="text-[13px] text-[rgba(55,53,47,0.65)]">
                  Selected systems I&apos;ve designed and built.
                </p>
              </div>

              {/* Curated Gallery View Indicator */}
              <div className="flex items-center border-b border-[#e9e9e7] mb-6 text-[13px]">
                <div className="flex items-center gap-1.5 py-2 font-medium text-[#37352f] border-b-2 border-[#37352f] -mb-[1px]">
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                  <span>Gallery View</span>
                </div>
              </div>

              {/* Gallery Grid (Dynamically balances single or multiple projects) */}
              <div className={PROJECTS.length === 1 ? "max-w-[720px] mx-auto w-full" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
                {PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleNavigate(project.id)}
                    className="group rounded-lg border border-[#e9e9e7] bg-white hover:border-[#d0d0cc] hover:-translate-y-[2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(project.id);
                      }
                    }}
                  >
                    {/* PROJECT VISUAL / PREVIEW */}
                    <div className="w-full bg-[#fbfbfa] border-b border-[#e9e9e7] overflow-hidden select-none relative">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.imageAlt || `${project.name} preview`} 
                          className="w-full h-40 sm:h-44 object-cover object-top"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div style={{ display: project.image ? 'none' : 'block' }}>
                        {project.visual || <InventoryHubProductVisual />}
                      </div>
                    </div>

                    {/* CARD DETAILS */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category + Status */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-mono font-medium text-[rgba(55,53,47,0.65)] bg-[#f1f1ef] px-2 py-0.5 rounded border border-[#e9e9e7]">
                            {project.category}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-[#286644] bg-[#dbeddb] px-2 py-0.5 rounded flex items-center gap-1">
                            {project.status}
                          </span>
                        </div>

                        {/* Project Title */}
                        <h3 className="font-bold text-[17px] text-[#37352f] group-hover:text-[#2383e2] transition-colors leading-snug">
                          {project.name}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-[13px] font-medium text-[rgba(55,53,47,0.7)] mt-0.5 mb-2.5">
                          {project.subtitle}
                        </p>

                        {/* Short Description */}
                        <p className="text-[13px] text-[rgba(55,53,47,0.65)] leading-relaxed mb-3.5">
                          {project.description}
                        </p>

                        {/* Technology Tags (Subtle tinted Notion pills) */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies.map((tech) => (
                            <span 
                              key={tech} 
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${getTechTagClass(tech)}`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Divider & Text Links */}
                      <div className="pt-3 border-t border-[#f1f1ef] flex items-center justify-between text-[12px] flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-[rgba(55,53,47,0.65)]">
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[12px] font-medium text-[rgba(55,53,47,0.75)] hover:text-[#2383e2] hover:underline flex items-center gap-0.5 transition-colors py-1"
                          >
                            <span>Live Demo</span>
                            <span className="text-[11px]">↗</span>
                          </a>
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[12px] font-medium text-[rgba(55,53,47,0.75)] hover:text-[#2383e2] hover:underline flex items-center gap-0.5 transition-colors py-1"
                          >
                            <span>GitHub</span>
                            <span className="text-[11px]">↗</span>
                          </a>
                        </div>
                        <span className="text-[11px] text-[rgba(55,53,47,0.4)] flex items-center gap-0.5 group-hover:text-[#37352f] transition-colors py-1">
                          <span>Details</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-b border-[#e9e9e7]"></div>

            {/* ───────── EXPERIENCE SECTION ───────── */}
            <section className="py-10 sm:py-16 md:py-20 scroll-mt-4 sm:scroll-mt-6" id="experience">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px]">🛠️</span>
                  <h2 className="text-[20px] font-bold text-[#37352f]">Engineering Experience</h2>
                </div>
                <p className="text-[13px] text-[rgba(55,53,47,0.65)]">
                  Hands-on experience building backend, full-stack, and distributed applications.
                </p>
              </div>

              {/* 2x2 Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Backend Engineering */}
                <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 hover:bg-white hover:border-[#d0d0cc] hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#daf1ea] text-[#1b6e56]">
                        Backend Engineering
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#37352f] mb-3">
                      Backend Engineering
                    </h3>
                    <ul className="space-y-2 text-[13px] text-[rgba(55,53,47,0.7)] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Designed and implemented <strong className="text-[#37352f] font-semibold">RESTful APIs</strong> using <strong className="text-[#37352f] font-semibold">Java and Spring Boot</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Built CRUD workflows with <strong className="text-[#37352f] font-semibold">validation, exception handling</strong>, and <strong className="text-[#37352f] font-semibold">transactional business logic</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Worked with <strong className="text-[#37352f] font-semibold">Spring Data JPA</strong> and <strong className="text-[#37352f] font-semibold">Hibernate</strong> for relational data access and persistence.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Developed backend services for applications including inventory, expense tracking, URL shortening, and AI-powered workflows.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 2: API & Security */}
                <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 hover:bg-white hover:border-[#d0d0cc] hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e8deee] text-[#5c3882]">
                        API &amp; Security
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#37352f] mb-3">
                      API &amp; Security
                    </h3>
                    <ul className="space-y-2 text-[13px] text-[rgba(55,53,47,0.7)] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Designed <strong className="text-[#37352f] font-semibold">REST API contracts</strong> and structured endpoints around business workflows.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Implemented authentication using <strong className="text-[#37352f] font-semibold">Spring Security</strong> and <strong className="text-[#37352f] font-semibold">JWT</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Worked with <strong className="text-[#37352f] font-semibold">stateless authentication</strong>, request validation, authorization checks, and secure API access.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Integrated <strong className="text-[#37352f] font-semibold">API Gateway patterns</strong> for centralized routing and request handling.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 3: Distributed Systems */}
                <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 hover:bg-white hover:border-[#d0d0cc] hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fadec9] text-[#854c1d]">
                        Distributed Systems
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#37352f] mb-3">
                      Distributed Systems
                    </h3>
                    <ul className="space-y-2 text-[13px] text-[rgba(55,53,47,0.7)] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Worked with <strong className="text-[#37352f] font-semibold">microservices architecture</strong> and service-oriented application design.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Implemented <strong className="text-[#37352f] font-semibold">event-driven communication</strong> using <strong className="text-[#37352f] font-semibold">Apache Kafka</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Built <strong className="text-[#37352f] font-semibold">real-time communication</strong> features using <strong className="text-[#37352f] font-semibold">WebSocket and STOMP</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Worked with service integration, <strong className="text-[#37352f] font-semibold">API Gateway routing</strong>, and communication between backend components.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 4: Development & Delivery */}
                <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 hover:bg-white hover:border-[#d0d0cc] hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#dbeddb] text-[#286644]">
                        Development &amp; Delivery
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#37352f] mb-3">
                      Development &amp; Delivery
                    </h3>
                    <ul className="space-y-2 text-[13px] text-[rgba(55,53,47,0.7)] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Wrote service-layer <strong className="text-[#37352f] font-semibold">unit tests</strong> using <strong className="text-[#37352f] font-semibold">JUnit 5 and Mockito</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Used <strong className="text-[#37352f] font-semibold">Git and GitHub</strong> for version control, source management, and development workflows.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Containerized applications using <strong className="text-[#37352f] font-semibold">Docker</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[rgba(55,53,47,0.4)] select-none leading-[1.3] text-[15px]">•</span>
                        <span>Built <strong className="text-[#37352f] font-semibold">CI/CD workflows</strong> with <strong className="text-[#37352f] font-semibold">GitHub Actions</strong> and deployed applications in Linux/cloud environments.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Optional Subtle Engineering Summary */}
              <p className="mt-4 text-[12.5px] text-[rgba(55,53,47,0.55)] leading-relaxed">
                Focused on backend systems, API design, distributed communication, testing, and production-oriented development.
              </p>
            </section>

            <div className="border-b border-[#e9e9e7]"></div>

            {/* ───────── TECHNICAL STACK SECTION ───────── */}
            <section className="py-10 sm:py-16 md:py-20 scroll-mt-4 sm:scroll-mt-6" id="skills">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🛠️</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Technical Stack</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-5">Backend-focused technologies I use to build APIs, distributed systems, and production-ready applications.</p>

              {/* Interactive 3D Technology Map */}
              <TechGlobe activeFilter={skillFilter} theme={theme} />

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 my-4" role="tablist" aria-label="Filter technologies by category">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'backend', label: 'Backend' },
                  { key: 'data', label: 'Data' },
                  { key: 'devops', label: 'DevOps' },
                  { key: 'frontend', label: 'Frontend' },
                ].map(f => (
                  <button
                    key={f.key}
                    role="tab"
                    aria-selected={skillFilter === f.key}
                    onClick={() => setSkillFilter(f.key)}
                    className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors border ${
                      skillFilter === f.key
                        ? f.key === 'backend'
                          ? 'bg-[#d9730d] text-white border-[#d9730d]'
                          : 'bg-[#37352f] text-white border-[#37352f]'
                        : f.key === 'backend'
                          ? 'bg-white text-[#d9730d] border-[#d9730d]/30 hover:bg-[#d9730d]/5'
                          : 'bg-white text-[rgba(55,53,47,0.65)] border-[#e9e9e7] hover:bg-[rgba(55,53,47,0.04)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Technology Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Backend */}
                {(skillFilter === 'all' || skillFilter === 'backend') && <div className="p-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#d9730d]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.5)]">Backend</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Java", "Spring Boot", "Spring Security", "Spring MVC", "REST APIs", "Spring Data JPA", "Hibernate/JPA", "Microservices", "JWT", "WebSocket / STOMP"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>}
                {/* Data & Messaging */}
                {(skillFilter === 'all' || skillFilter === 'data') && <div className="p-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#0b6e99]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.5)]">Data &amp; Messaging</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["PostgreSQL", "MySQL", "Redis", "Kafka"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>}
                {/* DevOps & Infrastructure */}
                {(skillFilter === 'all' || skillFilter === 'devops') && <div className="p-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#6940a5]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.5)]">DevOps &amp; Infrastructure</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Docker", "Git", "GitHub", "GitHub Actions", "Linux", "Azure", "Kong API Gateway", "Postman", "Swagger / OpenAPI"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>}
                {/* Frontend */}
                {(skillFilter === 'all' || skillFilter === 'frontend') && <div className="p-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#0f7b6c]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.5)]">Frontend</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "JavaScript", "HTML", "CSS"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>}
              </div>
            </section>

            <div className="border-b border-[#e9e9e7]"></div>

            {/* ───────── EDUCATION SECTION ───────── */}
            <section className="py-10 sm:py-16 md:py-20 scroll-mt-4 sm:scroll-mt-6" id="education">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🎓</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Education</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">Academic background and foundational coursework.</p>
              <div className="p-4 sm:p-5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[#fadec9] text-[#854c1d]">
                        Academic Background
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold font-mono bg-[#dbeddb] text-[#286644]">
                        CGPA: 8.0 / 10
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#37352f]">B.E. Computer Science &amp; Design</h3>
                    <div className="text-[13px] text-[rgba(55,53,47,0.65)] font-medium mt-0.5">New Horizon Institute of Technology and Management (NHITM) · Mumbai University</div>
                  </div>
                  <span className="text-[12px] font-mono text-[rgba(55,53,47,0.45)] bg-white border border-[#e9e9e7] px-2 py-0.5 rounded shrink-0 self-start mt-1 sm:mt-0">
                    2022 – 2026
                  </span>
                </div>
                <div className="pt-3 border-t border-[#e9e9e7]">
                  <div className="text-[12px] font-semibold text-[#37352f] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[rgba(55,53,47,0.45)]">menu_book</span>
                    <span>Relevant Coursework</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Data Structures & Algorithms",
                      "Database Management Systems",
                      "Object-Oriented Programming",
                      "Operating Systems",
                      "Computer Networks"
                    ].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded text-[12px] font-medium bg-white text-[#37352f] border border-[#e9e9e7]">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7]"></div>

            {/* ───────── CONTACT SECTION (Blue Callout) ───────── */}
            <section className="py-10 sm:py-16 md:py-20 scroll-mt-4 sm:scroll-mt-6" id="contact">
              <div className="rounded-lg bg-[#edf3f8] border border-[#dbe8f2] p-4 sm:p-5 text-[#37352f]">
                <div className="flex items-start gap-3">
                  <div className="text-[22px] select-none mt-0.5">📬</div>
                  <div className="flex-1">
                    {/* Secondary Availability Status Badge */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#dbeddb] text-[#286644]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#286644]"></span>
                        <span>Open to Software Development Opportunities</span>
                      </span>
                    </div>

                    <h3 className="text-[17px] font-bold text-[#205d86] mb-1">
                      Let&apos;s build something.
                    </h3>
                    <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4 leading-relaxed">
                      Open to conversations about software development opportunities, interesting projects, and engineering work.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                      <button 
                        className="min-h-[44px] px-3.5 py-2.5 bg-white border border-[#dbe8f2] rounded shadow-sm hover:bg-[#f7f7f5] text-[13px] font-medium text-[#37352f] flex items-center justify-center gap-2 transition-colors"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText('schevula26@gmail.com');
                          }
                          showToast('Email (schevula26@gmail.com) copied!', 'check_circle');
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">content_copy</span>
                        <span>Copy Email</span>
                      </button>
                      <a 
                        className="min-h-[44px] px-3.5 py-2.5 bg-[#2383e2] hover:bg-[#1a70c5] text-white rounded text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm" 
                        href="mailto:schevula26@gmail.com"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Send Email Directly</span>
                      </a>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#dbe8f2]/60 flex items-center text-[12px]" id="resume">
                      <a 
                        href="/Saikiran_Chevula_Resume.pdf" 
                        download="Saikiran_Chevula_Resume.pdf"
                        onClick={() => {
                          showToast('Resume download started', 'download');
                        }}
                        className="inline-flex items-center gap-1.5 font-medium text-[#205d86] hover:underline cursor-pointer py-1.5 min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        <span>Download Resume ↓</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-10 pt-5 border-t border-[#e9e9e7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[rgba(55,53,47,0.45)] select-none mb-8 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>Built with care · Inspired by Notion</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} Saikiran Chevula</span>
              </div>
              <div className="flex items-center gap-3">
                <a className="hover:text-[#37352f] py-1" href="#about">Back to Top ↑</a>
                <span>•</span>
                <a className="hover:text-[#37352f] py-1" href="https://github.com/SaikiranC08" target="_blank" rel="noopener noreferrer">GitHub</a>
                <span>•</span>
                <a className="hover:text-[#37352f] py-1" href="https://www.linkedin.com/in/saikiran-chevula/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </footer>
          </div>
        </main>
      )}
      </div>

      {/* SEARCH MODAL OVERLAY */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1.5px] flex items-start justify-center pt-3 sm:pt-20 px-3 sm:px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="w-full max-w-[560px] bg-white rounded-xl shadow-2xl border border-[#e9e9e7] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[75vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-[#e9e9e7] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[rgba(55,53,47,0.45)]">search</span>
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, technologies, experience..."
                className="flex-1 text-[16px] sm:text-[14px] text-[#37352f] placeholder-[rgba(55,53,47,0.4)] outline-none bg-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.4)] hover:text-[#37352f]"
                  aria-label="Clear search query"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
              <kbd className="text-[11px] font-mono text-[rgba(55,53,47,0.45)] bg-[#f7f7f5] border border-[#e9e9e7] px-1.5 py-0.5 rounded shadow-sm">
                ESC
              </kbd>
            </div>

            {/* Search Results List */}
            <div className="overflow-y-auto p-2 divide-y divide-[#f7f7f5]">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      if (item.page) {
                        handleNavigate(item.page);
                      } else {
                        handleNavigate('portfolio', item.target);
                      }
                    }}
                    className="w-full text-left p-3 sm:p-2.5 rounded-lg hover:bg-[rgba(55,53,47,0.05)] transition-colors flex items-start justify-between gap-3 group min-h-[44px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium text-[#37352f] group-hover:text-[#2383e2] transition-colors truncate">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ${item.catColor}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[12px] text-[rgba(55,53,47,0.55)] truncate">
                        {item.desc}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[14px] text-[rgba(55,53,47,0.3)] group-hover:text-[#37352f] shrink-0 mt-1">
                      arrow_forward
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-[13px] text-[rgba(55,53,47,0.45)]">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="p-2.5 border-t border-[#e9e9e7] bg-[#fbfbfa] flex items-center justify-between text-[11px] text-[rgba(55,53,47,0.45)]">
              <span>Search across projects, technical stack &amp; experience</span>
              <span className="font-mono">Press ↵ to select</span>
            </div>
          </div>
        </div>
      )}
      <div className={`fixed bottom-6 right-6 bg-[#37352f] text-white px-4 py-2 rounded shadow-lg text-[13px] flex items-center gap-2 transition-all duration-200 z-50 ${
        toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}>
        <span className={`material-symbols-outlined text-[16px] ${
          toast.icon === 'favorite' ? 'text-[#ff6b6b]' : toast.icon === 'error_outline' ? 'text-[#ffb74d]' : 'text-[#dbeddb]'
        }`}>
          {toast.icon}
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
