let source_height;
let source_pos;
let screen_x = 900;
let screen_height = 700;
let obstacles, trash;
let offset_x = 50;
let mouse_start;
let source_color = 'yellow',
    obstacle_color = 'lightblue',
    screen_color = 'pink';
let resolution = 0.2;  // percentage of pixels rendered (max 1)


function Obstacle(start, end) {
  this.x1 = this.x2 = start.x;  // same x coord
  this.y1 = min(start.y, end.y);
  this.y2 = max(start.y, end.y);

  this.draw = function() {
    push();
    stroke(obstacle_color);
    strokeWeight(2);
    line(this.x1, this.y1, this.x2, this.y2);
    pop()
  }
}

function init() {
  obstacles = [];
  trash = [];
  source_pos = createVector(0, 0);
  source_height = 100;
}

function setup() {
  createCanvas(1080, 720);
  init();
}

function getMouse() {
  return createVector(mouseX-offset_x, mouseY-height/2);
}

function draw_source() {
  stroke(source_color);
  strokeWeight(5);
  line(source_pos.x, source_pos.y - source_height / 2,
    source_pos.x, source_pos.y + source_height / 2);
}

function draw_screen() {
  stroke(screen_color);
  strokeWeight(2);
  line(screen_x, -screen_height/2, screen_x, screen_height/2);
}

function draw_obstacles() {
  for (let ob of obstacles) ob.draw();
}

function get_intensities() {
  let num_pix = parseInt(screen_height*resolution);
  let scr = Array(num_pix).fill(0);
  for (let y = -source_height/2; y < source_height/2; y++) {
    let occ = Array(num_pix).fill(1);
    for (let ob of obstacles) {
      let start_y = (ob.y1 - y)*(screen_x - ob.x1)/(ob.x1 - 0) + ob.y1;
      let end_y = (ob.y2 - y)*(screen_x - ob.x2)/(ob.x2 - 0) + ob.y2;
      //console.log(start_y, end_y);
      start_y += max(0, screen_height/2);
      end_y += min(screen_height, screen_height/2);
      //console.log(start_y, end_y);
      for (let i=start_y*resolution; i<=end_y*resolution; i++) {
        occ[parseInt(i)] = 0;
      }
      //console.log(occ);
    }
    for (let i=0; i<num_pix; i++) scr[i] += occ[i];
  }
  //console.log(scr);
  push();
  translate(screen_x, -screen_height/2);
  noStroke();
  /*fill(source_color);
  for (v of scr) {
    rect(0, 0, v, 1/resolution);
    translate(0, 1/resolution);
  }*/
  let c = color(source_color);
  for (v of scr) {
    c.setAlpha(255*v/source_height);
    fill(c);
    rect(0, 0, 50, 1/resolution);
    translate(0, 1/resolution);
  }
  pop();
}

function draw() {
  background(0);
  translate(offset_x, height / 2);
  draw_source();
  draw_screen();
  draw_obstacles();
  get_intensities();
  noStroke();
  fill(obstacle_color);
  ellipse(mouseX-offset_x, mouseY-height/2, 5);
  if (mouse_start) {
    new Obstacle(mouse_start, getMouse()).draw();
  }
}

function mousePressed() {
  mouse_start = getMouse();
}

function mouseReleased() {
  obstacles.push(new Obstacle(mouse_start, getMouse()));
  mouse_start = undefined;
}

function keyPressed() {
  if (key == 'z' && obstacles.length) trash.push(obstacles.pop());
  if ((key == 'Z' || key == 'x') && trash.length) obstacles.push(trash.pop());
}


/*
Notes:
{x2: 854, x1: 854, y1: -238, y2: -149}
*/
