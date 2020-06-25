/* Enumerations */
const CASTING = Object.freeze({'DIAGONAL': 1, 'PARALAL': 2, 'PERSPECTIVE': 3});
const ROTATE = Object.freeze({'X': 1, 'Y': 2, 'Z': 3});

/* Global File Management Parameters */
let isFileLoaded = false;

/* Global Graphic Objects */
const vertices = [];
const polygons = [];
let currentCasting;

function reset(reloadFile) {
	document.getElementById('castPara').checked = 'yes';
	document.getElementById('xAngle').value = '0';
	document.getElementById('yAngle').value = '0';
	document.getElementById('zAngle').value = '0';
	document.getElementById('zoom').value = '100';
	currentCasting = CASTING.PARALAL;

	clear();

	if (reloadFile === true) {
		if (isFileLoaded === true) {
			parseFile();
			draw();
		} else {
			document.getElementById('fileInput').value = null; //clear file field for same file reload
		}
	} else if (reloadFile === false) {
		isFileLoaded = false;
	}
}

function load(fileObject) {
	let fileList = fileObject.files;
	if (fileList <= 0) return;

	const reader = new FileReader();

	reset(false);

	reader.onload = () => {
		let data = reader.result;

		parseFile(data);
		draw();
	};

	reader.readAsText(fileObject.files[0]); //Read all text in file into global variable
}

function parseFile(data) {
	if (!data) return;
	data = data.split('\n');
	let vertexNum = 0;
	let polygonNum = 0;

	/* Parsing - expecting 12 vertices & 10 polygons */
	for (let line of data) {
		// if its start with a hashtag(comment) or not a number we skip this line
		if (line[0] === '#' || Number.isNaN(line[0])) continue;
		if (line.length < 5) continue;

		if (vertexNum < 12) {
			vertices[vertexNum] = line.split(',');
			vertexNum++;
		} else if (polygonNum < 10) {
			polygons[polygonNum] = line.split(',');
			polygonNum++;
		}
	}

	if (vertexNum === 12 && polygonNum === 10) {
		normalize();
		isFileLoaded = true;
	} else {
		isFileLoaded = false;
	}
}

function setCasting(cast) {
	if (!isFileLoaded) return;
	currentCasting = cast;
	draw();
}

function setAngleValue(input, axis) {
	if (!isFileLoaded) return;
	applyAngle(input.value, axis);
	draw();
}

function setZoomValue(input) {
	if (!isFileLoaded) return;
	zoom(input.value);
	draw();
}
