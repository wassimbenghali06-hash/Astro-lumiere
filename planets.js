// ============================================
// SYSTÈME DE PLANÈTES 3D AVEC THREE.JS
// ============================================

let scene, camera, renderer, planets = [], stars = [];

function initPlanets() {
    // Récupérer le conteneur
    const container = document.querySelector('.stars-background');
    
    // Configuration de base
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 1000, 3000);
    
    // Caméra
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 500;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Ajouter le canvas au conteneur
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(300, 300, 300);
    scene.add(pointLight);
    
    // Créer les planètes
    createPlanets();
    
    // Créer les étoiles
    createStars();
    
    // Gérer le redimensionnement
    window.addEventListener('resize', onWindowResize, false);
    
    // Animer
    animate();
}

function createPlanets() {
    const planetData = [
        { name: 'Mercury', size: 8, distance: 80, speed: 0.05, color: 0x8c7853, rotation: 0.01 },
        { name: 'Venus', size: 14, distance: 140, speed: 0.02, color: 0xffc649, rotation: 0.004 },
        { name: 'Earth', size: 15, distance: 200, speed: 0.015, color: 0x4b9bff, rotation: 0.02 },
        { name: 'Mars', size: 10, distance: 260, speed: 0.012, color: 0xff6347, rotation: 0.018 },
        { name: 'Jupiter', size: 35, distance: 350, speed: 0.005, color: 0xc88b3a, rotation: 0.01 },
        { name: 'Saturn', size: 30, distance: 450, speed: 0.003, color: 0xfdb813, rotation: 0.008, hasRing: true },
    ];
    
    planetData.forEach((data, index) => {
        const geometry = new THREE.IcosahedronGeometry(data.size, 32);
        const material = new THREE.MeshStandardMaterial({ color: data.color });
        const planet = new THREE.Mesh(geometry, material);
        
        // Ajouter une texture de base
        addPlanetDetails(planet, data.color);
        
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Position initiale
        planet.position.x = data.distance;
        
        // Créer un groupe pour l'orbite
        const orbitGroup = new THREE.Group();
        orbitGroup.add(planet);
        scene.add(orbitGroup);
        
        planets.push({
            mesh: planet,
            group: orbitGroup,
            data: data,
            angle: Math.random() * Math.PI * 2
        });
        
        // Ajouter les anneaux de Saturne
        if (data.hasRing) {
            const ringGeometry = new THREE.TorusGeometry(data.size * 2, data.size * 0.5, 32, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xccaa88 });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotationX = Math.PI / 6;
            planet.add(ring);
        }
    });
}

function addPlanetDetails(planet, color) {
    // Ajouter des détails de surface avec une texture procédurale
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Gradient basé sur la couleur
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ajouter du bruit
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    planet.material.map = texture;
}

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        sizeAttenuation: true,
        transparent: true
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
    
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Animer les planètes
    planets.forEach((planet) => {
        // Orbite
        planet.angle += planet.data.speed;
        planet.group.position.x = Math.cos(planet.angle) * planet.data.distance;
        planet.group.position.z = Math.sin(planet.angle) * planet.data.distance;
        
        // Rotation
        planet.mesh.rotation.x += planet.data.rotation;
        planet.mesh.rotation.y += planet.data.rotation * 1.5;
    });
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanets);
} else {
    initPlanets();
}
