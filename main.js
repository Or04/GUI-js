/* enum */
//3 casting option
const CASTING = Object.freeze({'DIAGONAL': 1, 'PARALAL': 2, 'PERSPECTIVE': 3});
//3 axis option x y and z
const ROTATE = Object.freeze({'X': 1, 'Y': 2, 'Z': 3});
let file_loaded = false;
const vertices = [];
const polygons = [];
let currentCasting;

function parse_file(data) {
	if (!data) return;
	data = data.split('\n');
	let vertexNum = 0;
	let polygonNum = 0;
	/* Parsing - expecting 12 vertices & 10 polygons */
	for (let line of data) {
		// if its start with a #(comment) or not a number we skip this line
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
		file_loaded = true;
	} else {
		file_loaded = false;
	}
}

function load(file_object) {
	let fileList = file_object.files;
	if (fileList <= 0) return;

	const reader = new FileReader();

	reset(false);

	reader.onload = () => {
		let data = reader.result;

		parse_file(data);
		draw();
	};

	reader.readAsText(file_object.files[0]);
	//Read all text in file into global variable
}

function reset(reloadFile) {
	document.getElementById('castPara').checked = 'yes';
	document.getElementById('xAngle').value = '0';
	document.getElementById('yAngle').value = '0';
	document.getElementById('zAngle').value = '0';
	document.getElementById('zoom').value = '100';
	currentCasting = CASTING.PARALAL;

	clear();

	if (reloadFile) {
		if (file_loaded) {
			parse_file();
			draw();
		} else {
			document.getElementById('fileInput').value = null; //clear file field for same file reload
		}
	} else {
		file_loaded = false;
	}
}

function set_casting(cast) {
	if (!file_loaded) return;
	currentCasting = cast;
	draw();
}

function set_zoom_value(input) {
	if (!file_loaded) return;
	zoom(input.value);
	draw();
}

function set_angle_value(input, axis) {
	if (!file_loaded) return;
	applyAngle(input.value, axis);
	draw();
}
