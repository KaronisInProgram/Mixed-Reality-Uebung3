
AFRAME.registerComponent('log', {
    schema: {
      message: {type: 'string'}
    },
  
    init: function () {
        console.log(this.data.message + " -> from " + this.el.localName);
    },
  
    update: function () {
      console.log("Updated -> from " + this.el.localName);
    },
  
    remove: function () {
      // Do something when the component or its entity is detached.
    },
  
    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});