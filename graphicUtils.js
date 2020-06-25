/* Global Graphic Objects */
let canvas, context;
const dDepth = 10000;
const visiblePolygons = [];
const CAVALIER = -45 * (Math.PI / 180);
window.onload = function () { //verify canvs is loaded
	canvas = document.getElementById('workspace');
	context = canvas.getContext('2d');
};


function clear() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

//make sure shapes values fit in the screen and positioned well
function normalize() {
	let i, maxX = 0, maxY = 0, minX = 0, minY = 0, rangeX, rangeY, diff;

	for (i = 0; i < vertices.length; i++) {
		if (vertices[i][0] > maxX) {
			maxX = vertices[i][0];
		}

		if (vertices[i][0] < minX) {
			minX = vertices[i][0];
		}

		if (vertices[i][1] > maxY) {
			maxY = vertices[i][1];
		}

		if (vertices[i][1] < minY) {
			minY = vertices[i][1];
		}
	}

	rangeX = maxX - minX;
	rangeY = maxY - minY;

	if (rangeX > rangeY) {
		diff = (canvas.width / 3) / rangeX;
	} else {
		diff = (canvas.height / 3) / rangeY;
	}

	diff *= 100;
	zoom(diff);

	move((canvas.width / 3) - (minX * diff), (canvas.height / 3) - (minY * diff), 0);
}

//calculate normals & scalar multiplication for perspective casting
function checkPolygonsVisibility() {
	let i, aX, aY, aZ, bX, bY, bZ, cX, cY, cZ, nX, nY, nZ;

	for (i = 0; i < polygons.length; i++) {
		aX = vertices[polygons[i][0] - 1][0] * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth)));
		aY = vertices[polygons[i][0] - 1][1] * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth)));
		aZ = vertices[polygons[i][0] - 1][2];
		bX = vertices[polygons[i][1] - 1][0] * (1 / (1 + (vertices[polygons[i][1] - 1][2] / dDepth)));
		bY = vertices[polygons[i][1] - 1][1] * (1 / (1 + (vertices[polygons[i][1] - 1][2] / dDepth)));
		bZ = vertices[polygons[i][1] - 1][2];
		cX = vertices[polygons[i][2] - 1][0] * (1 / (1 + (vertices[polygons[i][2] - 1][2] / dDepth)));
		cY = vertices[polygons[i][2] - 1][1] * (1 / (1 + (vertices[polygons[i][2] - 1][2] / dDepth)));
		cZ = vertices[polygons[i][2] - 1][2];
		nX = ((bY - aY) * (cZ - aZ)) - ((bZ - aZ) * (cY - aY));
		nY = ((bZ - aZ) * (cX - aX)) - ((bX - aX) * (cZ - aZ));
		nZ = ((bX - aX) * (cY - aY)) - ((bY - aY) * (cX - aX));

		visiblePolygons[i] = (nX * (canvas.width / 2)) + (nY * (canvas.height / 2)) + (nZ * (vertices[polygons[i][2] - 1][2] - dDepth)) < 0;
	}
}

function orderPolygonsByZ() {
	polygons.sort(function (a, b) {
		let i, minA = 0, minB = 0;

		//get minimal average z for each of the polygons by searching their vertices
		for (i = 0; i < a.length; i++) {
			minA += vertices[a[i] - 1][2];
		}
		for (i = 0; i < b.length; i++) {
			minB += vertices[b[i] - 1][2];
		}

		//sort by ascending order
		return (minB / b.length) - (minA / a.length);
	});
}

function draw() {
	clear();

	if (currentCasting === CASTING.PERSPECTIVE) {
		checkPolygonsVisibility();
	}
	orderPolygonsByZ();

	//draw by polygon
	for (let i = 0; i < polygons.length; i++) {
		context.beginPath();
		switch (currentCasting) {
			case CASTING.PARALAL:
				context.moveTo(vertices[polygons[i][0] - 1][0], vertices[polygons[i][0] - 1][1]);
				for (let j = 1; j < polygons[i].length; j++) {
					context.lineTo(vertices[polygons[i][j] - 1][0], vertices[polygons[i][j] - 1][1]);
				}
				context.lineTo(vertices[polygons[i][0] - 1][0], vertices[polygons[i][0] - 1][1]);
				break;
			case CASTING.DIAGONAL:
				context.moveTo(vertices[polygons[i][0] - 1][0] + (vertices[polygons[i][0] - 1][2] * Math.cos(CAVALIER)), vertices[polygons[i][0] - 1][1] + (vertices[polygons[i][0] - 1][2] * Math.sin(CAVALIER)));
				for (let j = 1; j < polygons[i].length; j++) {
					context.lineTo(vertices[polygons[i][j] - 1][0] + (vertices[polygons[i][j] - 1][2] * Math.cos(CAVALIER)), vertices[polygons[i][j] - 1][1] + (vertices[polygons[i][j] - 1][2] * Math.sin(CAVALIER)));
				}
				context.lineTo(vertices[polygons[i][0] - 1][0] + (vertices[polygons[i][0] - 1][2] * Math.cos(CAVALIER)), vertices[polygons[i][0] - 1][1] + (vertices[polygons[i][0] - 1][2] * Math.sin(CAVALIER)));
				break;
			case CASTING.PERSPECTIVE:
				if (visiblePolygons[i] === true) {
					context.moveTo(vertices[polygons[i][0] - 1][0] * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth))), vertices[polygons[i][0] - 1][1]) * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth)));
					for (let j = 1; j < polygons[i].length; j++) {
						context.lineTo(vertices[polygons[i][j] - 1][0] * (1 / (1 + (vertices[polygons[i][j] - 1][2] / dDepth))), vertices[polygons[i][j] - 1][1]) * (1 / (1 + (vertices[polygons[i][j] - 1][2] / dDepth)));
					}
					context.lineTo(vertices[polygons[i][0] - 1][0] * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth))), vertices[polygons[i][0] - 1][1]) * (1 / (1 + (vertices[polygons[i][0] - 1][2] / dDepth)));
				}
				break;
		}
		context.closePath();

		context.fillStyle = 'blue';
		context.fill();

		context.strokeStyle = 'black';
		context.stroke();
	}
}

function move(rangeX, rangeY, rangeZ) {
	for (let i =0; i < vertices.length; i++) {
		vertices[i][0] += rangeX;
		vertices[i][1] += rangeY;
		vertices[i][2] += rangeZ;
	}
}

function zoom(num) {
	let i;

	num /= 100;

	for (i = 0; i < vertices.length; i++) {
		vertices[i][0] *= num;
		vertices[i][1] *= num;
		vertices[i][2] *= num;
	}
}

function applyAngle(angle, axis) {
	let i, x, y, z;

	angle = angle * (Math.PI / 180);

	move(-(canvas.width / 2), -(canvas.height / 2), 0);

	switch (axis) {
		case ROTATE.X:
			for (i = 0; i < vertices.length; i++) {
				y = vertices[i][1];
				z = vertices[i][2];
				vertices[i][1] = y * Math.cos(angle) - z * Math.sin(angle);
				vertices[i][2] = y * Math.sin(angle) + z * Math.cos(angle);
			}
			break;
		case ROTATE.Y:
			for (i = 0; i < vertices.length; i++) {
				x = vertices[i][0];
				z = vertices[i][2];
				vertices[i][0] = z * Math.sin(angle) + x * Math.cos(angle);
				vertices[i][2] = z * Math.cos(angle) - x * Math.sin(angle);
			}
			break;
		case ROTATE.Z:
			for (i = 0; i < vertices.length; i++) {
				x = vertices[i][0];
				y = vertices[i][1];
				vertices[i][0] = x * Math.cos(angle) - y * Math.sin(angle);
				vertices[i][1] = x * Math.sin(angle) + y * Math.cos(angle);
			}
			break;
	}

	move((canvas.width / 2), (canvas.height / 2), 0);
}
