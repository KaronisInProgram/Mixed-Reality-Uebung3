/**
 * Repesents a stroke along a path.
 *
 * Source: https://github.com/c-frame/aframe-extras/blob/master/src/primitives/a-tube.js
 */
AFRAME.registerPrimitive('a-stroke', {
    defaultComponents: {
        stroke: {},
    },
    mappings: {
        path:               'stroke.path',
        segments:           'stroke.segments',
        radius:             'stroke.radius',
        'radial-segments':  'stroke.radialSegments',
        color:              'stroke.color',
        opacity:    	    'stroke.opacity'
    }
});
  
AFRAME.registerComponent('stroke', {
    schema: {
        path:             {default: []},
        segments:         {default: 64},
        radius:           {default: 1},
        radialSegments:   {default: 16},    
        
        // Material.
        color: {default: '#ffffff', type: 'color'},
        opacity: {default: 1}
    },
  
    init: function () {
        const self = this;
        const el = self.el;
        const initialColor = self.data.color;

        el.addEventListener('mousedown', function () {
          el.setAttribute('color', '#EF2D5E');
        });
    
        el.addEventListener('mouseup', function () {
          el.setAttribute('color', self.isMouseEnter ? '#24CAFF' : initialColor);
        });
    
        el.addEventListener('mouseenter', function () {
          el.setAttribute('color', '#24CAFF');
          self.isMouseEnter = true;
        });
    
        el.addEventListener('mouseleave', function () {
          el.setAttribute('color', initialColor);
          self.isMouseEnter = false;
        });

        this.customDraw();
    },

    update: function (prevData) {
        if (!Object.keys(prevData).length) return;

        this.remove();
        this.customDraw();
    },
  
    remove: function () {
        if (this.connectionMesh) this.el.removeObject3D('connectionMesh');
        if (this.startSphereMesh) this.el.removeObject3D('startSphereMesh');
        if (this.endSphereMesh) this.el.removeObject3D('endSphereMesh');
    },

    customDraw: function() {
        const el = this.el;
        const data = this.data;
        let material = el.components.material;
  
        if (!data.path.length) {
            console.error('[a-stroke] `path` property expected but not found.');
            return;
        }

        if (data.path.length === 1) {
            data.path.push(data.path[0]);
        }
    
        const tubeCurve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
            point = point.split(' ');
            return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
        }));
        const tubeGeometry = new THREE.TubeGeometry(tubeCurve, data.segments, data.radius, data.radialSegments, false);
    
        if (!material) {
            material = {};
            material.material = new THREE.MeshPhongMaterial({
                color: data.color,
                transparent: data.opacity < 1,
                opacity: data.opacity
              });
        }
    
        this.connectionMesh = new THREE.Mesh(tubeGeometry, material.material);
        this.el.setObject3D('connectionMesh', this.connectionMesh);

        const sphereGeometry = new THREE.SphereGeometry(data.radius, 32, 16); 

        this.startSphereMesh = new THREE.Mesh(sphereGeometry, material.material);
        const startPosition = data.path[0].split(' ');
        this.startSphereMesh.position.set(startPosition[0], startPosition[1], startPosition[2]);
        this.el.setObject3D('startSphereMesh', this.startSphereMesh);

        this.endSphereMesh = new THREE.Mesh(sphereGeometry, material.material);
        const endPosition = data.path[data.path.length - 1].split(' ');
        this.endSphereMesh.position.set(endPosition[0], endPosition[1], endPosition[2]);
        this.el.setObject3D('endSphereMesh', this.endSphereMesh);

    }
  });