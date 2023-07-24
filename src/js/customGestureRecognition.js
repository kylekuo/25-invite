import HandLandmarks from "./handLandmarks";

const debug = false;

let tipWithoutMiddleFingerIndexes = HandLandmarks.TIPS.filter( (v, i) => v !== HandLandmarks.MIDDLE_FINGER_TIP ),
		tipWithoutThumbIndexes = HandLandmarks.PIPS.filter( (v, i) => v !== HandLandmarks.THUMB_TIP );

export const customGestureRecognition = landmarks => {

	// Y VALUES ARE SMALLER THE HIGHER UP THEY ARE
	
	// check for middle finger

		const mfCheckTips = landmarks.filter((v, i) => tipWithoutMiddleFingerIndexes.includes(i)).map(v => v.y),
					mfCheckDip = landmarks[ HandLandmarks.MIDDLE_FINGER_DIP ].y;

		if (debug) console.log({ mfCheckTips, mfCheckDip });

		if ( mfCheckTips.every(v => v > mfCheckDip) ) return 'Middle_Finger';

	// check for pinch

		// const pinchMaxDistance = 0.5,
		// 			pinchTips = landmarks.filter((v, i) => tipWithoutThumbIndexes.includes(i)).map(v => v.y),
		// 			thumbTip = landmarks[ HandLandmarks.THUMB_TIP ];		

		// if (debug) console.log({ pinchTips, thumbTip });

	return 'None';

}