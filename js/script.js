/**
 *
 * Christmas tree with three.js
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Script Tutorials
 * http://www.script-tutorials.com/
 */

var container;
var camera, scene, renderer, group;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// initialize and start animation
init();
animate();

function init() {

    // prepare the container
    container = document.createElement('div');
    document.body.appendChild(container);

    // display Info
    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    container.appendChild(info);

    // initialize the scene
    scene = new THREE.Scene();

    // add the fog
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // set the camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 100, 500);
    scene.add(camera);

    // create the empty scene group
    group = new THREE.Object3D();
    scene.add(group);

    // prepare materials
    var imgTexture = THREE.ImageUtils.loadTexture('img/texture.jpg');
    imgTexture.repeat.set(1, 1);
    imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
    imgTexture.anisotropy = 16;
    imgTexture.needsUpdate = true;

    var shininess = 50, specular = 0x333333, bumpScale = 1, shading = THREE.SmoothShading;

    var materials = [];
    materials.push( new THREE.MeshPhongMaterial( { map: imgTexture, bumpMap: imgTexture, bumpScale: bumpScale, color: 0xff0000, ambient: 0xffffff, specular: specular, shininess: shininess, shading: shading } ) );
    materials.push( new THREE.MeshPhongMaterial( { map: imgTexture, color: 0x008800, ambient: 0xffffff, specular: specular, shininess: shininess, shading: shading } ) );
    materials.push( new THREE.MeshPhongMaterial( { map: imgTexture, color: 0x584000, ambient: 0xffffff, shading: shading } ) );
    materials.push( new THREE.MeshPhongMaterial( { map: imgTexture, color: 0xff0000, ambient: 0xffffff, shading: shading } ) );

    // add the Trunk
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 20, 300, 30, 1, false), materials[2]);
    group.add(trunk);

    // add branch function
    function addBranch(count, x, y, z, opts, material, rotate) {

        // prepare star-like points
        var points = [], l;
        for (i = 0; i < count * 2; i++) {
            if (i % 2 == 1) {
                l = count * 2;
            } else {
                l = count * 4;
            }
            var a = i / count * Math.PI;
            points.push( new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));

            if (rotate && i % 2 == 0) {
                var sphGeometry = new THREE.SphereGeometry(8);
                sphMesh = new THREE.Mesh(sphGeometry, materials[0]);
                sphMesh.position.set(Math.cos(a) * l*1.25, y, Math.sin(a) * l*1.25);
                group.add(sphMesh);
            }
        }

        var branchShape = new THREE.Shape(points);
        var branchGeometry = new THREE.ExtrudeGeometry(branchShape, opts);
        var branchMesh = new THREE.Mesh(branchGeometry, material);

        branchMesh.position.set(x, y, z);

        // rotate 90 degrees
        if (rotate) {
            branchMesh.rotation.set(Math.PI / 2, 0, 0);
        } else {
            branchMesh.rotation.set(0, 0, Math.PI / 2);
        }

        // add branch to the group
        group.add(branchMesh);
    }

    // options
    var options = {
        amount: 6,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 2
    };

    // add 10 branches
    var iBranchCnt = 14;
    for (i1 = 0; i1 < iBranchCnt; i1++) {
        addBranch(iBranchCnt + 3 - i1, 0, -125 + i1*20, 0, options, materials[1], true);
    }

    // add the star
    var starOpts = {
        amount: 4,
        bevelEnabled: false
    };
    addBranch(5, 0, 160, -2, starOpts, materials[3], false);

    // add the ground
    var groundColor = new THREE.Color(0xd2ddef);
    var groundTexture = THREE.ImageUtils.generateDataTexture(1, 1, groundColor);
    var groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, map: groundTexture });

    var groundTexture = THREE.ImageUtils.loadTexture('img/ground.jpg', undefined, function() { groundMaterial.map = groundTexture });
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;

    var groundMesh = new THREE.Mesh( new THREE.PlaneGeometry(20000, 20000), groundMaterial);
    groundMesh.position.y = -150;
    groundMesh.rotation.x = - Math.PI / 2;
    group.add(groundMesh);

    // add snowflakes
    var sfMats = [];
    var sfTexture = THREE.ImageUtils.loadTexture('img/snowflake.png');
    var sfGeometry = new THREE.Geometry();
    for (i = 0; i < 10000; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2000 - 1000;
        vertex.y = Math.random() * 2000 - 1000;
        vertex.z = Math.random() * 2000 - 1000;

        sfGeometry.vertices.push(vertex);
    }

    var states = [ [ [1.0, 0.2, 0.9], sfTexture, 10 ], [ [0.90, 0.1, 0.5], sfTexture, 8 ], [ [0.80, 0.05, 0.5], sfTexture, 5 ] ];
    for (i = 0; i < states.length; i++) {
        color  = states[i][0];
        sprite = states[i][1];
        size   = states[i][2];

        sfMats[i] = new THREE.ParticleSystemMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true });
        sfMats[i].color.setHSL(color[0], color[1], color[2]);

        particles = new THREE.ParticleSystem(sfGeometry, sfMats[i]);

        particles.rotation.x = Math.random() * 10;
        particles.rotation.y = Math.random() * 10;
        particles.rotation.z = Math.random() * 10;

        group.add(particles);
    }

    // Add lights:

    // add ambient (global) light
    scene.add( new THREE.AmbientLight(0x222222));

    // add particle of light
    particleLight = new THREE.Mesh( new THREE.SphereGeometry(5, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    particleLight.position.y = 250;
    group.add(particleLight);

    // add flying pint light
    pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    group.add(pointLight);

    pointLight.position = particleLight.position;

    // add directional blue light
    var directionalLight = new THREE.DirectionalLight(0x0000ff, 2);
    directionalLight.position.set(10, 1, 1).normalize();
    group.add(directionalLight);

    // prepare the render object and render the scene
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(scene.fog.color);

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;

    // add events handlers
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
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

function onDocumentTouchStart(event) {
    if (event.touches.length == 1) {
        event.preventDefault();

        mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
    }
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    var timer = Date.now() * 0.00025;

    group.rotation.y += (targetRotation - group.rotation.y) * 0.01;

    particleLight.position.x = Math.sin(timer * 7) * 300;
    particleLight.position.z = Math.cos(timer * 3) * 300;

    camera.position.x = Math.cos(timer) * 1000;
    camera.position.z = Math.sin(timer) * 500;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
