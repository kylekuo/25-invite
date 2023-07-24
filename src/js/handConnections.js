import HandLandmarks from "./handLandmarks.js";

export default class HandConnections {

	createConnection ( from, to ) {
		return { from, to }
	}

	static THUMB = [
		[ HandLandmarks.THUMB_CMC, HandLandmarks.THUMB_MCP ],
		[ HandLandmarks.THUMB_MCP, HandLandmarks.THUMB_IP ],
		[ HandLandmarks.THUMB_IP, HandLandmarks.THUMB_TIP ]
	];

	static INDEX_FINGER = [
		[ HandLandmarks.INDEX_FINGER_MCP, HandLandmarks.INDEX_FINGER_PIP ],
		[ HandLandmarks.INDEX_FINGER_PIP, HandLandmarks.INDEX_FINGER_DIP ],
		[ HandLandmarks.INDEX_FINGER_DIP, HandLandmarks.INDEX_FINGER_TIP ],
	];

	static MIDDLE_FINGER = [
		[ HandLandmarks.MIDDLE_FINGER_MCP, HandLandmarks.MIDDLE_FINGER_PIP ],
		[ HandLandmarks.MIDDLE_FINGER_PIP, HandLandmarks.MIDDLE_FINGER_DIP ],
		[ HandLandmarks.MIDDLE_FINGER_DIP, HandLandmarks.MIDDLE_FINGER_TIP ],
	];

	static RING_FINGER = [
		[ HandLandmarks.RING_FINGER_MCP, HandLandmarks.RING_FINGER_PIP ],
		[ HandLandmarks.RING_FINGER_PIP, HandLandmarks.RING_FINGER_DIP ],
		[ HandLandmarks.RING_FINGER_DIP, HandLandmarks.RING_FINGER_TIP ],
	];

	static PINKY = [
		[ HandLandmarks.PINKY_MCP, HandLandmarks.PINKY_PIP ],
		[ HandLandmarks.PINKY_PIP, HandLandmarks.PINKY_DIP ],
		[ HandLandmarks.PINKY_DIP, HandLandmarks.PINKY_TIP ],
	];

	static PALM = [
		[ HandLandmarks.WRIST, HandLandmarks.THUMB_CMC ],
		[ HandLandmarks.THUMB_CMC, HandLandmarks.INDEX_FINGER_MCP ],
		[ HandLandmarks.INDEX_FINGER_MCP, HandLandmarks.MIDDLE_FINGER_MCP ],
		[ HandLandmarks.MIDDLE_FINGER_MCP, HandLandmarks.RING_FINGER_MCP ],
		[ HandLandmarks.RING_FINGER_MCP, HandLandmarks.PINKY_MCP ],
		[ HandLandmarks.PINKY_MCP, HandLandmarks.WRIST ],
	];

	static ALL = [
		...this.PALM,
		...this.THUMB,
		...this.INDEX_FINGER,
		...this.MIDDLE_FINGER,
		...this.RING_FINGER,
		...this.PINKY
	]

}