AFRAME.registerComponent("stroke-spawner", {

  // Init lifecycle method fires upon initialization of component.
  init: function() {
    console.log("Init spawn-entity for " + this.el.id);

    // Allows the use of "self" as "this" within the listener without binding.
    const self = this;

    let lockedElement = null;
    this.activeStrokeElement = null;
    this.activeDrawing = false;

    this.brushHeadPosition = new THREE.Vector3(-0.010, -0.04, -0.08);
    this.initBrushHeadRadius = 0.01;
    this.initBrushHeadColor = "white";
    this.brushHeadRadius = this.initBrushHeadRadius;
    this.brushHeadColor = this.initBrushHeadColor;
    this.brushHead = null;

    this.ThumbstickOrientation = "Upright";

    this.lastModeIndex = -1;
    this.modes = ["draw", "paint"];
    this.mode = "draw";

    let initializeModeSpecificEventListeners = () => {
      if(this.mode === "draw")
        {
          this.el.removeEventListener("triggerdown", paintDrawing);
          this.el.addEventListener("triggerdown", startDrawing);
          this.el.addEventListener("triggerup", stopDrawing);
        }
  
        if(this.mode === "paint")
        {
          this.el.removeEventListener("triggerdown", startDrawing);
          this.el.removeEventListener("triggerup", stopDrawing);
          this.el.addEventListener("triggerdown", paintDrawing);
        }
    }
    
    let resetBrushHead = () => {
      this.brushHeadRadius = this.initBrushHeadRadius;
      this.brushHeadColor = this.initBrushHeadColor;

      removeBrushHead()
      spawnBrushHead();
    }

    let spawnBrushHead = () => {
      if(this.brushHead !== null)
      {
        return;
      }

      const brushHead = document.createElement("a-sphere");
      brushHead.setAttribute("material", "color", this.brushHeadColor);
      brushHead.setAttribute("material", "opacity", "0.25");
      brushHead.setAttribute("radius", this.brushHeadRadius);
      brushHead.setAttribute("position", this.brushHeadPosition.x + " " + this.brushHeadPosition.y + " " + this.brushHeadPosition.z);
      this.brushHead = brushHead;
  
      self.el.appendChild(brushHead);
    }

    let removeBrushHead = () => {
      if(this.brushHead === null)
      {
        return;
      }

      this.brushHead.object3D.parent.remove(this.brushHead.object3D);
      this.brushHead = null
    }

    let startDrawing = () => {
      const stroke = document.createElement("a-stroke");
      stroke.classList.add("drawnObject");

      stroke.setAttribute("color", this.brushHeadColor);
      stroke.setAttribute("radius", this.brushHeadRadius);

      const spawnPosition = self.el.object3D.localToWorld(self.el.components.raycaster.lineData.end.clone());
      stroke.setAttribute("path", spawnPosition.x + " " + spawnPosition.y + " " + spawnPosition.z);
 
      stroke.setAttribute("intersect-color-change", {});

      self.el.sceneEl.appendChild(stroke);

      this.activeStrokeElement = stroke;
      this.activeDrawing = true;
    }

    let stopDrawing = () => {
      this.activeDrawing = false;
      this.activeStrokeElement = null;
    }

    let paintDrawing = () => {
      const intersectedElements = self.el.components.raycaster.intersectedEls;
      if(intersectedElements.length === 0)
      {
        return;
      }

      let intersectionElement = intersectedElements[0];
      if(intersectionElement.className !== "drawnObject")
      {
        return;
      }

      intersectionElement.setAttribute("color", this.brushHeadColor);
    }

    let lockDrawing = () => {
      const intersectedElements = self.el.components.raycaster.intersectedEls;

      if(intersectedElements.length === 0)
      {
        return;
      }
      
      lockedElement = intersectedElements[0];
      self.el.object3D.attach(lockedElement.object3D);
    }

    let releaseLockedDrawing = () => {

      if(lockedElement === null)
      {
        return;
      }
      
      self.el.sceneEl.object3D.attach(lockedElement.object3D);
      lockedElement = null;
    }

    let deleteLockedDrawing = () => {

      if(lockedElement === null)
      {
        return;
      }
      
      lockedElement.object3D.parent.remove(lockedElement.object3D);
      lockedElement = null;
    }

    let logThumbstick = (evt) => {
      if (evt.detail.y > 0.95) { this.ThumbstickOrientation = "DOWN"; }
      else if (evt.detail.y < -0.95) { this.ThumbstickOrientation = "UP"; }
      else if (evt.detail.x < -0.95) { this.ThumbstickOrientation = "LEFT"; }
      else if (evt.detail.x > 0.95) { this.ThumbstickOrientation = "RIGHT"; }
      else { this.ThumbstickOrientation = "Upright"}
    }
    
    let changeCursorMode = () => {
      this.lastModeIndex = (this.lastModeIndex + 1) % this.modes.length;
      this.mode = this.modes[this.lastModeIndex];

      initializeModeSpecificEventListeners();
      resetBrushHead();
    }

    let changeBrushColor = (evt) => {
      let intersectionElement = evt.detail.els[0];

      if(intersectionElement.className !== "colorSelection")
      {
        return;
      }

      this.brushHeadColor = intersectionElement.components.material.data.color;

      removeBrushHead();
      spawnBrushHead();
    }

    this.el.addEventListener('raycaster-intersection', changeBrushColor);
    this.el.addEventListener("gripdown", lockDrawing);
    this.el.addEventListener("gripup", releaseLockedDrawing);
    this.el.addEventListener("bbuttondown", deleteLockedDrawing);
    this.el.addEventListener("abuttondown", changeCursorMode);
    this.el.addEventListener("thumbstickmoved", logThumbstick);
    initializeModeSpecificEventListeners();

    spawnBrushHead();
  },

  tick: function (time, timeDelta) {
    this._scaleBrushHead(timeDelta);
    this._updateStroke();
  },

  _updateStroke: function () {
    if(this.activeDrawing && this.activeStrokeElement.hasLoaded) {
      const nextPosition = this.brushHead.object3D.position.clone()
      this.el.object3D.localToWorld(nextPosition);

      const strokeComponent = this.activeStrokeElement.components.stroke;
      const pathPositions = strokeComponent.getPathPositions();      
      const lastFixPathPosition = pathPositions[pathPositions.length - 2];

      if(nextPosition.distanceTo(lastFixPathPosition) >= 0.01 ) 
      {
        strokeComponent.addPathPosition(nextPosition);
      }
      else
      {
        strokeComponent.replaceLastPathPosition(nextPosition);
      }
    }
  },

  _scaleBrushHead: function (timeDelta) {
    if(this.mode === "draw" && !this.activeDrawing && this.ThumbstickOrientation === "RIGHT" && this.brushHeadRadius < 0.04) {
      const scalingFactor = 0.00005 * timeDelta;
      this.brushHeadRadius = Math.min(0.04, (this.brushHeadRadius + scalingFactor));
      this.brushHead.setAttribute("radius", this.brushHeadRadius);
    }
    
    if(this.mode === "draw" && !this.activeDrawing && this.ThumbstickOrientation === "LEFT" && this.brushHeadRadius > 0.005) {
      const scalingFactor = -(0.00005 * timeDelta);
      this.brushHeadRadius = Math.max(0.005, (this.brushHeadRadius + scalingFactor));
      this.brushHead.setAttribute("radius", this.brushHeadRadius);
    }
  }
});