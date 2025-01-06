AFRAME.registerComponent('spawn-entity', {
  
  // Accept value for color or default to blue.
  schema: {
    color: {type: 'color', default: 'white'}
  },
  
  // Init lifecycle method fires upon initialization of component.
  init: function() {
    console.log("Init spawn-entity for " + this.el.id);

    // Allows the use of "self" as "this" within the listener without binding.
    var self = this;
    
    // Add the click listener.
    this.el.addEventListener('triggerdown', function(e) {
      
      // Log intersection points for our reference.
      // console.log(e.detail.intersection.point);
      
      // Create the box element (not yet added).
      var entity = document.createElement('a-sphere');
    
      // Set the color to the assigned value.
      entity.setAttribute('material', 'color', self.data.color);

      // Set the radius to the assigned value.
      entity.setAttribute('radius', 0.015);

      // Mark as drawn object.
      entity.classList.add('drawnObject');
      entity.setAttribute('intersect-color-change', {});
      
      // Set the position of the box to the click intersection.
      // entity.setAttribute('position', e.detail.intersection.point);

      let raycaster_lineEndPosition = self.el.components.raycaster.lineData.end
      let spawn_position = self.el.object3D.localToWorld(raycaster_lineEndPosition);

      entity.setAttribute('position', spawn_position);

      // Append the box element to the scene.
      self.el.sceneEl.appendChild(entity);
    });
    
  }
});

// Create boxes.
AFRAME.registerComponent('boxes', {
  init: function () {
    var box;
    var columns = 20;
    var el = this.el;
    var i;
    var j;
    var rows = 15;

    if (el.sceneEl.isMobile) {
      columns = 10;
      rows = 5;
    };

    for (x = columns / -2; x < columns / 2; x++) {
      for (y = 0.5; y < rows; y++) {
        box = document.createElement('a-entity');
        box.setAttribute('mixin', 'box');
        box.setAttribute('position', {x: x * .6, y: y * .6, z: 1.5});
        el.appendChild(box);
      }
    }
  }
});

AFRAME.registerComponent('intersect-color-change', {
  init: function () {
    var el = this.el;
    var material = el.getAttribute('material');
    var initialColor = material.color;
    var self = this;

    el.addEventListener('mousedown', function (evt) {
      el.setAttribute('material', 'color', '#EF2D5E');
    });

    el.addEventListener('mouseup', function (evt) {
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