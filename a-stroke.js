/**
 * Repesents a stroke along a path.
 *
 * Source: https://github.com/c-frame/aframe-extras/blob/master/src/primitives/a-tube.js
 */
AFRAME.registerPrimitive("a-stroke", {
    defaultComponents: {
        stroke: {},
    },
    mappings: {
        path:               "stroke.path",
        segments:           "stroke.segments",
        radius:             "stroke.radius",
        "radial-segments":  "stroke.radialSegments",
        active:             "stroke.active",
        color:              "stroke.color",
        opacity:    	    "stroke.opacity"
    }
});
  
AFRAME.registerComponent("stroke", {
    schema: {
        path:             {default: []},
        segments:         {default: 64},
        radius:           {default: 1},
        radialSegments:   {default: 16}, 
        active:           {default: false},    
        
        // Material.
        color: {default: "white", type: "color"},
        opacity: {default: 1}
    },
  
    init: function () {
        const self = this;
        const el = self.el;
        
        this._convertPathToThreeJsPositions();

        el.addEventListener("mouseenter", function () {
            let drawableObjects = document.getElementsByClassName("drawnObject");
            el.setAttribute("active", true);

            for (const element of drawableObjects) {

                    element.setAttribute("opacity", "0.65")

            }
            
            el.setAttribute("opacity", "1")
        });
    
        el.addEventListener("mouseleave", function () {
            let drawableObjects = document.getElementsByClassName("drawnObject");
            el.setAttribute("active", false);

            for (const element of drawableObjects) {

                    element.setAttribute("opacity", "1")

            }

            el.setAttribute("opacity", "1")
        });

        this._customDraw();
    },

    update: function (oldData) {
        if (!Object.keys(oldData).length) return;

        if(oldData.path !== this.data.path)
        {
            this._convertPathToThreeJsPositions(this.data.path);
        }

        this._customDraw();
    },
  
    remove: function () {
        if (this.connectionMesh) this.el.removeObject3D("tubeMesh");
        if (this.startSphereMesh) this.el.removeObject3D("startSphereMesh");
        if (this.endSphereMesh) this.el.removeObject3D("endSphereMesh");
    },

    _customDraw: function() {
        this.remove();

        const el = this.el;
        const data = this.data;
        let material = el.components.material;
  
        if (!this.pathPositions.length) {
            console.error("[a-stroke] `path` property expected but not found.");
            return;
        }

        if (this.pathPositions.length === 1) {
            this.pathPositions.push(this.pathPositions[0]);
        }
    
        const tubeCurve = new THREE.CatmullRomCurve3(this.pathPositions);
        const tubeGeometry = new THREE.TubeGeometry(tubeCurve, data.segments, data.radius, data.radialSegments, false);
    
        if (!material) {
            material = {};
            material.material = new THREE.MeshPhongMaterial({
                color: data.color,
                transparent: data.opacity < 1,
                opacity: data.opacity
              });
        }

        this.tubeMesh = new THREE.Mesh(tubeGeometry, material.material);
        this.el.setObject3D("tubeMesh", this.tubeMesh);

        const sphereGeometry = new THREE.SphereGeometry(data.radius - 0.00001, 32, 16); 

        this.startSphereMesh = new THREE.Mesh(sphereGeometry, material.material);
        const startPosition = this.pathPositions[0];
        this.startSphereMesh.position.set(startPosition.x, startPosition.y, startPosition.z);
        this.el.setObject3D("startSphereMesh", this.startSphereMesh);

        this.endSphereMesh = new THREE.Mesh(sphereGeometry, material.material);
        const endPosition = this.pathPositions[this.pathPositions.length - 1];
        this.endSphereMesh.position.set(endPosition.x, endPosition.y, endPosition.z);
        this.el.setObject3D("endSphereMesh", this.endSphereMesh);
    },

    _convertPathToThreeJsPositions: function() {
        this.pathPositions = this.data.path.map(function (point) {
            point = point.split(" ");
            return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
        });
    },

    _convertThreeJsPositionsToStringPath: function() {
        this.data.path = this.pathPositions.map(function (point) {
            return point.x + " " + point.y + " " + point.z;
        });
    },

    addPathPosition: function(point) {
        this.pathPositions.push(point);
        this._convertThreeJsPositionsToStringPath()

        this._customDraw();
    },
    
    replaceLastPathPosition: function(point) {
        this.pathPositions.pop();
        this.pathPositions.push(point);
        this._convertThreeJsPositionsToStringPath()

        this._customDraw();
    },

    getPathPositions: function() {
        return this.pathPositions;
    }
  });