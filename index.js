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
    this.brushHeadRadius = 0.01;
    this.brushHeadColor = "red";

    this.ThumbstickOrientation = "Upright";

    const brushHead = document.createElement("a-sphere");
    brushHead.setAttribute("material", "color", this.brushHeadColor);
    brushHead.setAttribute("material", "opacity", "0.25");
    brushHead.setAttribute("radius", this.brushHeadRadius);
    brushHead.setAttribute("position", this.brushHeadPosition.x + " " + this.brushHeadPosition.y + " " + this.brushHeadPosition.z);
    this.brushHead = brushHead;

    self.el.appendChild(brushHead);

    let startDrawing = () => {
      const stroke = document.createElement("a-stroke");
      stroke.classList.add("drawnObject");

      stroke.setAttribute("color", this.brushHeadColor);
      stroke.setAttribute("radius", this.brushHeadRadius);

      const spawnPosition = self.el.object3D.localToWorld(self.el.components.raycaster.lineData.end.clone());
      stroke.setAttribute("path", spawnPosition.x + " " + spawnPosition.y + " " + spawnPosition.z);
 
      stroke.setAttribute("intersect-color-change", {});
      // stroke.setAttribute("obb-collider", {});

      self.el.sceneEl.appendChild(stroke);

      this.activeStrokeElement = stroke;
      this.activeDrawing = true;
    }

    let stopDrawing = () => {
      this.activeDrawing = false;
      this.activeStrokeElement = null;
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

    this.el.addEventListener("triggerdown", startDrawing);
    this.el.addEventListener("triggerup", stopDrawing);
    this.el.addEventListener("gripdown", lockDrawing);
    this.el.addEventListener("gripup", releaseLockedDrawing);
    this.el.addEventListener("bbuttondown", deleteLockedDrawing);
    this.el.addEventListener('thumbstickmoved', logThumbstick);
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
    if(!this.activeDrawing && this.ThumbstickOrientation === "RIGHT" && this.brushHeadRadius <= 0.05) {
      const scalingFactor = this.brushHeadRadius * 0.005 * timeDelta;
      this.brushHeadRadius += scalingFactor;
      this.brushHead.setAttribute("radius", this.brushHeadRadius);
    }
    
    if(!this.activeDrawing && this.ThumbstickOrientation === "LEFT" && this.brushHeadRadius >= 0.005) {
      const scalingFactor = -(this.brushHeadRadius * 0.005 * timeDelta);
      this.brushHeadRadius += scalingFactor;
      this.brushHead.setAttribute("radius", this.brushHeadRadius);
    }
  }
});


// Component to change to a sequential color on click.
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var lastIndex = -1;
    var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener('click', function (evt) {
      lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute('material', 'color', COLORS[lastIndex]);
      console.log('I was clicked at: ', evt.detail.intersection.point);
    });
  }
});