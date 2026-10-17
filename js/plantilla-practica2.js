// Plantilla de partida de la Práctica 2 GPC: Grafo de escena (brazo robot)

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;

// Nodos del robot (globales porque en la P4 los giraremos con sliders)
var robot, base, brazo, antebrazo, mano, pinza, dedoIz, dedoDe;

// 1-inicializa
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  // El robot mide unos 250 de alto: near/far y posición acordes a esa escala
  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio, 1, 2000 );
  camera.position.set( 150, 300, 300 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 120, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
  // Mientras desarrollamos: material que no necesita luces
  var material = new THREE.MeshNormalMaterial({ wireframe: false });

  // Ejes de ayuda (rojo = X, verde = Y, azul = Z)
  scene.add( new THREE.AxesHelper(200) );

  // ---------------------------------------------------------------
  // PASO 1: Suelo 1000 x 1000 en el plano XZ
  // ---------------------------------------------------------------
  // TODO

  // ---------------------------------------------------------------
  // PASO 2: Robot y base
  //   robot: Object3D raíz (luego lo moveremos con el teclado)
  //   base:  cilindro r=50, h=15, apoyado en el suelo
  // ---------------------------------------------------------------
  // TODO

  // ---------------------------------------------------------------
  // PASO 3: Brazo (Object3D colgado de la base, pivote en el eje)
  //   eje:       cilindro r=20, h=18, tumbado
  //   esparrago: caja 18 x 120 x 12, de pie
  //   rotula:    esfera r=20, en lo alto del espárrago (y=120)
  // ---------------------------------------------------------------
  // TODO

  // ---------------------------------------------------------------
  // PASO 4: Antebrazo (Object3D colgado del brazo, pivote en la rótula)
  //   disco:    cilindro r=22, h=6
  //   nervios:  4 cajas 4 x 80 x 4 sobre el disco
  //   mano:     cilindro r=15, h=40, tumbado, encima de los nervios
  // ---------------------------------------------------------------
  // TODO

  // ---------------------------------------------------------------
  // PASO 5: Pinza (dos dedos colgados de la mano)
  //   cada dedo = caja (BoxGeometry) + cuña (BufferGeometry a mano)
  //   el segundo dedo se obtiene transformando el primero
  // ---------------------------------------------------------------
  // TODO
}


function updateAspectRatio()
{
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}

function render()
{
  requestAnimationFrame( render );
  update();
  renderer.render( scene, camera );
}
