AFRAME.registerComponent('controller-event-handler', {
  init: function () {
    var el = this.el;
    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'color', '#24CAFF');  
    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', '#EF2D5E');  
    });
  }
});