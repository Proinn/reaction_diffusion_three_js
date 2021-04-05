import * as THREE from 'three';
import gs_fragment from './shaders/gs_fragment.glsl';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import { Float16BufferAttribute, Float32BufferAttribute } from 'three';


export default class GrayScott{
	constructor(){
		//create renderer
		this.canvas = document.getElementsByTagName('canvas')[0];
		
		this.renderer = new THREE.WebGLRenderer( {canvas: this.canvas} );
		this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

        //set camera
		this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
		this.camera.position.z = 100;
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;
        //create render targets
        let textureOptions = {
            minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
        };
        this.prev_target = new THREE.WebGLRenderTarget(this.width, this.height, textureOptions);
        this.next_target = new THREE.WebGLRenderTarget(this.width, this.height, textureOptions);
		let init_texture_array = new Float32Array(this.width * this.height * 4);
		for(let i=0; i< this.width * this.height; i++){
			init_texture_array[4*i] = 1;
			if (Math.random > 0.5){
				init_texture_array[4*i+1] = 1;}
		}


		let init_texture = new THREE.DataTexture(init_texture_array, this.width, this.height, THREE.RGBAFormat,THREE.FloatType );
		this.prev_target.texture = init_texture;
		// create scene
		this.scene = new THREE.Scene();

		// create uniforms
		this.time = 0;
        this.killrate_min = 0.045;
		this.killrate_max = 0.050;
        this.feedrate = 0.015;
        this.difussion_a = 1.;
        this.difussion_b = 0.5;
		this.brush_size = 10.;

		this.addMesh();
		this.mouseEffects();
		this.render();
	}


	render(){
        //calculate gs step

        this.mesh.material = this.gs_material;
		for (let index = 0; index < 8; index++) {
			this.gs_material.uniforms.previous_texture.value = this.prev_target.texture;
			this.renderer.setRenderTarget(this.next_target);
			this.renderer.render( this.scene, this.camera);

			let temp = this.prev_target;
			this.prev_target = this.next_target;
			this.next_target = temp;
		}
		this.gs_material.uniforms.brush.value = new THREE.Vector2(-1, -1);
        //show on screen
        this.screen_material.uniforms.gs_texture.value = this.prev_target.texture;
        this.mesh.material = this.screen_material;
		this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this.render.bind(this));
	}

	mouseEffects(){
		this.canvas.addEventListener("mousemove", (e)=>{    
    		var mMouseX = e.offsetX;
    		var mMouseY = e.offsetY;
        	this.gs_material.uniforms.brush.value = new THREE.Vector2(mMouseX/this.canvas.clientWidth, 1-mMouseY/this.canvas.clientHeight );
			});
	}

	addMesh(){
		this.gs_material = new THREE.ShaderMaterial({
			fragmentShader: gs_fragment,
			vertexShader: vertex,
			uniforms:{
				killrate_min: {type: 'f', value: this.killrate_min},
				killrate_max: {type: 'f', value: this.killrate_max},
                feedrate: {type: 'f', value: this.feedrate},
                difussion_a: {type: 'f', value: this.difussion_a},
                difussion_b: {type: 'f', value: this.difussion_b},
                previous_texture: {type: 't', value: undefined},
				time: {type: 'f', value: this.time},
				brush: {type: 'vec2', value: new THREE.Vector2(0.5,0.5)},
				brush_size: {type: 'f', value: this.brush_size},
				screen_size: {type: 'vec2', value: new THREE.Vector2(this.width, this.height)}
			},
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});

        this.screen_material = new THREE.ShaderMaterial({
			fragmentShader: fragment,
			vertexShader: vertex,
			uniforms:{
                gs_texture: {type: 't', value: undefined},
			},
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});

		this.plane = new THREE.PlaneGeometry(1.0, 1.0);

		this.mesh = new THREE.Mesh( this.plane, this.material );
		this.scene.add( this.mesh );

	}
}

new GrayScott();

