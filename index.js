import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

AFRAME.registerComponent('draw-spawner', {

  // Accept value for color or default to blue.
  schema: {
    color: {type: 'color', default: 'white'}
  },

  // Init lifecycle method fires upon initialization of component.
  init: function() {
    console.log("Init spawn-entity for " + this.el.id);

    // Allows the use of "self" as "this" within the listener without binding.
    var self = this;
    var intersectedElement = null;
    
    let spawn_entity = () => {
      // Create the box element (not yet added).
      var entity = document.createElement('a-sphere');

      // Set the color to the assigned value.
      entity.setAttribute('material', 'color', self.data.color);

      // Set the radius to the assigned value.
      entity.setAttribute('radius', 0.015);

      // Mark as drawn object.
      entity.classList.add('drawnObject');
      entity.setAttribute('intersect-color-change', {});

      let raycaster_lineEndPosition = self.el.components.raycaster.lineData.end
      let spawn_position = self.el.object3D.localToWorld(raycaster_lineEndPosition);

      entity.setAttribute('position', spawn_position);

      // Append the box element to the scene.
      self.el.sceneEl.appendChild(entity);
    }

    // Add the click listener.
    this.el.addEventListener('triggerdown', function(e) {
      
      let intersectedElements = self.el.components.raycaster.intersectedEls;

      if(intersectedElements.length == 0)
      {
        spawn_entity();
        return;
      }
      
      intersectedElement = intersectedElements[0].object3D;
      self.el.object3D.attach(intersectedElement);
    });

    this.el.addEventListener('gripdown', function(e) {
      
      if(intersectedElement != null)
      {
        self.el.sceneEl.object3D.attach(intersectedElement);
      }
    });
  },

  update: function () {
    var data = this.data;  // Component property values.
    var el = this.el;  // Reference to the component's entity.

    console.log("update");

    if (data.event) {
      // This will log the `message` when the entity emits the `event`.
      el.addEventListener(data.event, function () {
        console.log(data.message);
      });
    } else {
      // `event` not specified, just log the message.
      console.log(data.message);
    }
  }
});


AFRAME.registerComponent('intersect-color-change', {
  init: function () {
    var el = this.el;
    var material = el.getAttribute('material');
    var initialColor = material.color;
    var self = this;

    el.addEventListener('mousedown', function () {
      el.setAttribute('material', 'color', '#EF2D5E');
    });

    el.addEventListener('mouseup', function () {
      el.setAttribute('material', 'color', self.isMouseEnter ? '#24CAFF' : initialColor);
    });

    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'color', '#24CAFF');
      self.isMouseEnter = true;
    });

    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', initialColor);
      self.isMouseEnter = false;
    });
  }
});