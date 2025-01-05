AFRAME.registerComponent('spawn-entity', {
  
  // Accept value for color or default to blue.
  schema: {
    color: {type: 'color', default: 'blue'}
  },
  
  // Init lifecycle method fires upon initialization of component.
  init: function() {
    
    // Allows the use of "self" as "this" within the listener without binding.
    var self = this;
    
    // Add the click listener.
    this.el.addEventListener('click', function(e) {
      
      // Log intersection points for our reference.
      // console.log(e.detail.intersection.point);
      
      // Create the box element (not yet added).
      var entity = document.createElement('a-box');
    
      // Set the color to the assigned value.
      entity.setAttribute('material', 'color', self.data.color);
      
      // Set the position of the box to the click intersection.
      entity.setAttribute('position', e.detail.intersection.point);

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