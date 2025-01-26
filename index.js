AFRAME.registerComponent("stroke-spawner", {
  dependencies: ["raycaster", "line"],

  // Init lifecycle method fires upon initialization of component.
  init: function() {
    console.log("Init spawn-entity for " + this.el.id);

    // Allows the use of "self" as "this" within the listener without binding.
    const self = this;

    let lockedObject = null;
    this.activeStrokeElement = null;
    this.activeDrawing = false;
    this.brushHeadPosition = new THREE.Vector3(-0.010, -0.04, -0.08);
    this.brushHead = new THREE.Vector3(-0.010, -0.04, -0.08);

    const brushHead = document.createElement("a-sphere");
    brushHead.setAttribute("material", "color", "white");
    brushHead.setAttribute("material", "opacity", "0.25");

    brushHead.setAttribute("radius", 0.01);
    brushHead.setAttribute("position", this.brushHeadPosition.x + " " + this.brushHeadPosition.y + " " + this.brushHeadPosition.z);
    this.brushHead = brushHead;

    self.el.appendChild(brushHead);

    let startDrawing = () => {
      const stroke = document.createElement("a-stroke");
      stroke.classList.add("drawnObject");

      stroke.setAttribute("color", "white");
      stroke.setAttribute("radius", 0.01);

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

    let lockDrawing = () => {
      const intersectedElements = self.el.components.raycaster.intersectedEls;

      if(intersectedElements.length === 0)
      {
        return;
      }
      
      lockedObject = intersectedElements[0].object3D;
      self.el.object3D.attach(lockedObject);
    }

    let releaseLockedDrawing = () => {

      if(lockedObject === null)
      {
        return;
      }
      
      self.el.sceneEl.object3D.attach(lockedObject);
      lockedObject = null;
    }

    this.el.addEventListener("triggerdown", startDrawing);
    this.el.addEventListener("triggerup", stopDrawing);
    this.el.addEventListener("gripdown", lockDrawing);
    this.el.addEventListener("gripup", releaseLockedDrawing);
  },

  update: function () {

  },

  tick: function () {

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
  }
});