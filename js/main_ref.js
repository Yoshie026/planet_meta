// Import all the stuff required
import * as THREE from './libs/three/build/three.module.js'
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './libs/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from './libs/three/examples/jsm/utils/RoughnessMipmapper.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './libs/three/examples/jsm/libs/dat.gui.module.js';
import Stats from './libs/three/examples/jsm/libs/stats.module.js';
import { DRACOLoader } from './libs/three/examples/jsm/loaders/DRACOLoader.js';

import { EffectComposer } from './libs/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './libs/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './libs/three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from './libs/three/examples/jsm/shaders/FXAAShader.js';
import { GammaCorrectionShader } from './libs/three/examples/jsm/shaders/GammaCorrectionShader.js';

import { BokehPass } from './libs/three/examples/jsm/postprocessing/BokehPass.js';

import cameras from './cameras.js';

let camera, bokehCamera, renderer, scene, controls, stats;

let WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2;


let count = 0,
    cubeCamera, cubeCamera1, cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;

// let count = 0, cubeCamera, cubeCamera1, cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;


let pmrem;

// let lightr, lightl;

let clock, mixer;

let car;

let blurUniforms;

const postprocessing = { cinematic: true, play: false };

let composer, fxaaPass, gammaCorrection;

let camnum = 0;

let carMaterials = [],
    stripesMaterials = [];

let combinedColors = {
    carColor: '#ffffff',
    stripesColor: '#ff0000'
};

let carColors = {
    aqua: '#00ffff',
    black: '#000000',
    blue: '#0000ff',
    fuchsia: '#FF00FF',
    grey: '#808080',
    green: '#008000',
    lime: '#00ff00',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    purple: '#800080',
    red: '# ff0000 ',
    silver: '#C0C0C0',
    teal: '#008080',
    white: '#ffffff',
    yellow: '#FFFF00'
}

let stripesColors = {
    aqua: '#00ffff',
    black: '#000000',
    blue: '#0000ff',
    fuchsia: '#FF00FF',
    grey: '#808080',
    green: '#008000',
    lime: '#00ff00',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    purple: '#800080',
    red: '#ff0000',
    silver: '#C0C0C0',
    teal: '#008080',
    white: '#ffffff',
    yellow: '#FFFF00'
}

var guiWindow = document.querySelector(".gui");

init();

function init() {

    // CLOCK

    clock = new THREE.Clock();

    // SCENE

    scene = new THREE.Scene();

    // CAMERA

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100000);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 10;

    bokehCamera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 20);

    // RENDERER

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(1); // <- use 1 is on a very high resolution display - might produce aliasing, even with the AA applied
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = "canvas";
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);

    // To move the camera around the central point with the mouse
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.maxDistance = 13;
    // controls.minDistance = 6;

    // CUBE CAMERAS, for reference only

    // cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(1024, {
    //     format: THREE.RGBEFormat,
    //     generateMipmaps: true,
    //     minFilter: THREE.LinearMipmapLinearFilter,
    //     encoding: THREE.sRGBEncoding
    // });

    // cubeCamera1 = new THREE.CubeCamera(0.25, 100, cubeRenderTarget1);

    // cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(1024, {
    //     format: THREE.RGBEFormat,
    //     generateMipmaps: true,
    //     minFilter: THREE.LinearMipmapLinearFilter,
    //     encoding: THREE.sRGBEncoding
    // });

    // cubeCamera2 = new THREE.CubeCamera(0.25, 100, cubeRenderTarget2);

    // PMREM GENERATOR, FOR ENV MAPS

    pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();

    // POST PROCESSING

    const bokehPass = new BokehPass(scene, bokehCamera, {
        focus: 1.0,
        aperture: 0.025,
        maxblur: 0.02,

        width: WIDTH,
        height: HEIGHT
    });

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;

    const renderPass = new RenderPass(scene, camera);

    fxaaPass = new ShaderPass(FXAAShader);
    gammaCorrection = new ShaderPass(GammaCorrectionShader);

    blurUniforms = {
        iTime: { value: 0.0 },
        cinematic: { value: true }
    }

    // Override the shader since the original one focuses on objects, not on depth
    bokehPass.materialBokeh.onBeforeCompile = shader => {

        shader.uniforms = {
            ...shader.uniforms,
            ...blurUniforms
        }

        shader.uniforms.nearClip.value = 10.0;
        shader.uniforms.farClip.value = 100.0;

        shader.fragmentShader =
            `
            precision  mediump  float;
            precision  mediump  int;

            uniform  sampler2D  tDiffuse;
            uniform  sampler2D  tColor;
            uniform  sampler2D  tDepth;
            uniform  float  iTime;
            uniform  float  noiseamount;
            uniform float maxblur;
            uniform float aspect;
            uniform float aperture;
            uniform float nearClip;
            uniform float farClip;
            uniform float focus;
            uniform bool cinematic;
        
            varying  vec2  vUv;
        
            float  AMPLITUDE = 0.0;

            const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
            const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
            const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
            const float ShiftRight8 = 1. / 256.;
            vec4 packDepthToRGBA( const in float v ) {
                vec4 r = vec4( fract( v * PackFactors ), v );
                r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
            }
            float unpackRGBAToDepth( const in vec4 v ) {
                return dot( v, UnpackFactors );
            }

            float getDepth( const in vec2 screenPosition ) {
                #if DEPTH_PACKING == 1
                return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
                #else
                return texture2D( tDepth, screenPosition ).x;
                #endif
            }
        
            float  normpdf(in float  x,  in float  sigma)  {
                return  0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
            }

            vec3 czm_saturation(vec3 rgb, float adjustment) {
                // Algorithm from Chapter 16 of OpenGL Shading Language
                const vec3 W = vec3(0.2125, 0.7154, 0.0721);
                vec3 intensity = vec3(dot(rgb, W));
                return mix(intensity, rgb, adjustment);
            }
        
            void main()  {
                
                vec2  uv = vUv;

                vec3 c_step_1 = vec3(0.0);

			    if (cinematic) {

                    float factor = focus + getDepth( vUv );//( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

                    vec2 dofblur = vec2 ( factor * maxblur ); //clamp( factor * aperture, -maxblur, maxblur ) );

                    vec2 dofblur9 = dofblur * 0.9;
                    vec2 dofblur7 = dofblur * 0.7;
                    vec2 dofblur4 = dofblur * 0.4;

                    vec2 aspectcorrect = vec2( 1.0, aspect );

                    vec4 col = vec4( 0.0 );

                    col += texture2D( tColor, vUv.xy );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 )  * aspectcorrect ) * dofblur );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 )  * aspectcorrect ) * dofblur );

                    col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 )  * aspectcorrect ) * dofblur9 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 )  * aspectcorrect ) * dofblur9 );

                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 )  * aspectcorrect ) * dofblur7 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  )  * aspectcorrect ) * dofblur7 );

                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 )  * aspectcorrect ) * dofblur4 );
                    col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  )  * aspectcorrect ) * dofblur4 );

                    gl_FragColor = col / 41.0;

                } else {

                    gl_FragColor = texture2D( tColor, vUv.xy );

                }

                // desaturate a bit and increase the contrast, to make it more dramatic
                gl_FragColor.rgb = czm_saturation(gl_FragColor.rgb, 0.6);
                gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.2));

                //  grain  effect
                float  strength = 5.0;
                float  x = (uv.x + 4.0) * (uv.y + 4.0) * (iTime * 10.0);
                vec3  grain = vec3(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;
                gl_FragColor.rgb += grain;

                gl_FragColor.a = 1.0;
            }
            `

        console.log(shader);
    }

    fxaaPass.material.uniforms['resolution'].value.x = 1 / (WIDTH * renderer.getPixelRatio());
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (HEIGHT * renderer.getPixelRatio());

    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(gammaCorrection);
    composer.addPass(fxaaPass);
    composer.addPass(bokehPass);

    //

    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('assets/')
        .load('carBeach.hdr', function(texture) {

            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            initGUIwithHDRI();

            scene.environment = envMap;

            texture.dispose();
            // pmremGenerator.dispose();

            // CAR MODEL

            // use of RoughnessMipmapper is optional
            const roughnessMipmapper = new RoughnessMipmapper(renderer);

            // LOAD THE GLTF FILE
            // First set the path where the model is
            const gltfloaderDraco = new GLTFLoader().setPath('assets/CarLights/');
            const gltfloader = new GLTFLoader().setPath('assets/');
            // // Then load the model
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('js/libs/three/examples/js/libs/draco/');
            dracoLoader.setDecoderConfig({ type: 'js' });
            gltfloaderDraco.setDRACOLoader(dracoLoader);

            gltfloaderDraco.load('MustangDraco.gltf', function(gltf) {

                car = gltf.scene;

                gltf.scene.traverse(function(child) {

                    if (child.isMesh) {


                        child.castShadow = true;
                        child.receiveShadow = true;

                        // console.log(child.material);
                        if (child.material.name === 'glass_tinted') {
                            child.material.transparent = true;
                            child.castShadow = false;
                            child.receiveShadow = false;
                        }

                        if (child.material.name === 'car_paint_shader') {
                            carMaterials.push(child.material);
                        }

                        if (child.material.name === 'car_stripes') {
                            stripesMaterials.push(child.material);
                        }

                    }

                });

                car = gltf.scene;
                // gltf.scene.position.set(0, 0.675 * 2, 0);
                gltf.scene.scale.set(2, 2, 2);
                gltf.scene.rotateY(Math.PI);

                scene.add(gltf.scene);


                roughnessMipmapper.dispose();

                // LOADS THE ENVIRONMENT
                gltfloader.load('environmentFlatSand.glb', function(gltfenv) {

                    gltfenv.scene.traverse(function(child) {

                        if (child.isMesh) {

                            child.castShadow = true;
                            child.receiveShadow = true;

                        }

                    });

                    gltfenv.scene.position.set(0, -1.4, 0);
                    gltfenv.scene.scale.set(3, 3, 3);

                    scene.add(gltfenv.scene);


                    if (postprocessing.play) cameraHandler();

                    renderer.setAnimationLoop(animate);

                });

            });

        });

    // Generate an env map from the cubemap compatible with the PBM of the 3D model
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();
    pmremGenerator.compileEquirectangularShader();

    // Use a jpg for scene background
    // The HDR produces very low resolution maps, just for the reflections
    // This does not affect the reflections (scene.environment does)

    const textureLoader = new THREE.TextureLoader();

    const textureEquirec = textureLoader.load('assets/sky4/sky4.jpg')
    textureEquirec.minFilter = THREE.LinearFilter;
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.encoding = THREE.sRGBEncoding;

    scene.background = textureEquirec;

    // SOME LIGHTS

    const sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunlight.position.set(25, 17, 0);
    // sunlight.position.set(4, 1.25, 0);
    sunlight.castShadow = true;

    sunlight.shadow.mapSize.width = 512; // default
    sunlight.shadow.mapSize.height = 512; // default
    sunlight.shadow.camera.near = 0.5; // default
    sunlight.shadow.camera.far = 60; // default

    sunlight.shadow.bias = -0.0005;

    // sunlight.target = car;
    scene.add(sunlight);

    // The lights of the car, need implementation

    // lightr = new THREE.SpotLight(0xffffff, 1.0);
    // // light.position.set(0.039130228544244486, 1.319493863119135, 0.875490893203601); //default; light shining from top
    // lightr.position.set(-1.5321056998963472, 1.8181251884497356, -4.5244284997700292); //default; light shining from top
    // lightr.castShadow = true; // default false
    // scene.add(lightr);

    // lightr.shadow.mapSize.width = 1024;
    // lightr.shadow.mapSize.height = 1024;
    // lightr.shadow.camera.near = 0.5;
    // lightr.shadow.camera.far = 20;
    // lightr.shadow.bias = -0.00005;
    // lightr.shadow.radius = 8;
    // lightr.penumbra = 1;
    // lightr.angle = Math.PI / 4;

    // const lightRightTarget = new THREE.Object3D();
    // scene.add(lightRightTarget);
    // // lightTarget.position.set(-0.041139835636156384, 0.8076724200066481, 12.974820722302256)
    // lightRightTarget.position.set(-0.7843125925724836, 0.4075115246498199, -7.96991858549658)
    // lightr.target = lightRightTarget;

    // lightl = new THREE.SpotLight(0xffffff, 1.0);
    // // light.position.set(0.039130228544244486, 1.319493863119135, 0.875490893203601); //default; light shining from top
    // lightl.position.set(1.5321056998963472, 1.8181251884497356, -4.5244284997700292); //default; light shining from top
    // lightl.castShadow = true; // default false
    // scene.add(lightl);

    // lightl.shadow.mapSize.width = 1024;
    // lightl.shadow.mapSize.height = 1024;
    // lightl.shadow.camera.near = 0.5;
    // lightl.shadow.camera.far = 20;
    // lightl.shadow.bias = -0.00005;
    // lightl.shadow.radius = 8;
    // lightl.penumbra = 1;
    // lightl.angle = Math.PI / 4;

    // const lightLeftTarget = new THREE.Object3D();
    // scene.add(lightLeftTarget);
    // // lightTarget.position.set(-0.041139835636156384, 0.8076724200066481, 12.974820722302256)
    // lightLeftTarget.position.set(0.7843125925724836, 0.4075115246498199, -7.96991858549658)
    // lightl.target = lightLeftTarget;

    //

    window.addEventListener('resize', onWindowResize);

    // stats
    // stats = new Stats();
    // document.body.appendChild(stats.dom);

}

function animate() {

    // console.log(camera.position, camera.rotation);

    if (postprocessing.play) {
        camera.translateX(cameras.cameras[camnum].movpos.x);
        camera.translateY(cameras.cameras[camnum].movpos.y);
        camera.translateZ(cameras.cameras[camnum].movpos.z);

        camera.rotateX(cameras.cameras[camnum].movrot.x);
        camera.rotateY(cameras.cameras[camnum].movrot.y);
        camera.rotateZ(cameras.cameras[camnum].movrot.z);
    }

    const delta = clock.getDelta();
    let elapsedTime = clock.getElapsedTime();
    elapsedTime = elapsedTime % 120;

    if (mixer) mixer.update(delta);

    bokehCamera.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z,
    );

    bokehCamera.rotation.set(
        camera.rotation.x,
        camera.rotation.y,
        camera.rotation.z,
    )

    blurUniforms.iTime.value = 10.0 + elapsedTime;

    if (!postprocessing.play) {
        const distance = camera.position.distanceTo(controls.target);
        const focus = -0.5 - ((Math.max(0.000001, distance - 6) / 7) * 0.4);
        // console.log(focus);
        postprocessing.bokeh.uniforms["focus"].value = focus;
    }

    // DYNAMIC ENV MAP, for refernce only
    // cubeCamera1.position.set(
    //     camera.position.x * -1,
    //     camera.position.y * -1,
    //     camera.position.z
    // );
    //     // cubeCamera1.position.set(
    //     //     0, 0.675 * 2, 0
    //     // );

    //     car.visible = false;
    //     cubeCamera1.update(renderer, scene);
    //     // const envMapWithoutCar = pmrem.fromCubemap(cubeRenderTarget1.texture).texture;
    //     // console.log(cubeRenderTarget1.texture.encoding, THREE.sRGBEncoding)
    //     // obj.traverse((child) => {
    //     //     if (child.isMesh) child.material.envMap = envMapWithoutCar;
    //     // });

    //     car.visible = true;
    //     // cubeCamera1.update(renderer, scene);
    // const envMapWithCar = pmrem.fromCubemap(cubeRenderTarget1.texture).texture;

    //     var options = {
    //         generateMipmaps: true,
    //         minFilter: THREE.LinearMipmapLinearFilter,
    //         magFilter: THREE.LinearFilter,
    //         outputEncoding: THREE.sRGBEncoding
    //     };

    // const envMap = pmrem.fromEquirectangular(cubeRenderTarget1.texture).texture;

    // scene.environment = envMapWithCar;

    //     // scene.environment = envMapWithCar;
    //     floorMesh.material.envMap = envMapWithCar;
    //     car.traverse((child) => {
    //         if (child.isMesh) {
    //             child.material.envMap = envMapWithCar;
    //             child.material.needsUpdate = true;
    //         }
    //     })


    //     // scene.environment = envMap;

    // } else {

    //     // obj.visible = false;

    //     cubeCamera2.position.set(
    //         camera.position.x * -1,
    //         camera.position.y * -1,
    //         camera.position.z
    //     );
    //     // cubeCamera2.position.set(
    //     //     0, 0.675 * 2, 0
    //     // );

    //     // obj.visible = false;
    //     // cubeCamera2.update(renderer, scene);
    //     // const envMapWithoutCar = pmrem.fromCubemap(cubeRenderTarget2.texture).texture;
    //     // obj.traverse((child) => {
    //     //     if (child.isMesh) child.material.envMap = envMapWithoutCar;
    //     // });

    //     obj.visible = true;
    //     cubeCamera2.update(renderer, scene);
    //     const envMapWithCar = pmrem.fromCubemap(cubeRenderTarget2.texture).texture;
    //     floorMesh.material.envMap = envMapWithCar;
    //     dancer.traverse((child) => {
    //         if (child.isMesh) child.material.envMap = envMapWithCar;
    //     })

    // }

    // scene.scale.x *= -1;

    // obj.visible = true;

    // controls.update();

    // count++;

    composer.render();

    // stats.update();
}


//


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
const gui = new GUI();

function initGUIwithHDRI() {

    // const gui = new GUI();

    gui.add(postprocessing, 'cinematic').onChange(function() {

        blurUniforms.cinematic.value = postprocessing.cinematic;

    });

    gui.add(postprocessing, 'play').onChange(function() {

        if (postprocessing.play) {
            cameraHandler();
        } else {
            camera.position.x = 5;
            camera.position.y = 5;
            camera.position.z = 10;
            camera.lookAt(0, 0, 0);
        }

    });

    gui.add(combinedColors, 'carColor', carColors).onChange(() => {

        for (let i = 0, n = carMaterials.length; i < n; i++) {

            carMaterials[i].color = new THREE.Color(combinedColors.carColor);

        }

    });

    gui.add(combinedColors, 'stripesColor', stripesColors).onChange(() => {

        for (let i = 0, n = stripesMaterials.length; i < n; i++) {

            stripesMaterials[i].color = new THREE.Color(combinedColors.stripesColor);

        }

    });

    gui.close();

}



function addGUIElement() {

    var colorBtns = ["#8a0000", "#ff7300", "#ffea00", "#00de30", "#0255b5", "#f5f5f5"];
    var stripeBtns = ["#8a0000", "#ff7300", "#ffea00", "#00de30", "#0255b5", "#f5f5f5"];


    // create a new div element
    const newDiv = document.createElement("div");
    newDiv.setAttribute('id', 'gui_window');
    const h_color = document.createElement("h4");
    h_color.appendChild(document.createTextNode("CAR BODY COLOR"));
    h_color.setAttribute('id', 'gui_label');
    newDiv.appendChild(h_color);
    const h_stripe_color = document.createElement("h4");
    h_stripe_color.setAttribute('id', 'gui_label');
    h_stripe_color.appendChild(document.createTextNode("STRIPE COLOR"));




    guiWindow.appendChild(newDiv);

    const colorBtnDiv = document.createElement("div");
    colorBtnDiv.setAttribute('class', 'colorBtnDiv');
    for (var i = 0; i < colorBtns.length; i++) {
        const btns = document.createElement("button");
        btns.style.background = colorBtns[i];
        btns.setAttribute('id', 'color_btn');
        btns.checked = function() {
            this.classList.add('checked');
            let selectedCol = document.querySelector(".checked");
            selectedCol.style.opacity = "10";
        }

        colorBtnDiv.appendChild(btns);
    }
    newDiv.appendChild(colorBtnDiv);


    newDiv.appendChild(h_stripe_color);


    const stripeColorBtnDiv = document.createElement("div");
    stripeColorBtnDiv.setAttribute('class', 'stripColorBtnDiv');
    for (var i = 0; i < stripeBtns.length; i++) {
        const stripe_color_btns = document.createElement("button");
        stripe_color_btns.style.background = stripeBtns[i];
        stripe_color_btns.setAttribute('id', 'stripe_btn');
        stripe_color_btns.checked = function() {
            this.classList.add('checked');
            let selectedCol = document.querySelector(".checked");
            selectedCol.style.opacity = "10";
        }
        stripeColorBtnDiv.appendChild(stripe_color_btns);
    }
    newDiv.appendChild(stripeColorBtnDiv);


    const hoodDiv = document.createElement("div");
    hoodDiv.setAttribute('class', 'hoodDiv');
    let stripeStatus = false;
    const hoodBtn = document.createElement("button");
    hoodBtn.setAttribute('type', 'checkbox');
    hoodBtn.setAttribute('name', 'toggle1');
    hoodBtn.setAttribute('id', 'toggle1');
    hoodBtn.setAttribute('class', 'hoodBtn');
    hoodBtn.innerHTML = "STRIPES OFF";



    newDiv.appendChild(hoodDiv);
    hoodDiv.appendChild(hoodBtn);
    // hoodBtn.appendChild(h_stripe_status);

    hoodBtn.onclick = function() {
        switch (stripeStatus) {
            case false:
                stripeStatus = true;
                hoodBtn.innerHTML = "STRIPES ON";
                hoodBtn.style.color = 'rgb(7, 221, 117)';
                hoodBtn.style.borderColor = 'rgb(7, 221, 117)';
                break;
            case true:
                stripeStatus = false;
                hoodBtn.innerHTML = "STRIPES OFF";
                hoodBtn.style.color = '#fff';
                hoodBtn.style.borderColor = '#fff';
                //match the color
                break;
        }
    };


    const sun_svg = document.getElementById('sun_icon');
    const moon_svg = document.getElementById('moon_icon');

    const icon_sun = document.createElement("i");
    icon_sun.setAttribute('class', 'sun fas fa-sun');
    const icon_moon = document.createElement("i");
    icon_moon.setAttribute('class', 'dark fas fa-moon');

    icon_sun.appendChild(sun_svg);
    icon_moon.appendChild(moon_svg);


    const sceneLightDiv = document.createElement("div");
    sceneLightDiv.setAttribute('class', 'sceneLightDiv');
    let sceneLightStatus = false;
    const sceneLightBtn = document.createElement("button");
    sceneLightBtn.setAttribute('type', 'checkbox');
    sceneLightBtn.setAttribute('name', 'toggle1');
    sceneLightBtn.setAttribute('id', 'toggle1');
    sceneLightBtn.setAttribute('class', 'sceneLightBtn');
    sceneLightBtn.innerHTML = "DAY";


    newDiv.appendChild(sceneLightDiv);
    sceneLightDiv.appendChild(sceneLightBtn);

    sceneLightBtn.onclick = function() {
        switch (sceneLightStatus) {
            case false:
                sceneLightStatus = true;
                sceneLightBtn.innerHTML = "NIGHT";
                sceneLightBtn.style.color = 'red';
                sceneLightBtn.style.borderColor = 'red';
                sceneLightDiv.style.borderColor = 'red';
                break;
            case true:
                sceneLightStatus = false;
                sceneLightBtn.innerHTML = "DAY";
                sceneLightBtn.style.color = '#fff';
                sceneLightBtn.style.borderColor = '#fff';
                sceneLightDiv.style.borderColor = '#fff';
                //match the color
                break;
        }
    };




    const animDiv = document.createElement("div");
    animDiv.setAttribute('class', 'animDiv');
    let animStatus = false;
    const animBtn = document.createElement("button");
    animBtn.setAttribute('type', 'checkbox');
    animBtn.setAttribute('name', 'toggle1');
    animBtn.setAttribute('id', 'toggle1');
    animBtn.setAttribute('class', 'animBtn');
    animBtn.innerHTML = "ANIMATION <div class='animIcon'><b>▶︎</b></div>";


    newDiv.appendChild(animDiv);
    animDiv.appendChild(animBtn);

    animBtn.onclick = function() {
        switch (animStatus) {
            case false:
                animStatus = true;
                animBtn.innerHTML = "ANIMATION <div class='animIcon'><b>‖</b></dvi>";
                animBtn.style.color = 'red';
                animBtn.style.borderColor = 'red';
                document.querySelector('.animIcon').style.borderColor = 'red';
                animDiv.style.borderColor = 'red';




                gui.add(postprocessing, 'play').onChange(function() {

                    if (postprocessing.play) {
                        cameraHandler();
                    } else {
                        camera.position.x = 5;
                        camera.position.y = 5;
                        camera.position.z = 10;
                        camera.lookAt(0, 0, 0);
                    }

                });

                break;
            case true:
                animStatus = false;
                animBtn.innerHTML = "ANIMATION <div class='animIcon'><b>▶︎</b></div>";
                animBtn.style.color = '#fff';
                animBtn.style.borderColor = '#fff';
                document.querySelector('.animIcon').style.borderColor = '#fff';
                animDiv.style.borderColor = '#fff';

                gui.add(postprocessing, 'play').onChange(function() {

                    if (postprocessing.play) {
                        cameraHandler();
                    } else {
                        camera.position.x = 5;
                        camera.position.y = 5;
                        camera.position.z = 10;
                        camera.lookAt(0, 0, 0);
                    }

                });
                //match the color
                break;
        }
    };

    const cinemaModeDiv = document.createElement("div");
    cinemaModeDiv.setAttribute('class', 'cinemaModeDiv');
    let cinemaModeStatus = false;
    const cinemaModeBtn = document.createElement("button");
    cinemaModeBtn.setAttribute('type', 'checkbox');
    cinemaModeBtn.setAttribute('name', 'toggle1');
    cinemaModeBtn.setAttribute('id', 'toggle1');
    cinemaModeBtn.setAttribute('class', 'cinemaModeBtn');
    cinemaModeBtn.innerHTML = "CINEMA MODE OFF";



    newDiv.appendChild(cinemaModeDiv);
    cinemaModeDiv.appendChild(cinemaModeBtn);

    cinemaModeBtn.onclick = function() {
        switch (cinemaModeStatus) {
            case false:
                cinemaModeStatus = true;
                cinemaModeBtn.innerHTML = "CINEMA MODE ON";
                cinemaModeBtn.style.color = 'rgb(7, 221, 117)';
                cinemaModeBtn.style.borderColor = 'rgb(7, 221, 117)';
                break;
            case true:
                cinemaModeStatus = false;
                cinemaModeBtn.innerHTML = "CINEMA MODE OFF";
                cinemaModeBtn.style.color = '#fff';
                cinemaModeBtn.style.borderColor = '#fff';
                //match the color
                break;
        }
    };



    gui.add(postprocessing, 'cinematic').onChange(function() {

        blurUniforms.cinematic.value = postprocessing.cinematic;

    });

    gui.add(postprocessing, 'play').onChange(function() {

        if (postprocessing.play) {
            cameraHandler();
        } else {
            camera.position.x = 5;
            camera.position.y = 5;
            camera.position.z = 10;
            camera.lookAt(0, 0, 0);
        }

    });

    gui.add(combinedColors, 'carColor', carColors).onChange(() => {

        for (let i = 0, n = carMaterials.length; i < n; i++) {

            carMaterials[i].color = new THREE.Color(combinedColors.carColor);

        }

    });

    gui.add(combinedColors, 'stripesColor', stripesColors).onChange(() => {

        for (let i = 0, n = stripesMaterials.length; i < n; i++) {

            stripesMaterials[i].color = new THREE.Color(combinedColors.stripesColor);

        }

    });



    // animation


    // add the newly created element and its content into the DOM
}

addGUIElement();

function cameraHandler() {

    camera.position.set(
        cameras.cameras[camnum].pos.x,
        cameras.cameras[camnum].pos.y,
        cameras.cameras[camnum].pos.z
    );
    camera.rotation.set(
        cameras.cameras[camnum].rot._x,
        cameras.cameras[camnum].rot._y,
        cameras.cameras[camnum].rot._z
    );
    camera.fov = cameras.cameras[camnum].fov;
    postprocessing.bokeh.uniforms["focus"].value = cameras.cameras[camnum].focus;

    if (postprocessing.play) {
        setTimeout(() => {
            camnum++;
            if (camnum > cameras.cameras.length - 1) camnum = 0;
            cameraHandler();
        }, 8000 + Math.random() * 4000);
    }

}