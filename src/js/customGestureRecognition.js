import HandLandmarks from "./handLandmarks";

const debug = false;

let tipWithoutMiddleFingerIndexes = HandLandmarks.TIPS.filter( (v, i) => v !== HandLandmarks.MIDDLE_FINGER_TIP ),
		pipWithoutPinkyFingerIndexes = HandLandmarks.PIPS.filter( (v, i) => v !== HandLandmarks.PINKY_PIP );

export const customGestureRecognition = landmarks => {

	// Y VALUES ARE SMALLER THE HIGHER UP THEY ARE
	
	// check for middle finger

		const mfCheckTips = landmarks.filter((v, i) => tipWithoutMiddleFingerIndexes.includes(i)).map(v => v.y),
					mfCheckDip = landmarks[ HandLandmarks.MIDDLE_FINGER_DIP ].y;

		if (debug) console.log({ mfCheckTips, mfCheckDip });

		if ( mfCheckTips.every(v => v > mfCheckDip) ) return 'Middle_Finger';

	// // check for number three

	// 	const ntCheckMcps = landmarks.filter((v, i) => HandLandmarks.MCPS.includes(i)).map(v => v.y),
	// 				ntCheckMaxMcp = Math.min( ...ntCheckMcps ),
	// 				ntCheckPips = landmarks.filter((v, i) => pipWithoutPinkyFingerIndexes.includes(i)).map(v => v.y),
	// 				ntCheckMinPip = Math.max( ...ntCheckPips ),
	// 				ntCheckTip = landmarks[ HandLandmarks.PINKY_TIP ].y;

	// 	if (debug) console.log({ ntCheckPips, ntCheckTip });

	// 	if ( ntCheckMinPip > ntCheckMaxMcp && ntCheckPips.every(v => v < ntCheckTip) ) return 'Number_Three';

	return 'None';

}