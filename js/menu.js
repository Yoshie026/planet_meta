// Import all the stuff required
import * as THREE from './libs/three/build/three.module.js'
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './libs/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from './libs/three/examples/jsm/utils/RoughnessMipmapper.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from './libs/three/examples/jsm/loaders/DRACOLoader.js';
import { SVGRenderer } from './libs/three/examples/jsm/renderers/SVGRenderer.js';
import { EffectComposer } from './libs/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './libs/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './libs/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from './libs/three/examples/jsm/postprocessing/BokehPass.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import { CSS2DRenderer, CSS2DObject } from './libs/three/examples/jsm/renderers/CSS2DRenderer.js';
// import { EXRLoader } from './libs/three/examples/jsm/loaders/EXRLoader.js';

// import { ArcballControls } from './libs/three/examples/jsm/controls/ArcballControls.js';


let camera, bokehCamera, renderer, scene, stats, raycaster, labelRenderer;

var targetRotationX = 0.5;
var targetRotationOnMouseDownX = 0;
var targetRotationY = 0.1;
var targetRotationOnMouseDownY = 0;


var mouseX = 0;
var mouseXOnMouseDown = 0;

var mouseY = 0;
var mouseYOnMouseDown = 0;

var slowingFactor = 0.1;

const mouse = new THREE.Vector2();

let WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2;


// let cubeCamera, cubeCamera1, cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;
let planets = [];
let planetsEdges = [];
let planetsNum = 3;


let lines = [];
let linesNum = 2;
let cookieLabel, cloudLabel, aiLabel;

var avatars = []; //going to be image this time.
var avatar_planets = [];
var avatar_planet3D = [];
var obj1, obj2;

var isNight = false;
var avatarScreen = false;
var selected;
var removingObj;

var defaultCol = 0x202020;
var defaultBackCol = 0xF5F2F5;


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/libs/three/examples/js/libs/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

function loadAvatarPlanet(avatarPlanetPath, planetProperty) {
    loader.load(
        avatarPlanetPath,
        function(gltf) {
            obj2 = gltf.scene;
            obj2.position.set(planetProperty.position.x, planetProperty.position.y - 3.2, planetProperty.position.z); // scale here
            obj2.scale.set(planetProperty.scale.x + 0.2, planetProperty.scale.y + 0.2, planetProperty.scale.z + 0.2);

            obj2.traverse(n => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                    if (n.material.map) {
                        n.material.map.anisotropy = 16;
                    }
                }
            });

            switch (avatarPlanetPath) {
                case avatar_planet3D[0]:
                    obj2.name = 'cookie_day';
                    break;
                case avatar_planet3D[1]:
                    obj2.name = 'ai_day';
                    break;
                case avatar_planet3D[2]:
                    obj2.name = 'cloud_day';
                    break;
                case avatar_planet3D[3]:
                    obj2.name = 'cookie_night';
                    break;
                case avatar_planet3D[4]:
                    obj2.name = 'ai_night';
                    break;
                case avatar_planet3D[5]:
                    obj2.name = 'cloud_night';
                    break;
            }
            console.log(obj2.name);
            scene.add(obj2);
            obj2.visible = false;
        });
}


avatar_planet3D[0] = './assets/avatar/planet_cookie1.glb'; //cookie
avatar_planet3D[1] = './assets/avatar/planet_ai1.glb'; //ai
avatar_planet3D[2] = './assets/avatar/planet_cloud1.glb'; //cloud
avatar_planet3D[3] = './assets/avatar/planet_cookie2.glb'; //cookie
avatar_planet3D[4] = './assets/avatar/planet_ai2.glb'; //ai
avatar_planet3D[5] = './assets/avatar/planet_cloud2.glb'; //cloud



const scrollBtn = "<p class=" + "read-more" + "><a href=" + "#" + "class=" + "scrollButton" + ">Scroll</a></p>";



const planetTitleTypesDay = [{
    "cookie": "<h2>PLANET: COOKIE<br>INHABITANT: FORTUNA</h2><br>",
    "cloud": "<h2>PLANET: CLOUD<br>INHABITANT: CUMULUS</h2><br>",
    "ai": "<h2>PLANET: AI<br>INHABITANT: ARTIFEX</h2><br>"
}];

const paragraphTypesDay = [{
    "cookie": "<h2>PLANET: COOKIE<br>INHABITANT: FORTUNA</h2><br><h5>Welcome to the first planet upon entrance of the meta galaxy!</h5><br><p>This creature and its planet have an eye on you, and a great memory too. Sprinkles turned into googly eyes that will retain as much or your data as possible. If one eye misses something, another one will make sure to catch it.</p><br><h5>(SPECULATIVE PERCEPTION: COOKIE, REALLY?)</h5><p>Cookies have evolved beyond their finger-licking name, into various types but mostly, into various purposes. Opia represents one of the most occult ones: the third-party cookie. Whilst first-party cookies are sent directly from the visited website to your browser, third-party cookies are sent from different websites through ads on the website you’re visiting. Despite never visiting the website of the ad, it will be able to send you cookies, therefore obtaining information about you. A major part of online advertisement is now fostered by unconsciously offered data from the user. This system of online ads has reached such extents that Google is planning on phasing out third-party cookies as we know them.</p>",
    "cloud": "<h2>PLANET: CLOUD<br>INHABITANT: CUMULUS</h2><br><h5>You’ve reached the second planet of the meta galaxy! </h5><br><p>Ever wondered where our data goes after sending it to the so-called “cloud”? This ethereal creature lives on an ever floating planet,a space where our data stays out of sight and therefore, out of mind.</p><br><p>To its users the cloud feels like an immaterial, almost magic entity, hanging around and always available. The word ‘cloud’ shaped our vision of it into a transparent,shapeless space floating around without limitations.</p><br><h5>(DISTORTED PERCEPTION: CLOUD, WHY?)</h5><br><p>In 2001, one of the first public uses of the word cloud was published in a New York Times article by John Markoff. He foresaw the phenomenon of “cloud computing” and wrote: \"Microsoft\'s .net software did not reside on any one's computer \"but instead exists in the \"cloud\" of computers that make up the Internet</p><br><p>Nevertheless, Markoff didn’t officially coin the term as earlier trademark attempts of “cloud computing” from the late 90s resurfaced.</p><br><p>Despite its blurry origin, the term “cloud computing” surely rose for marketing purposes to put a name on this fast-developing system.</p>",
    "ai": "<h2>PLANET: AI<br>INHABITANT: ARTIFEX</h2><br><h5>You’ve reached the center of the meta constellation.</h5><br><p>This is the first planet space travellers encounter on their digital exploration of the meta galaxy. Similarly, web users will encounter cookies upon entering a website and these cokkies will define their digital experience.</p><br><p>This creature lives on a decadent planet made of smooth batter, fragrant sprinkles and rich chocolate chips. If your spaceship is travelling from Europe, the creatures of this planet will typically ask you for your consent before giving you a taste of thier galacy famous cookies.</p><br><h5>(DISTORTED PERCEPTION: AI, WHY?)</h5><br><p>The term \"cookie\" shortened from \"magic cookie\". The latter was itself inspired by the idea of fortune cookies,the distinctively shaped discuit containing a fortune inscribed paper. The fortune can only be revealed by \'opening\' the cookie. Similarly, in the digital world, cookies represent a small bit of data passed from the website we're visiting to our device. Far from being malicious, cookies help he website remember the user\'s password, login and preferences to enchance their experience on the website they\'re visiting.</p>"
}];

const planetTitleTypesNight = [{
    "cookie": "<h2>PLANET: COOKIE_NIGHT<br>INHABITANT: OPIA</h2><br>",
    "cloud": "<h2>PLANET: CLOUD_NIGHT<br>INHABITANT: LOCUS</h2><br>",
    "ai": "<h2>PLANET: AI_NIGHT<br>INHABITANT: LUX</h2><br>"
}];

const paragraphTypesNight = [{
    "cookie": "<h2>PLANET: COOKIE_NIGHT<br>INHABITANT: OPIA</h2><br><h5>Welcome to the first planet upon entrance of the meta galaxy!</h5><br><p>This is the first planet space travellers encounter on their digital exploration of the meta galaxy. Similarly, web users will encounter cookies upon entering a website and these cokkies will define their digital experience.</p><br><p>This creature lives on a decadent planet made of smooth batter, fragrant sprinkles and rich chocolate chips. If your spaceship is travelling from Europe, the creatures of this planet will typically ask you for your consent before giving you a taste of thier galacy famous cookies.</p><br><h5>(DISTORTED PERCEPTION: COOKIE, WHY?)</h5><br><p>The term \"cookie\" shortened from \"magic cookie\". The latter was itself inspired by the idea of fortune cookies,the distinctively shaped discuit containing a fortune inscribed paper. The fortune can only be revealed by \'opening\' the cookie. Similarly, in the digital world, cookies represent a small bit of data passed from the website we're visiting to our device. Far from being malicious, cookies help he website remember the user\'s password, login and preferences to enchance their experience on the website they\'re visiting.</p>",
    "cloud": "<h2>PLANET: CLOUD_NIGHT<br>INHABITANT: LOCUS</h2><br><h5>You’ve reached the second planet of the meta galaxy!</h5><br><p>Whilst the term cloud takes us high in the sky into abstraction, the practicalities of it take place are rooted in solid ground. This planet made of concrete and steel hosts the real face behind the cloud; a creature made of cables, servers, data centers and a symbol for immense energy consumption.</p><br><h5>(SPECULATIVE PERCEPTION: CLOUD, REALLY?)</h5><p>Whilst the thought of the cloud is highly immaterial, its impact is to be witnessed in concrete ways. On the user-end the abstraction justifies the use of such a term but the operator-end shows another story. According to Metahaven (2015)tThe cloud needs reification into a “finite thing” to allow its understanding.</p><br><p>The running of a data center, the physical face of the cloud, implies a piece of land, which works under specific laws. To build a data center is to look for the most beneficial laws to work under. The spread of data centers across the world unconsciously map the most laxist environmental laws as the amount of energy used to run such infrastructures can equal that of a medium-sized US town. The servers containing our precious data need constant and stable energy supply.(Metahaven, 2015)</p><br><p>The connection between data centers does not float around in the air but is rather hidden underground, connecting continents and crossing oceans through fiber-optic cables.</p>",
    "ai": "<h2>PLANET: AI_NIGHT<br>INHABITANT: LUX</h2><br><h5>You’ve reached the center of the meta constellation.</h5><br><p>Leaving the black box analogy behind, this planet uses AI as a tool to let the light out. AI avatar’s Lux’s glass skin turns crystalline and reorients light in different directions to give them new meanings. On this planet, AI is all about diffraction.</p><br><h5>(SPECULATIVE PERCEPTION: AI, REALLY?)</h5><p>Moving away from the idea of AI having their own willpower and working in occult ways is to move away from the overall idea of ‘intelligence’. Computers do not gain wisdom and knowledge but simply approximate a function from statistical values. Far from alien cognition, Joler and Pasquinelli (2020) define AI as an \“instrument of knowledge magnification that helps perceive features, patterns, and correlations through vast spaces of data beyond human reach.\”</p><br><p>Joler and Pasquinelli (2020) propose that, oppositely to the black box analogy, AI could be compared to light diffraction. Unorganized data is projected as a light beam onto glass. Depending on the shape and size of the glass the light is projected on, its diffraction back into the world will vary. The essence of AI therefore lies in the appearance of the diffracting glass; the algorithm.  The way this glass is shaped, in other words how this algorithm is programmed is the key of the diffraction control. Only humans have this key. The diffraction tool (AI) will only follow the steps decided by humans.</p>"
}];

var avatarBgImgDay = './assets/img/background/bluured_day.png';
var avatarBgImgNight = './assets/img/background/bluured_night.png';

// let lightr, lightl;

let clock, mixer;

let blurUniforms;


// const postprocessing = { cinematic: true, play: false };
const postprocessing = {};

let composer, fxaaPass, gammaCorrection;

let canvas = document.getElementById('canvas');

// init();
// animate();


landingPageBtn.addEventListener("click", () => {
    landingPageBtn.style.display = 'none';
    modeBtn.style.display = 'flex';
    audioBtn.style.display = 'flex';
    init();
    animate();
    if (!isNight) {
        audio.src = './assets/audio/metaDay.wav';
    } else {
        audio.src = './assets/audio/metaNight.wav';
    }
    audio.volume = 0.2;
    audio.loop = true;
    audio.play();

}, false);



function init() {
    const sized = window.matchMedia('(max-width: 768px)')
    var dist;
    if (sized.matches) {
        dist = 220
    } else {
        dist = 140
    }
    title.style.display = 'flex';
    camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 1500);
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        encoding: THREE.sRGBEncoding, // since gamma is applied during rendering, the cubeCamera renderTarget texture encoding must be sRGBEncoding
        format: THREE.RGBAFormat
    });


    // cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    if (camera.position.z < 140) {
        var tween_enter = new TWEEN.Tween(camera.position).to({
            x: 0,
            y: 0,
            z: dist
        }, 5000);
        tween_enter.easing(TWEEN.Easing.Cubic.Out);
        tween_enter.interpolation(TWEEN.Interpolation.CatmullRom);
        tween_enter.onUpdate(() => {});
        tween_enter.start();
        tween_enter.onComplete(function() {});
    }

    camera.position.set(0, 0, 140);
    // scene.add(camera);
    camera.updateProjectionMatrix();

    scene = new THREE.Scene();




    // refractionCube.mapping = THREE.CubeRefractionMapping;
    scene = new THREE.Scene();

    // scene.background = reflectionCube;
    // console.log(scene.background);
    raycaster = new THREE.Raycaster();

    renderer = new SVGRenderer();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });


    renderer.setPixelRatio(1); // <- use 1 is on a very high resolution display - might produce aliasing, even with the AA applied
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(defaultBackCol, 1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = "canvas";
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);



    //light
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    const spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize.width = 1024 * 4;
    spotLight.shadow.mapSize.height = 1024 * 4;
    scene.add(spotLight);

    //Planet_ Sphere
    var radius = 3.8;
    var segments = 22;
    var rings = 22;

    const sphereGeometry = new THREE.SphereBufferGeometry(radius, segments, rings);
    var sphereMaterial = new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true,
        wireframe: false
    });
    const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);


    // const sphereWireframe = new THREE.LineSegments(sphereEdges, sphereEdgeMaterial);
    for (let i = 0; i < planetsNum; i++) {
        const sphereEdgeMaterial = new THREE.LineBasicMaterial({
            color: defaultCol,
            transparent: false,
            linewidth: 5,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        planets[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
        planetsEdges[i] = new THREE.LineSegments(sphereEdges, sphereEdgeMaterial); // Build sphere
        planets[i].position.set(0, 0, 0);
        scene.add(planets[i]); // Add sphere to canvas
        planets[i].add(planetsEdges[i]);
    }


    planetsEdges[0].name = 'COOKIE';
    planetsEdges[1].name = 'CLOUD';
    planetsEdges[2].name = 'AI';

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(innerWidth, innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    canvas.appendChild(labelRenderer.domElement);


    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.style.marginTop = '-1em';
    const label = new CSS2DObject(labelDiv);
    label.visible = false;
    scene.add(label);

    //Svg Orbit Lines
    const vertices = [];
    const divisions = 100;
    for (let i = 0; i <= divisions; i++) {
        const v = (i / divisions) * (Math.PI * 2);
        const x = Math.sin(v);
        const z = Math.cos(v);
        vertices.push(x, 0, z);
    }

    const line_geometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: defaultCol,
        linewidth: 2
    });

    line_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    for (let i = 0; i < linesNum; i++) {
        lines[i] = new THREE.Line(line_geometry, lineMaterial);
        lines[i].name = 'planet-line';
        // lines[0].position.set(0, 2, 3);
        lines[i].position.set(0, 5, 0);
        lines[0].scale.set(40, 0, 60);
        lines[i].scale.set(65, 0, 50);
        scene.add(lines[i]);
        lines[i].rotation.set(0, 0.5, 0.5);
    }




    initPostprocessing();
    renderer.autoClear = false;


    const dof_params = {
        focus: 60.0,
        aperture: 10,
        maxblur: 0.002

    };

    const bloom_params = {
        exposure: 1.6,
        bloomStrength: 1.5,
        bloomThreshold: 0,
        bloomRadius: 0
    };
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.exposure = bloom_params.exposure;
    bloomPass.threshold = bloom_params.bloomThreshold;
    bloomPass.strength = bloom_params.bloomStrength;
    bloomPass.radius = bloom_params.bloomRadius;
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    const matChanger = function() {
        postprocessing.bokeh.uniforms["focus"].value = dof_params.focus;
        postprocessing.bokeh.uniforms["aperture"].value = dof_params.aperture;
        postprocessing.bokeh.uniforms["maxblur"].value = dof_params.maxblur;
    };
    // const gui = new GUI();
    // gui.add(bloom_params, 'exposure', 0.8, 2).onChange(function(value) {
    //     renderer.toneMappingExposure = Math.pow(value, 4.0);
    // });
    // gui.add(bloom_params, 'bloomThreshold', 0.0, 1.0).onChange(function(value) {
    //     bloomPass.threshold = Number(value);
    // });
    // gui.add(bloom_params, 'bloomStrength', 0.0, 3.0).onChange(function(value) {
    //     bloomPass.strength = Number(value);
    // });
    // gui.add(bloom_params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function(value) {
    //     bloomPass.radius = Number(value);
    // });
    // gui.add(dof_params, "focus", 10.0, 3000.0, 10).onChange(matChanger);
    // gui.add(dof_params, "aperture", 0, 10, 0.1).onChange(matChanger);
    // gui.add(dof_params, "maxblur", 0.0, 0.01, 0.001).onChange(matChanger);
    // gui.close();
    // matChanger();

    // var controls = new OrbitControls(camera, renderer.domElement);
    // controls.minDistance = 20;
    // controls.maxDistance = 200;
    // window.addEventListener('resize', onWindowResize);
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 200;
    })
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    // scene.fog = new THREE.Fog(0xDFE9F3, 2000, 500);



    canvas.addEventListener('mousedown', zoomCam, false);
    var target = new THREE.Vector3();

    function zoomCam(event) {

        var point_mouse = new THREE.Vector2();
        var point_x = null;
        var point_y = null;

        if (event.changedTouches) {
            point_x = event.changedTouches[0].pageX;
            point_y = event.changedTouches[0].pageY;
        } else {

            point_x = event.clientX;
            point_y = event.clientY;
        }

        point_mouse.x = (point_x / window.innerWidth) * 2 - 1;
        point_mouse.y = -(point_y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(point_mouse, camera);
        var intersects = raycaster.intersectObjects(planets, true);
        canvas.style.cursor = "default";
        for (var i = 0; i < intersects.length; i++) {
            if (intersects.length > 0 && camera.position.z > 120) {
                target.copy(intersects[i].point);
                var selectedPlanet = intersects[0].object.name;

                var tween = new TWEEN.Tween(camera.position).to({
                    x: target.x - 12,
                    y: target.y,
                    z: target.z + 4
                }, 1800);
                tween.easing(TWEEN.Easing.Exponential.InOut);
                tween.interpolation(TWEEN.Interpolation.CatmullRom);
                tween.onUpdate(() => {
                    camera.lookAt(target);
                })
                tween.start()
                tween.onComplete(function() {
                    // scene.remove(line);
                    // loadAvatar();
                    planetClicked(selectedPlanet);
                    selected = selectedPlanet;
                    // return selectedPlanet;
                });
                break;
            }
        }
        document.addEventListener("mousemove", onDocumentMouseMove, false);
    }


    avatars[0] = './assets/img/avatar_img/avater/cookie1.png'; //cookie
    avatars[1] = './assets/img/avatar_img/avater/ai1.png'; //ai
    avatars[2] = './assets/img/avatar_img/avater/cloud1.png'; //cloud
    avatars[3] = './assets/img/avatar_img/avater/cookie2.png'; //cookie_night
    avatars[4] = './assets/img/avatar_img/avater/ai2.png'; //ai_night
    avatars[5] = './assets/img/avatar_img/avater/cloud2.png'; //cloud_night

    avatar_planets[0] = './assets/img/avatar_img/planet/cookiePlnt1.png'; //cookie
    avatar_planets[1] = './assets/img/avatar_img/planet/aiPlnt1.png'; //ai
    avatar_planets[2] = './assets/img/avatar_img/planet/cloudPlnt1.png'; //cloud
    avatar_planets[3] = './assets/img/avatar_img/planet/cookiePlnt2.png'; //cookie
    avatar_planets[4] = './assets/img/avatar_img/planet/aiPlnt2.png'; //ai
    avatar_planets[5] = './assets/img/avatar_img/planet/cloudPlnt2.png'; //cloud

    avatar_planet3D[0] = './assets/avatar/planet_cookie1.glb'; //cookie
    avatar_planet3D[1] = './assets/avatar/planet_ai1.glb'; //ai
    avatar_planet3D[2] = './assets/avatar/planet_cloud1.glb'; //cloud
    avatar_planet3D[3] = './assets/avatar/planet_cookie2.glb'; //cookie
    avatar_planet3D[4] = './assets/avatar/planet_ai2.glb'; //ai
    avatar_planet3D[5] = './assets/avatar/planet_cloud2.glb'; //cloud

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    // Check if the media query is true


    function planetClicked(planet) {
        avatarScreen = true;
        if (mediaQuery.matches) {
            title.style.display = 'none';
        }
        // title.style.padding = '0';

        for (var i in lines) {
            lines[i].visible = false;
        }

        // scene.add(paragraph);
        returnBtn.style.display = 'block';

        switch (planet) {
            case 'COOKIE':
                // cookiePlanet.visible = true;
                planetsEdges[1].visible = false;
                planetsEdges[2].visible = false;
                planets[0].visible = false;
                if (!isNight) {
                    removingObj = scene.getObjectByName('cookie_day');
                    scene.remove(removingObj);

                    removingObj = scene.getObjectByName('cookie_night');
                    scene.remove(removingObj);
                    loadAvatarPlanet(avatar_planet3D[0], planets[0]);
                    // loadAvatar(avatars[0]);
                    avatarImg.src = avatars[0];
                    planetImg.src = avatar_planets[0];
                    planetTitle.innerHTML = planetTitleTypesDay[0].cookie;
                    paragraphDiv.innerHTML = paragraphTypesDay[0].cookie;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/cookie.png';
                    avatarBgImg.src = avatarBgImgDay;
                } else {
                    removingObj = scene.getObjectByName('cookie_night');
                    scene.remove(removingObj);

                    removingObj = scene.getObjectByName('cookie_day');
                    scene.remove(removingObj);
                    loadAvatarPlanet(avatar_planet3D[3], planets[0]);

                    avatarImg.src = avatars[3];
                    planetImg.src = avatar_planets[3];
                    // loadAvatar(avatars[3]);
                    planetTitle.innerHTML = planetTitleTypesNight[0].cookie;
                    paragraphDiv.innerHTML = paragraphTypesNight[0].cookie;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/cookie_dark.png';
                    avatarBgImg.src = avatarBgImgNight;
                }
                break;
            case 'AI':
                // aiPlanet.visible = true;
                planetsEdges[0].visible = false;
                planetsEdges[1].visible = false;
                planets[2].visible = false;
                if (!isNight) {
                    removingObj = scene.getObjectByName('ai_day');
                    scene.remove(removingObj);
                    removingObj = scene.getObjectByName('ai_night');
                    scene.remove(removingObj);

                    loadAvatarPlanet(avatar_planet3D[4], planets[2]);
                    // loadAvatar(avatars[1]);
                    avatarImg.src = avatars[1];
                    planetImg.src = avatar_planets[1];
                    planetTitle.innerHTML = planetTitleTypesDay[0].ai;
                    paragraphDiv.innerHTML = paragraphTypesDay[0].ai;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/ai.png';
                    avatarBgImg.src = avatarBgImgDay;
                } else {
                    removingObj = scene.getObjectByName('ai_night');
                    scene.remove(removingObj);
                    removingObj = scene.getObjectByName('ai_day');
                    scene.remove(removingObj);
                    loadAvatarPlanet(avatar_planet3D[1], planets[2]);
                    // loadAvatar(avatars[4]);
                    avatarImg.src = avatars[4];
                    planetImg.src = avatar_planets[4];
                    planetTitle.innerHTML = planetTitleTypesNight[0].ai;
                    paragraphDiv.innerHTML = paragraphTypesNight[0].ai;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/ai_dark.png';
                    avatarBgImg.src = avatarBgImgNight;

                }
                break;


            case 'CLOUD':
                // cloudPlanet.visible = true;
                planetsEdges[0].visible = false;
                planetsEdges[2].visible = false;
                planets[1].visible = false;
                if (!isNight) {
                    removingObj = scene.getObjectByName('cloud_day');
                    scene.remove(removingObj);
                    removingObj = scene.getObjectByName('cloud_night');
                    scene.remove(removingObj);


                    loadAvatarPlanet(avatar_planet3D[2], planets[1]);
                    // loadAvatar(avatars[2]);
                    avatarImg.src = avatars[2];
                    planetImg.src = avatar_planets[2];
                    planetTitle.innerHTML = planetTitleTypesDay[0].cloud;
                    paragraphDiv.innerHTML = paragraphTypesDay[0].cloud;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/cloud.png';
                    avatarBgImg.src = avatarBgImgDay;

                } else {
                    removingObj = scene.getObjectByName('cloud_night');
                    scene.remove(removingObj);

                    removingObj = scene.getObjectByName('cloud_day');
                    scene.remove(removingObj);
                    loadAvatarPlanet(avatar_planet3D[5], planets[1]);
                    isNight = true;

                    // loadAvatar(avatars[5]);
                    avatarImg.src = avatars[5];
                    planetImg.src = avatar_planets[5];
                    planetTitle.innerHTML = planetTitleTypesNight[0].cloud;
                    paragraphDiv.innerHTML = paragraphTypesNight[0].cloud;
                    avatarDiagramImg.src = './assets/img/avatar_diagram/cloud_dark.png';
                    avatarBgImg.src = avatarBgImgNight;

                }
                break;
            default:
                null;
        }

        avatarImg.style.display = 'block';
        planetImg.style.display = 'block';
        paragraphDiv.style.display = 'block';
        avatarBgImg.style.display = 'block';
        paragraphDiv.appendChild(avatarDiagramImg);
    }

    var currentCamPos = camera.position;

    title.addEventListener("click", () => {
        avatarScreen = false;
        removingObj = '';

        var tween2 = new TWEEN.Tween(currentCamPos).to({
            x: 0,
            y: 0,
            z: 140
        }, 1800);
        for (var i in lines) {
            for (var j in planetsEdges) {
                lines[i].visible = true;
                planetsEdges[j].visible = true;

            }
        }
        camera.updateProjectionMatrix();
        tween2.easing(TWEEN.Easing.Exponential.InOut);
        tween2.interpolation(TWEEN.Interpolation.CatmullRom);
        tween2.onUpdate(() => {
            camera.lookAt(0, 0, 0);
            avatarImg.style.display = 'none';
            planetImg.style.display = 'none';
            paragraphDiv.style.display = 'none';
            avatarBgImg.style.display = 'none';
            returnBtn.style.display = 'none';
            obj2.visible = true;
        }), tween2.start();
    });

    returnBtn.addEventListener("click", () => {
        const sized = window.matchMedia('(max-width: 768px)')
        var dist;
        if (sized.matches) {
            dist = 220
        } else {
            dist = 140
        }
        avatarScreen = false;
        removingObj = '';
        if (mediaQuery.matches) {
            title.style.display = 'block';
        }
        var tween2 = new TWEEN.Tween(currentCamPos).to({
            x: 0,
            y: 0,
            z: dist
        }, 1800);
        for (var i in lines) {
            for (var j in planetsEdges) {
                lines[i].visible = true;
                planetsEdges[j].visible = true;

            }
        }
        camera.updateProjectionMatrix();
        tween2.easing(TWEEN.Easing.Exponential.InOut);
        tween2.interpolation(TWEEN.Interpolation.CatmullRom);
        tween2.onUpdate(() => {
            camera.lookAt(0, 0, 0);
            avatarImg.style.display = 'none';
            planetImg.style.display = 'none';
            paragraphDiv.style.display = 'none';
            avatarBgImg.style.display = 'none';
            returnBtn.style.display = 'none';
            // scene.remove(obj1);
            obj2.visible = true;
        }), tween2.start();
    });

    audioBtn.addEventListener("click", () => {
        if (audioBtn.checked) {
            audioBtn.classList.remove('fa-volume-up');
            audioBtn.classList.add('fa-volume-off');
            audio.muted = true;
        } else {
            audioBtn.classList.remove('fa-volume-off');
            audioBtn.classList.add('fa-volume-up');
            audio.muted = false;
        }
    }, false);
    modeBtn.addEventListener("click", () => {


        if (modeBtn.checked) {
            isNight = true;
            modeChanger(selected);
            removingObj = null;
            audio.src = './assets/audio/metaNight.wav';
            modeBtn.style.color = "#FFF";
            audioBtn.style.color = "#FFF";
            modeBtn.style.boxShadow = "-10px -10px 15px rgb(111 111 111 / 10%), 10px 10px 15px rgb(61 61 61 / 10%)";
            audioBtn.style.boxShadow = "-10px -10px 15px rgb(111 111 111 / 10%), 10px 10px 15px rgb(61 61 61 / 10%)";
            // console.log(currentDom);
            defaultCol = 0xffffff;
            defaultBackCol = 0x222222;
            modeBtn.classList.remove('fa-moon-o');
            modeBtn.classList.add('fa-sun-o');
            for (var i in planetsEdges) {
                planetsEdges[i].material.color.setHex(defaultCol);
            }
            for (var i in lines) {
                lines[i].material.color.setHex(defaultCol);
            }
            renderer.setClearColor(defaultBackCol, 1.0);
            // body.style.color = '#fff';
            // body.style.background = '#000';
            returnBtn.style.color = '#fff';
            // scrollBtn.style.color = '#fff';
            canvas.style.background = "#000";
            navBar.style.background = 'rgba(0,0,0,0)';
            for (var i = 0; i < 4; i++) {
                navSection[i].style.background = '#333';
                navSection[i].style.color = '#fff';
            }
            topTitle.style.color = '#fff';
            canvas.style.color = "#fff";
            // paragraphDiv.style.color = '#fff';
            // modeBtn.style.background = '#fff';
            paragraphDiv.style.color = '#fff';
            // navSection.style.color = '#fff';
        } else {
            isNight = false;
            modeChanger(selected);
            removingObj = null;
            audio.src = './assets/audio/metaDay.wav';
            modeBtn.style.color = "#000";
            audioBtn.style.color = "#000";
            navBar.style.background = '#F5F2F5';
            modeBtn.style.boxShadow = "-10px -10px 15px rgba(230, 230, 230, 0.3), 10px 10px 15px rgba(180, 180, 180, 0.3);";
            audioBtn.style.boxShadow = "-10px -10px 15px rgba(230, 230, 230, 0.3), 10px 10px 15px rgba(180, 180, 180, 0.3);";
            modeBtn.classList.remove('fa-sun-o');
            modeBtn.classList.add('fa-moon-o');
            // isNight = false;
            defaultCol = 0x000000;
            defaultBackCol = 0xF5F2F5;

            for (var i in planetsEdges) {
                planetsEdges[i].material.color.setHex(defaultCol);
            }
            for (var i in lines) {
                lines[i].material.color.setHex(defaultCol);
            }
            renderer.setClearColor(defaultBackCol, 1.0);
            topTitle.style.color = '#000';
            returnBtn.style.color = '#000';

            for (var i = 0; i < 4; i++) {
                navSection[i].style.background = '#F5F2F5';
                navSection[i].style.color = '#333';
            }

            // scrollBtn.style.color = '#000';
            paragraphDiv.style.color = '#000';
            // modeBtn.style.background = '#F5F2F5';
            // navSection.style.color = '#000';
        }
        if (!avatarScreen) {
            // obj2.name = null;
        }
    }, false);

} //end of init


function onDocumentMouseDown(event) {

    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDownX = targetRotationX;

    mouseYOnMouseDown = event.clientY - windowHalfY;
    targetRotationOnMouseDownY = targetRotationY;
}

function onDocumentMouseMove(event) {

    // mouseX = event.clientX - windowHalfX;

    // targetRotationX = (mouseX - mouseXOnMouseDown) * 0.0025;

    // mouseY = event.clientY - windowHalfY;

    // targetRotationY = (mouseY - mouseYOnMouseDown) * 0.00025;

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
}


function mouseCamera() {
    camera.position.x += (mouseX - camera.position.x) * 0.00005;
    camera.position.y += (-mouseY - camera.position.y) * 0.00005;
}



function onDocumentMouseUp(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

// function onDocumentTouchStart(event) {

//     if (event.touches.length == 1) {

//         event.preventDefault();

//         mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
//         targetRotationOnMouseDownX = targetRotationX;

//         mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
//         targetRotationOnMouseDownY = targetRotationY;

//     }

// }

// function onDocumentTouchMove(event) {

//     if (event.touches.length == 1) {

//         event.preventDefault();

//         mouseX = event.touches[0].pageX - windowHalfX;
//         targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.05;

//         mouseY = event.touches[0].pageY - windowHalfY;
//         targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.05;

//     }

// }


function resize(renderer) {


    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }


    // labelRenderer.setSize(WIDTH, HEIGHT);
    postprocessing.composer.setSize(WIDTH, HEIGHT);
    return needResize;
}


function initPostprocessing() {
    const renderPass = new RenderPass(scene, camera);
    const bokehPass = new BokehPass(scene, camera, {
        focus: 60.0,
        aperture: 0.05,
        maxblur: 0.001,
        width: WIDTH,
        height: HEIGHT
    });
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;
}



function modeChanger(planet) {
    if (!isNight && planet == 'COOKIE') {
        isNight = false;
        removingObj = scene.getObjectByName('cookie_night');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[0], planets[0]);
        obj2.name = "";
        avatarImg.src = avatars[0];
        planetImg.src = avatar_planets[0];
        planetTitle.innerHTML = planetTitleTypesDay[0].cookie;
        paragraphDiv.innerHTML = paragraphTypesDay[0].cookie;
        avatarDiagramImg.src = './assets/img/avatar_diagram/cookie.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgDay;
    } else if (isNight && planet == 'COOKIE') {
        isNight = true;
        removingObj = scene.getObjectByName('cookie_day');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[3], planets[0]);
        avatarImg.src = avatars[3];
        planetImg.src = avatar_planets[3];
        planetTitle.innerHTML = planetTitleTypesNight[0].cookie;
        paragraphDiv.innerHTML = paragraphTypesNight[0].cookie;
        avatarDiagramImg.src = './assets/img/avatar_diagram/cookie_dark.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgNight;

    }
    if (!isNight && planet == 'AI') {
        isNight = false;
        removingObj = scene.getObjectByName('ai_night');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[4], planets[2]);
        avatarImg.src = avatars[1];
        planetImg.src = avatar_planets[1];
        planetTitle.innerHTML = planetTitleTypesDay[0].ai;
        paragraphDiv.innerHTML = paragraphTypesDay[0].ai;
        avatarDiagramImg.src = './assets/img/avatar_diagram/ai.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgDay;


    } else if (isNight && planet == 'AI') {
        isNight = true;
        removingObj = scene.getObjectByName('ai_day');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[1], planets[2]);
        avatarImg.src = avatars[4];
        planetImg.src = avatar_planets[4];
        planetTitle.innerHTML = planetTitleTypesNight[0].ai;
        paragraphDiv.innerHTML = paragraphTypesNight[0].ai;
        avatarDiagramImg.src = './assets/img/avatar_diagram/ai_dark.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgNight;

    }
    if (!isNight && planet == 'CLOUD') {
        isNight = false;
        removingObj = scene.getObjectByName('cloud_night');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[2], planets[1]);
        avatarImg.src = avatars[2];
        planetImg.src = avatar_planets[2];
        planetTitle.innerHTML = planetTitleTypesDay[0].cloud;
        paragraphDiv.innerHTML = paragraphTypesDay[0].cloud;
        avatarDiagramImg.src = './assets/img/avatar_diagram/cloud.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgDay;

    } else if (isNight && planet == 'CLOUD') {
        isNight = true;
        removingObj = scene.getObjectByName('cloud_day');
        scene.remove(removingObj);
        loadAvatarPlanet(avatar_planet3D[5], planets[1]);
        avatarImg.src = avatars[5];
        planetImg.src = avatar_planets[5];
        planetTitle.innerHTML = planetTitleTypesNight[0].cloud;
        paragraphDiv.innerHTML = paragraphTypesNight[0].cloud;
        avatarDiagramImg.src = './assets/img/avatar_diagram/cloud_dark.png';
        scrollBtnContainer.innerHTML = scrollBtn;
        avatarBgImg.src = avatarBgImgNight;
    }
    paragraphDiv.appendChild(avatarDiagramImg);
    removingObj = null;

}



function render() {
    if (scene.children[9]) {
        mouseCamera();
    }

    if (resize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    planets[0].position.set(27, 20, 50);
    planets[1].position.set(0, 5, 80);
    planets[2].position.set(-35, -15, 40);

    planets[0].scale.set(1., 1., 1.);
    planets[0].rotation.z -= 0.0001;
    planets[1].scale.set(1., 1., 1.0);
    planets[1].rotation.x += 0.0001;
    planets[2].scale.set(1., 1., 1.);
    planets[2].rotation.z += 0.0001;


    // lines[0].rotation.y += 0.0001;
    // lines[1].rotation.y -= 0.0001;

    // camera.lookAt(scene.position);
    //horizontal rotation   

    //vertical rotation 
    // scene.traverse(function(object) {
    //     if (object.isMesh) {
    //         avatar.rotation.y += (targetRotationX - avatar.rotation.y) * 0.1;

    //         finalRotationY = (targetRotationY - avatar.rotation.x);
    //     avatar.rotation.x += finalRotationY * 0.05;

    //     finalRotationY = (targetRotationY - avatar.rotation.x);  
    // if (avatar.rotation.x <= 1 && avatar.rotation.x >= -1) {

    //     avatar.rotation.x += finalRotationY * 0.1;
    // }
    // if (avatar.rotation.x > 1) {

    //     avatar.rotation.x = 1
    // }

    // if (avatar.rotation.x < -1) {

    //     avatar.rotation.x = -1
    // }
    // }


    // })





    // for (let i = 0; i < planetsNum; i++) {
    // planets[i].rotatioY.y += rand_rotVal;
    // planets[i].position.x = trigs[i]['r'] * trigs[i]['x'];
    // planets[i].position.y = trigs[i]['r'] * trigs[i]['y'];
    // planets[i].position.z = trigs[i]['r'] * trigs[i]['z'];
    // planets[i].position.set(20 + i, 0, 40 + i);
    // planets[0].position.x = trigs[i]['r'] * trigs[i]['x'];
    // planets[1].position.y = trigs[i]['r'] * trigs[i]['y'];
    // planets[2].position.z = trigs[i]['r'] * trigs[i]['z'];
    // };
    // planets[0].position.set = 20;;
    // planets[1].position.y = 0;
    // planets[2].position.z = 50;

    // Store trig functions
    // for sphere orbits
    // MUST BE INSIDE RENDERING FUNCTION OR THETA VALUES ONLY GET SET ONCE

    // raycaster.setFromCamera(mouse, camera);

    // const intersection = raycaster.intersectObject(planets);

    // if (intersection.length > 0) {

    //     const instanceId = intersection[0].instanceId;
    //     planet.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
    //     planet.instanceColor.needsUpdate = true;



    //     renderer.render(scene, camera);
    //     labelRenderer.render(scene, camera);

    //     // stats.update();

}



let rand_rotVal = Math.random() * 1;
let count = 0;



function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    postprocessing.composer.render(0.8);
    render();
    // const time = performance.now() / 1000;


    // scene.traverse(function(child) {
    //     child.rotatioY.y += rand_rotVal;
    //     const rot = time * count;
    //     child.rotation.x = rot;
    //     child.rotation.z = rot;
    // console.log((count + (time / 200)) / 14);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // planet.rotation.y += 0.0002
    //     const speed = 1 + ndx * .1;
    //     const rot = time * speed;
    //     planets.rotation.x = rot;
    //     planets.rotation.y = rot;

    // });
    // renderer.toneMappingExposure = 1.0;
    // renderer.clear(); // <-
    // });
    // count++;
    renderer.render(scene, camera);
    // labelRenderer.render(scene, camera);



}