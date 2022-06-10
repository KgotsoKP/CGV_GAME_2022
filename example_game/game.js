class Game{
    OBSTACLE_PREFAB = new THREE.BoxBufferGeometry(1,1,1);
    OBSTACLE_MATERIAL = new THREE.MeshPhongMaterial({ color: 0xccdeee});
    BONUS_PREFAB = new THREE.SphereBufferGeometry(1,12,12);
    COLLISION_THRESHOLD = 0.2;
    
    constructor(scene,camera,light){
        
        //get these elements from the base.css 
        this.divStage = document.getElementById('stage');
        this.divHealth = document.getElementById('health');
        this.divDistance = document.getElementById('distance');
        this.divScore = document.getElementById('score');
        this.divBall = document.getElementById('ball_title');
        this.light = light;
        //start button functionality
        document.getElementById('start_btn').onclick = () =>{
            this.running = true;
            document.getElementById('intro_panel').style.display = 'none';
            
        };
        // Replay button functionality 
        document.getElementById('replay_button').onclick = () =>{
            this.running = true;
            this.divGameOverPanel.style.display = 'none';
        };
        
        //getting the game over elements
        this.divGameOverPanel = document.getElementById('game_over_panel');
        this.divGameOverDistance = document.getElementById('game_distance');
        this.divGameOverScore = document.getElementById('game_score');
        this.divGameWonPanel = document.getElementById('game_won_panel');
        this.divGameWonDistance = document.getElementById('game_won_distance');
        this.divGameWonScore = document.getElementById('game_won_score');
        this.scene = scene;
        this.camera = camera;

        //next level 
        document.getElementById('next_level_button').onclick = () =>{
            this.running = true;
            this.divGameWonPanel.style.display = 'none';
        };

        this._reset(false);

        // bind event callbacks
        document.addEventListener('keydown',this._keyDown.bind(this));
        document.addEventListener('keydown',this._keyDown.bind(this));

        
    }

  
    /*This is called in main.js under animate to always update the game.
    */
    update(){
        if(!this.running)
            return;
        
        //recompute the game state 
        const timeDelta =this.clock.getDelta();
        this.time += timeDelta;  

    
        if(this.rotationLerp!== null){
            this.rotationLerp.update(timeDelta);
        }

        if(this._mixers){
           this._mixers.map(mixer => mixer.update(timeDelta)); 
        }
        

        //controls this speed of the model
        this.translateX += this.speedX * -0.2;
        this._updateGrid();
        this._checkCollisions();
        this._updateInfoPAnel();
        this._UpdateSun();
    }


    _updateObjects(timeDelta){
        this.KILLERSS.rotateY(-0.2*timeDelta);
        this.objectsParent.rotateY(-0.2*timeDelta);
        this.Boosters.rotateY(-0.2*timeDelta);
    }
    //Update the light position
    _UpdateSun() {
        const player = this.OBJECT_MODEL;

        const pos = player.position;
    
        this.light.position.copy(pos);
        this.light.position.add(new THREE.Vector3(-10, 500, -10));
        this.light.target.position.copy(pos);
        this.light.updateMatrixWorld();
        this.light.target.updateMatrixWorld();
      }

    _reset(replay){
        //initailize variables 
        this.running  = false;
        this.speedZ = 10;
        this.speedX = 0;  //-1:left, 0:straight, 1:right
        this.translateX = 0;
        this.health  = 10;
        this.stage = 1;
        this.score = 0;
        this.rotationLerp = null;
        this.time = 0;
        this.clock = new THREE.Clock();
        

        //show initial value
        this.divDistance.innerText = 0;
        this.divStage.innerText = this.stage;
        this.divHealth.value = this.health;
        this.divScore.innerText = this.score;

        //prepare three 3d
        this._initializeScene(this.scene,this.camera,replay);
        this._change();
    }

    //Must take in current score
    _resetToStage2(replay){
        //initailize variables 
        this.running  = false;

        this.speedZ = 10;
        this.speedX = 0;  //-1:left, 0:straight, 1:right
        this.translateX = 0;
        this.health  = 10;
        this.stage = 2;
        this.score = 25;
        this.rotationLerp = null;
        this.time = 0;
        this.clock = new THREE.Clock();
        

        //show initial value
        this.divDistance.innerText = 500;
        this.divStage.innerText = this.stage;
        this.divHealth.value = this.health;
        this.divScore.innerText = this.score;

        //prepare three 3d 
        this._StageTwo(this.scene,this.camera,replay);
    } 

    _resetToStage3(replay){
        //initailize variables 
        this.running  = false;

        this.speedZ = 10;
        this.speedX = 0;  //-1:left, 0:straight, 1:right
        this.translateX = 0;
        this.health  = 10;
        this.stage = 3;
        this.score = 0;
        this.rotationLerp = null;
        this.time = 0;
        this.clock = new THREE.Clock();

        //show initial values
        this.divDistance.innerText = 600;
        this.divStage.innerText = this.stage;
        this.divHealth.value = this.health;
        this.divScore.innerText = this.score;

        //prepare three 3d 
        this._StageThree(this.scene,this.camera,replay);
    } 

   async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }


    red(){
        //this is to spawn the killer obstacles 
        this.divBall.value = 'red';
        for(let  i = 0; i < 2;i++){
            this._spawnKillers();
        }
        
    }
    
    _spawnKillers(){
        const material = new THREE.MeshPhongMaterial( { color: "red" } );
        const killers = new THREE.Mesh(
            this.OBSTACLE_PREFAB,
            material
        );
        
        this._setupObstacle(killers);
        killers.castShadow = true;
        killers.receiveShadow=true;
        this.KILLERSS.add(killers);
        
    }

    green(){
        
        this.divBall.value = 'green';
        for(let i = 0;i<2;i++){
            this._spawnBoosters();
        }
       
    }



   async _change(){

        this.red();
        await this.sleep(10000);
        this.green();

        await this.sleep(10000);           
        this._change.bind(this);

    }


    _keyDown(event){
        // check for the key to move the ship accordingly
        let newSpeedX;

        switch(event.key){
            case 'ArrowLeft':
                newSpeedX =-1.0;
                break;
            case 'ArrowRight' :
                newSpeedX = 1.0;
               
                break;
            case 'ArrowUp' :
                newSpeedX = 0.0;
                
            default:
                return;
        }
        if(this.speedX !== newSpeedX){
            this.speedX = newSpeedX;
            this._rotateModel(-this.speedX * 20 * Math.PI/180,0.02);
        }
        

    }

    _keyUp(){
       // reset to 'idle' mode. 
       this.speedX = 0.0;
       this._rotateModel(0,0.5);
       
       
    }

    _rotateModel(targetRotation,delay){
        const $this = this;
        this.rotationLerp =  new Lerp(this.OBJECT_MODEL.rotation.z,targetRotation,delay)
            .onUpdate((value)=>{$this.OBJECT_MODEL.rotation.z = value})
            .onFinish(() =>{$this.rotationLerp = null})
        }       

    _updateGrid(){
        //speed up the game as it progresses
        this.speedZ += 0.002;
        this.grid.material.uniforms.speedZ.value =this.speedZ;


        //this makes the grid 'move' 
        this.grid.material.uniforms.time.value =this.time;
        this.grid.material.uniforms.translateX.value =this.translateX;


        //this makes the objects seem like they are coming towards the player
        this.objectsParent.position.z = this.speedZ *this.time;
        this.KILLERSS.position.z = this.speedZ *this.time;
        this.Boosters.position.z = this.speedZ *this.time;
        // to make the actual object('I think')
        
        this.objectsParent.position.x = this.translateX;
        this.KILLERSS.position.x = this.translateX;
        this.Boosters.position.x = this.translateX;
       
        //This is to respawn the objects with recreating or deleting
        this.objectsParent.traverse((child)=> {
            //check that we are in a child
            if(child instanceof THREE.Mesh){
                //give the actual z position of the object(bonus or obstacle)
                const childZPos = child.position.z + this.objectsParent.position.z;

                if(childZPos>0){
                    //reset the object
                    if(child.userData.type === 'obstacle'){
                        this._setupObstacle(child,-this.translateX,-this.objectsParent.position.z);
                        
                    }else{
                        const price = this._setupBonus(child,-this.translateX,-this.objectsParent.position.z);
                        child.userData.price = price;
                        
                    }
                }


            }
        });

        //This is to respawn the objects with recreating or deleting
        this.KILLERSS.traverse((child)=> {
            //check that we are in a child
            if(child instanceof THREE.Mesh){
                //give the actual z position of the object(bonus or obstacle)
                const childZPos = child.position.z + this.KILLERSS.position.z;

                if(childZPos>0){
                    //reset the object
                    
                        this._setupObstacle(child,-this.translateX,-this.KILLERSS.position.z);
                        
                    
                }


            }
        });

        //This is to respawn the boosters
        this.Boosters.traverse((child)=> {
            //check that we are in a child
            if(child instanceof THREE.Mesh){
                //give the actual z position of the object(bonus or obstacle)
                const childZPos = child.position.z + this.Boosters.position.z;

                if(childZPos>0){
                    //reset the object
                        this._setupObstacle(child,-this.translateX,-this.Boosters.position.z);
                }


            }
        });
    }
    
    _checkCollisions(){
        const distance = this.objectsParent.position.z.toFixed(0);
        //obstacles and points
        this.objectsParent.traverse((child)=> {
            //check that we are in a child
            if(child instanceof THREE.Mesh){
                //give the actual z position of the object(bonus or spawn)
                const childZPos = child.position.z + this.objectsParent.position.z;
                
                //threshold distances
               const thresholdX = this.COLLISION_THRESHOLD + child.scale.x/2;
               const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z/2;

               if(
                   childZPos > -thresholdZ &&
                   Math.abs(child.position.x + this.translateX)< thresholdX
               ){
                   //Collisions
                const params = [child,-this.translateX,this.objectsParent.position.z];
                   if (child.userData.type === 'obstacle'){
                        this.health -=10;
                        this.divHealth.value = this.health;
                        console.log('Health:' ,this.health);
                        this._setupObstacle(...params);
                        if (this.health <=0){
                            this._gameOver()
                        }
                   }else{
                        this.score+=child.userData.price;
                        console.log('score:',this.score);
                        child.userData.price = this._setupBonus(...params);
                        this.divScore.innerText= this.score;
                        

                        //Go to level 2
                        if(this.score > 20 && this.stage == 1){
                           this._setUpStage2();
                        }


                        //Go to level 3
                        if(this.score > 30 && this.stage == 2){
                           this._setUpStage3();
                        }

                        if(distance>5000 && this.stage == 3){
                            setTimeout(() => {
                                this.divGameWonPanel.style.display = 'grid';
                                this._reset(true);
                            });
                        }
                       

                   }
               }
            }
       });

       //killers
       this.KILLERSS.traverse((child)=> {
        //check that we are in a child
        if(child instanceof THREE.Mesh){
            //give the actual z position of the object(bonus or spawn)
            const childZPos = child.position.z + this.KILLERSS.position.z;
            
            //threshold distances
           const thresholdX = this.COLLISION_THRESHOLD + child.scale.x/2;
           const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z/2;

           if(
               childZPos > -thresholdZ &&
               Math.abs(child.position.x + this.translateX)< thresholdX
                ){
               //Collisions
               this._gameOver();
             }
            }
        });

        //obstacles and points
        this.Boosters.traverse((child)=> {
            //check that we are in a child
            if(child instanceof THREE.Mesh){
                //give the actual z position of the object(bonus or spawn)
                const childZPos = child.position.z + this.Boosters.position.z;
                
                //threshold distances
               const thresholdX = this.COLLISION_THRESHOLD + child.scale.x/2;
               const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z/2;

               if(
                   childZPos > -thresholdZ &&
                   Math.abs(child.position.x + this.translateX)< thresholdX
               ){
                   //Boosters increase the health of the player
                const params = [child,-this.translateX,this.Boosters.position.z];
                if(this.health <= 100){
                    this.health +=10;
                }
                    
                    this.divHealth.value = this.health;
                    console.log('Health:' ,this.health);
                    this._setupObstacle(...params);
               }

            
            }
       });
    }

    _updateInfoPAnel(){
        this.divDistance.innerText = this.objectsParent.position.z.toFixed(0);
    }

    _gameOver(){
        //prepare the endstate 
        this.running = false;

        //(show ui)
        this.divGameOverScore.innerText = this.score;
        this.divGameOverDistance.innerText=this.objectsParent.position.z.toFixed(0);
        setTimeout(() => {
            this.divGameOverPanel.style.display = 'grid';
            this._reset(true);
        });
       
        //reset variables

    }

    _setUpStage2(){

        //prepare the endstate 
        this.running = false;

        
        //show ui 
        this.divGameWonScore.innerText = this.score;
        this.divGameWonDistance.innerText=this.objectsParent.position.z.toFixed(0);
        setTimeout(() => {
            this.divGameWonPanel.style.display = 'grid';
           let  temp = this.score;
            this._resetToStage2(true);
            this.score = temp;
        });

    }

    _setUpStage3(){

        //prepare the endstate 
        this.running = false;

        
        //show ui 
        this.divGameWonScore.innerText = this.score;
        this.divGameWonDistance.innerText=this.objectsParent.position.z.toFixed(0);
        setTimeout(() => {
            this.divGameWonPanel.style.display = 'grid';
            this._resetToStage3(true);
        });

    }

    _createModel(scene){
        // To make the animation play 
        this._mixers = [];
        //Loads the model
        const loader = new THREE.FBXLoader();
        loader.setPath('./resources/models/');
        loader.load('model1.fbx', (fbx)=>{
        this.OBJECT_MODEL = fbx;

        this.OBJECT_MODEL.rotateY(-180* Math.PI/180);
        this.OBJECT_MODEL.scale.multiplyScalar(0.01);
        fbx.traverse(c =>{
            c.castShadow = true;
            c.receiveShadow = true; 
        });
        
        // load and play the animation of the model
        
        const anim = new THREE.FBXLoader();
        anim.setPath('./resources/models/');
        anim.load('Running.fbx', (anim) => {
          const mixer  = new THREE.AnimationMixer(fbx);
          this._mixers.push(mixer);
 
          const action = mixer.clipAction(anim.animations[0]);
          action.enabled = true;
          action.clampWhenFinished = true;
          action.play();
        });
   
         scene.add(fbx);
    
        });
         
    }

    _createGrid(scene) {
        // create the moving 'illusion'
        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xccddee, 0xccddee);
    
        const moveableZ = [];
        const moveableX = [];
        for (let i = 0; i <= divisions; i++) {
          moveableX.push(0, 0, 1, 1); // move vertical lines only (1 - point is moveable)
          moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));
        this.grid.geometry.setAttribute('moveableX', new THREE.BufferAttribute(new Uint8Array(moveableX), 1));

        this.grid.material = new THREE.ShaderMaterial({
          uniforms: {
            speedZ: {
              value: this.speedZ
            },
            translateX: {
                value : this.translateX
            },
            gridLimits: {
              value: new THREE.Vector2(-gridLimit, gridLimit)
            },
            time: {
              value: 0
            }
          },
          vertexShader: `
            uniform float time;
            uniform vec2 gridLimits;
            uniform float speedZ;
            uniform float translateX;
            attribute float moveableZ;
            attribute float moveableX;

            varying vec3 vColor;
          
            void main() {
              
              float limLen = gridLimits.y - gridLimits.x;
              vec3 pos = position;
              if (floor(moveableX + 0.5) > 0.5) { // if a point has "moveableX" attribute = 1 
                float xDist = translateX;
                float curXPos = mod((pos.x + xDist) - gridLimits.x, limLen) + gridLimits.x;
                pos.x = curXPos;
              }
              if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
                float zDist = speedZ * time;
                float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
                pos.z = curZPos;
              }
              float k = 1.0 -(-pos.z / 110.0);
              vColor = color * k;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            precision mediump float;
            varying vec3 vColor;
            
            void main() {
              
              gl_FragColor = vec4(vColor, 1.0); // r, g, b channels + alpha (transparency)
            }
          `,
          vertexColors: THREE.VertexColors
        });
    
        scene.add(this.grid);
        
      
    }

    _initializeScene(scene,camera,replay){

        if(!replay){

            // move the camera back so it can see the model
            camera.rotateX(-20 * Math.PI/180);
            
            camera.position.set(0, 1.5,2);
            //prepare 3D scene
            //Add the grid 
            this._createGrid(scene)
            
            this._createModel(scene);
             // this for loading obstacles and bonuses
             this.objectsParent = new THREE.Group();
             scene.add(this.objectsParent);
 
             this.KILLERSS = new THREE.Group();
            
 
             this.Boosters = new THREE.Group();
    
            //spawn bonuses
            for(let i = 0;i<10;i++){
                this._spawnBonuses();
            }

                scene.add(this.KILLERSS);
            
               scene.add(this.Boosters); 
            
            

        }else{
            //replay
            this.objectsParent.traverse((item) =>{
                if(item instanceof THREE.Mesh){
                    //child item
                    if(item.userData.type === 'obstacle'){
                        this._setupObstacle(item);
                    }
                    else{
                        item.userData.price = this._setupBonus(item);

                    }
                }else{
                    //anchor itself
                    item.position.set(0,0,0)
                }
            });
        }
        
        
        

    }

    _StageTwo(scene,camera,replay){

        if(!replay){
            
           

           
            
        }else{
            scene.background = new THREE.Color('blue');
            for(let i = 0;i<15;i++){
                console.log("Ran")
              //spawn obstacles
              this._spawnObstacles();
            }

            //replay
            this.objectsParent.traverse((item) =>{
                if(item instanceof THREE.Mesh){
                    //child item
                    if(item.userData.type === 'obstacle'){
                        this._setupObstacle(item);
                    }
                    else{
                        item.userData.price = this._setupBonus(item);
                    }
                }else{
                    //anchor itself
                    item.position.set(0,0,0)
                }
            });
        }

    }

    _StageThree(scene,camera,replay){

        console.log("Hi stage 3 | replay ", replay);
        if(!replay){
        //do nothing;
            
        }else{
            for(let i = 0;i<30;i++){
                console.log("Ran")
              //spawn obstacles
              this._spawnObstacles();
            }
            //replay
            this.objectsParent.traverse((item) =>{
                if(item instanceof THREE.Mesh){
                    //child item
                    if(item.userData.type === 'obstacle'){
                        this._setupObstacle(item);
                    }
                    else{
                       item.userData.price = this._setupBonus(item);

                    }
                }else{
                    //anchor itself
                    item.position.set(0,0,0)
                }
            });
        }

    }

    _spawnObstacles(){
        // create geometry of the obstacles 
        const obj = new THREE.Mesh(
            this.OBSTACLE_PREFAB,
            this.OBSTACLE_MATERIAL
        );
//get random class
        this._setupObstacle(obj);
        obj.castShadow=true;
        obj.receiveShadow=true;
        //setup a label for the object
        obj.userData = {type: 'obstacle'};
        
        //add to scene
        this.objectsParent.add(obj);
    }

    _spawnBonuses(){
        const texture = new THREE.TextureLoader().load('./textures/gold.jpg');
        const material = new THREE.MeshBasicMaterial({map:texture});
        const obj = new THREE.Mesh(
            this.BONUS_PREFAB,
            material
        );
        
        const price =this._setupBonus(obj);
        
        //setup a label for the object
        obj.userData = {type: 'bonus',
                        price: price};
        // add to scene
        this.objectsParent.add(obj);

    }

    _spawnBoosters(){
        const obj = new THREE.Mesh(
            this.BONUS_PREFAB,
            new THREE.MeshPhongMaterial({color: 'green'})
        );
        
        this._setupObstacle(obj);
        obj.castShadow=true;
        obj.receiveShadow=true;
        // add to scene
        this.Boosters.add(obj);

    }


    _setupObstacle(obj,refXPos = 0,refZPos = 0){

        //random scale 
        obj.scale.set(
            this._randomfloat(0.5,2),
            this._randomfloat(0.5,2),
            this._randomfloat(0.5,2)
        );
        
        //random position 
        obj.position.set(
            refXPos + this._randomfloat(-30,30),  //objects to apppear in front of the player 
            obj.scale.y,  // the object will placed on the grid 
            refZPos -100- this._randomfloat(-70,10)  // to populate in the horison
        );
        
        
        
    }

    _setupBonus(obj,refXPos = 0,refZPos = 0){
        obj.castShadow=true;
        obj.receiveShadow=true;
        // set value for the coin 
        const price = this._randomInt(5,20);
        const ratio = price/20;
        //size of the coin 
        const size = ratio * 0.5;
        obj.scale.set(size,size,size);


        //random position 
        obj.position.set(
            refXPos + this._randomfloat(-30,30),  //objects to apppear in front of the player 
            obj.scale.y,  // the object will placed on the grid 
            refZPos -100- this._randomfloat(0,200)  // to populate in the horison
        );
        
        return price;
    }

    _randomInt(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random()*(max-min+1)) +min;
    }

    _randomfloat(min,max){
        return Math.random() *(max -min) + min;
    }

}