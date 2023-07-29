import 'normalize.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '../css/global.scss';

import { ready, loaded } from './LoadEvents';

import { isEqual } from 'lodash-es';

import { FilesetResolver, DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';
import { customGestureRecognition } from './customGestureRecognition';
import FixedSizeArray from './FixedSizeArray';

import * as THREE from 'three';
import HandLandmarks from './handLandmarks';
import HandConnections from './handConnections';

const debug = false;

await ready();

// --- DEFINITIONS --- //

	const html = document.querySelector('html');

	html.classList.add('ready');
	html.classList.add('loading');
	loaded().then(() => html.classList.add('loaded'));

	const body = html.querySelector('body'),
				app = body.querySelector('#app');

	let width = window.innerWidth,
			height = window.innerHeight;

	let isLocked = true,
			unlockConditionOne = false,
			unlockConditionTwo = false;

// --- MEDIAPIPE --- //

	html.classList.add('loading-ml');

	const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'),
				recognizer = await GestureRecognizer.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: 'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
					},
					runningMode: 'VIDEO',	
					numHands: 2
				});

	html.classList.remove('loading-ml');

	if (debug) console.debug({ vision, recognizer });

// --- PREDICTIONS --- //

	let predictionsRunning = false;

	const gestureBuffer = new FixedSizeArray( 5 ),
				gestureHistory = new FixedSizeArray( 2 ),
				video = app.querySelector('video');

	function predictVideo () {

		if (!predictionsRunning) return; 

		const now = performance.now(),
					detections = recognizer.recognizeForVideo( video, now ),
					hasDetections = ( detections.worldLandmarks.length > 0 );
					
		html.classList.toggle('no-detections', !hasDetections);

		// if (detections.gestures[0]) console.log( detections.gestures[0][0] );

		if ( hasDetections ) {
			handleDetections( detections );
			// handle2D( detections );
			handle3D( detections );
		}

		requestAnimationFrame( predictVideo );

	}

	function handleUnlock () {

		unlockConditionOne = false;
		unlockConditionTwo = false;

		for (const item of gestureHistory.items) {

			if (!item) continue;

			let gestures = Object.values(item),
					categoryNames = gestures.map(v => v ? v.categoryName : 'undefined');

			if ( categoryNames.includes('Victory') ) unlockConditionOne = true;
			if ( categoryNames.includes('Open_Palm') ) unlockConditionTwo = true;

		}

		html.classList.toggle('unlock-condition-one', unlockConditionOne);
		html.classList.toggle('unlock-condition-two', unlockConditionTwo);
		
		if (unlockConditionOne && unlockConditionTwo) {
			html.classList.add('unlocked');
			isLocked = false;
		}

	}

	function handleGestureChange () {

		const allGestures = gestureHistory.items.reduce((acc, curr) => { 
			if (!curr) return acc;
			if (curr.left) acc.push( curr.left.categoryName ); 
			if (curr.right) acc.push( curr.right.categoryName ); 
			return acc;
		}, []);

		// const lastTwoDiffHands = Object.values( gestureHistory.items.at(-1) ),
		// 			lastTwoLeft = [ gestureHistory.items.at(-1)?.left, gestureHistory.items.at(-2)?.left ],
		// 			lastTwoRight = [ gestureHistory.items.at(-1)?.right, gestureHistory.items.at(-2)?.right ],
		// 			checkOrder = [ lastTwoDiffHands, lastTwoLeft, lastTwoRight ];
					
		// for (const combination of checkOrder) {
			
		// 	let categoryNames = combination.map(v => v ? v.categoryName : 'undefined').sort();

		// 	if ( isEqual( categoryNames, [ 'Open_Palm', 'Victory' ] ) ) {
		// 		console.log('25');
		// 	}

		// }

		html.setAttribute('gestures', allGestures ? allGestures.join(',') : '');

	}

	function handleDetections ( detections ) {

		let numHands = detections.landmarks.length;
		if ( numHands === 0 ) return;

		let nextInHistory = {
			left: null,
			right: null
		};

		for (let i = 0; numHands > i; i++) {
	
			let handedness = detections.handednesses[i][0],
					gesture = detections.gestures[i][0],
					landmarks = detections.landmarks[i],
					worldLandmarks = detections.worldLandmarks[i];
	
			if (gesture.categoryName == 'None') {
				let custom = customGestureRecognition( worldLandmarks );
				if (custom !== 'None') gesture = { 
					isCustom: true,
					categoryName: custom 
				}
			}
			
			// if (debug) console.log({
			// 	handedness,
			// 	gesture,
			// 	landmarks,
			// 	worldLandmarks,
			// });
	
			switch (handedness.categoryName) {
	
				case 'Left':
					nextInHistory.left = gesture;
					break;
	
				case 'Right':
					nextInHistory.right = gesture;
					break;
			}
	
		} 

		gestureBuffer.push( nextInHistory );

		let lastCategories = Object.values( gestureHistory.items.at(-1) || {} ).map( g => g?.categoryName ),
				nextCategories = Object.values( nextInHistory ).map( g => g?.categoryName ),
				lastIsEqual = isEqual( lastCategories, nextCategories ),
				bufferIsFullOfEqual = gestureBuffer.every( prev => 
					isEqual( prev?.left?.categoryName, nextInHistory.left?.categoryName ) &&
					isEqual( prev?.right?.categoryName, nextInHistory.right?.categoryName )
				);

		if ( bufferIsFullOfEqual && !lastIsEqual ) {
			gestureHistory.push( nextInHistory );
			handleGestureChange();
		} 

		if (isLocked) handleUnlock();

	}

// --- GRAPHICS --- //

	// --- 2D --- //

		const canvas2D = app.querySelector('#two_d'),
					ctx2D = canvas2D.getContext('2d'),
					drawUtils = new DrawingUtils(ctx2D);

		function handle2D ( detections ) {

			ctx2D.save();
			ctx2D.clearRect( 0, 0, canvas2D.width, canvas2D.height );

			for (const landmarks of detections.landmarks) {
				
				drawUtils.drawConnectors(
					landmarks, 
					GestureRecognizer.HAND_CONNECTIONS, 
					{
						color: '#ffffff',
						lineWidth: 1
					}
				);
		
				drawUtils.drawLandmarks(
					landmarks, 
					{
						color: '#ffffff',
						lineWidth: 10,
					}
				);

			}

			ctx2D.restore();

		}

	// --- 3D --- //

		const canvas3D = app.querySelector('#three_d');

		const scene = new THREE.Scene();

		const renderer = new THREE.WebGLRenderer({ 
			alpha: true, 
			antialias: true,
			canvas: canvas3D
		});

		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.setClearColor( 0x000000, 0 );
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.85;
		renderer.useLegacyLights = false;

		const camera = new THREE.PerspectiveCamera( 20, width / height, 0.1, 2000 );
		let cameraPosition = new THREE.Vector3( 0, 5, -100 ),
				cameraTarget = new THREE.Vector3( 0, 0, 0 ),
				cameraOffset = new THREE.Vector3( 0, 0, 0 );

		camera.position.addVectors( cameraPosition, cameraOffset );
		camera.lookAt( cameraTarget );

		const ambientLight = new THREE.AmbientLight( 0xfff, 1000 );
		scene.add( ambientLight );

		const sphereGeo = new THREE.SphereGeometry( 0.5, 10, 10 ),
					sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }),
					spheres = new THREE.Group();

		for (const landmark of HandLandmarks.ALL.entries()) {
			let sphere = new THREE.Mesh( sphereGeo, sphereMaterial );
			spheres.add(sphere);
		}

		scene.add( spheres );

		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }),
					lines = new THREE.Group();
		
		for (const connection of HandConnections.ALL.entries()) {
			
			const lineGeo = new THREE.BufferGeometry(),
						line = new THREE.Line( lineGeo, lineMaterial );

			lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
						
			lines.add( line );
			
		}

		scene.add( lines );

		function handle3D ( detections ) {

			if ( detections.worldLandmarks.length == 0 ) return;

			const bbox = detections.landmarks[0].reduce((acc, curr) => {

				if (curr.x < acc.left) acc.left = curr.x;
				if (curr.x > acc.right) acc.right = curr.x;
				
				if (curr.y < acc.top) acc.top = curr.y;
				if (curr.y > acc.bottom) acc.bottom = curr.y;
				
				if (curr.z < acc.back) acc.back = curr.z;
				if (curr.z > acc.front) acc.front = curr.z;
				
				return acc;

			}, {
				
				left: Infinity,
				right: -Infinity,

				top: Infinity,
				bottom: -Infinity,

				back: Infinity,
				front: -Infinity,

			});

			bbox.back *= -1;

			const center = {
				x: ((bbox.right - bbox.left) / 2) + bbox.left,
				y: ((bbox.bottom - bbox.top) / 2) + bbox.top,
				z: ((bbox.back - bbox.front) / 2) + bbox.front,
			};
			
			const hand = detections.worldLandmarks[0];

			for (const [index, mesh] of spheres.children.entries()) {
				let pos = hand[index];
				mesh.position.set( pos.x, -pos.y, pos.z );
				mesh.position.multiplyScalar( 100 );
			}

			for (const [index, line] of lines.children.entries()) {

				let [fromIndex, toIndex] = HandConnections.ALL[ index ],
						from = spheres.children[fromIndex],
						to = spheres.children[toIndex],
						positions = line.geometry.attributes.position;

				positions.setXYZ(0, from.position.x, from.position.y, from.position.z);
				positions.setXYZ(1, to.position.x, to.position.y, to.position.z);

				positions.needsUpdate = true;

			}

			const tScale = 50,
						tX = THREE.MathUtils.mapLinear( center.x, 0, 1, width * 0.5, width * -0.5 ) / tScale,
						tY = THREE.MathUtils.mapLinear( center.y, 0, 1, height * 0.5, height * -0.5 ) / tScale,
						tZ = THREE.MathUtils.mapLinear( center.z, 0, 0.5, cameraPosition.z * -1, cameraPosition.z); 
			
			// console.log({ tX, tY, tZ });

			spheres.translateX( tX );
			spheres.translateY( tY );
			spheres.translateZ( tZ );
			
			lines.translateX( tX );
			lines.translateY( tY );
			lines.translateZ( tZ );
			
			renderer.render( scene, camera );

			spheres.translateX( -tX );
			spheres.translateY( -tY );
			spheres.translateZ( -tZ );

			lines.translateX( -tX );
			lines.translateY( -tY );
			lines.translateZ( -tZ );

		}

// --- INIT --- //

	let stream = null,
			useCamera = false;
	
	const useCameraCheck = app.querySelector('#use-camera');
	useCameraCheck.checked = false;

	switchVideoSource();
	useCameraCheck.onchange = evt => {
		const { checked } = evt.target;
		useCamera = checked;
		switchVideoSource();
	}

	function switchVideoSource () {

		html.classList.remove('unlock-condition-one', 'unlock-condition-two');

		html.classList.add('loading');
		html.classList.add('loading-video');
		predictionsRunning = false;
		video.pause();

		if (
			navigator.mediaDevices && 
			'getUserMedia' in navigator.mediaDevices
		) {

			if (useCamera) {
				
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then(str => {
						console.warn('got stream', str);
						initStream(str);
					})
					.catch(err => {
						console.error(err);
						initWithoutStream();
					});

			} else initWithoutStream();


		} else {

			console.warn("getUserMedia() is not supported by your browser");
			html.classList.add('no-user-media');
			initWithoutStream();

		}

		video.onloadeddata = evt => {
			predictionsRunning = true;
			predictVideo();
			html.classList.remove('loading');
			html.classList.remove('loading-video');
		}

	}

	function initStream (s) {

		stream = s;

		video.src = null;
		video.srcObject = stream;

		video.play();
		
	}
	
	function initWithoutStream () {
		
		video.loop = true;
		video.muted = true;

		video.srcObject = null;
		video.src = 'video.mp4';
		
		video.play();

	}

	function resizeCanvas () {

		canvas2D.width = width;
		canvas2D.height = height;
		
		canvas3D.width = width;
		canvas3D.height = height;

		canvas3D.style.setProperty('width', `${width}px`);
		canvas3D.style.setProperty('height', `${height}px`);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

	}

	window.onresize = evt => {
		
		width = window.innerWidth;
		height = window.innerHeight;

		resizeCanvas();

	}

	resizeCanvas();

// TODO
// add 3D card when user pinches
// size card based on space between fingers
// 3D face mesh???
// https://techtee.medium.com/real-time-face-mesh-point-cloud-with-three-js-tensorflow-js-and-typescript-1f37ae844e1f