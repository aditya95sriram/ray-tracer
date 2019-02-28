let source_height;
let source_pos, source_top, source_bot;
let screen_x = 900;
let screen_height = 700;
let obstacles, trash;
let offset_x = 50;
let mouse_start;
let source_color = 'yellow',
    obstacle_color = 'lightblue',
    obstacle_hover_color = 'blue',
    screen_color = 'pink';
let resolution = 1;  // percentage of pixels rendered (max 1)
let show_guidelines = true;
let hovering=false, hover_start;
let fps_prev = new Date(), fps_cur, fps;
let shadow_mode = 1;
let frame_ctr = 0;

function Obstacle(start, end) {
  this.x1 = this.x2 = start.x;  // same x coord
  this.y1 = min(start.y, end.y);
  this.y2 = max(start.y, end.y);
  this.length = dist(this.x1, this.y1, this.x2, this.y2);
  this.hover = false;

  this.draw = function() {
    push();
    stroke(this.hover ? obstacle_hover_color : obstacle_color);
    strokeWeight(2);
    line(this.x1, this.y1, this.x2, this.y2);
    pop()
  }

  this.check = function(pt) {
    pt2 = pt.copy();
    // lies within ellipse
    let d1 = pt.sub(this.x1, this.y1).mag();
    let d2 = pt2.sub(this.x2, this.y2).mag();
    //console.log(d1, d2, this.length);
    return d1 + d2 <= 1.1*this.length;
  }
}

function init() {
  obstacles = [];
  if (window.location.search.indexOf("pos") >= 0) {
    query = window.location.search.substr(1).split("&");
    console.log("loading from query");
    for (let param of query) {
      let kv = param.split("=");
      if (kv[0] == "pos") {
        let obs = kv[1].split(";");
        for (let ob of obs) {
          let xy = ob.split(",");
          console.log(createVector(parseInt(xy[0]), parseInt(xy[1])), createVector(parseInt(xy[2]), parseInt(xy[3])));
          obstacles.push(new Obstacle(createVector(parseInt(xy[0]), parseInt(xy[1])),
                                      createVector(parseInt(xy[2]), parseInt(xy[3]))));
        }
      }
    }
  }
  trash = [];
  source_pos = createVector(0, 0);
  source_height = 50;
  source_top = createVector(source_pos.x, source_pos.y-source_height/2);
  source_bot = createVector(source_pos.x, source_pos.y+source_height/2);
  show_guidelines = true;
  document.body.style.cursor = "pointer";
}

function setup() {
  createCanvas(1080, 720);
  init();
  textAlign(LEFT, TOP);
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
      // if (y==0) console.log(start_y, end_y);
      start_y = max(0, start_y + screen_height/2);
      end_y = min(screen_height, end_y + screen_height/2);
      // if (y==0) console.log(start_y, end_y);
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
  if (shadow_mode == 0) {
    fill(source_color);
    for (v of scr) {
      rect(0, 0, v, 1/resolution);
      translate(0, 1/resolution);
    }
  } else {
    let c = color(source_color);
    for (v of scr) {
      c.setAlpha(255*v/source_height);
      fill(c);
      rect(0, 0, 50, 1/resolution);
      translate(0, 1/resolution);
    }
  }
  pop();
}

function draw_guidelines() {
  let p = getMouse();
  let n = p5.Vector.sub(p, source_top).setMag(1200).add(source_top);
  line(source_top.x, source_top.y, n.x, n.y);
  n = p5.Vector.sub(p, source_bot).setMag(1200).add(source_bot);
  line(source_bot.x, source_bot.y, n.x, n.y);
}

function check_obstacles() {
  document.body.style.cursor = 'pointer';
  hovering = false;
  obstacles.map(x => x.hover = false);
  for (let ob of obstacles) {
    if (ob.check(getMouse())) {
      document.body.style.cursor = 'grab';
      ob.hover = true;
      hover_start = getMouse();
      hovering = ob;
      return;
    }
  }
}

function mouseMoved() {
  check_obstacles();
}

function draw() {
  background(0);
  /* display fps */
  if (frame_ctr%100 == 0) {
    fps_cur = new Date();
    fps = 100000 / (fps_cur - fps_prev);
    fps_prev = fps_cur;
  }
  frame_ctr++;
  fill('white');
  textSize(25);
  text(parseInt(fps), 0, 0);

  translate(offset_x, height / 2);
  draw_source();
  draw_screen();
  draw_obstacles();
  check_obstacles();
  get_intensities();
  if (show_guidelines) draw_guidelines();
  noStroke();
  fill(obstacle_color);
  ellipse(mouseX-offset_x, mouseY-height/2, 5);
  if (mouse_start) {
    new Obstacle(mouse_start, getMouse()).draw();
  }
}

function mousePressed() {
  if (!hovering)
    mouse_start = getMouse();
}

function mouseReleased() {
  if (typeof(mouse_start) != 'undefined') {
    obstacles.push(new Obstacle(mouse_start, getMouse()));
    mouse_start = undefined;
  }
}

function mouseDragged(event) {
  if (hovering) {
    delta = p5.Vector.sub(getMouse(), hover_start);
    hovering.x1 += delta.x;
    hovering.x2 += delta.x;
    hovering.y1 += delta.y;
    hovering.y2 += delta.y;
  } else {
    document.body.style.cursor = "pointer";
  }
}

function keyPressed() {
  if (key == 'z' && obstacles.length) trash.push(obstacles.pop());
  if ((key == 'Z' || key == 'x') && trash.length) obstacles.push(trash.pop());
  if (key == 'g') show_guidelines = !show_guidelines;
  if (key == 's') shadow_mode = 1-shadow_mode;
  if (key == 'h') alert(" z - undo \n shift+z|x - redo \n g - guidelines \n \
s - shadow mode \n h - help screen");
  if (key == 'c') share();
}

function share() {
  if (obstacles.length == 0) return;
  let pos = obstacles.map(x => x.x1 + "," + x.y1 + "," + x.x2 + "," + x.y2).join(";");
  window.history.pushState({}, "Ray-tracer", "?pos="+pos);
}


/*
Notes:
{x2: 854, x1: 854, y1: -238, y2: -149}
// perpendicular distance of point from line
let d = Math.abs((this.y2 - this.y1)*pt.x - (this.x2 - this.x1)*pt.y +
this.x2*this.y1 - this.x1*this.y2) /
(Math.sqrt((this.y2-this.y1)**2 + (this.x2-this.x1)**2));
// return d;
*/
