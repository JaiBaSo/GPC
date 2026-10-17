// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;

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

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 1, 1.5, 2 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}

function loadScene()
{
  var material = new THREE.MeshBasicMaterial({ color:0x0000ff });

  let geometriaPiso = new THREE.PlaneGeometry(10, 10, 10, 10); 
  let piso = new THREE.Mesh(geometriaPiso, material);

  piso.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI/2);
  scene.add(piso);


  var escalera = new THREE.Object3D();
  for (var i = 0; i < 8; i++) {
    var geoCaja = new THREE.BoxGeometry(2, 1, 1);
    var escalon = new THREE.Mesh(geoCaja, material); 
    escalon.position.set(0, i + 0.5, i/2 -4); 
    escalera.add(escalon);
  }

  scene.add(escalera);
}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  cameraControls.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}