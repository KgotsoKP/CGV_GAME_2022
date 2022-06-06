


var scene,camera,renderer,cube;

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //Adding fog to the scene
    scene.fog = new THREE.Fog(0x000000, 120, 160);
  
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    document.body.appendChild(renderer.domElement);
  
    //const gameInstance = new Game(scene, camera);


    const gameInstance = new Game(scene,camera);

    function animate(){
        requestAnimationFrame(animate);
        gameInstance.update();
       
        renderer.render(scene, camera);
        
    }
    
    animate();
}


window.onload = () => {
    init();
  };