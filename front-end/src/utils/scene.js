import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

const ThreeBSP = require('three-js-csg')(THREE);

export class SceneCreator{
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 20000);
        this.camera.position.set(0,0,120 );
        this.camera.lookAt(0, 0, 0);
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.clip = null;

        this.textureList=[
            require('@/static/flower1.png'),
            require('@/static/flower2.png'),
            require('@/static/flower3.png'),
            require('@/static/flower4.png'),
            require('@/static/flower5.png'),
        ]
        this.particleNum = 99;
    }
    //添加灯光
    initLight(){
        let directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); //模拟远处类似太阳的光源
        directionalLight.color.setHSL(0.1, 1, 0.95);
        directionalLight.position.set(0, 200, 0).normalize();
        this.scene.add(directionalLight);
        let ambient = new THREE.AmbientLight(0xffffff, 1); //AmbientLight,影响整个场景的光源
        ambient.position.set(0, 0, 0);
        this.scene.add(ambient);
        let dotLight = new THREE.SpotLight(0xFFFFFF);
        dotLight.position.set(-40,60,-10);
        dotLight.castShadow = true;
        this.scene.add(dotLight);
    }

    //初始化性能插件
    initStatus(){
        this.stats = new Stats();

        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';

        this.container.appendChild(this.stats.domElement);
    }
    initRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0xffffff, 1.0);
        this.container.appendChild(this.renderer.domElement);
    }
    initContent(){
        var axes = new THREE.AxesHelper(200);
        // axes.position.x=-1000;
        // axes.position.z=-1000; 三维轴会到左上角

        // this.scene.add(axes);

        //底图网格 (总长宽，分多少个网格，颜色，轴线颜色，和网格颜色 #e6e8ed)
        const gridHelper = new THREE.GridHelper(2000, 100, 0x888888, 0x888888);
        gridHelper.position.x=1000;
        gridHelper.position.z=1000;
        // this.scene.add(gridHelper);
        let heart;
        let originHeart;
        new OBJLoader().load('model/heart_2.obj',obj => {
            heart = obj.children[0];
            heart.geometry.rotateX(-Math.PI * 0.5);
            heart.geometry.scale(2,2,2);
            heart.geometry.translate(0, -0.4, 0);
            heart.material = new THREE.MeshPhongMaterial({color: 0xff5555});
            heart.castShadow = true;
            this.group.add(heart);
            originHeart = Array.from(heart.geometry.attributes.position.array);
        });
        let heartOutside;
        new OBJLoader().load('model/heart_2.obj',obj => {
            heartOutside = obj.children[0];
            heartOutside.geometry.rotateX(-Math.PI * 0.5);
            heartOutside.geometry.scale(2.5,2.5,2.5);
            heartOutside.geometry.translate(0, -0.4, 0);
            let pointMaterial = new THREE.PointsMaterial({color:0xffffff, size:1});
            let points = new THREE.Points(heartOutside.geometry, pointMaterial);
            // this.group.add(points);
        });
        this.initParticle();
    }
    initParticle(){
        this.particleArray = [];
        for(var i=0; i<this.particleNum; i++){
            var textureLoader = new THREE.TextureLoader();
            var textureIndex = parseInt(Math.random()*100)%5;
            var texture = textureLoader.load(this.textureList[textureIndex]);
            var particle = new THREE.Sprite(new THREE.SpriteMaterial({map:texture}));
            particle.position.x = Math.round(Math.random() * this.container.clientWidth * 100)%200 - 100;
            particle.position.y = Math.round(Math.random() * this.container.clientHeight *100)%200 - 100;
            particle.position.z = Math.round(Math.random() * this.container.clientHeight *100)%200 - 100;
            particle.scale.x = particle.scale.y = particle.scale.z = Math.round(Math.random() * 50)%5 ;
            particle.sizeX = particle.scale.x;
            particle.xScaleSpeed = -0.08;
            particle.speed = Math.round(Math.random()*10)/80;
            this.scene.add(particle);
            this.particleArray.push(particle);
        }
    }
    makeClip(){
        this.mixer = new THREE.AnimationMixer(this.group);
        this.mixer2 = new THREE.AnimationMixer(this.group);
        const xAxis = new THREE.Vector3(0, 1, 0)
        const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, -Math.PI)
        const qMid = new THREE.Quaternion().setFromAxisAngle(xAxis, 0)
        const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
        const quaternionKF = new THREE.QuaternionKeyframeTrack(
            '.quaternion',
            [0, 1, 2, 3],
            [
                qInitial.x, qInitial.y, qInitial.z, qInitial.w,
                qMid.x, qMid.y, qMid.z, qMid.w,
                qFinal.x, qFinal.y, qFinal.z, qFinal.w,
                qMid.x, qMid.y, qMid.z, qMid.w

            ]
        )
        const positionKF = new THREE.VectorKeyframeTrack(
            '.position',
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            [
                0, -2, 0,
                0, -1.8, 0,
                0, -0.8, 0,
                0, -0.6, 0,
                0, -0.4, 0,
                0, 0, 0,
                0, 0, 0,
                0, -0.4, 0,
                0, -0.6, 0,
                0, -0.8, 0,
                0, -1.8, 0,
                0, -2.0, 0,
            ]
        );
        const opacityKF = new THREE.NumberKeyframeTrack(
            '.material.opacity',
            [0, 1, 2, 3],
            [
                0,
                0.33,
                0.66,
                1
            ]
        );
        const scaleKF = new THREE.VectorKeyframeTrack(
            '.scale',
            [0, 1, 2, 3],
            [
                1, 1, 1,
                0.9, 0.9, 0.9,
                0.95, 0.95, 0.95,
                1, 1, 1,
            ]
        )
        this.clip = new THREE.AnimationClip('basic_animation', 12, [positionKF, scaleKF]);
        const clipAction = this.mixer.clipAction(this.clip);
        clipAction.play();
        /*
        const clip2 = new THREE.AnimationClip('rotate_animation', 4, [quaternionKF]);
        const clip2Action = this.mixer2.clipAction(clip2);
        clip2Action.play();
        *
         */
    }
    initText(){
        var text = 'I love u, lim';
// 使用FontLoader加载字体
        var loader = new THREE.FontLoader();
        let that = this;
        loader.load('model/ElegantScript_Normal.json', function (response) {
            // 文字配置
            var fontCfg = {
                font : response,
                size : 8,
                height: 1,
            };
            // TextGeometry文本几何对象
            var fontGeometry = new THREE.TextGeometry(text,fontCfg);
            fontGeometry.computeBoundingBox();//绑定盒子模型

            // 文字的材质
            var fontMaterial = new THREE.MeshNormalMaterial();
            var font = new THREE.Mesh(fontGeometry, fontMaterial);

            // 计算出整个模型宽度的一半, 不然模型就会绕着x = 0,中心旋转
            font.position.x = -(fontGeometry.boundingBox.max.x - fontGeometry.boundingBox.min.x) / 2;
            font.position.y = -10;
            that.scene.add(font);
        });
    }
    initControls(){
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.5;
        // 视角最小距离
        this.controls.minDistance = 100;
        // 视角最远距离
        this.controls.maxDistance = 5000;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;

        // 最大角度
        // this.controls.maxPolarAngle = Math.PI/2.2;
        // var controls = new THREE.FirstPersonControls ( camera, renderer.domElement );
        // controls.lookSpeed = 0.4;
    }
    update(){
        // this.stats.update();
        this.controls.update();
        TWEEN.update();
        this.mixer.update(0.04);
        // this.mixer2.update(0.001);
        this.particleUpdate()
    }
    particleUpdate(){
        for(var i=0; i<this.particleNum; i++){
            this.particleArray[i].position.x += this.particleArray[i].speed;
            this.particleArray[i].position.y -= this.particleArray[i].speed+0.01;
            if(this.particleArray[i].position.x > 200 || this.particleArray[i].position.y < -100){
                this.particleArray[i].position.x = Math.round(Math.random() * this.container.clientWidth * 100)%200 - 100;
                this.particleArray[i].position.y = Math.round(Math.random() * this.container.clientHeight *100)%200 - 100;
                this.particleArray[i].position.z = Math.round(Math.random() * this.container.clientHeight *100)%200 - 100;
            }
            this.particleArray[i].scale.x += this.particleArray[i].xScaleSpeed;
            if(this.particleArray[i].scale.x < -this.particleArray[i].sizeX){
                this.particleArray[i].xScaleSpeed = 0.08;
            }
            if(this.particleArray[i].scale.x > this.particleArray[i].sizeX){
                this.particleArray[i].xScaleSpeed = -0.08;
            }
            if(this.particleArray[i].scale.x < 0.3 && this.particleArray[i].scale.x > 0){
                this.particleArray[i].scale.x = -0.3;
            }
            if(this.particleArray[i].scale.x > -0.3 && this.particleArray[i].scale.x < 0){
                this.particleArray[i].scale.x = 0.3;
            }
        }
    }
    init(){
        this.initRenderer();
        this.initContent();
        this.initLight();
        this.initControls();
        // this.initStatus();
        document.addEventListener('resize', this.onWindowResize, false);
        this.animate();
        this.makeClip();
        this.initText();
    }
    onWindowResize(){
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    animate() {
        let that = this;
        requestAnimationFrame(function (){
            that.renderer.render(that.scene, that.camera);
            that.update()
            that.animate()
        });
    }
}