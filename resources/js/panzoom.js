export class PanZoom {

   zoomVals = { step: 0.1, start: 1, min: 1, max: 100 }
   MOVE_THRESHOLD = 5

   constructor(svg) {
      this.svg = svg
      this.port = { w: this.svg.getAttribute("width"), h: this.svg.getAttribute("height") }
      this.bounds = {
         xMin: -0.5 * this.port.w,
         yMin: -0.5 * this.port.h,
         xMax: 1.5 * this.port.w,
         yMax: 1.5 * this.port.h
      }
      this.box = this.svg.viewBox.baseVal
      this.distance = 0
      this.pointers = {}
      // run listeners
      this.addEventListeners()
   }

   addEventListeners() {
      this.svg.addEventListener('resize', e => this.init());
      this.svg.addEventListener('wheel', e => this.zoom(e));
      this.svg.addEventListener('click', e => this.clickHandler(e), true);
      this.svg.addEventListener('pointerdown', e => this.pointerDownHandler(e));
      this.svg.addEventListener('pointermove', e => this.pointerMoveHandler(e));
      this.svg.addEventListener('pointerup', e => this.pointerUpHandler(e));
      this.svg.addEventListener('pointerleave', e => this.pointerUpHandler(e));
   }

   removeEventListeners() {
      this.svg.removeEventListener('resize', e => this.init());
      this.svg.removeEventListener('wheel', e => this.zoom(e));
      this.svg.removeEventListener('click', e => this.clickHandler(e), true);
      this.svg.removeEventListener('pointerdown', e => this.pointerDownHandler(e));
      this.svg.removeEventListener('pointermove', e => this.pointerMoveHandler(e));
      this.svg.removeEventListener('pointerup', e => this.pointerUpHandler(e));
      this.svg.removeEventListener('pointerleave', e => this.pointerUpHandler(e));
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

   applyTransform(dx, dy) {

      let x = this.box.x + dx
      let y = this.box.y + dy

      if (x < this.bounds.xMin)
         x = this.bounds.xMin
      if (x + this.box.width > this.bounds.xMax)
         x = this.bounds.xMax - this.box.width
      if (y < this.bounds.yMin)
         y = this.bounds.yMin
      if (y + this.box.height > this.bounds.yMax)
         y = this.bounds.yMax - this.box.height

      this.box.x = x
      this.box.y = y

   }

   pointerMoveHandler(e) {

      if (Object.keys(this.pointers).length == 1) { // panning
         let point = this.pointers[e.pointerId];
         let scale = this.svg.clientWidth / this.box.width;
         let [dx, dy] = [(point.x - e.x) / scale, (point.y - e.y) / scale];
         this.distance++;

         this.applyTransform(dx, dy);

         [point.x, point.y] = [e.x, e.y];

      } else if (Object.keys(this.pointers).length >= 2) { // tactile zoom
         let point = this.pointers[e.pointerId];
         let center = {
            x: (this.pointers[Object.keys(this.pointers)[0]].x + this.pointers[Object.keys(this.pointers)[1]].x) / 2,
            y: (this.pointers[Object.keys(this.pointers)[0]].y + this.pointers[Object.keys(this.pointers)[1]].y) / 2,
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
         this.box.width -= dw;
         this.box.height -= dh;
         this.applyTransform(dx, dy);

      }
   }

}