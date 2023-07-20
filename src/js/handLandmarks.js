export default class HandLandmarks {
	
	static WRIST 			= 0;

	static THUMB_CMC 	= 1;
	static THUMB_MCP 	= 2;
	static THUMB_IP 	= 3;
	static THUMB_TIP 	= 4;

	static INDEX_FINGER_MCP 	= 5;
	static INDEX_FINGER_PIP 	= 6;
	static INDEX_FINGER_DIP 	= 7;
	static INDEX_FINGER_TIP 	= 8;
	
	static MIDDLE_FINGER_MCP 	= 9;
	static MIDDLE_FINGER_PIP 	= 10;
	static MIDDLE_FINGER_DIP 	= 11;
	static MIDDLE_FINGER_TIP 	= 12;
	
	static RING_FINGER_MCP 	= 13;
	static RING_FINGER_PIP 	= 14;
	static RING_FINGER_DIP 	= 15;
	static RING_FINGER_TIP 	= 16;
	
	static PINKY_MCP 	= 17;
	static PINKY_PIP 	= 18;
	static PINKY_DIP 	= 19;
	static PINKY_TIP 	= 20;
	
	static THUMB = [
		this.THUMB_CMC,
		this.THUMB_MCP,
		this.THUMB_IP,
		this.THUMB_TIP,
	];
	
	static INDEX_FINGER = [
		this.INDEX_FINGER_MCP,
		this.INDEX_FINGER_PIP,
		this.INDEX_FINGER_DIP,
		this.INDEX_FINGER_TIP,
	];
	
	static MIDDLE_FINGER = [
		this.MIDDLE_FINGER_MCP,
		this.MIDDLE_FINGER_PIP,
		this.MIDDLE_FINGER_DIP,
		this.MIDDLE_FINGER_TIP,
	];
	
	static RING_FINGER = [
		this.RING_FINGER_MCP,
		this.RING_FINGER_PIP,
		this.RING_FINGER_DIP,
		this.RING_FINGER_TIP,
	];
	
	static PINKY = [
		this.PINKY_MCP,
		this.PINKY_PIP,
		this.PINKY_DIP,
		this.PINKY_TIP,
	];
	
	static TIPS = [
		this.THUMB_TIP,
		this.INDEX_FINGER_TIP,
		this.MIDDLE_FINGER_TIP,
		this.RING_FINGER_TIP,
		this.PINKY_TIP,
	];

	static DIPS = [
		this.INDEX_FINGER_DIP,
		this.MIDDLE_FINGER_DIP,
		this.RING_FINGER_DIP,
		this.PINKY_DIP,
	];

	static PIPS = [
		this.INDEX_FINGER_PIP,
		this.MIDDLE_FINGER_PIP,
		this.RING_FINGER_PIP,
		this.PINKY_PIP,
	];

	static MCPS = [
		this.THUMB_MCP,
		this.INDEX_FINGER_MCP,
		this.MIDDLE_FINGER_MCP,
		this.RING_FINGER_MCP,
		this.PINKY_MCP,
	];

}