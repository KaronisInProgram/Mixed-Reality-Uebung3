AFRAME.registerComponent('draw-spawner', {
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

    const brushHead = document.createElement('a-sphere');
    brushHead.setAttribute('material', 'color', "white");
    brushHead.setAttribute('material', 'opacity', "0.25");
    // brushHead.setAttribute('obb-collider', 'showColliders', "true");

    brushHead.setAttribute('radius', 0.01);
    brushHead.setAttribute('position', this.brushHeadPosition.x + " " + this.brushHeadPosition.y + " " + this.brushHeadPosition.z);
    this.brushHead = brushHead;

    self.el.appendChild(brushHead);

    let startDrawing = () => {
      const stroke = document.createElement('a-stroke');
      stroke.classList.add('drawnObject');

      // stroke.setAttribute('obb-collider', 'showColliders', "true");
      stroke.setAttribute('color', "white");
      stroke.setAttribute('radius', 0.01);

      const spawnPosition = self.el.object3D.localToWorld(self.el.components.raycaster.lineData.end);
      stroke.setAttribute('path', spawnPosition.x + " " + spawnPosition.y + " " + spawnPosition.z);
 
      stroke.setAttribute('intersect-color-change', {});

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

    this.el.addEventListener('triggerdown', startDrawing);
    this.el.addEventListener('triggerup', stopDrawing);
    this.el.addEventListener('gripdown', lockDrawing);
    this.el.addEventListener('gripup', releaseLockedDrawing);

    // self.el.sceneEl.addEventListener('enter-vr', setSpawnPreview);
    // self.el.sceneEl.addEventListener('enter-ar', setSpawnPreview);

  },

  update: function () {

  },

  tick: function () {

    if(this.activeDrawing) {
      const nextPosition = this.el.object3D.localToWorld(this.brushHead.object3D.position.clone());
      const nextStrokePosition = nextPosition.x + " " + nextPosition.y + " " + nextPosition.z;

      let path = this.activeStrokeElement.getAttribute('path');
      const pathPositions = path.split(", ");
      
      const lastPathPosition = pathPositions[pathPositions.length - 1];

      console.log("last " + lastPathPosition);
      console.log("next " + nextStrokePosition);

      if(nextStrokePosition !== lastPathPosition) 
      {
          path = path + ", " + nextStrokePosition;
          this.activeStrokeElement.setAttribute('path', path);
      }
    }
  }
});