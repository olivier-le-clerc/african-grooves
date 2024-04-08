export class PanZoom {

    zoomVals = { step: 0.1, start: 1, min: 1, max: 100 }
    MOVE_THRESHOLD = 5
 
    constructor(svg) {
       this.svg = svg
       this.port = { w: this.svg.getAttribute("width"), h: this.svg.getAttribute("height") }
       this.box = this.svg.viewBox.baseVal
       this.distance = 0
       this.pointers = {}
       // run listeners
       this.svg.addEventListener('resize', e => this.init());
       this.svg.addEventListener('wheel', e => this.zoom(e));
       this.svg.addEventListener('click', e => this.clickHandler(e), true);
       this.svg.addEventListener('pointerdown', e => this.pointerDownHandler(e));
       this.svg.addEventListener('pointermove', e => this.pointerMoveHandler(e));
       this.svg.addEventListener('pointerup', e => this.pointerUpHandler(e));
       this.svg.addEventListener('pointerleave', e => this.pointerUpHandler(e));
    }
 
    init() {
       var ratio = this.svg.clientWidth / this.svg.clientHeight;
       if (ratio < this.port.w / this.port.h) { // Offset X
          this.box.height = this.port.h;
          this.box.width = this.box.height * ratio;
          this.box.x = (this.port.w - this.box.width) / 2;
          this.box.y = 0;
       } else { // Offset Y
          this.box.width = this.port.w;
          this.box.height = this.box.width / ratio;
          this.box.x = 0;
          this.box.y = (this.port.h - this.box.height) / 2;
       }
    }
 
    hasMoved() {
       return this.distance > this.MOVE_THRESHOLD;
    }
 
    clickHandler(e) {
       if (this.hasMoved()) {
          e.stopPropagation()
       }
    }
 
    pointerDownHandler(e) {
       this.pointers[e.pointerId] = { x: e.x, y: e.y, dx: 0, dy: 0 };
       if (Object.keys(this.pointers).length === 1) {
          this.distance = 0;
       }
    }
 
    pointerUpHandler(e) {
       delete this.pointers[e.pointerId];
    }
 
    pointerMoveHandler(e) {
       if (Object.keys(this.pointers).length == 1) { // panning
          let point = this.pointers[e.pointerId];
          let scale = this.svg.clientWidth / this.box.width;
          let [dx, dy] = [(point.x - e.x) / scale, (point.y - e.y) / scale];
          this.distance++;
          this.box.x += dx;
          this.box.y += dy;
          [point.x, point.y] = [e.x, e.y];
       } else if (Object.keys(this.pointers).length == 2) { // tactile zoom
          let point = this.pointers[e.pointerId];
          let center = {
             x: (this.pointers[Object.keys(pointers)[0]].x + this.pointers[Object.keys(pointers)[1]].x) / 2,
             y: (this.pointers[Object.keys(pointers)[0]].y + this.pointers[Object.keys(pointers)[1]].y) / 2,
          }
          let [dx, dy] = [(point.x - e.x), (point.y - e.y)];
          let delta = dx * (- 2 * center.x + point.x + e.x) + dy * (- 2 * center.y + point.y + e.y);
 
          let wheelEvent = new WheelEvent('wheel', {
             clientX: center.x,
             clientY: center.y,
             deltaY: delta,
          });
          [point.x, point.y] = [e.x, e.y];
          this.svg.dispatchEvent(wheelEvent);
       }
    }
 
    zoom(e) {
       e.preventDefault();
       let delta = - Math.sign(e.deltaY)
          , [w, h] = [this.box.width, this.box.height]
          , [mx, my] = [e.x, e.y]
          , dw = w * delta * this.zoomVals.step
          , dh = h * delta * this.zoomVals.step
          , [dx, dy] = [dw * mx / this.svg.clientWidth, dh * my / this.svg.clientHeight];
 
       if (this.port.w / this.zoomVals.max < this.box.width - dw && this.box.width - dw < this.port.w / this.zoomVals.min) {
          this.box.x += dx;
          this.box.y += dy;
          this.box.width -= dw;
          this.box.height -= dh;
       }
    }
 
 }