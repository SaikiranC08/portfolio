import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  fetchAppreciationCount, 
  submitAppreciation, 
  APPRECIATION_DISPLAY_THRESHOLD 
} from './services/appreciationService';

/* ─── 3D Tech Globe Component ─── */
function TechGlobe({ activeFilter }) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const globeRef = useRef(null);

  // Store references for filter updates
  const nodesRef = useRef([]);
  const arcsRef = useRef([]);
  const arcStreamsRef = useRef([]);

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
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.insertBefore(renderer.domElement, container.firstChild);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeRef.current = globeGroup;

    const GLOBE_RADIUS = 75;

    // Solid globe sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xf7f6f3,
      transparent: true,
      opacity: 0.85
    });
    globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xdfdeda,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    globeGroup.add(new THREE.Mesh(sphereGeo, wireMat));

    // Orbital ring
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.15, GLOBE_RADIUS * 1.16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd3d1cb,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    globeGroup.add(ring);

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
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredSprite = null;

    function onPointerDown(e) {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hoveredSprite !== hit) {
          // Reset previous
          if (hoveredSprite && hoveredSprite.userData.marker) {
            hoveredSprite.userData.marker.scale.set(1, 1, 1);
          }
          hoveredSprite = hit;
          container.style.cursor = 'pointer';
          // Highlight hovered node
          if (hit.userData.marker) {
            hit.userData.marker.scale.set(1.6, 1.6, 1.6);
          }
          const data = hit.userData;
          if (tooltip) {
            tooltip.innerHTML = `<div style="font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px;margin-bottom:2px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${data.catColor}"></span>${data.name}</div><div style="font-size:11px;color:rgba(55,53,47,0.5);font-weight:500">${data.catName}</div>${data.desc ? `<div style="font-size:11px;color:rgba(55,53,47,0.65);margin-top:3px;font-family:Inter,system-ui,sans-serif;font-style:normal">${data.desc}</div>` : ''}`;
            tooltip.style.display = 'block';
          }
        }
        if (tooltip) {
          tooltip.style.left = `${e.clientX - rect.left + 14}px`;
          tooltip.style.top = `${e.clientY - rect.top + 10}px`;
        }
      } else {
        if (hoveredSprite) {
          if (hoveredSprite.userData.marker) {
            hoveredSprite.userData.marker.scale.set(1, 1, 1);
          }
          hoveredSprite = null;
          container.style.cursor = 'default';
          if (tooltip) tooltip.style.display = 'none';
        }
      }
    }

    function onPointerUp() {
      isDragging = false;
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
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D technology map showing technical skills organized by category. Drag to rotate, scroll to zoom, hover over nodes for details.');

    function onWindowResize() {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
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

  return (
    <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] bg-[#faf9f6] overflow-hidden flex items-center justify-center"
      >
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-xs transition-opacity duration-150 border"
          style={{ display: 'none', background: '#ffffff', borderColor: '#e3e2de', color: '#37352f', boxShadow: '0 4px 12px rgba(15,15,15,0.1)' }}
        />
        {/* Bottom legend — no counts */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-4 pointer-events-none bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-[11px]">
          <span className="flex items-center gap-1.5 text-[#d9730d] font-medium"><span className="w-2 h-2 rounded-full bg-[#d9730d]"></span>Backend</span>
          <span className="flex items-center gap-1.5 text-[#0b6e99] font-medium"><span className="w-2 h-2 rounded-full bg-[#0b6e99]"></span>Data &amp; Messaging</span>
          <span className="flex items-center gap-1.5 text-[#6940a5] font-medium"><span className="w-2 h-2 rounded-full bg-[#6940a5]"></span>DevOps</span>
          <span className="flex items-center gap-1.5 text-[#0f7b6c] font-medium"><span className="w-2 h-2 rounded-full bg-[#0f7b6c]"></span>Frontend</span>
          <span className="ml-auto text-[rgba(55,53,47,0.35)] text-[10px] hidden sm:inline">Drag to rotate · Scroll to zoom · Hover for details</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Searchable Content Data ─── */
const SEARCH_ITEMS = [
  // Projects
  {
    title: 'InventoryHub (Inventory Management System)',
    category: 'Project',
    catColor: 'bg-[#fadec9] text-[#854c1d]',
    desc: 'Microservices architecture, Java, Spring Boot, PostgreSQL, Docker, Kong API GW',
    target: 'projects'
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
    desc: 'NHITM · Mumbai University (2022–2026), DSA, DBMS, OS, Networks',
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
    desc: 'Direct email and professional connection channels',
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
  onNavigate 
}) {
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
          fixed inset-y-0 left-0 h-screen md:static
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-[56px] w-[240px]' : 'w-[240px] shrink-0'}
        `}
      >
        {/* Top & Navigation Area with independent scrolling */}
        <div className="p-2.5 overflow-y-auto overflow-x-hidden flex-1">
          
          {/* Header row */}
          {collapsed ? (
            /* Collapsed Header: Expand Icon button */
            <div className="flex flex-col items-center mb-3">
              <button
                onClick={onToggleCollapse}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
              </button>
            </div>
          ) : (
            /* Expanded Header: Workspace title + collapse icon */
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
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
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
              className={`w-full flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-left transition-colors ${
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1'
              }`}
              onClick={onOpenSearch}
              title="Search portfolio (⌘K)"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[18px] text-[rgba(55,53,47,0.45)] shrink-0">search</span>
              {!collapsed && (
                <>
                  <span>Search</span>
                  <span className="ml-auto text-[10px] text-[rgba(55,53,47,0.45)] font-mono bg-white border border-[#e9e9e7] px-1 rounded">⌘K</span>
                </>
              )}
            </button>
            <button 
              className={`w-full flex items-center rounded text-left transition-colors ${
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1'
              } ${
                activePage === 'updates' ? 'bg-[rgba(55,53,47,0.08)] font-medium text-[#37352f]' : 'hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]'
              }`}
              onClick={() => onNavigate('updates')}
              title="Updates"
              aria-label="Updates"
            >
              <span className="material-symbols-outlined text-[18px] text-[rgba(55,53,47,0.45)] shrink-0">update</span>
              {!collapsed && <span>Updates</span>}
            </button>
          </div>

          {/* Divider in collapsed mode */}
          {collapsed && <div className="my-3 border-t border-[#e9e9e7]" />}

          {/* Workspace Pages */}
          <div className="mt-4">
            {!collapsed && (
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)]">
                Workspace Pages
              </div>
            )}
            <nav className="mt-1 space-y-0.5 text-[13px] text-[#37352f]">
              <a 
                className={`flex items-center rounded transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                } ${
                  activePage === 'portfolio' ? 'bg-[rgba(55,53,47,0.06)] font-medium text-[#37352f]' : 'hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]'
                }`} 
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
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                }`} 
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
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                }`} 
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
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                }`} 
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
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                }`} 
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
                className={`flex items-center rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f] transition-colors ${
                  collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1'
                }`} 
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

  const handleNavigate = (page, targetId) => {
    setActivePage(page);
    setSidebarOpen(false);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else if (page === 'portfolio') {
      const mainEl = document.querySelector('main');
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
        onNavigate={handleNavigate}
      />

      {/* MAIN WORKSPACE WRAPPER */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Top Breadcrumb Toolbar */}
        <header className="h-11 shrink-0 border-b border-[#e9e9e7] bg-white/95 backdrop-blur z-20 px-4 flex items-center justify-between text-[13px] text-[#37352f]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <button 
              className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] md:hidden mr-1" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[18px]">menu</span>
            </button>
            {sidebarCollapsed && (
              <button
                className="hidden md:flex p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] mr-1"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
              </button>
            )}
            <span 
              className="text-[rgba(55,53,47,0.65)] hover:underline cursor-pointer truncate"
              onClick={() => handleNavigate('portfolio')}
            >
              Saikiran's Workspace
            </span>
            <span className="text-[rgba(55,53,47,0.45)]">/</span>
            <span 
              className="font-medium text-[#37352f] truncate cursor-pointer hover:underline"
              onClick={() => handleNavigate(activePage)}
            >
              {activePage === 'updates' ? 'Updates' : 'Developer Portfolio'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-[rgba(55,53,47,0.65)]">
            <button 
              className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1 text-[12px]"
              onClick={() => setSearchOpen(true)}
              title="Search portfolio (⌘K)"
            >
              <span className="material-symbols-outlined text-[15px]">search</span>
              <span className="hidden sm:inline">Search</span>
            </button>
            <button 
              className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1 text-[12px] transition-colors"
              onClick={handleShare}
              title="Share portfolio link"
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

          </div>
        </header>

        {/* VIEW CONDITIONAL: UPDATES PAGE VS PORTFOLIO */}
        {activePage === 'updates' ? (
          <main className="w-full overflow-y-auto pb-28">
            <div className="max-w-[760px] mx-auto px-6 sm:px-12 py-10 sm:py-14">
              
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
        ) : (
          /* MAIN PORTFOLIO DOCUMENT */
          <main className="w-full overflow-y-auto pb-28">
          
          {/* INITIAL / HERO VIEWPORT */}
          <section id="about" className="min-h-[calc(100vh-44px)] flex flex-col items-center justify-center py-12 sm:py-16 px-6 sm:px-12 text-center select-none">
            
            {/* 1. MINIMAL CIRCULAR AVATAR */}
            <div className={`mb-4 inline-block ${hasAnimated ? '' : 'hero-anim-1'}`}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#f7f7f5] border border-[#e2e2df] flex items-center justify-center text-[22px] sm:text-[24px] font-semibold text-[#37352f] tracking-tight shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                SC
              </div>
            </div>

            {/* 2. NAME */}
            <h1 className={`text-[32px] sm:text-[42px] font-bold text-[#37352f] tracking-tight leading-tight mb-2 ${hasAnimated ? '' : 'hero-anim-2'}`}>
              Saikiran Chevula
            </h1>

            {/* 3. PROFESSIONAL IDENTITY */}
            <p className={`text-[17px] sm:text-[19px] font-medium text-[#37352f] mb-1 ${hasAnimated ? '' : 'hero-anim-3'}`}>
              Software Developer
            </p>

            {/* 4. SHORT TECHNICAL IDENTITY */}
            <p className={`text-[14px] sm:text-[15px] text-[rgba(55,53,47,0.55)] font-normal mb-2 ${hasAnimated ? '' : 'hero-anim-4'}`}>
              Java · Spring Boot · Backend &amp; Full-Stack
            </p>

            {/* 5. DOTTED ARROW */}
            <div className={`flex justify-center text-[rgba(55,53,47,0.35)] my-2 ${hasAnimated ? '' : 'hero-anim-5'}`}>
              <svg width="36" height="52" viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                <path d="M14 2 C14 18, 18 28, 22 40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3.5" strokeLinecap="round" />
                <path d="M16 36 L23 43 L25 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 6 & 7. WHO I AM SECTION */}
            <div className="w-full max-w-[480px] rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(55,53,47,0.05)] text-[11px] font-semibold text-[rgba(55,53,47,0.6)] uppercase tracking-wider mb-2 font-mono ${hasAnimated ? '' : 'hero-anim-6'}`}>
                Who I Am
              </div>
              <p className={`text-[14px] sm:text-[15px] text-[#37352f] leading-relaxed font-normal ${hasAnimated ? '' : 'hero-anim-7'}`}>
                Software developer focused on building practical backend and full-stack applications with Java and Spring Boot.
              </p>
            </div>

            {/* 8. SUBTLE SCROLL CUE */}
            <a 
              href="#projects" 
              className={`mt-10 sm:mt-14 flex flex-col items-center gap-1 text-[rgba(55,53,47,0.35)] hover:text-[#37352f] transition-colors cursor-pointer group ${hasAnimated ? '' : 'hero-anim-8'}`}
              aria-label="Explore Projects"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                <span className="w-1 h-1 rounded-full bg-current opacity-70"></span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-y-0.5 transition-transform">
                  arrow_downward
                </span>
              </div>
              <span className="text-[11px] font-mono tracking-wider text-[rgba(55,53,47,0.5)] group-hover:text-[#37352f] transition-colors">
                Explore
              </span>
            </a>
          </section>

          {/* MAIN WORKSPACE CONTENT (Revealed on Scroll) */}
          <div className="max-w-[920px] mx-auto px-6 sm:px-12">

            {/* ───────── PROJECTS SECTION ───────── */}
            <section className="my-8" id="projects">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">🗂️</span>
                  <h2 className="text-[20px] font-bold text-[#37352f]">Featured Projects &amp; Systems</h2>
                  <span className="text-[12px] bg-[#f1f1ef] text-[rgba(55,53,47,0.45)] px-2 py-0.5 rounded font-mono">1 item</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[rgba(55,53,47,0.65)]">
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">filter_list</span><span>Filter</span>
                  </button>
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">swap_vert</span><span>Sort</span>
                  </button>
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">search</span>
                  </button>
                  <button className="px-2.5 py-1 rounded bg-[#2383e2] hover:bg-[#1a70c5] text-white font-medium flex items-center gap-1">
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-4 border-b border-[#e9e9e7] mb-6 text-[13px]">
                <button className="flex items-center gap-1.5 py-2 font-medium text-[#37352f] border-b-2 border-[#37352f] -mb-[1px]">
                  <span className="material-symbols-outlined text-[16px]">grid_view</span><span>Gallery View</span>
                </button>
                <button className="flex items-center gap-1.5 py-2 text-[rgba(55,53,47,0.45)] hover:text-[#37352f]">
                  <span className="material-symbols-outlined text-[16px]">table_rows</span><span>Table</span>
                </button>
                <button className="flex items-center gap-1.5 py-2 text-[rgba(55,53,47,0.45)] hover:text-[#37352f]">
                  <span className="material-symbols-outlined text-[16px]">view_kanban</span><span>Board</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* CARD 1: Inventory Management System */}
                <div className="group rounded-lg border border-[#e9e9e7] bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#d0d0cc] transition-all overflow-hidden flex flex-col cursor-pointer">
                  <div className="h-40 bg-[#f7f7f5] overflow-hidden relative border-b border-[#e9e9e7] flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[48px] text-[rgba(55,53,47,0.25)]">inventory_2</span>
                      <div className="text-[12px] text-[rgba(55,53,47,0.45)] mt-1 font-mono">Microservices Architecture</div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[11px] font-mono text-[#37352f] shadow-sm border border-[#e9e9e7]">
                        🔧 Backend
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[16px]">🏗️</span>
                        <h3 className="font-bold text-[15px] text-[#37352f] group-hover:text-[#2383e2] transition-colors">
                          Inventory Management System
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fadec9] text-[#854c1d]">Java</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#d3e5ef] text-[#205d86]">Spring Boot</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#dbeddb] text-[#286644]">REST APIs</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e8deee] text-[#5c3882]">PostgreSQL</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e3e2e0] text-[#32302c]">Docker</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fdecc8] text-[#8f632d]">Kong API GW</span>
                      </div>
                      <p className="text-[13px] text-[rgba(55,53,47,0.65)] leading-relaxed mb-3">
                        A microservices-based inventory management system designed to manage products, inventory, and business operations through secure REST APIs. Features authentication, authorization, and Dockerized services.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#f1f1ef] flex items-center justify-between text-[12px]">
                      <span className="font-mono text-[rgba(55,53,47,0.45)] text-[11px]">Java · Spring Boot · PostgreSQL</span>
                      <div className="flex items-center gap-2 text-[rgba(55,53,47,0.65)]">
                        <a 
                          href="https://github.com/SaikiranC08" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] hover:text-[#37352f] hover:underline flex items-center gap-0.5"
                        >
                          GitHub ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Placeholder */}
                <div className="group rounded-lg border border-dashed border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-all overflow-hidden flex flex-col cursor-pointer items-center justify-center min-h-[300px] text-center p-6">
                  <span className="material-symbols-outlined text-[36px] text-[rgba(55,53,47,0.2)] mb-3">add_circle_outline</span>
                  <h3 className="font-medium text-[15px] text-[rgba(55,53,47,0.45)] mb-1">Project 2</h3>
                  <p className="text-[13px] text-[rgba(55,53,47,0.35)] max-w-[200px]">
                    Project details coming soon. Click + New to add.
                  </p>
                </div>

                {/* CARD 3: Placeholder */}
                <div className="group rounded-lg border border-dashed border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-all overflow-hidden flex flex-col cursor-pointer items-center justify-center min-h-[300px] text-center p-6">
                  <span className="material-symbols-outlined text-[36px] text-[rgba(55,53,47,0.2)] mb-3">add_circle_outline</span>
                  <h3 className="font-medium text-[15px] text-[rgba(55,53,47,0.45)] mb-1">Project 3</h3>
                  <p className="text-[13px] text-[rgba(55,53,47,0.35)] max-w-[200px]">
                    Project details coming soon. Click + New to add.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── EXPERIENCE SECTION ───────── */}
            <section className="my-8" id="experience">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🛠️</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Engineering Experience</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">
                Independent Software Development • Backend &amp; Full-Stack Projects
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Backend Development */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#d3e5ef] text-[#205d86]">Backend Development</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Built RESTful APIs using <strong className="text-[#37352f] font-medium">Java</strong> and <strong className="text-[#37352f] font-medium">Spring Boot</strong>.</li>
                      <li>Developed services following a <strong className="text-[#37352f] font-medium">microservices architecture</strong>.</li>
                      <li>Implemented <strong className="text-[#37352f] font-medium">authentication</strong>, authorization, validation, and exception handling.</li>
                    </ul>
                  </div>
                </div>
                {/* System Design */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#e8deee] text-[#5c3882]">System Design</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Designed clear <strong className="text-[#37352f] font-medium">service boundaries</strong>, database schemas, and API contracts.</li>
                      <li>Integrated backend services through an <strong className="text-[#37352f] font-medium">API Gateway</strong>.</li>
                      <li>Used <strong className="text-[#37352f] font-medium">Docker</strong> for containerized development.</li>
                    </ul>
                  </div>
                </div>
                {/* Development Practices */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#dbeddb] text-[#286644]">Development Practices</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Used <strong className="text-[#37352f] font-medium">Git and GitHub</strong> for version control.</li>
                      <li>Tested APIs and debugged application and integration issues.</li>
                      <li>Documented project architecture and setup.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── TECHNICAL STACK SECTION ───────── */}
            <section className="my-8" id="skills">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🛠️</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Technical Stack</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-5">Backend-focused technologies I use to build APIs, distributed systems, and production-ready applications.</p>

              {/* Interactive 3D Technology Map */}
              <TechGlobe activeFilter={skillFilter} />

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

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── EDUCATION SECTION ───────── */}
            <section className="my-8" id="education">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🎓</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Education</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">Academic background and foundational coursework.</p>
              <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#37352f]">B.E. Computer Science &amp; Design</h3>
                    <div className="text-[13px] text-[rgba(55,53,47,0.65)] font-medium mt-0.5">New Horizon Institute of Technology and Management (NHITM) · Mumbai University</div>
                  </div>
                  <span className="text-[12px] font-mono text-[rgba(55,53,47,0.45)] bg-white border border-[#e9e9e7] px-2 py-0.5 rounded shrink-0">
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

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── CONTACT SECTION (Blue Callout) ───────── */}
            <section className="my-8" id="contact">
              <div className="rounded-lg bg-[#edf3f8] border border-[#dbe8f2] p-5 text-[#37352f]">
                <div className="flex items-start gap-3">
                  <div className="text-[22px] select-none mt-0.5">📬</div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-[#205d86] mb-1">
                      Let's connect! I'm actively looking for full-time developer roles
                    </h3>
                    <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4 leading-relaxed">
                      Looking for a dedicated software developer who builds reliable backend systems with Java &amp; Spring Boot? I'd love to chat about entry-level software development opportunities.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        className="px-3 py-1.5 bg-white border border-[#dbe8f2] rounded shadow-sm hover:bg-[#f7f7f5] text-[13px] font-medium text-[#37352f] flex items-center gap-2 transition-colors"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText('chevulasaikiran@gmail.com');
                          }
                          showToast('Email copied to clipboard!', 'check_circle');
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">content_copy</span>
                        <span>Copy Email</span>
                      </button>
                      <a className="px-3 py-1.5 bg-[#2383e2] hover:bg-[#1a70c5] text-white rounded text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm" href="mailto:chevulasaikiran@gmail.com">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Send Email Directly</span>
                      </a>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#dbe8f2]/60 flex items-center justify-between text-[12px] text-[rgba(55,53,47,0.65)]" id="resume">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#205d86]">description</span>
                        <span>Saikiran_Chevula_Resume.pdf</span>
                      </div>
                      <span className="font-medium text-[#205d86] flex items-center gap-1 cursor-pointer hover:underline">
                        Download Resume
                        <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-16 pt-6 border-t border-[#e9e9e7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[rgba(55,53,47,0.45)] select-none mb-8">
              <div className="flex items-center gap-2">
                <span>Made with care in Notion style</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} Saikiran Chevula</span>
              </div>
              <div className="flex items-center gap-3">
                <a className="hover:text-[#37352f]" href="#about">Back to Top ↑</a>
                <span>•</span>
                <a className="hover:text-[#37352f]" href="https://github.com/SaikiranC08" target="_blank" rel="noopener noreferrer">GitHub</a>
                <span>•</span>
                <a className="hover:text-[#37352f]" href="https://www.linkedin.com/in/saikiran-chevula/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </footer>
          </div>
        </main>
      )}
      </div>

      {/* SEARCH MODAL OVERLAY */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1.5px] flex items-start justify-center pt-16 sm:pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="w-full max-w-[560px] bg-white rounded-xl shadow-2xl border border-[#e9e9e7] overflow-hidden flex flex-col max-h-[75vh]"
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
                className="flex-1 text-[14px] text-[#37352f] placeholder-[rgba(55,53,47,0.4)] outline-none bg-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.4)] hover:text-[#37352f]"
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
                      handleNavigate('portfolio', item.target);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-[rgba(55,53,47,0.05)] transition-colors flex items-start justify-between gap-3 group"
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
