import 'normalize.css';
import '../css/global.scss';

import { ready, loaded } from './LoadEvents';

import { isEqual } from 'lodash-es';

import { FilesetResolver, DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';
import { customGestureRecognition } from './customGestureRecognition';
import FixedSizeArray from './FixedSizeArray';

const debug = true;

await ready();

const html = document.querySelector('html'),
			body = html.querySelector('body'),
			app = body.querySelector('#app');

html.classList.add('ready');
loaded().then(() => html.classList.add('loaded'));

const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'),
			recognizer = await GestureRecognizer.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: 'src/shared/models/gesture_recognizer.task',
				},
				runningMode: 'VIDEO',	
				numHands: 2
			})


console.log({ vision, recognizer });

const video = app.querySelector('video'),
			canvas = app.querySelector('canvas'),
			ctx = canvas.getContext('2d'),
			drawUtils = new DrawingUtils(ctx);

const gestureBuffer = new FixedSizeArray( 5 ),
			gestureHistory = new FixedSizeArray( 2 );

let lastVideoTime = -1;
const output = app.querySelector('#output');

function resizeCanvas () {
	canvas.width = video.offsetWidth;
	canvas.height = video.offsetHeight;
}

function initWithWebcam (stream) {

	if (debug) console.debug('initWithWebcam');

	video.srcObject = stream;
	video.play();

	video.onloadeddata = evt => {
		resizeCanvas();
		predictVideo();
	}

}

function initWithoutWebcam () {

	if (debug) console.debug('initWithoutWebcam');

	video.autoplay = true;
	video.muted = true;
	video.loop = true;

	video.src = 'video.mp4';
	video.play();

	video.onloadeddata = evt => {
		resizeCanvas();
		predictVideo();
	}

}

function handleGestureChange () {

	const lastTwoDiffHands = Object.values( gestureHistory.items.at(-1) ),
				lastTwoLeft = [ gestureHistory.items.at(-1)?.left, gestureHistory.items.at(-2)?.left ],
				lastTwoRight = [ gestureHistory.items.at(-1)?.right, gestureHistory.items.at(-2)?.right ],
				checkOrder = [ lastTwoDiffHands, lastTwoLeft, lastTwoRight ];

	const anyIsMF = lastTwoDiffHands.some(v => v && v.categoryName === 'Middle_Finger');

	// console.log( checkOrder );
				
	for (const combination of checkOrder) {
		
		let categoryNames = combination.map(v => v ? v.categoryName : 'undefined').sort();

		if ( isEqual( categoryNames, [ 'Open_Palm', 'Victory' ] ) ) {
			console.log('25');
		}

	}

	if (anyIsMF) console.log('middle finger!');

}

function handleGesture ( key ) {
}

async function predictVideo () {

	const now = performance.now();

	if (lastVideoTime === now) return requestAnimationFrame( predictVideo );
	lastVideoTime = now;

	const detections = recognizer.recognizeForVideo( video, now ),
				numHands = detections.landmarks.length;

	ctx.save();
	ctx.clearRect( 0, 0, canvas.width, canvas.height );

	output.innerHTML = '';

	if ( numHands > 0 ) {

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
	
			drawUtils.drawConnectors(
				landmarks, 
				GestureRecognizer.HAND_CONNECTIONS, 
				{
					color: "#00FF00",
					lineWidth: 5
				}
			);
	
			drawUtils.drawLandmarks(
				landmarks, 
				{
					color: '#FF0000',
					lineWidth: 2,
				}
			);
			
			output.innerHTML += `${handedness.categoryName}: ${gesture.categoryName}<br />`;
	
		} 

		gestureBuffer.push( nextInHistory );

		let lastCategories = Object.values( gestureHistory.items.at(-1) || {} ).map( g => g?.categoryName ),
				nextCategories = Object.values( nextInHistory ).map( g => g?.categoryName ),
				lastIsEqual = isEqual( lastCategories, nextCategories ),
				bufferIsFullOfEqual = gestureBuffer.every( prev => 
					isEqual( prev?.left?.categoryName, nextInHistory.left?.categoryName ) &&
					isEqual( prev?.right?.categoryName, nextInHistory.right?.categoryName )
				);

		// console.log({
		// 	buffer: gestureBuffer.items,
		// 	next: nextInHistory,
		// 	// lastCategories,
		// 	// lastIsEqual,
		// 	// bufferIsFullOfEqual,
		// });

		if ( bufferIsFullOfEqual && !lastIsEqual ) {
			gestureHistory.push( nextInHistory );
			handleGestureChange();
		}

	} 

	ctx.restore();

	requestAnimationFrame( predictVideo );

}

if ( !!navigator.mediaDevices?.getUserMedia ) {
	navigator.mediaDevices
		.getUserMedia({ video: true, audio: false })
		.then(stream => initWithWebcam(stream))
		.catch(err => {
			console.error(`An error occurred: ${err}`);
			initWithoutWebcam();
		});
} else {
	console.warn("getUserMedia() is not supported by your browser");
	initWithoutWebcam();
}

window.onresize = evt => resizeCanvas();
resizeCanvas();
