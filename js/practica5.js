var renderer, scene, camera;

var cameraControls;
var cameraTop;
var robot = new THREE.Object3D();
var teclas = {ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false};

var cargador = new THREE.TextureLoader();
var texMadera = cargador.load('images/wood512.jpg');
var texMetal = cargador.load('images/metal_128.jpg');

var materialMate = new THREE.MeshLambertMaterial({map: texMadera});
var materialBrillante = new THREE.MeshPhongMaterial({map: texMetal, specular: 0xffffff, shininess: 40});

var geomBase = new THREE.CylinderGeometry(50, 50, 15, 32);
var geomPinza1 = new THREE.BoxGeometry(4,20,19);
var Base = new THREE.Mesh(geomBase, materialMate);
var Brazo = new THREE.Object3D();
var AnteBrazo = new THREE.Object3D();
var Mano = new THREE.Object3D();
var Pinza1 = new THREE.Mesh(geomPinza1, materialBrillante);
var Pinza2;

var texCubo = new THREE.CubeTextureLoader()
    .setPath('images/')
    .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);

var materialRotula = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    envMap: texCubo,
    specular: 0xffffff,
    shininess: 80
});


init();
loadRobot();
render();

function init() {
    // 1. Renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));

    // Sombras (teoría, paso 1): habilitar shadowMap en el renderizador
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // bordes suaves

    document.getElementById('container').appendChild(renderer.domElement);

    // 2. Escena
    scene = new THREE.Scene();

    // 3. Cámara
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 5000);
    camera.position.set(300, 300, 400);
    camera.lookAt(0, 0, 0);

    // Cámara cenital para la miniatura
    cameraTop = new THREE.OrthographicCamera(-200, 200, 200, -200, 1, 5000);
    cameraTop.position.set(0, 1000, 0);
    cameraTop.up.set(0, 0, 1);
    cameraTop.lookAt(0, 0, 0);

    // 4. Controles de órbita
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    // 5. Crear la habitación y el suelo continuo
    crearHabitacion();
    crearSuelo();
    setupGUI();

    // 6. LUCES
    // Luz ambiental
    var luzAmbiental = new THREE.AmbientLight(0x333333);
    scene.add(luzAmbiental);

    // Luz direccional
    var luzDireccional = new THREE.DirectionalLight(0xffffff, 0.5);
    luzDireccional.position.set(200, 400, 200);
    luzDireccional.castShadow = true;                    
    luzDireccional.shadow.mapSize.width = 1024;         
    luzDireccional.shadow.mapSize.height = 1024;
    luzDireccional.shadow.camera.left = -300;            
    luzDireccional.shadow.camera.right = 300;
    luzDireccional.shadow.camera.top = 300;
    luzDireccional.shadow.camera.bottom = -300;
    luzDireccional.shadow.camera.near = 1;
    luzDireccional.shadow.camera.far = 1500;
    scene.add(luzDireccional);

    // Luz focal
    var luzFoco = new THREE.SpotLight(0xffffff, 1);      // color, intensidad
    luzFoco.position.set(-220, 500, 100);
    luzFoco.target.position.set(0, 0, 0);                
    luzFoco.angle = Math.PI / 6;                         
    luzFoco.penumbra = 0.3;                              
    luzFoco.castShadow = true;                         
    luzFoco.shadow.mapSize.width = 1024;
    luzFoco.shadow.mapSize.height = 1024;
    luzFoco.shadow.camera.near = 1;
    luzFoco.shadow.camera.far = 1500;
    scene.add(luzFoco);

    // Redimensionar ventana
    window.addEventListener('resize', updateAspectRatio);

    window.addEventListener('keydown', function(event) {
        teclas[event.key] = true;
    })

    window.addEventListener('keyup', function(event) {
        teclas[event.key] = false;
    })
}

function crearHabitacion() {
    var caras = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
    var materiales = [];
    for (var i = 0; i < 6; i++) {
        materiales.push(new THREE.MeshBasicMaterial({
            map: cargador.load('images/' + caras[i]),
            side: THREE.BackSide
        }));
    }
    materiales[3].visible = false;   // cara negy (suelo de la habitación): la tapa crearSuelo()
    var habitacion = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), materiales);
    habitacion.position.y = 499;   // casi apoyada en el suelo
    scene.add(habitacion);
}

function crearSuelo() {
    var geometriaSuelo = new THREE.PlaneGeometry(1000, 1000);
    geometriaSuelo.rotateX(-Math.PI / 2);
    var textura = new THREE.TextureLoader().load('images/pisometalico_1024.jpg');
    textura.wrapS = THREE.RepeatWrapping;   // repetir en horizontal
    textura.wrapT = THREE.RepeatWrapping;   // repetir en vertical
    textura.repeat.set(5, 5);
    var materialSuelo = new THREE.MeshPhongMaterial({ map: textura });
    var suelo = new THREE.Mesh(geometriaSuelo, materialSuelo);
    suelo.receiveShadow = true;
    scene.add(suelo);
}

function loadRobot() {
    // Creamos la base del robot
    Base.position.set(0, 7.5, 0);

    // Creamos el brazo del robot
    var geomBrazo1 = new THREE.CylinderGeometry(20, 20, 18, 32);
    var Brazo1 = new THREE.Mesh(geomBrazo1, materialMate);
    Brazo1.position.set(0,0,0);
    Brazo1.rotateX(Math.PI/2)
    Brazo.add(Brazo1);

    var geomBrazo2 = new THREE.BoxGeometry(18, 120, 12);
    var Brazo2 = new THREE.Mesh(geomBrazo2, materialMate);
    Brazo2.position.set(0,69,0);
    Brazo.add(Brazo2);

    // Rótula: refleja el mapa de entorno
    var geomBrazo3 = new THREE.SphereGeometry(20, 32, 32);
    var Brazo3 = new THREE.Mesh(geomBrazo3, materialRotula);
    Brazo3.position.set(0,140,0);
    Brazo.add(Brazo3);

    // Creamos el antebrazo del robot
    AnteBrazo.position.set(0, 140, 0);
    var geomAB1 = new THREE.CylinderGeometry(22,22,6,32);
    var AB1 = new THREE.Mesh(geomAB1, materialMate);
    AB1.position.set(0,2,0);
    AnteBrazo.add(AB1);


    var pos = [[6,42,6], [-6,42,6], [-6,42,-6], [6,42,-6]]
    for (var i = 0; i < 4; i++) {
        var geomNervio = new THREE.BoxGeometry(4, 80, 4);
        var Nervio = new THREE.Mesh(geomNervio, materialBrillante);
        AnteBrazo.add(Nervio);
        Nervio.position.set(pos[i][0], pos[i][1], pos[i][2]);
    }

    var geomAB2 = new THREE.CylinderGeometry(15, 15, 40, 32);
    var AB2 = new THREE.Mesh(geomAB2, materialMate);
    AB2.position.set(0, 82, 0);
    AB2.rotateX(Math.PI/2);
    AnteBrazo.add(AB2);

    Mano.position.set(0, 82, 0);
    AnteBrazo.add(Mano);

    // Creamos las pinzas
    Pinza1.rotateY(Math.PI /2);
    Pinza1.position.set(20,0,-10);
    Mano.add(Pinza1);

    var geomDedo1 = new THREE.BufferGeometry();
    var vertices1 = new Float32Array([
        -2, 10, 9.5,
        -2, 10, 28.5,
        0, 10, 28.5,

        0, 10, 28.5,
        2, 10, 9.5,
        -2, 10, 9.5,

        -2, 10, 9.5,
        -2, -10, 9.5,
        -2,-10, 28.5,

        -2,-10,28.5,
        -2, 10, 28.5,
        -2, 10, 9.5,

        -2, -10, 9.5,
        2, -10, 9.5,
        0, -10, 28.5,

        0, -10, 28.5,
        -2, -10, 28.5,
        -2, -10, 9.5,

        2, 10, 9.5,
        0, 10,28.5,
        0, -10, 28.5,

        0, -10, 28.5,
        2, -10, 9.5,
        2, 10, 9.5,

        -2, 10, 9.5,
        2, 10, 9.5,
        2, -10, 9.5,

        2, -10, 9.5,
        -2, -10, 9.5,
        -2, 10, 9.5,

        -2, 10, 28.5,
        -2, -10, 28.5,
        0, -10, 28.5,

        0, -10, 28.5,
        0, 10, 28.5,
        -2, 10, 28.5,


    ])

    geomDedo1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));

    // Coordenadas de textura (UV): proyección lateral
    var uvs = new Float32Array(36 * 2);        // 2 valores (u, v) por vértice
    for (var i = 0; i < 36; i++) {
        var y = vertices1[3*i + 1];
        var z = vertices1[3*i + 2];
        uvs[2*i]     = (z - 9.5) / 19;         // u
        uvs[2*i + 1] = (y + 10) / 20;          // v
    }
    geomDedo1.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geomDedo1.computeVertexNormals();
    var Dedo1 = new THREE.Mesh(geomDedo1, materialBrillante);
    Pinza1.add(Dedo1);

    Pinza2 = Pinza1.clone();
    Pinza2.rotateZ(Math.PI);
    Pinza2.position.set(20, 0, 10);
    Mano.add(Pinza2);

    // establecemos la jerarquía
    Brazo.add(AnteBrazo);
    Base.add(Brazo);
    robot.add(Base);

    // Sombras (paso 3): todas las mallas del robot proyectan y reciben
    robot.traverse(function (obj) {
        if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    robot.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(robot);

}

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function render() {
    requestAnimationFrame(render);
    TWEEN.update();        
    cameraControls.update();

    if (teclas['ArrowUp']) {
        robot.position.z -= 1;
    }
    if (teclas['ArrowDown']) {
        robot.position.z += 1;
    }
    if (teclas['ArrowLeft']) {
        robot.position.x -= 1;
    }
    if (teclas['ArrowRight']) {
        robot.position.x += 1;
    }

    // Calcular el tamaño de la miniatura: 1/4 de la dimensión menor
    var ds = Math.min(window.innerWidth, window.innerHeight) / 4;

    // --- Vista general (pantalla completa) ---
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.clear();
    renderer.render(scene, camera);

    // --- Vista miniatura cenital (esquina superior izquierda) ---
    renderer.setViewport(0, window.innerHeight - ds, ds, ds);
    renderer.setScissor(0, window.innerHeight - ds, ds, ds);
    renderer.setScissorTest(true);
    renderer.setClearColor(new THREE.Color(0xaaaaee));
    renderer.clear();
    renderer.render(scene, cameraTop);

    renderer.setScissorTest(false);
}

function setupGUI() {
    // 1. Los datos que controlan las barras (un objeto)
    var controles = {
        giroBase: 0,          
        giroBrazo: 0,         
        giroAntebrazoY: 0,   
        giroAntebrazoZ: 0,    
        giroPinza: 0,        
        separacionPinza: 10,  
        alambres: false      
    };

    // 2. El panel
    var gui = new lil.GUI();
    gui.title('Control Robot');

    function aplicarControles() {
        Base.rotation.y = THREE.MathUtils.degToRad(controles.giroBase);
        Brazo.rotation.z = THREE.MathUtils.degToRad(controles.giroBrazo);
        AnteBrazo.rotation.y = THREE.MathUtils.degToRad(controles.giroAntebrazoY);
        AnteBrazo.rotation.z = THREE.MathUtils.degToRad(controles.giroAntebrazoZ);
        Mano.rotation.z = THREE.MathUtils.degToRad(controles.giroPinza);
        Pinza1.position.z = -controles.separacionPinza;
        Pinza2.position.z = controles.separacionPinza;
    }

    // 3. Las barras: gui.add(objeto, 'propiedad', mínimo, máximo)
    //    .listen() hace que la barra se actualice sola cuando la animación cambia el valor
    gui.add(controles, 'giroBase', -180, 180)
       .name('Giro Base')
       .listen()
       .onChange(function (grados) {
           Base.rotation.y = THREE.MathUtils.degToRad(grados);
       });

    gui.add(controles, 'giroBrazo', -45, 45)
       .name('Giro Brazo')
       .listen()
       .onChange(function (grados) {
           Brazo.rotation.z = THREE.MathUtils.degToRad(grados);
       });

    gui.add(controles, 'giroAntebrazoY', -180, 180)
       .name('Giro Antebrazo Y')
       .listen()
       .onChange(function (grados) {
           AnteBrazo.rotation.y = THREE.MathUtils.degToRad(grados);
       });

    gui.add(controles, 'giroAntebrazoZ', -90, 90)
       .name('Giro Antebrazo Z')
       .listen()
       .onChange(function (grados) {
           AnteBrazo.rotation.z = THREE.MathUtils.degToRad(grados);
       });

    gui.add(controles, 'giroPinza', -40, 220)
       .name('Giro Pinza')
       .listen()
       .onChange(function (grados) {
           Mano.rotation.z = THREE.MathUtils.degToRad(grados);
       });

    gui.add(controles, 'separacionPinza', 0, 15)
       .name('Separación Pinza')
       .listen()
       .onChange(function (distancia) {
           Pinza1.position.z = -distancia;  
           Pinza2.position.z = distancia;   
       });

    gui.add(controles, 'alambres')
       .name('Alambres')
       .onChange(function (valor) {
           // ahora hay varios materiales: hay que cambiarlos todos
           materialMate.wireframe = valor;
           materialBrillante.wireframe = valor;
           materialRotula.wireframe = valor;
       });

    // 4. Animación
    function paso(destino, ms, veces) {
        var t = new TWEEN.Tween(controles)
            .to(destino, ms)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(aplicarControles);
        if (veces) { t.yoyo(true).repeat(veces); }
        return t;
    }

    controles.anima = function () {
        TWEEN.removeAll();
        var agacharse = { giroBrazo: 45, giroAntebrazoZ: -50 };

        var pasos = [
            paso({ giroBase: -60 }, 700),
            paso(agacharse, 450, 3),
            paso({ giroBase: 60 }, 900),
            paso(agacharse, 450, 3),
            paso({ separacionPinza: 2 }, 150, 5),
            paso({ giroBase: 0, giroBrazo: 0, giroAntebrazoY: 0, giroAntebrazoZ: 0, giroPinza: 0, separacionPinza: 10 }, 800)
        ];

        for (var i = 0; i < pasos.length - 1; i++) {
            pasos[i].chain(pasos[i + 1]);
        }
        pasos[0].start();
    };
    gui.add(controles, 'anima').name('Anima');
}
