// --- PRELOADER & GSAP SETUP ---
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
    let progress = 0;
    const progressEl = document.querySelector('.progress');
    const loadingText = document.querySelector('.loader-content p');
    
    // Simulate loading systems
    const messages = ["Initializing Systems...", "Loading Subroutines...", "Engaging Engines...", "Ready."];
    let msgIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 8;
        
        if(progress > 30 && msgIndex === 0) { loadingText.innerText = messages[++msgIndex]; }
        if(progress > 60 && msgIndex === 1) { loadingText.innerText = messages[++msgIndex]; }
        if(progress > 90 && msgIndex === 2) { loadingText.innerText = messages[++msgIndex]; }
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                const preloader = document.getElementById("preloader");
                preloader.style.opacity = "0";
                setTimeout(() => preloader.style.display = "none", 800);
                
                initAnimations();
            }, 600);
        }
        progressEl.style.width = progress + '%';
    }, 100);
});

function initAnimations() {
    // Hero Animations
    gsap.from(".hero-content h1", { y: 60, opacity: 0, duration: 1.2, delay: 0.2, ease: "power4.out" });
    gsap.from(".hero-content p", { y: 40, opacity: 0, duration: 1.2, delay: 0.4, ease: "power4.out" });
    gsap.from(".hero-actions button", { 
        y: 40, opacity: 0, duration: 1, 
        stagger: 0.2, delay: 0.6, ease: "power3.out" 
    });
    gsap.from(".scroll-indicator", { opacity: 0, duration: 2, delay: 1.5 });
    
    // Scroll Animations for sections
    gsap.utils.toArray('.glass-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });
    
    // Animate section titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 90%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
}

// Navbar Scrolled Effect & Mobile Menu
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger to X (simplified)
    const spans = hamburger.querySelectorAll('span');
    if(navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
            hamburger.click();
        }
    });
});

// Sound Effect optional setup
const interactBtns = document.querySelectorAll('.play-sound');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSciFiBeep() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.3);
    
    // Add some grit/filter
    const filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}
interactBtns.forEach(btn => btn.addEventListener('click', playSciFiBeep));

// --- THREE.JS SETUP AND CAR BUILD ---
const container = document.getElementById('canvas-container');

// Scene and Camera
const scene = new THREE.Scene();
// Leave background transparent so HTML/CSS shows behind it
scene.background = null; 

// Cool neon fog to merge floor with background
scene.fog = new THREE.FogExp2(0x050505, 0.04);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(6, 2.5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 4;
controls.maxDistance = 15;
// Don't let user pan below floor
controls.maxPolarAngle = Math.PI / 2 + 0.05; 
// Enable auto rotation initially
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

// Remove autoRotate when user interacts
controls.addEventListener('start', () => {
    controls.autoRotate = false;
});

// Environment / Showroom
const planeGeometry = new THREE.PlaneGeometry(60, 60);
const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x050505,
    roughness: 0.1,
    metalness: 0.8,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Tech Grid Helper
const gridHelper = new THREE.GridHelper(60, 60, 0x00f0ff, 0x111111);
gridHelper.position.y = 0.01;
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Lighting Setup for high-end look
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Key light shining down
const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 8, 0);
spotLight.angle = Math.PI / 3;
spotLight.penumbra = 0.8;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Neon accents
const blueSpot = new THREE.SpotLight(0x00f0ff, 3);
blueSpot.position.set(5, 2, 5);
blueSpot.angle = Math.PI / 4;
blueSpot.penumbra = 1;
scene.add(blueSpot);

const purpleSpot = new THREE.PointLight(0xaa00ff, 2, 10);
purpleSpot.position.set(-3, 1, -3);
scene.add(purpleSpot);

// CAR MODEL
// **********************************************
// HOW TO LOAD A REAL .GLB MODEL
// Uncomment the code below and comment out the procedural car group below it.
/*
const loader = new THREE.GLTFLoader();
loader.load('YOUR_MODEL_LINK.glb', function (gltf) {
    const carModel = gltf.scene;
    
    // Scale and position based on your model
    carModel.scale.set(1, 1, 1);
    carModel.position.set(0, 0, 0);
    
    carModel.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    scene.add(carModel);
}, undefined, function (error) {
    console.error(error);
});
*/
// **********************************************

// PROD FALLBACK: Building a Stylized Futuristic Car internally 
// (Guarantees rendering without needing an external .glb file immediately)
const carGroup = new THREE.Group();
scene.add(carGroup);

// Materials
const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});

const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0.9,
    roughness: 0.0,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8,
});

const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
const tailGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0040 });
const headGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Chassis Base
const chassisGeo = new THREE.BoxGeometry(2.1, 0.4, 4.4);
const chassis = new THREE.Mesh(chassisGeo, bodyMat);
chassis.position.y = 0.5;
chassis.castShadow = true;
chassis.receiveShadow = true;
carGroup.add(chassis);

// Cabin
const cabinGeo = new THREE.BoxGeometry(1.6, 0.45, 2.2);
const cabin = new THREE.Mesh(cabinGeo, glassMat);
cabin.position.set(0, 0.92, -0.2);
cabin.castShadow = true;
carGroup.add(cabin);

// Aerodynamic sloping front
const frontSlopeGeo = new THREE.CylinderGeometry(0, 0.2, 2.1, 3, 1, false, 0, Math.PI);
const frontSlope = new THREE.Mesh(frontSlopeGeo, bodyMat);
frontSlope.rotation.z = Math.PI / 2;
frontSlope.rotation.x = -Math.PI / 2 + 0.2;
frontSlope.position.set(0, 0.5, 2.3);
frontSlope.castShadow = true;
carGroup.add(frontSlope);

// Headlights (Neon strips)
const headLightGeo = new THREE.BoxGeometry(1.7, 0.05, 0.1);
const headLight = new THREE.Mesh(headLightGeo, headGlowMat);
headLight.position.set(0, 0.6, 2.21);
carGroup.add(headLight);

// Taillights
const tailLightGeo = new THREE.BoxGeometry(1.8, 0.08, 0.1);
const tailLight = new THREE.Mesh(tailLightGeo, tailGlowMat);
tailLight.position.set(0, 0.6, -2.21);
carGroup.add(tailLight);

// Wheels Setup
const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32);
wheelGeo.rotateZ(Math.PI / 2);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.8 });

const wheelPositions = [
    [-1.15, 0.35, 1.3],
    [ 1.15, 0.35, 1.3],
    [-1.15, 0.35, -1.3],
    [ 1.15, 0.35, -1.3]
];

const wheels = [];
wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(...pos);
    
    // Tire
    const tire = new THREE.Mesh(wheelGeo, wheelMat);
    tire.castShadow = true;
    wheelGroup.add(tire);
    
    // Glowing Rim
    const rimGeo = new THREE.TorusGeometry(0.22, 0.02, 16, 32);
    rimGeo.rotateY(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, glowMat);
    
    // Position rim on correct side of wheel
    if(pos[0] > 0) rim.position.x = 0.13;
    else rim.position.x = -0.13;
    
    wheelGroup.add(rim);
    
    wheels.push(wheelGroup);
    carGroup.add(wheelGroup);
});

// Underglow light to add to the futuristic vibe
const underGlow = new THREE.RectAreaLight(0x00f0ff, 5, 2, 4);
underGlow.position.set(0, 0.1, 0);
underGlow.lookAt(0, 0, 0);
scene.add(underGlow);

const underGlowHelper = new THREE.PointLight(0x00f0ff, 1, 5);
underGlowHelper.position.set(0, 0.2, 0);
scene.add(underGlowHelper);


// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Small hovering effect for car
    carGroup.position.y = Math.sin(time * 2) * 0.03;
    
    // Only spin wheels if auto rotating to simulate driving
    if(controls.autoRotate) {
        wheels.forEach(w => w.rotation.x += 0.05);
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Bind custom button actions
document.querySelector('.hero-actions .btn-secondary').addEventListener('click', () => {
    // Zoom in on car
    gsap.to(camera.position, {
        x: 3, y: 1.5, z: 4,
        duration: 1.5,
        ease: "power2.inOut"
    });
    controls.autoRotate = false;
});

// --- FORM HANDLING ---
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const interest = document.getElementById('interest').value;
        
        if(!name || !email || !interest) {
            showMessage('Please fill all required fields.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        try {
            // Sends to Formspree
            // TODO: Generate a new form on Formspree.io for kunalsoni7651@gmail.com and paste your URL endpoint below!
            const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID_HERE', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, interest })
            });

            if (response.ok) {
                showMessage('Success! Your test drive request has been sent.', 'success');
                contactForm.reset();
            } else {
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    showMessage(data.errors.map(error => error.message).join(", "), 'error');
                } else {
                    showMessage('Failed to submit the form.', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Cannot connect to the server. Please check your connection.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Request";
        }
    });
}

function showMessage(msg, type) {
    formMessage.style.display = 'block';
    formMessage.innerText = msg;
    if (type === 'success') {
        formMessage.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        formMessage.style.color = '#00ff00';
        formMessage.style.border = '1px solid #00ff00';
    } else {
        formMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        formMessage.style.color = '#ff4444';
        formMessage.style.border = '1px solid #ff4444';
    }
}
