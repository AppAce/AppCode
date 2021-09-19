



window.onload = function(){


var callback1 = function(){ }

var callback2 = function(){ }

    "use strict";

              var Engine = Matter.Engine,
                  Render = Matter.Render,
                  World = Matter.World,
                  Bodies = Matter.Bodies,
                  Runner = Matter.Runner,
                  Body = Matter.Body;

              var cHeight = window.innerHeight,
                  cWidth = window.innerWidth,
                  that = this;

if(cWidth > cHeight/1.2){
    cWidth = cHeight/1.2;
}


that.network = {
    getConnection: function(){
        return true;
    }
}



Render.ballText = function(bodies, context) {

    if(!bodies[0].render.text.content){
      return;
    }

    var c = context,
        content = bodies[0].render.text.content,
        PI2 = Math.PI*2,
        part,
        rotation,
        i;

        c.textBaseline="middle";
        c.textAlign = "center";
        c.fillStyle = "#000";
        c.font =  "bold "+bodies[0].render.text.fontSize+"px JoyPixels";



    for (i = 0; i < bodies.length; i++) {


        part = bodies[i];
        rotation = part.render.text.rotation;

        if(rotation % PI2 == 0){
          c.fillText(content, part.position.x, part.position.y);
          continue;
        }

        c.translate(part.position.x, part.position.y);
        c.rotate(rotation);

        c.fillText(content, 0, 0); //  part.position.x, part.position.y+down);

        c.rotate(-rotation);
        c.translate(-part.position.x, -part.position.y);


    }

};

Render.squareText = function(bodies, context) {

    if(!!!bodies[0])
      return;

    var c = context,
        part,
        content,
        opacity,
        i;

        c.textBaseline="middle";
        c.textAlign = "center";
        c.fillStyle = "#000000";
        c.font = "bold "+bodies[0].render.text.fontSize+"px Bai Jamjuree";

    for (i = 0; i < bodies.length; i++) {
        if(bodies[i].isSleeping)
          continue;

        part = bodies[i];
        content = part.render.text.content,
        opacity = part.render.opacity;

        if(opacity < 1)
          c.fillStyle = "rgba(0,0,0,"+opacity+")";

        if(part.label === "Square")
          c.fillText(content, part.position.x, part.position.y);
        else
          c.fillText(content, part.position.x-part.center.x, part.position.y-part.center.y);

    }

};

Render.gemText = function(bodies, context) {

    if(bodies.length == 0)
      return;

    var c = context,
        content = bodies[0].render.text.content,
        part,
        opacity,
        i;

        c.textBaseline="middle";
        c.textAlign = "center";
        c.font = bodies[0].render.text.fontSize+"px JoyPixels";

    for (i = 0; i < bodies.length; i++) {
        if(bodies[i].isSleeping)
          continue;
        if(!bodies[i].render.text.visible)
          continue;

        part = bodies[i],
        opacity = part.render.opacity;

        if(opacity < 1)
          c.fillStyle = "rgba(0,0,0,"+opacity+")";
        else
          c.fillStyle = "rgba(0,0,0,1)";

        c.fillText(content, part.position.x, part.position.y);

    }

};

// APP -----------------------
var App = {};

App.create = function(){

  var app = {};

  app.layers = [];
  app.events = [];
  app.adsEnabled = false;
  app.tabletMode = false;

  return app;

}

App.getTabletMode = function(app){
    return app.tabletMode;
}

App.getCurrentLayer = function(app){
  return app.layers["currentLayer"];
}

App.getLastLayer = function(app){
  return app.layers["lastLayer"];
}

App.getAdsEnabled = function(app){
    return app.adsEnabled;
}
App.setAdsEnabled = function(app,boolean){
  app.adsEnabled = boolean;
}



// APP-LAYERS ------------------
App.Layers = {};


App.Layers.create = function(options){

    var layer = {};
    layer.elements = options.elements;
    layer.render = options.render;
    layer.context = [];
    layer.buttons = options.buttons;
    layer.paths = options.paths;
    layer.pseudo = options.pseudo || false;


    options.append();


    var elems = options.elements;



    for(let i=0; i<elems.length; i++){
      if(elems[i] instanceof HTMLCanvasElement){

        Elements.setPixelRatio(elems[i]);

        if(!!shop && elems[i] == shop.emoji.canvas)
          Elements.setPixelRatio(elems[i],1);

        layer.context.push(elems[i].getContext("2d"));
      }
    }



    for(let i=0;i<layer.buttons.length;i++){
      if(!layer.buttons[i].context)
        layer.buttons[i].render.context = layer.context[0];
    }


    return layer;
}

App.Layers.add = function(app,layerName,layer){

  if(!app.layers[layerName])
    app.layers[layerName] = layer;

  // show
app.layers[layerName].show = function(){
   var layer = this;
for(let i=0; i<layer.elements.length; i++){
layer.elements[i].style.display = "block";
}

}

  // hide
app.layers[layerName].hide = function(){
   var layer = this;
for(let i=0; i<layer.elements.length; i++){
layer.elements[i].style.display = "none";
}

}

}

App.Layers.show = function(app,layerName){

    var event = {
      newLayer: layerName,
      currentLayer: app.layers["currentLayer"],
      pseudoLayer: App.Layers.isPseudo(app,layerName)
    }
    App.Events.trigger("viewchange",app,event);

    app.layers[layerName].show();

    app.layers["currentLayer"] = layerName;

}

App.Layers.hide = function(app,layer){

    app.layers[layer].hide();
}

App.Layers.render = function(app,layerName){
   var layer = app.layers[layerName];
  for(let i=0; i<layer.render.length; i++){
      layer.render[i](layer.context[i]);
  }

}

App.Layers.isPseudo = function(app,layerName){

    return app.layers[layerName].pseudo;
}

// APP-EVENTS ------------------
App.Events = {};

App.Events.on = function(eventName,app,callback){

  if(!!app.events[eventName])
    app.events[eventName].push(callback);
  else
    app.events[eventName] = [];
    app.events[eventName].push(callback);

}

App.Events.trigger = function(eventName,app,eventArg){

  if(!app.events[eventName]){
    return;
  }


  var eventObject = eventArg || {};

  eventObject.currentLayer = app.layers["currentLayer"];


  var event = app.events[eventName];



  // calls callbackfunctions related to that event
  for(let i=0; i<event.length; i++){
    event[i](eventObject);
  }

}




// AUDIO --------------------------
var Audio = {};




Audio.createContainer = function(){

  var container = {
    audios: [],
    status: "off",
    context: new AudioContext(),
    audioBackUps: [],
  }
  return container;

}

Audio.create = function(options){

    var audio = {
        id: options.id,
        path: options.path,
        sourceNode: null,
        buffer: null,
        duration: null
    }
    return audio;
}


Audio.add = function(container,audio){

    var id = audio.id,
        path = audio.path;

    container.audios[id] = { ready: true };

    Audio.load(container,audio);

    container.audioBackUps.push(audio);



}

Audio.load = function(container,audio){

  var id = audio.id,
      path = audio.path,
      context = container.context;
/*
  window.fetch(path)
  .then( response => response.arrayBuffer() )
  .then( arrayBuffer => context.decodeAudioData(arrayBuffer) )
  .then( audioBuffer => {
    container.audios[id].buffer = audioBuffer;
    container.audios[id].duration = container.audios[id].buffer.duration*1000;
  });


*/
}

Audio.reload = function(container){

  var audios = container.audioBackUps;

  for(let i=0; i<audios.length; i++)
    Audio.load(container,audios[i]);

}

Audio.setVolume = function(container,id,volume){



  var ctx = container.context,
      gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(ctx.destination);

  container.audios[id].sourceNode.connect(gainNode);

}



Audio.play = function(container,id){

  if(container.status === "off")
    return;




  switch(id){
    case "bubble":

              var audio = container.audios[id];

              if(audio.ready){

                  var context = container.context;



                  audio.ready = false;
                  if(!!!audio.sourceNode){
                    audio.sourceNode = context.createBufferSource();
                    audio.sourceNode.buffer = audio.buffer;
                    audio.sourceNode.connect(context.destination);
                  }
                  audio.sourceNode.start();
                  Timer.setDelay(game.timer,audio.duration*1.0,function(){
                    audio.sourceNode = context.createBufferSource();
                    audio.sourceNode.buffer = audio.buffer;
                    audio.sourceNode.connect(context.destination);
                    audio.ready = true;
                  });
                //  Timer.setDelay(game.timer,audio.duration*1.2,function(){
                //    audio.ready = true;
                //  });

              }
              return;
      //  break;
  }

  var audio = container.audios[id],
      context = container.context;

  switch(id){


    case "new-round":

          audio.sourceNode = context.createBufferSource();
          audio.sourceNode.buffer = audio.buffer;
          Audio.setVolume(container,id,0.4);
          audio.sourceNode.start();
        break;

  //  case "gem":
  //        Audio.setVolume(container,id,0.4);
  //      break;

    case "clock":

          audio.sourceNode = context.createBufferSource();
          audio.sourceNode.buffer = audio.buffer;
          Audio.setVolume(container,id,0.2);
          audio.sourceNode.start();
        break;

    case "click":
          audio.sourceNode = context.createBufferSource();
          audio.sourceNode.buffer = audio.buffer;
          Audio.setVolume(container,id,.4);
          audio.sourceNode.start();
        break;

    default:

          audio.sourceNode = context.createBufferSource();
          audio.sourceNode.buffer = audio.buffer;
          audio.sourceNode.connect(context.destination);
          audio.sourceNode.start();
        break;
  }





}

Audio.stop = function(container,id){

    if(!!container.audios[id].sourceNode)
      container.audios[id].sourceNode.stop();

}

Audio.setReady = function(container,id,boolean){
    container.audios[id].ready = boolean;
}

Audio.release = function(container){
  container.context.close();
}

Audio.renderSpeaker = function(status){

    var buttons = [
      {button: mainMenu.buttons[4], context: app.layers["mainmenu"].context[0] },
      {button: pauseLayer.buttons[3], context: app.layers["pausemenu"].context[0] }
    ];

    for(let i=0; i<buttons.length; i++){

      var button = buttons[i].button,
          c = buttons[i].context;

      Button.render(button,c);

      Path.renderSpeaker({
          position: {
              x: button.position.x,
              y: button.position.y
          },
          size: button.width/3,
          fillStyle: "#fff",
          status: status
      },c);

    }
}


Audio.setStatus = function(container,status){
  container.status = status;
}





// STORAGE -----------------------
var Storage = {};

Storage.saveAdsEnabled = function(app){

}

Storage.overrideAdsEnabled = function(app){

}

Storage.saveLevels = function(levels,indices){



}

Storage.saveBalance = function(shop){

}

Storage.saveEmoji = function(shop,emoji){

}

Storage.saveSelectedEmoji = function(shop){

}

Storage.overrideSelectedEmoji = function(shop){
  return new Promise((resolve,reject)=> {
    resolve();
  })
}

Storage.overrideBalance = function(shop){

  return new Promise((resolve,reject)=> {
    resolve();
  });
}


Storage.overrideEmojis = function(shop){

  return new Promise((resolve,reject)=> {
    resolve();
  });

}

Storage.overrideLevels = function(levels){

  return new Promise((resolve,reject)=> {
    resolve();
  });
}


// ERROR 2 -----------------------
var Error2 = {};

Error2.createContainer = function(){

    var container = {
        timer: Timer.create(),
        errors: [],
    }
    return container;
}

Error2.reset = function(container,error){

    var timings = error.timings,
        timer = container.timer,
        p = error.paragraph;

    for(let i in timings)
      Timer.clear(timer,timings[i]);

    timings.length = 0;

    p.style.display = "none";

    p.style.opacity = 1;

    p.style.transform = "translate(0,0)";
}

Error2.create = function(options){

    var error = {
        timings: []
    };

    error.paragraph = Elements.paragraph({
        position: {
            x: !!options.position ? options.position.x ? options.position.x : "10vw" : "10vw",
            y: !!options.position ? options.position.y ? options.position.y : "50vh" : "50vh"
        },
        width: cWidth*.8+"px",
        font: cWidth*.04+"px Bai Jamjuree",
        zIndex: 100,
        text: options.text || "ERROR THROWN"
    });

    error.paragraph.style.transform = "translate(-50%,0)";


    Elements.append(document.body,error.paragraph);

    error.paragraph.style.display = "none";

    return error;
}

Error2.add = function(container,id,error){

    container.errors[id] = error;
}

Error2.throw = function(container,id){

    var error = container.errors[id],
        p = error.paragraph,
        timer = container.timer,
        timings = error.timings,
        opacity = 1,
        ticks = 40,
        delay = 200,
        translation = 0,
        t1,t2,t3;

    Error2.reset(container,error);

    p.style.display = "block";

    t1 = Timer.setInterval2(timer,20,function(){
        translation += 1;//cWidth*.004;
        p.style.transform = "translate(0,"+-translation+"px)";

    },ticks+delay/ticks);

    t2 = Timer.setDelay(timer,delay,function(){

      t3 = Timer.setInterval2(timer,20,function(){
        opacity -= 1/ticks;
        p.style.opacity = opacity;
      },ticks);

      timings.push(t3);

    });

    timings.push(t1,t2);
}


// BUTTON -----------------------
var Button = {};


Button.create = function(options){

    var button = {
        width: options.width,
        height: options.height,
        position: {
             x: options.position.x,
             y: options.position.y
        },
        feedBack: null,
        size: options.size || "small",
        isActive: false,
        render: {
            context: options.render.context || null,
            background: options.render.background || "pink",
            text: {
                content: options.render.text.content || " ",
                fillStyle: options.render.text.fillStyle || "white",
                font: options.render.text.font || "Bai Jamjuree",
                fontWeight: options.render.text.fontWeight || "bold ",
                fontSize: options.render.text.fontSize || 20,
                filter: options.render.text.filter || "none",
                rotation: options.render.text.rotation || 0
            },
            stroke: {},
        },
        callback: options.callback || function(){},



    };

    button.feedBack = options.feedBack === false ? false : true;

    if(options.render.stroke){
        button.render.stroke.style = options.render.stroke.style || "white";
        button.render.stroke.lineWidth = options.render.stroke.lineWidth;

    }

    return button;
}

Button.click = function(button){
    button.callback();
}

Button.setActive = function(button,boolean){
    button.isActive = boolean;
}

Button.clicked = function(button,coors){

    var clickX = coors.clientX,
        clickY = coors.clientY,
        buttonW = button.width,
        buttonH = button.height,
        edgeX = button.position.x - buttonW/2,
        edgeY = button.position.y - buttonH/2

  return (clickX >= edgeX &&
          clickX <= edgeX + buttonW &&
          clickY >= edgeY &&
          clickY <= edgeY + buttonH);
}

Button.render = function(button,ctx){

    var c = !ctx ? button.render.context : ctx;


    var width = button.width,
        height = button.height,
        x = button.position.x,
        y = button.position.y,
        text = button.render.text,
        stroke = button.render.stroke,
        w = 2, // width of shape
        h = 2, // height of shape
        s; // sharpness of edges

    // render
    switch(button.size){
        case "small":
            s = 6;
            break;
        case "large":
             s = 8;
            break;
    }


    c.save();
c.beginPath();
c.translate(x,y)

c.fillStyle = button.render.background;
c.moveTo(0,0-height/h);
c.lineTo(0 + (width/w-width/s),-height/h);
c.lineTo(0 + (width/w-width/s) + width/s, 0);
c.lineTo(0 + (width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
c.lineTo(0,0-height/h);

c.fill();

    if(!!text.content){
      c.save();
      c.rotate(text.rotation / 180 * Math.PI);
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = text.fillStyle;
      c.filter = text.filter;
      c.font = text.fontWeight+" "+text.fontSize+"px "+text.font;
      c.fillText(text.content,0,0);
      c.restore();

    }

    if(stroke.style){
      c.strokeStyle = stroke.style;
      c.lineWidth = stroke.lineWidth;
      c.stroke();
    }

 c.restore();
}

// BUTTONS ----------------------
var Buttons = {};

Buttons.createContainer = function(){
    var container = [];

    return container;
}

Buttons.add = function(container,button){

    container.push(button);
}

Buttons.observe = function(container,coors){

    var btn;

    for(let i=0; i<container.length; i++){

      btn = container[i];



      if(btn.isActive && Button.clicked(btn, coors)){
        Button.click(btn);
        if(!!btn.feedBack)
          Audio.play(audios,"click");

      }

    }
}

Buttons.render = function(container){

    for(let i=0; i<container.length; i++){

        Button.render(container[i]);
    }
}

Buttons.setActive = function(container,boolean){

   for(let i=0; i<container.length; i++){

       Button.setActive(container[i],boolean);
   }
}


// COMMON ------------------------------
var Common = {};

// generates a unique id
Common.vars = {
    id: 0,
    pixelRatio: window.devicePixelRatio || 1,
};

Common.nextId = function(){
  return Common.vars.id++;
}

Common.randomNumber = function(min,max,round){

  if(!round){
    return min + Math.random() * (max-min);
  }else{
    return Math.round( min + Math.random() * (max-min) );
  }
}



// GAME -------------------------
var Game = {};



Game.Vars = {};

Game.Vars.addBall = function(game,body){
    game.balls.push(body);
}

Game.Vars.addSquare = function(game,body){
    game.squares.push(body);
}

Game.Vars.addGem = function(game,body){
    game.gems.push(body);
}

Game.Vars.addCollidingBall = function(game,body){
    game.collidingBalls.push(body);
}

Game.Vars.addReadyBall = function(game,body){
    game.readyBalls.push(body);
}

Game.Vars.clearReadyBalls = function(game){
    game.readyBalls.length = 0;
}

Game.Vars.getReadyBalls = function(game){
    return game.readyBalls;
}

Game.Vars.getBalls = function(game){
    return game.balls;
}

Game.Vars.getRound = function(game){
    return game.round;
}

Game.Vars.increaseRound = function(game){
    game.round++;
}

//specifies wether game needs user input or not
Game.Vars.setInput = function(game,boolean){
    game.input = boolean;
}

Game.needsInput = function(game){
    return game.input;
}

Game.Vars.addShootTimeout = function(game,timeout){
    game.shootTimeouts.push(timeout);
}

Game.Vars.clearShootTimeouts = function(game){
    game.shootTimeouts.length = 0;
}

Game.Vars.setIsActive = function(game,boolean){
    game.isActive = boolean;
}

Game.Vars.getIsActive = function(game){
    return game.isActive;
}

Game.Vars.setCurrentLevel = function(game,level){
    game.currentLevel = Object.assign({},level);
    game.currentLevel.tilemap = level.tilemap.slice();
    game.currentLevel.bestTime = level.bestTime.slice();
}

Game.Vars.getCurrentLevel = function(game){
    return game.currentLevel;
}

Game.Vars.getAdUsed = function(game){
    return game.adUsed;
}

Game.Vars.setAdUsed = function(game,boolean){
    game.adUsed = boolean;
}

Game.Vars.addNewSquare = function(game,body){
    game.newSquares.push(body);
}

Game.Vars.getNewSquares = function(game){
    return game.newSquares;
}

Game.Vars.clearNewSquares = function(game){
    game.newSquares.length = 0;
}

Game.Vars.addRemovedSquare = function(game,body){
    game.removedSquares.push(body);
}

Game.Vars.getRemovedSquares = function(game){
    return game.removedSquares;
}


Game.Vars.addBallGemCollision = function(game,object){
    game.ballGemCollisions.push(object);
}

Game.Vars.getBallGemCollisions = function(game){
    return game.ballGemCollisions;
}

Game.Vars.addSpreader = function(game,body){
    game.spreaders.push(body);
}

Game.Vars.getSpreaders = function(game){
    return game.spreaders;
}

Game.Vars.addBallSpreaderCollision = function(game,object){
    game.ballSpreaderCollisions.push(object);
}

Game.Vars.getBallSpreaderCollisions = function(game){
    return game.ballSpreaderCollisions;
}

Game.Vars.addSquareDust = function(game,dust){
    game.squareDust.push(dust);
}

Game.Vars.getSquareDust = function(game){
    return game.squareDust;
}


Game.Vars.setMode = function(game,mode){
    game.mode = mode;
}

Game.Vars.getMode = function(game){
    return game.mode;
}

Game.Vars.getLoadingInterval = function(game){
    return game.loadingInterval;
}

// GAME VARS LEVEL --------------------
Game.Vars.Level = {};

Game.Vars.Level.getGridTranslation = function(game){
    return game.currentLevel.gridTranslation;
}

Game.Vars.Level.getRounds = function(game){
    return game.currentLevel.rounds;
}

Game.Vars.Level.setRounds = function(game){
    var level = game.currentLevel;

    var rounds = level.tilemap.length/7-7;

    level.rounds = rounds;
}

Game.Vars.Level.setAllSquares = function(game){
    var level = game.currentLevel,
        tilemap = level.tilemap,
        allSquares = 0,
        index;

    for(let i in tilemap){

        index = tilemap[i] > 10 ? Number( tilemap[i].toString().split("").slice(1,2) ) : tilemap [i];

        if(index >= 1 && index <= 5)
            allSquares++;

    }
    level.allSquares = allSquares;
}

Game.Vars.Level.getAllSquares = function(game){
    return game.currentLevel.allSquares;
}



Game.Vars.Level.getGems = function(game){
    return game.currentLevel.gems;
}


// GAME ----------------------

Game.create = function(canvas){

  var game = {
      mode: "level",
      events: [],
      balls: [],
      squares: [],
      gems: [],
      spreaders: [],
      collidingBalls: [],
      readyBalls: [],
      shootTimeouts: [],
      newSquares: [],
      removedSquares: [],
      ballGemCollisions: [],
      ballSpreaderCollisions: [],
      squareDust: [],
      newRoundTimeout: null,
      animationFrame: null,
      fadeInTimeout: null,
      translationInterval: null,
      loadingInterval: null,
      round: 1,
      input: true,
      isActive: false,
      lowerBorder: null, // set later
      upperBorder: cHeight*.1,
      currentLevel: null,
      adUsed: false,
      ball: {
        speed: Math.round(cWidth/45),
        radius: Math.round(cWidth/50),
        initialX: cWidth/2,
        initialY: null,
      },
      square: {
        width : cWidth/7*0.75,
        height: cWidth/7*0.75,
        minSquares: 1,
        maxSquares: 3,
      }
  };


  game.grid = Grid.create(0,game.upperBorder+cWidth/7,cWidth,cWidth/7*8,8,7);

  game.lowerBorder = cHeight*.88 >= game.grid.position.y + game.grid.height ? game.grid.position.y + game.grid.height : cHeight*.88;

  var newWidth = ( game.lowerBorder - game.upperBorder ) / 9 * 7;

  if(newWidth < cWidth){
    game.grid = Grid.create( ( cWidth-newWidth )/2,game.upperBorder+newWidth/7,newWidth,newWidth/7*8,8,7);
    game.lowerBorder = cHeight*.88 >= game.grid.position.y + game.grid.height ? game.grid.position.y + game.grid.height : cHeight*.88;
    game.square.width = newWidth/7*.75;
    game.square.height = newWidth/7*.75;
    game.ball.radius = Math.round(newWidth/50);
    game.speed = Math.round(newWidth/45);
  }


  game.ball.initialY = game.lowerBorder-game.ball.radius;

  if(!canvas){
    game.canvas = Elements.canvas({
       width: "100vw",
       height: "100vh",
       position: {x: 0, y: 0},
       zIndex: 5,
       background: "#1F1F1F"
    });
  }else{ game.canvas = canvas; }

  game.streakCanvas = Elements.canvas({
       width: "100vw",
       height: "100vh",
       position: {x: 0, y: 0},
       zIndex: 6,
       background: "transparent"
  });

  game.streakContext = game.streakCanvas.getContext("2d");

  game.barCanvas = Elements.canvas({
       width: "100vw",
       height: "100vh",
       position: {x: 0, y: 0},
       zIndex: 7,
       background: "transparent"
  });

 game.barContext = game.barCanvas.getContext("2d");

 game.touchCanvas = Elements.canvas({
       width: "100vw",
       height: game.lowerBorder-game.upperBorder+"px",
       position: {
           x: 0,
           y: game.upperBorder+"px"
       },
       zIndex: 8,
       background: "transparent"
  });



  return game;
}

Game.clear = function(game){




      game.balls.length = 0;
      game.squares.length = 0;
      game.gems.length = 0;
      game.spreaders.length = 0;
      game.collidingBalls.length = 0;
      game.readyBalls.length = 0;
      game.shootTimeouts.length = 0;
      game.newSquares.length = 0;
      game.removedSquares.length = 0;
      game.ballGemCollisions.length = 0;
      game.squareDust.length = 0;
      game.fadeInTimeout = null;
      game.translationInterval = null;
      game.loadingInterval = null;
      game.input = true;
      game.round = 1;
      game.isActive = false;
      game.ball.initialX = cWidth/2;
      game.ball.initialY = game.lowerBorder-game.ball.radius;
      game.adUsed = false;
      game.currentLevel = null;

      Audio.setReady(audios,"bubble",true);
      Timer.reset(game.timer);
      Game.stop(game);
      Grid.clear(game.grid);
      World.clear(game.engine.world);
      Engine.clear(game.engine);


}


Game.init = function(game,app){





  game.engine = Engine.create();

  game.world = game.engine.world;

  game.engine.world.gravity.y = 0;
  game.engine.velocityIterations = 1;
  game.engine.constraintIterations = 4;
  game.engine.positionIterations = 4;
  Matter.Resolver._restingThresh = .1;


  game.render = Render.create({
      canvas: game.canvas,
      engine: game.engine,
      runner: game.runner,
      options: {
        width: cWidth,
        height: cHeight,
        background: "#1a1a1a",
        wireframes: false,
        showAngleIndicator: false
      }
  });

  game.runner = Runner.create({
      delta: 1000 / 60,
      isFixed: true,
      enabled: true
  });

  game.timer = Timer.create();



  game.topBar = Bar.create({
      position: {x: 0, y: 0},
      width: cWidth,
      height: game.upperBorder,
      fillStyle: "#212121",
      text: [
          Text.create({
              position: {
                  x: cWidth/2,
                  y: game.upperBorder/2
              },
              fontSize: cWidth*.08,
              fontWeight: "bold ",
              content: "..." // time
          }),
          Text.create({
              position: {
                  x: cWidth*.98,
                  y: game.upperBorder*.8
              },
              fontSize: cWidth*.04,
              fontWeight: "bold ",
              textAlign: "right",
              content: "b" // round
          }),
      ],
      buttons: [
          Button.create({
              size: "small",
              position: {
                  x: cWidth*.1,
                  y: game.upperBorder/2
              },
              width: cWidth*.16,
              height: cWidth*.1,
              render: {
                  background: "transparent",
                  text: {  }
              },
              callback: function(){
                  Game.Events.trigger("pausemenu",game);

                  switch( Game.Vars.getMode(game) ){

                      case "level":
                           Button.setActive(pauseLayer.buttons[5],false);
                           Button.setActive(pauseLayer.buttons[6],false);
                        break;

                      case "score":
                          Button.setActive(pauseLayer.buttons[1],false);
                          Button.setActive(pauseLayer.buttons[4],false);

                        break;
                  }

              }
          })
      ]

  });


  game.ballText = Text.create({
              position: {
                  x: game.ball.initialX+game.ball.radius,
                  y: game.ball.initialY-game.ball.radius
              },
              fontSize: cWidth*.04,
              fontWeight: "bold ",
              textAlign: "left",
              textBaseline: "bottom",
              content: "0"
            });

  game.bottomBar = Bar.create({
      position: {
        x: 0,
        y: game.lowerBorder
      },
      width: cWidth,
      height: cHeight-game.lowerBorder,
      fillStyle: "#212121",
      text: [],
      buttons: [
          Button.create({
              size: "small",
              position: {
                  x: cWidth/2,
                  y: game.lowerBorder+(cHeight-game.lowerBorder)/2
              },
              feedBack: false,
              width: cWidth*.3,
              height: cWidth*.1,
              render: {
                  background: "#000",
                  text: {
                      content: " "
                  },
                  stroke: {
                      style: "white",
                      lineWidth: cWidth*.01
                  }
              },
              callback: function(){
                  if(Game.Vars.getIsActive(game)){
                      Game.Vars.setIsActive(game,false);
                      Game.Events.trigger("newround",game,{});
                      Balls.Text.setRotating(game.balls,false);
                      Balls.Text.setRotation(game.balls,0);
                   }
              }
          })
      ],

  });
  var btn = game.bottomBar.buttons[0];
  game.bottomBar.paths = [
          Path.create({
            points: [
              {x: btn.position.x,
               y: btn.position.y - btn.height * .38
              },
              {x: btn.position.x,
               y: btn.position.y + btn.height * .3
              },

            ],
            strokeStyle: "white",
            lineWidth: cWidth*.012,
            lineJoin: "miter",
            lineCap: "butt"
          }),
          Path.create({
            points: [
              {x: btn.position.x + btn.height * .25,
               y: btn.position.y
              },
              {x: btn.position.x,
               y: btn.position.y + btn.height * .3
              },
              {x: btn.position.x - btn.height * .25,
               y: btn.position.y
              },
            ],
            strokeStyle: "white",
            lineWidth: cWidth*.012,
            lineJoin: "miter",
            lineCap: "butt"
          })
      ];







}


Game.startPause = function(game){

    Game.stop(game);
    Timer.stop(game.timer,game.countdown);
    Timer.stop(game.timer,game.newRoundTimeout);
    Timer.stop(game.timer,game.fadeInTimeout);
    Timer.stop(game.timer,game.translationInterval);
    Game.pauseShootTimeouts(game);

}

Game.endPause = function(game){

    Timer.run(game.timer,game.countdown);
    Timer.run(game.timer,game.newRoundTimeout);
    Timer.run(game.timer,game.fadeInTimeout);
    Timer.run(game.timer,game.translationInterval);
    Game.run(game);
    Game.runShootTimeouts(game);
}


Game.update = function(game){


  Runner.tick(game.runner,game.engine,16.7);
  Render.world(game.render);


}


Game.newRound = function(game){

     Game.renderBallText(game);

    if(Game.Vars.Level.getGridTranslation(game)){
        var duration = 20;

        Game.Vars.increaseRound(game);

        Grid.newRound(game.grid);
        Level.buildRow(game,0);

        Spreaders.outsource(game);
        Gems.outsource(game);

        Squares.update(game.squares);

        game.fadeInTimeout = Timer.setTimeout(game.timer,duration,function(){
          Grid.fadeIn(game,game.grid,game.timer,duration);
        });


        game.translationInterval = Timer.setInterval2(game.timer, duration/2, function(){
          Grid.translate(game.timer,game.grid,game.grid.rectHeight,duration);
        },duration,function(){

          Timer.setTimeout(game.timer,duration,function(){
            Game.Vars.setInput(game, true);
          });

        });

    }else{
        Game.Vars.setInput(game, true);
    }



}

Game.run = function(game){

  game.animationFrame = requestAnimationFrame(function(){
    Game.run(game);
  });

  Game.update(game);
}


Game.stop = function(game){
cancelAnimationFrame(game.animationFrame);
}

Game.runCountdown = function(game){

    var topBar = game.topBar,
        text = topBar.text[0],
        timeLeft = Calculator.convertToMilSec(game.currentLevel.timeLimit);

    game.currentLevel.timeLeft = timeLeft;

    game.countdown = Timer.setInterval2(game.timer,1000,function(){
        game.currentLevel.timeLeft -= 1000;
       var time =  Calculator.convertToMinSec(game.currentLevel.timeLeft);
       if(time.sec < 10)
          time.sec = "0"+time.sec;
       var string = time.min+":"+time.sec;

        Text.changeContent(text,string);

        Elements.renderArea({
            position: {
                x: text.position.x,
                y: text.position.y
            },
            width: cWidth/4,
            height: topBar.height/1.8,
            fillStyle: topBar.fillStyle,
            context: game.barContext
        });
        Text.render(text,game.barContext);
    },timeLeft/1000-1,function(){
        Game.Events.trigger("lost",game,{});
    });



}

Game.lost = function(game){

    return (Game.timeUp(game) || Game.squaresDown(game));

}

Game.timeUp = function(game){
    return (game.currentLevel.timeLeft <= 0 );
}

Game.squaresDown = function(game){
    var content = game.grid.content,
        rows = game.grid.rows-1,
        columns = game.grid.columns,
        rect;

    if(!Game.Vars.Level.getGridTranslation(game))
      return false;


    for(let i=0; i<columns; i++){

        if(!!content[rows-1][i].connection){
          rect = content[rows-1][i].connection;
          if(rect.label === "Square" || rect.label === "Triangle")
            return true;
        }
    }
}

Game.won = function(game){

   var removed = Game.Vars.getRemovedSquares(game).length,
       allSquares = Game.Vars.Level.getAllSquares(game);

   return removed === allSquares;

}

Game.revive = function(game){

    var content = game.grid.content,
        rows = game.grid.rows,
        columns = game.grid.columns,
        rect;

    for(let k=rows-1; k>rows-4; k--){

      for(let i=0; i<columns; i++){
        rect = content[k][i];

        if(!!rect.connection){
          if(rect.connection.label === "Square" || rect.connection.label === "Triangle"){
           Square.remove(game,rect.connection);
           Grid.disconnect(game.grid,k,i);
           i--;
          }
        }
      }

    }

    if(Game.won(game))
      Game.Events.trigger("win",game,{});

}


Game.clearBallText = function(text,ctx){

    Elements.clearArea({
        position: {
            x: text.position.x,
            y: text.position.y-text.fontSize/2
        },
        width: cWidth/4,
        height: text.fontSize*2,
        context: ctx
    });

}

Game.renderBallText = function(game){
    var text = game.ballText,
        ctx = game.barContext,
        radius = game.ball.radius,
        balls = game.currentLevel.balls;

    Text.changeContent(text,balls);

    Game.clearBallText(text,game.barContext);

    Text.setPosition(game.ballText,{
      x: game.ball.initialX + radius,
      y: game.ball.initialY - radius
    });

    Text.render(text,ctx);

}


Game.getMetrics = function(game){

  var level = game.currentLevel,
      bestTime = level.bestTime,
      timeLeft = level.timeLeft,
      bestOne = Calculator.convertToMilSec(level.bestTime[0]),
      bestTwo = Calculator.convertToMilSec(level.bestTime[1]),
      stars = 1,
      gems = level.completed ? 0 : Game.Vars.Level.getGems(game);

  if(timeLeft >= bestOne){
      stars = 3;
  }else if(timeLeft >= bestTwo){
      stars = 2;
  }

  return { // metrics
      timeLeft: timeLeft,
      bestOne: bestOne,
      bestTwo: bestTwo,
      stars: stars,
      gems: gems
  };


}


Game.pauseShootTimeouts = function(game){

    var timeouts = game.shootTimeouts,
        timer = game.timer;

    for(let i=0; i<timeouts.length; i++){
        Timer.stop(timer,timeouts[i]);
    }

}

Game.runShootTimeouts = function(game){

    var timeouts = game.shootTimeouts,
        timer = game.timer;

    for(let i=0; i<timeouts.length; i++){
        Timer.run(timer,timeouts[i]);
    }

}



// GAME EVENTS ---------------------
Game.Events = {};

Game.Events.on = function(eventName, game, callback){

    if(!!game.events[eventName]){
       game.events[eventName].push(callback);
    }else{
    var event = game.events[eventName] = [];
        event.push(callback);
    }

}

Game.Events.trigger = function(eventName, game, eventObject){

  if(!game.events[eventName]){
    return;
  }

  var event = game.events[eventName];

  for(let i=0; i<event.length; i++)
    event[i](eventObject);

}



// SCORE GAME ----------------------
var ScoreGame = {};

ScoreGame.setScore = function(scoreGame,score){
  scoreGame.score = score;
}

ScoreGame.getScore = function(scoreGame){
  return scoreGame.score;
}

ScoreGame.increaseScore = function(scoreGame){
  scoreGame.score++;
}

ScoreGame.setBest = function(scoreGame,best){
  scoreGame.best = best;
}

ScoreGame.getBest = function(scoreGame){
  return scoreGame.best;
}

ScoreGame.create = function(game){

    var scoregame = {
        score: 0,
        best: 0, // highscore
        minBlocks: 1, // per row
        maxBlocks: 4, // per row
        pointBases: [4, 8, 10, 16, 20, 24, 30, 40, 48, 50, 64, 70, 80],
        level: Level.create({
            balls: 1,
            points: 1,
            gridTranslation: true,
            timeLimit: {min: 1, sec: 11},
            bestTime: [
              {min: 0, sec: 1},
              {min: 0, sec: 1}
            ],
            tilemap: []
        }),
        text: [
          Text.create({
              position: {
                  x: cWidth*.98,
                  y: game.upperBorder*.15
              },
              fontSize: cWidth*.026,
              fontWeight: "bold ",
              textAlign: "right",
              content: "BEST"
          }),
          Text.create({
              position: {
                  x: cWidth*.98,
                  y: game.upperBorder*.37
              },
              fontSize: cWidth*.04,
              fontWeight: "bold ",
              textAlign: "right",
              content: "0" // best num
          }),
          Text.create({
              position: {
                  x: cWidth*.98,
                  y: game.upperBorder*.6
              },
              fontSize: cWidth*.026,
              fontWeight: "bold ",
              textAlign: "right",
              content: "SCORE"
          }),
          Text.create({
              position: {
                  x: cWidth*.98,
                  y: game.upperBorder*.84
              },
              fontSize: cWidth*.04,
              fontWeight: "bold ",
              textAlign: "right",
              content: "0" // score num
          })
        ]
    }

    return scoregame;
}

ScoreGame.randomizeLevel = function(scoreGame,game){


    var level = scoreGame.level,
        score = scoreGame.score,
        pBases = scoreGame.pointBases,
        rows = game.grid.rows-1,
        cols = game.grid.columns,
        score = scoreGame.score,
        best = scoreGame.best,
        minBlocks = scoreGame.minBlocks,
        maxBlocks = scoreGame.maxBlocks,
        pointBase = pBases[score < 0 ? Common.randomNumber(0,4, true) : Common.randomNumber(0,pBases.length-1, true) ],
        tilemapRows = 5,//Common.randomNumber(5,16,true),
        tilemap = [""],
        text = scoreGame.text;

    for(let i=0; i<tilemapRows; i++)
      tilemap[0] += ScoreGame.randomizeRow(minBlocks, maxBlocks);


    level.gridTranslation = true;
    for(let i=0; i<6; i++)
      tilemap[0] += ScoreGame.randomizeRow(0,0);


    tilemap[0] = tilemap[0].slice(0,-1); //rm last ','

    var timeLimit = ( Math.round( maxBlocks / cols * (tilemapRows) +pointBase/10) * 10 )* 1000;



    level.index = -1;
    level.locked = false;
    level.points = pointBase;
    level.balls = level.points/2;
    level.tilemap = tilemap;
    level.timeLimit = Calculator.convertToMinSec( timeLimit );
    level.bestTime[0] = Calculator.convertToMinSec( Math.round ( timeLimit*.2 / 10) *10 );
    level.bestTime[1] = Calculator.convertToMinSec( Math.round ( timeLimit*.1 / 10) *10 );


    Level.convertTilemap(level);
    level.gems = Level.getGems(level);


    Text.changeContent(text[1],best);
    Text.changeContent(text[3],score);


    return level;
}

ScoreGame.randomizeRow = function(min,max){

    var blocks = Common.randomNumber(min,max,true),
        row = [0,0,0,0,0,0,0],
        half = null,
        string = "",
        index = null;



    for(let i=0; i<blocks; i++){

        index = Common.randomNumber(0,6,true);
        half = Common.randomNumber(0,1,true);

        if(row[index] === 0){
            row.splice(index,1,!!half ? 25 : 5);

        }else{

            for(let k=index; k<index+row.length; k++){

                if(row[k % row.length] !== 0)
                  continue;

                row.splice(k % row.length, 1 , !!half ? 25 : 5);
                k = index + row.length;

            }
        }

    }


    for(let i=0; i<row.length; i++)
      string += row[i].toString()+",";


    return string;
}

ScoreGame.renderBarText = function(scoreGame,context){

    var c = context,
        text = scoreGame.text;

    for(let i=0; i<text.length; i++)
      Text.render(text[i],c);
}


// LOADING BALL -----------------
var LoadingBall = {};


LoadingBall.run = function(game, options, context){

    var timer = game.timer;

    LoadingBall.init(options);

    game.loadingInterval = Timer.setInterval2(timer, 15, function(){
      LoadingBall.tick(options);
     LoadingBall.render(options,context);
    });

}

LoadingBall.init = function(options){

    var x = options.position.x,
        y = options.position.y,
        radius = options.radius,
        circles = [];

    for(let i=0; i<5; i++){
        circles.push({
            x: x,
            y: y+i*radius,
            radius: radius*4
        });
    }

    options.circles = circles;
}

LoadingBall.tick = function(options){

    var circles = options.circles,
        speed = circles[0].radius/30,
        y = options.position.y,
        radius = options.radius;

    for(let i=0; i<circles.length; i++){

      circles[i].y -= speed;

      if(circles[i].y < y)
        circles[i].y = y + radius*5;

    }

}

LoadingBall.render = function(options, context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        radius = options.radius,
        speed = radius,
        bgColor = options.bgColor,
        fgColor = options.fgColor,
        circles = options.circles;

    //c.clearRect(0,0,radius*2,radius*2);
    c.save();
    c.beginPath();
    c.arc(x,y,radius*1,0,Math.PI*2);
  //   c.rect(x-radius,y-radius,radius*2,radius*2);
    c.clip();

    c.beginPath();
    c.fillStyle = bgColor;
    c.arc(x,y,radius,0,Math.PI*2);
    c.fill();

    for(let i=0; i<circles.length; i++){

      c.beginPath();
      c.strokeStyle = fgColor;
      c.lineWidth = radius/4;
      c.arc(x, circles[i].y, circles[i].radius, 0, Math.PI*2);
      c.stroke();
    }

    c.closePath();
    c.restore();
}

LoadingBall.clear = function(game){

    var c = game.barContext,
        timer = game.timer;

    Timer.clear(timer, Game.Vars.getLoadingInterval(game));

    Elements.clearArea({
        position: {
          x: game.ball.initialX,
          y: game.ball.initialY
        },
        width: game.ball.radius*2.1,
        height: game.ball.radius*2.1,
        context: c
    });

    Bar.render(game.bottomBar,game.barContext);
    Path.render(game.bottomBar.paths[0],game.barContext);
    Path.render(game.bottomBar.paths[1],game.barContext);
}



// ELEMENTS --------------------
var Elements = {};

Elements.canvas = function(options){

  var canvas = document.createElement("canvas");

  canvas.style.width = options.width;
  canvas.style.height = options.height;
  canvas.style.position = options.positionAttribute || "absolute";
  canvas.style.top = options.position.y || 0;
  canvas.style.left = options.position.x || 0;
  canvas.style.marginTop =
  canvas.style.background = options.background || "pink";
  canvas.style.border = options.border || "none"
  canvas.style.zIndex = options.zIndex || 1;

    return canvas;
}

Elements.div = function(options){

  var div = document.createElement("div");

  div.style.width = options.width;
  div.style.height = options.height;
  div.style.position = options.positionAttribute || "absolute";
//  switch(options.positionAttribute){
//      case  "absolute":
      div.style.top = options.position.y;
      div.style.left = options.position.x;
//          break;
//      default:
//        div.style.marginTop = options.position.y;
//        div.style.marginLeft = options.position.x;
//          break;
//  }

  div.style.zIndex = options.zIndex || 1;
//  div.style.display = "none";

  if(options.scrollable){
    div.style.overflow = "scroll";
  }


  return div;
}



Elements.paragraph = function(options){

    var p = document.createElement("p");

    p.style.font = options.font || "Bai Jamjuree";
    p.style.fontSize = options.fontSize+"px" || "20px";
    p.style.position = options.positionAttribute || "absolute";
    p.style.left = options.position.x || 0;
    p.style.zIndex = options.zIndex || 1;
    p.style.width = options.width;
    p.style.height = options.height;
    p.style.textAlign = "center";
    p.style.top = options.position.y || 0;

    p.style.color = options.fillStyle || "red";
    p.innerHTML = options.text || "sample";

    if(options.id)
      p.id = options.id;

    return p;
}


Elements.append = function(element,attachment){

    element.appendChild(attachment);
}
// only for canvas
Elements.setPixelRatio = function(canvas,pixelRatio){

 if(canvas instanceof HTMLCanvasElement){

  var dpr = pixelRatio || Common.vars.pixelRatio,
      ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth*dpr;
  canvas.height = canvas.offsetHeight*dpr;


  ctx.scale(dpr,dpr);

 }

}

Elements.display =  function(element,display){
    return new Promise((res) => {

        element.style.display = display;
        res();
    })
}


Elements.remove = function(element){
  element.parentNode.removeChild(element);
}


Elements.renderArea = function(area){

   var c = area.context,
       width = area.width,
       height = area.height,
       x = area.position.x - width/2,
       y = area.position.y - height/2;


   c.fillStyle = area.fillStyle;
   c.fillRect(x,y,width,height);
}

Elements.clearArea = function(area){

   var c = area.context,
       width = area.width,
       height = area.height,
       x = area.position.x - width/2,
       y = area.position.y - height/2;

   c.clearRect(x,y,width,height);
}



// TIMER -------------------
var Timer = {};


// timestamp: now
Timer.execute = function(timer, timestamp){

    var queue = timer.queue,
        obj;

    for(let i=0; i<queue.length; i++){

        obj = queue[i];
        if(!!obj.stopped)
          continue;

        switch(obj.type){

          case "timeout":
                obj.value--;
                if(obj.value <= 0){
                  obj.callback();
                  queue.splice(i,1);
                }
              break;
          case "interval":
                obj.callback();
                obj.value--;
                if(obj.value <= 0){
                  queue.splice(i,1);
                }
              break;
          case "timeout2":
                if(obj.value <= timestamp){

                  obj.callback();
                  queue.splice(i,1);
                }
              break;
          case "interval2":
                if(timestamp >= obj.lastTime + obj.value){

                   obj.callback();
                   if(obj.ticks <= 0){
                     if(!!obj.endCallback)
                       obj.endCallback();
                     queue.splice(i,1);
                   }
                   obj.ticks--;

                   //obj.delta = timestamp - obj.lastTime - obj.value;


                   obj.lastTime = timestamp;

                   obj.delta = 0;


                }
              break;
        }



    }

}


// delay: milliseconds until execution
Timer.setDelay = function(timer, delay, callback){

  var timing = {
      type: "timeout2",
      id: timer.nextId(),
      value: performance.now()+delay,
      callback: callback
  }
  Timer.addTiming(timer,timing);
  return timing.id;
}

// ticks: ticks until end of interval
Timer.setInterval = function(timer,ticks,callback){

  var timing = {
      type: "interval",
      id: timer.nextId(),
      value: ticks,
      callback: callback
  }
  Timer.addTiming(timer,timing);
  return timing.id;
}



// interval: interval in milliseconds until next execution of callback
Timer.setInterval2 = function(timer,interval,callback,ticks,endCallback){

    var timing = {
        type: "interval2",
        id: timer.nextId(),
        ticks: !!ticks ? ticks : Infinity,
        value: interval,
        callback: callback,
        endCallback: endCallback,
        delta: 0,
        lastTime: performance.now()-interval
    }
    Timer.addTiming(timer,timing);
    return timing.id;
}


// delay: ticks until executuion
Timer.setTimeout = function(timer,delay,callback){

  var timing = {
      type: "timeout",
      id: timer.nextId(),
      value: delay,
      callback: callback
  }
  Timer.addTiming(timer,timing);
  return timing.id;
}

// timing: array of timings or timing
Timer.clear = function(timer,timing){

  var queue = timer.queue;

  if(typeof timing === typeof null){
    for(let i=0; i<queue.length; i++){
      for(let k in timing)
        if(queue[i].id === timing[k])
          queue.splice(i,1);
    }
  }else{
    for(let i=0; i<queue.length; i++){
      if(queue[i].id === timing)
        queue.splice(i,1);
    }
  }
}

Timer.create = function(){

  var timer = {};

  timer.queue = [];
  timer.id = 0;
  timer.nextId = function(){
      return timer.id++;
  }
  timer.animationFrame = null;

  return timer;

}

Timer.stop = function(timer,timingId){

    var queue = timer.queue,
        now = performance.now(),
        timing;

    for(let i=0; i<queue.length; i++){
      if(queue[i].id === timingId)
          timing = queue[i];
    }
    if(!timing)
      return;

    switch(timing.type){
        case "timeout2":
          timing.delta = timing.value-now;
            break;
        case "interval2":
          timing.delta = now - timing.lastTime;
            break;
    }
    timing.stopped = true;
}

Timer.run = function(timer,timingId){

    var queue = timer.queue,
        now = performance.now(),
        timing;

    for(let i=0; i<queue.length; i++){
      if(queue[i].id === timingId)
          timing = queue[i];
    }

    if(!timing)
      return;

    switch(timing.type){
        case "timeout2":
          timing.value = now+timing.delta;
            break;
        case "interval2":
          timing.lastTime = now - timing.delta;
            break;
    }
    timing.stopped = false;

}

Timer.reset = function(timer){
    timer.queue.length = 0;
    timer.id = 0;
    timer.animationFrame = null;
}

Timer.enabled = function(timer){
    return !!timer.queue.length;
}

Timer.loop = function(timer){

    if(!Timer.enabled(timer))
      return;

    timer.animationFrame = requestAnimationFrame(function(){
        Timer.loop(timer);
    });

    Timer.execute(timer,performance.now());
}

Timer.addTiming = function(timer,timing){
    if(Timer.enabled(timer)){
      timer.queue.push(timing);
    }else{
      timer.queue.push(timing);
      Timer.loop(timer);
    }
}

// TOUCH --------------------
var Touch = {};

Touch.vars = {
    start: { x: null, y: null},
    move: { x: null, y: null}
}

Touch.resetVars = function(){
    Touch.vars.start.x = null;
    Touch.vars.start.y = null;
    Touch.vars.move.x = null;
    Touch.vars.move.y = null;
}

// TouchStreak -------------------
var TouchStreak = {};

TouchStreak.render = function(render){

  var startX = render.start.x,
      startY = render.start.y,
      moveX = render.move.x,
      moveY = render.move.y,
      c = render.context,
      ball = render.ball;

  TouchStreak.clear(c);

  c.beginPath();
  c.moveTo(startX, startY);
  c.lineTo(moveX, moveY);
  c.lineWidth = ball.radius/3;
  c.strokeStyle = "white";
  c.fillStyle = "white";
  c.stroke();
  c.closePath();

}

TouchStreak.clear = function(ctx){
    ctx.clearRect(0,0,cWidth,cHeight);
}


// BallStreak -------------------
var BallStreak = {};

BallStreak.render = function(ball,render){

  var c = render.context,
      length = cHeight*2,
      angle = Calculator.streakAngle({
          start: render.start,
          move: render.move
      });

  var angle = Calculator.angleConstraint(angle);

  if(!angle){ return; }


  c.save();
 c.translate(ball.initialX,ball.initialY);
  c.rotate(-(angle-Math.PI/2));

  // triangle
  c.beginPath();
  c.moveTo(-ball.radius, -ball.radius*1);
  c.quadraticCurveTo(0, -ball.radius*1.7, ball.radius, -ball.radius*1);
  c.lineTo(0,-ball.radius*6);
  c.closePath();
  c.stroke();
  c.fill();

  c.translate(0,-ball.radius*2);

  // streak
  c.beginPath();
  c.moveTo(0,0);
  c.lineTo(0,-length);
  c.lineWidth = ball.radius/3; c.setLineDash([cWidth*0.008,ball.radius]);
  c.strokeStyle = "white";
  c.closePath();
  c.stroke();

  c.restore();
}




// GRID ----------------------
var Grid = {};

Grid.create = function(x,y,width,height,rows,columns){

  var gridObject = {};

  gridObject.content = [];

  var grid = gridObject.content,
      rectW = width / columns,
      rectH = height / rows,
      edgeX,
      edgeY;

  gridObject.rectWidth = rectW;
  gridObject.rectHeight = rectH;
  gridObject.width = width;
  gridObject.height = height;
  gridObject.position = {x: x, y: y};
  gridObject.rows = rows;
  gridObject.columns = columns;

  for(let i=0; i<rows; i++){

    edgeY = y + rectH*i;
    grid[i] = [];

    for(let k=0; k<columns; k++){

      grid[i][k] = {};

      var rect = grid[i][k];

      edgeX = x + rectW*k;
      rect.midX = edgeX + rectW/2;
      rect.midY = edgeY + rectH/2;
      rect.free = true;
      rect.connection = null;

    }

  }

  return gridObject;

}

Grid.clicked = function(pGrid,coors){

  var rectH = pGrid.rectHeight,
      rectW = pGrid.rectWidth,
      gridX = pGrid.position.x,
      gridY = pGrid.position.y,
      clickX = coors.clientX,
      clickY = coors.clientY;

  var column = Math.floor( (clickX-gridX) / rectW ),
      row = Math.floor( (clickY-gridY) / rectH );

  var obj;

  if( column < pGrid.columns && column >= 0 && row >= 0 && row < pGrid.rows){
      obj = {row: row, column: column, connection: pGrid.content[row][column].connection};
  }

  return obj;
}

Grid.getRect = function(grid,row,column){
    return grid.content[row][column];
}

// moves the grid's box free values on row down and clears the first row
Grid.newRound = function(grid){

  var content = grid.content,
      rows = grid.rows,
      columns = grid.columns;

  for(let i=rows-1; i>0; i--){

    var row = content[i],
        rowPrev = content[i-1];

    for(let k=0; k<columns; k++){

      row[k].free = rowPrev[k].free;
      row[k].connection = rowPrev[k].connection;


    }

  }

  for(let i=0; i<columns; i++){
    content[0][i].free = true;
    content[0][i].connection = null;
  }

}

Grid.translate = function(timer,pGrid,rectH,count){

  var grid = pGrid.content,
      rows  = pGrid.rows,
      columns = pGrid.columns,
      todo = rectH / count,
      rect;

  for(let i=1; i<rows; i++){ // dont move new bodies => i=1

    for(let k=0; k<columns; k++){

      rect = grid[i][k];

      if(!!rect.connection){
        if(rect.connection.label){

         if(i == rows-1){
             if(rect.connection.label !== "Square" && rect.connection.label !== "Triangle"){
                 continue;
             }
         }
          Square.translate(rect.connection, {x: 0, y: todo});

        }
      }
    }

  }

}

Grid.fadeIn = function(game,pGrid,timer,interval){

  var fadeInterval =  Timer.setInterval2(timer,interval,function(){

    for(let i in game.newSquares){
        Square.addAlpha(game.newSquares[i],1/interval);
    }

  },interval,function(){
      Game.Vars.clearNewSquares(game);
  });

}

Grid.isFree = function(grid,row,column){

  return grid.content[row][column].free;

}

Grid.setFree = function(grid,row,column,boolean){

  grid.content[row][column].free = boolean;

}

Grid.connect = function(grid,row,column,connection){

  grid.content[row][column].connection = connection;

}

Grid.disconnect = function(grid,row,column){
  grid.content[row][column].connection = undefined;

}

Grid.clear = function(grid){

    var content = grid.content,
        rows = grid.rows,
        columns = grid.columns;

    for(let i=0; i<rows; i++){

      for(let k=0; k<columns; k++){

        Grid.disconnect(grid,i,k);
        Grid.setFree(grid,i,k,true);

      }

    }


}



// CALCULATOR ------------------------
var Calculator = {};

Calculator.shootVelocity = function(angle,speed){

  var fullAngle = angle + Math.PI,
      x = -Math.cos(fullAngle) * speed,
      y = Math.sin(fullAngle) * speed;

  return {x: x, y: y};
}

Calculator.streakAngle = function(touch){

  var startX = touch.start.x,
      startY = touch.start.y,
      moveX = touch.move.x,
      moveY = touch.move.y,
      angle = Math.atan2( (startY-moveY),(moveX-startX) );

  return angle;
}

Calculator.angleConstraint = function(angle){

    var value = angle,
        constr = Math.PI * .02,
        l = Math.PI,
        r = 0;

    if(angle <= r + constr){
      value = r + constr ;
        if(angle <= r - constr)
          value = false;

    }else if(angle >= l - constr){
      value = l - constr;
        if(angle >= l + constr)
          value = false;
    }

    return value;
}

Calculator.convertToMilSec = function(time){
    return time.min*60*1000+time.sec*1000;
}

Calculator.convertToMinSec = function(milliseconds){

    var secs = Math.floor(milliseconds/1000),
        min = Math.floor(secs / 60),
        sec = secs % 60;



    return {min: min, sec: sec};
}

// BALL -----------------------
var Ball = {};


Ball.create = function(game,x,y,r){

  var body = Bodies.circle(x,y,r,{
      label: "Ball",
      density: 1,
      friction: 0,
      frictionAir: 0,
      restitution: 1,
      inertia : Infinity,
      render: {
        fillStyle: 'white',
        text: {
            fontSize: Math.round( r*1.5 ),
            content: null,
            isRotating: false,
            rotation: 0,
        }
      },
      collisionFilter : {
         group: -1
      },
      ready: true
  });

  Game.Vars.addBall(game,body);

  return body;

}

Ball.shoot = function(obj){


  Body.setVelocity(obj.ball, {x: obj.velocity.x, y: obj.velocity.y});
  Ball.setReady(obj.ball, false);

}

Ball.setReady = function(ball, boolean){

  ball.ready = boolean;
}

Ball.Text = {};

Ball.Text.rotate = function(body,rotation){
    body.render.text.rotation += rotation;
}

Ball.Text.setRotating = function(body,boolean){
    body.render.text.isRotating = boolean;
}

Ball.Text.setRotation = function(body,rotation){
    body.render.text.rotation = rotation;
}



Ball.translateToPoint = function(body,point,speed){

    Body.translate(body,{
        x: (point.x - body.position.x) * speed,
        y: (point.y - body.position.y) * speed,
    });
}

Ball.setMask = function(body,mask){
    body.collisionFilter.mask = mask;
}

// BALLS --------------------
var Balls = {};



Balls.shoot = function(game,bodies,timer,speed){

  var interval = 80,
      index = 0,
      delay;

  var angle = Calculator.streakAngle({
    start: Touch.vars.start,
    move: Touch.vars.move,
  });

  var angle = Calculator.angleConstraint(angle);



  var velocity = Calculator.shootVelocity(angle,speed);

  for(let i=0; i<bodies.length; i++){

      index++;

      delay = interval*index;
      Game.Vars.addShootTimeout(game,
        Timer.setDelay(timer, delay, function(){
            Ball.shoot({
              ball: bodies[i],
              velocity: velocity
            });
            Ball.Text.setRotating(bodies[i],true);
         })
       );

  }

}


Balls.setVisible = function(bodies,boolean){
  for(let i in bodies){
    bodies[i].render.visible = boolean;
  }
}


Balls.translateToPoint = function(bodies,point,speed){
    for(let i=0; i<bodies.length; i++){
        Ball.translateToPoint(bodies[i],point,speed);
    }
}

Balls.setVelocity = function(bodies,velocity){
    for(let i=0; i<bodies.length; i++){
        Body.setVelocity(bodies[i],{
            x: velocity.x,
            y: velocity.y
        })
    }
}

Balls.setMask = function(bodies,mask){
    for(let i=0; i<bodies.length; i++){
        Ball.setMask(bodies[i],mask);
    }
}

// BALLS TEXT -------------------
Balls.Text = {};

Balls.Text.rotate = function(bodies,pRotation){


  var body,
      rotation = pRotation/180*Math.PI;

  for(let i=0; i<bodies.length; i++){

    body = bodies[i];

    if(body.label === "Ball" && body.render.text.isRotating){
      Ball.Text.rotate(body,rotation);
    }

  }

}

Balls.Text.setRotation = function(bodies,rotation){
  for(let i=0; i<bodies.length; i++){
      Ball.Text.setRotation(bodies[i],rotation);
  }
}

Balls.Text.setRotating = function(bodies,boolean){
  for(let i=0; i<bodies.length; i++){
      Ball.Text.setRotating(bodies[i],boolean);
  }
}

Balls.Text.setContent = function(bodies,content){

    for(let i in bodies){
      bodies[i].render.text.content = content;
    }
}


Balls.Text.set = function(bodies,emoji){

  var content = !!!emoji || emoji.index === 0 ? null : emoji.good;


  if(!!!content){
    Balls.setVisible(bodies,true);
  }else{
    Balls.setVisible(bodies,false);
  }
  Balls.Text.setContent(bodies,content);
}

// SQUARE -------------------
var Square =  {};

Square.create = function(game,x,y,width,height){



    var body = Bodies.rectangle(x,y,width,height,{
          label: "Square",
          isStatic: true,
          width: width,
          height: height,
          render: {
              visible: true,
              fillStyle: "green",
              text: {
                  content: "",
                  color: "black",
                  fontSize: width/3,
                  family: "Arial",
              },
          },
          collisionFilter: {
              group: 3,
              mask: 0x0001
          },
          points: null,
    });

    Game.Vars.addSquare(game,body);

    return body;
}

Square.setPosition = function(square,vector){

  Body.setPosition(square, vector);

}

Square.remove = function(game,body){

    Game.Vars.addRemovedSquare(game,body);
    Body.setPosition(body,{
        x: -100,
        y: -100
    });
    body.isSleeping = true;

}


Square.removed = function(body){
    return body.isSleeping;
}

Square.hit = function(game,body){

  Audio.play(audios,"bubble");

  body.points--;

  if(body.points == 0){

    Square.Dust.initialize(body,game);

    Square.remove(game,body);

    if(Game.won(game))
      Game.Events.trigger("win",game,{});
  }else{
    Square.update(body);
  }

}

Square.update = function(body){

    body.render.fillStyle = Square.getColor(body.points);
    body.render.text.content = body.points;
}

Square.getColor = function(points){
    return "hsl("+points*8+",80%,50%)";
}


Square.addAlpha = function(body,alpha){

    body.render.opacity += alpha;
}

Square.setAlpha = function(body,alpha){
    body.render.opacity = alpha;
}


Square.translate = function(body,translation){

  Body.translate(body, {x: translation.x, y: translation.y});


}


// DUST ------------------------------
Square.Dust = {};

Square.Dust.initialize = function(body,game){

    var width = game.square.width,
        height = game.square.height,
        position,
        velocity,
        dust = [10]; // counter

    for(let i=0; i<40; i++){

        position = {
            x: body.position.x + Common.randomNumber(-width/5, width/5,true),
            y: body.position.y + Common.randomNumber(-height/5, height/5, true)
        }

        velocity = {
            x: Common.randomNumber(-width/5,width/5,true),
            y: Common.randomNumber(-height/5,height/5,true)
        }

        dust.push({
            position: position,
            velocity: velocity
        });


    }

    Game.Vars.addSquareDust(game,dust);
}

Square.Dust.run = function(dust,game,context){

    Square.Dust.tick(dust,game);
    Square.Dust.render(dust,game,context);

}

Square.Dust.tick = function(dust,game){


    for(let i=0; i<dust.length; i++){

      for(let k=1; k<dust[i].length; k++){

          dust[i][k].position.x += dust[i][k].velocity.x;
          dust[i][k].position.y += dust[i][k].velocity.y;





      }
      dust[i][0]--;
      if(dust[i][0] === 0){
        dust.splice(i,1);

      }
    }


}

Square.Dust.render = function(dust,game,context){

    var c = context,
        width = Math.round( game.square.width/5 ),
        height = Math.round( game.square.height/5 );



    for(let i=0; i<dust.length; i++){
      c.fillStyle = "rgba(230,25,25,"+dust[i][0]/10+")";
      for(let k=1; k<dust[i].length; k++){

        c.fillRect(dust[i][k].position.x, dust[i][k].position.y, width, height);

      }

    }
}


// SQUARES --------------------------
var Squares = {};


Squares.outsource = function(game){

    var grid = game.grid.content,
        rows = game.grid.rows-1,
        columns = game.grid.columns,
        row,
        rect;

    for(let i=0; i<rows; i++){

      row = grid[i];

      for(let k=0; k<rows; k++){

        rect = row[k];

        if(!!rect.connection){
          if(Square.removed(rect.connection)){
          Grid.disconnect(game.grid,i,k);
         }
        }
      }

    }


}

Squares.update = function(bodies){

    for(let i=0; i<bodies.length; i++){

        Square.update(bodies[i]);
    }
}

Squares.setAlpha = function(bodies,alpha){
    for(let i in bodies)
      Square.setAlpha(bodies[0],alpha);
}

// TRIANGLE -------------------------
var Triangle = {};

Triangle.create = function(game,x,y,width,height,index){

    // clockwise points
    var one = {x: 0, y:0},
        two = {x: width, y: 0},
        three = {x: width, y: height},
        four = {x: 0, y: height},
        diffX = 0.36*width,
        diffY = 0.36*height,
        length = width /12,
        offset,
        vertices;

    switch(index){

        case 1:
            vertices = [one,two,
            {x: two.x, y: two.y + length},
            {x: four.x + length, y: four.y},
            four];
            offset = {
                x: -diffX + width/2,
                y: -diffY + height/2
            }
          break;
        case 2:
            vertices = [two,three,
            {x: three.x - length, y: three.y},
            {x: one.x, y: one.y + length},
            one];
            offset = {
                x: diffX - width/2,
                y: -diffY + height/2
            }
          break;
        case 3:
            vertices = [three,four,
            {x: four.x, y: four.y - length},
            {x: two.x - length, y: two.y},
            two];
            offset = {
                x: diffX - width/2,
                y: diffY - height/2
            }
          break;
        case 4:
            vertices = [four,one,
            {x: one.x + length, y: one.y},
            {x: three.x, y: three.y - length},
            three];
            offset = {
                x: -diffX + width/2,
                y: diffY - height/2
            }
          break;
    }

    var body = Bodies.fromVertices(x,y,vertices,{
        label: "Triangle",
        isStatic : true,
        index: index,
        center: null,
        render: {
           fillStyle: "rgba(200,1,50,.6)",
            text: {
                content: "",
                color: "black",
                fontSize: width/3,
                family: "Bai Jamjuree",
            }
        },
        collisionFilter: {
            group: 3,
            mask: 0x0001
        },
        points: null,
    });




    Game.Vars.addSquare(game,body);

    body.center = offset;


    body.position.x += offset.x;
    body.position.y += offset.y;
    body.positionPrev.x += offset.x;
    body.positionPrev.y += offset.y;



    return body;
}



// GEM -----------------------
var Gem = {};

Gem.create = function(game,x,y,r){

  var body = Bodies.circle(x,y,r,{
      label: "Gem",
      isStatic: true,
      render: {
        visible: false,
        fillStyle: 'white',
        text: {
          visible: true,
          content: "\u{1F48E}",
          fontSize: r*1.5
        }
      },
      collisionFilter : {
         group: 4,
         mask: 0x0001
      },
  });



  Game.Vars.addGem(game,body);

  return body;
}

Gem.remove = function(game,body){


    Body.setPosition(body,{
        x: -100,
        y: -100
    });
    body.isSleeping = true;
}





Gem.outsource = function(game,body){

  Gem.fadeOut(body,game);
//  var visible = body.render.text.visible;

//  Timer.setInterval2(game.timer,50,function(){
//    body.render.text.visible = !body.render.text.visible;
//  },4,function(){
//    Gem.remove(game,body);
//  });

}

Gem.translateToPoint = function(body,point,speed){

    Body.translate(body,{
        x: (point.x - body.position.x) * speed,
        y: (point.y - body.position.y) * speed,
    });
}

Gem.setOpacity = function(body, opacity){
    body.render.opacity = opacity;
}

Gem.fadeOut = function(body,game){

    var radius = body.circleRadius*1.5,
        speed = .1,
        point = {
            x: body.position.x,
            y: body.position.y - radius
        },
        ticks = Math.round( (body.position.y-point.y) / speed )/6,
        opacity = 1;

    body.collisionFilter.mask = 0x0016;

    Timer.setInterval2(game.timer,20,function(){
      Gem.setOpacity(body,opacity-=1/ticks)
      Gem.translateToPoint(body,point,speed);
    },ticks,function(){
      Gem.remove(game,body);
    });

}
// GEMS -----------------------------
var Gems = {};
Gems.outsource = function(game){

    var grid = game.grid.content,
        rows = game.grid.rows-1,
        columns = game.grid.columns,
        rect;

      for(let k=0; k<columns; k++){

        rect = grid[rows][k];

        if(!!rect.connection){
          if(rect.connection.label === "Gem"){
            Gem.outsource(game,rect.connection);
            Grid.disconnect(game.grid,rows,k);
          }
        }
      }
}


// SPREADER ---------------------
var Spreader = {};

Spreader.create = function(game,x,y,r,diffusion,angle){

    var body = Bodies.circle(x,y,r,{
      label: "Spreader",

      diffusion: diffusion,
      diffusionAngle: angle || 8,
      direction: true,

      isStatic: true,
      render: {
        visible: false,
        fillStyle: 'white',
        strokeStyle: "lightblue",
        strokeVisible: true,
      },
      collisionFilter : {
         group: 5,
         mask: 0x0001
      },
  });

  Game.Vars.addSpreader(game,body);

  return body;

}

Spreader.render = function(spreader,context){

    var c = context,
        x = spreader.position.x,
        y = spreader.position.y,
        r = spreader.circleRadius,
        strokeStyle = spreader.render.strokeStyle,
        diffusion = spreader.diffusion,
        visible = spreader.render.strokeVisible,
        opacity = spreader.render.opacity;

    if(!visible)
      return;

    if(opacity < 1)
      c.strokeStyle = "rgba(173,216,230,"+opacity+")";
    else
      c.strokeStyle = strokeStyle;

    c.beginPath();
    c.lineWidth = r*.3;
    c.arc(x,y,r,0,Math.PI*2);
    c.stroke();

    c.beginPath();
    c.lineWidth = r*.2;
    switch(diffusion){

      case "x":
          c.moveTo(x - r*.1, y);
          c.lineTo(x - r*.6, y);
          c.moveTo(x - r*.4, y - r*.3);
          c.lineTo(x - r*.6, y);
          c.lineTo(x - r*.4, y + r*.3);

          c.moveTo(x + r*.1, y);
          c.lineTo(x + r*.6, y);
          c.moveTo(x + r*.4, y - r*.3);
          c.lineTo(x + r*.6, y);
          c.lineTo(x + r*.4, y + r*.3);
        break;

      case "y":
          c.moveTo(x, y - r*.1);
          c.lineTo(x, y - r*.6);
          c.moveTo(x - r*.3, y - r*.4);
          c.lineTo(x, y - r*.6);
          c.lineTo(x + r*.3, y - r*.4);

          c.moveTo(x, y + r*.1);
          c.lineTo(x, y + r*.6);
          c.moveTo(x - r*.3, y + r*.4);
          c.lineTo(x, y + r*.6);
          c.lineTo(x + r*.3, y + r*.4);
        break;
      case "north":
          c.moveTo(x, y - r*.1);
          c.lineTo(x, y - r*.6);
          c.moveTo(x - r*.25, y - r*.4);
          c.lineTo(x, y - r*.6);
          c.lineTo(x + r*.25, y - r*.4);

          c.moveTo(x + r*.2, y);
          c.lineTo(x + r*.6, y - r*.3);
          c.moveTo(x + r*.3, y - r*.4);
          c.lineTo(x + r*.6, y - r*.3);
          c.lineTo(x + r*.6, y + r*.05);

          c.moveTo(x - r*.2, y);
          c.lineTo(x - r*.6, y - r*.3);
          c.moveTo(x - r*.3, y - r*.4);
          c.lineTo(x - r*.6, y - r*.3);
          c.lineTo(x - r*.6, y + r*.05);

        break;
    }
    c.stroke();
}

Spreader.spread = function(spreader,body,speed){

  var diffusion = spreader.diffusion,
      angle = spreader.diffusionAngle,
      direction = spreader.direction,
      randomAngle = Common.randomNumber(-angle/2,angle/2,true),
      mult = speed,
      velocity;

  switch(diffusion){

    case "x":
        velocity = direction ? Spreader.getVelocity(180 + randomAngle, mult) : Spreader.getVelocity(randomAngle, mult);
        spreader.direction = !spreader.direction;
      break;
    case "y":
        velocity = direction ? Spreader.getVelocity(90 + randomAngle, mult) : Spreader.getVelocity(270 + randomAngle, mult);
        spreader.direction = !spreader.direction;
      break;
    case "north":
        velocity = Spreader.getVelocity(270 + randomAngle, mult);
      break;

  }

  Body.setVelocity(body,velocity);

}

Spreader.getVelocity = function(angle,mult){

  return {
    x: Math.cos(angle/180*Math.PI) * mult,
    y: Math.sin(angle/180*Math.PI) * mult
  };

}

Spreader.remove = function(body){

    Body.setPosition(body,{
        x: -100,
        y: -100
    });
    body.isSleeping = true;
}

Spreader.outsource = function(game,body){

  Timer.setInterval2(game.timer,50,function(){
    body.render.strokeVisible = !body.render.strokeVisible;
  },4,function(){
    Spreader.remove(body);
  });

}

// SPREADERS ----------------------
var Spreaders = {};

Spreaders.render = function(bodies,context){

    for(let i in bodies){
        Spreader.render(bodies[i],context);
    }
}

Spreaders.outsource = function(game){

    var grid = game.grid.content,
        rows = game.grid.rows-1,
        columns = game.grid.columns,
        rect;

      for(let k=0; k<columns; k++){

        rect = grid[rows][k];

        if(!!rect.connection){
          if(rect.connection.label === "Spreader"){
            Spreader.outsource(game,rect.connection);
            Grid.disconnect(game.grid,rows,k);
          }
        }
      }
}

Spreaders.collisionEnd = function(game,collisions){

  var bodyA, // ball
      bodyB,
      active = Game.Vars.getIsActive(game),
      speed = game.ball.speed;

  for(let i=0; i<collisions.length; i++){
    bodyA = collisions[i].bodyA;
    bodyB = collisions[i].bodyB;

    if(!collisions[i].spreaded && active){
      Spreader.spread(bodyB,bodyA,speed);
      collisions[i].spreaded = true;
    }
    if(Detector.overlaps(bodyA,bodyB))
      continue;

    Ball.setMask(bodyA, 0x0001);

    collisions.splice(i,1);
    i--;
  }

}


// Detector ---------------------------
var Detector = {};

Detector.overlaps = function(bodyA,bodyB){

  var boundsA = bodyA.bounds,
      boundsB = bodyB.bounds;

  // check for raw collision (AABB)
    return(boundsA.min.x <= boundsB.max.x && boundsA.min.y <= boundsB.max.y &&
           boundsA.max.x >= boundsB.min.x && boundsA.max.y >= boundsB.min.y);

}

// BORDER ---------------------------
var Border = {};

Border.create = function(x,y,width,height,label){

    var body = Bodies.rectangle(x,y,width,height,{
      label: label,
      isStatic: true,
      width: width,
      height: height,
      render: {
          visible: true,
          fillStyle: "green"
      },
      collisionFilter: {
          group: 2,
          mask: 0x0001
      },
    });

    return body;
}



// BORDERS ----------------------------
var Borders = {};

Borders.addNew = function(game){

  var height = cHeight,
      width = cWidth,
      world = game.world,
      upperBorder = game.upperBorder,
      lowerBorder = cHeight-game.lowerBorder,
      thickness = width / 6,
      length = height * 1.2;

  var top = Border.create(width/2,-thickness/2+upperBorder,length,thickness,"Border");
  var left = Border.create(-thickness/2,height/2,thickness,length,"Border");
  var right = Border.create(width+thickness/2,height/2,thickness,length,"Border");
  var bottom = Border.create(width/2,height+thickness/2-lowerBorder,length,thickness,"Floor");


  World.add(world,top);
  World.add(world,left);
  World.add(world,right);
  World.add(world,bottom);

}





// TEXT ------------------------------
var Text = {};

Text.create = function(options){

  var text = {
    content: options.content || "content",
    fontSize: options.fontSize || 20,
    fontWeight: options.fontWeight || "400",
    font: options.font || "Bai Jamjuree",
    textAlign: options.textAlign || "center",
    textBaseline: options.textBaseline || "middle",
    fillStyle: options.fillStyle || "#fff",
    position: {x: options.position.x, y: options.position.y },
    rotation: options.rotation || 0
  }
  return text;
}

Text.render = function(text,ctx,options){

  var c = ctx;

  var options = !options ? { position: {} } : options;

  c.save();

  if(!options.position){
    c.translate(options.position.x, options.position.y);
  }else{
    c.translate(text.position.x, text.position.y);
  }
  c.rotate(text.rotation / 180 * Math.PI);
  c.beginPath();
  c.textAlign = text.textAlign;
  c.textBaseline = text.textBaseline;
  c.font = text.fontWeight+" "+text.fontSize+"px "+text.font;
  c.fillStyle = text.fillStyle;
  c.fillText(text.content,0,0);

  c.restore();

}


Text.changeContent = function(text,content){

    text.content = content;
}

Text.setPosition = function(text,position){
    text.position.x = position.x;
    text.position.y = position.y;
}



// SHOP -----------------------
var Shop = {};

Shop.create = function(pShop){
    let shop = pShop;

    shop.emoji.context = shop.emoji.canvas.getContext("2d");
    shop.iap.context = shop.iap.canvas.getContext("2d");

    return shop;
}

Shop.render = function(shop){


  var iap = shop.iap;
  shop.emoji.context.clearRect(0,0,cWidth,cHeight*3);
  shop.iap.context.clearRect(0,0,cWidth,cHeight);

  Shop.IAPs.render(shop);
  Shop.Emojis.render(shop);


  Shop.renderBalance(shop);

  for(let i=0; i<iap.text.length; i++)
    Text.render(iap.text[i],iap.context);

 for(let i=0; i<iap.buttons.length; i++)
    Button.render(iap.buttons[i],iap.context);


  Path.renderFilmCoil({
      position: {
          x: iap.buttons[1].position.x,
          y: iap.buttons[1].position.y
      },
      currency: shop.currency,
      width: iap.buttons[1].width*.25,
      height: iap.buttons[1].height*.8,
      fillStyle: "#2f2f2f",
      holeFillStyle: iap.buttons[1].render.background,  //"#fff"
  },iap.context);

  Path.renderBackArrow({
    position: {
        x: iap.buttons[0].position.x,
        y: iap.buttons[0].position.y
    },
    size: iap.buttons[0].height/2,
    fillStyle: "#ffffff"
  },iap.context);

}

Shop.renderBalance = function(shop){

  var context = shop.iap.context,
      text = shop.iap.text;

  Elements.clearArea({
      context: context,
      position: {
          x: text[1].position.x,
          y: text[1].position.y+text[1].fontSize/2
      },
      width: cWidth/2,
      height: cWidth*.1,
  });

  Text.render(text[1],context);
  Text.render(text[2],context);
}

Shop.settleBalance = function(shop, amount){

    shop.balance += amount;
    Storage.saveBalance(shop);
}

Shop.setBalance = function(shop, amount){
    shop.balance = amount;
}

// IN APP PURCHASE -----------------------
Shop.IAP = {};

Shop.IAP.add = function(shop, options){

    var iap = {
      price: options.price,
      good: options.good, // text-emoji
      amount: options.amount,
      index: options.index,
      callback: options.callback
    };

    Grid.connect(shop.iap.grid, Math.floor(iap.index/shop.iap.grid.columns),iap.index % shop.iap.grid.columns, iap);

    shop.iaps.push(iap);
}

Shop.IAP.render = function(shop,iap,ctx){

  var c = ctx,
      width = shop.iap.grid.rectWidth*.8,
      height = shop.iap.grid.rectHeight*.8,
      fontSize = width/6,
      s = 6, // sharpness of edges
      w = 2,
      h = 2;


    c.save();
    c.beginPath();
    c.translate(iap.position.x,iap.position.y);
    c.fillStyle = "black";
    c.moveTo(0,0-height/h);
    c.lineTo(0 + (width/w-width/s),-height/h);
    c.lineTo(0 + (width/w-width/s) + width/s, 0);
    c.lineTo(0 + (width/w-width/s), 0 + height/h);
    c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
    c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);
    c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
    c.lineTo(0,0-height/h);
    c.fill();

    c.closePath();
    c.restore();

    // price
    c.beginPath();
    c.textAlign = "center";
    c.textBaseline = "top";
    c.fillStyle = "orange";
    c.font = "400 "+ fontSize*1.2+ "px sans-serif";
    c.fillText(iap.price,iap.position.x, iap.position.y+height*0.1);
    c.fill();

    // good / amount
    c.beginPath();
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "white";
    c.font = "600 "+fontSize*1.06+ "px Bai Jamjuree";
    c.fillText(  " + "+ iap.amount+"    ", iap.position.x, iap.position.y-height*0.1);

    c.font = fontSize*.9+"px JoyPixels";
    c.fillText(iap.good, iap.position.x + width*.33, iap.position.y-height*0.1);

    //c.fill();
    //c.closePath();
}

Shop.IAP.definePosition = function(shop){

  var grid = shop.iap.grid,
      content = grid.content,
      rows = grid.rows,
      columns = grid.columns,
      index = 0,
      rect;

  for(let i=0; i<rows; i++){

    for(let k=0; k<columns; k++){

      rect = content[i][k];
      shop.iaps[index].position = {};
      shop.iaps[index].position.x = rect.midX;
      shop.iaps[index].position.y = rect.midY;
      index++;
      if(index >= shop.iaps.length){ return; }
    }

  }

}


Shop.IAP.clicked = function(pGrid,click,event){

  if(!!!click){
    return false;
  }

  var grid = pGrid.content,
      rect = grid[click.row][click.column],
      width = pGrid.rectWidth*.8,
      height = pGrid.rectHeight*.8,
      edgeX = rect.midX - width/2,
      edgeY = rect.midY - height/2,
      clickX = event.clientX,
      clickY = event.clientY;

  if(clickX >= edgeX && clickX <= edgeX + width &&
     clickY >= edgeY && clickY <= edgeY + height){
       return click.connection;
  }else{
      return false;
  }

}


// IAPS ------------------
Shop.IAPs = {};

Shop.IAPs.render = function(shop){

  var iaps = shop.iaps;

  for(let i=0; i<iaps.length; i++){

    Shop.IAP.render(shop,iaps[i],shop.iap.context);

  }

}



// EMOJI -------------------------
Shop.Emoji = {};

Shop.Emoji.add = function(shop, options){

    var box = {
      bought: false,
      price: options.price,
      good: options.good, // text-emoji
      index: options.index,
      selected: false,
      filter: options.filter || "none",
    };

    Grid.connect(shop.emoji.grid, Math.floor(box.index/shop.emoji.grid.columns),box.index % shop.emoji.grid.columns, box);

    shop.emojis.push(box);
}

Shop.Emoji.select = function(shop, emoji){

  var emojis = shop.emojis;
  if(!emoji.bought){ return; }

  for(let i=0; i<emojis.length; i++){
    emojis[i].selected = false;
  }
  emoji.selected = true;
  Storage.saveSelectedEmoji(shop);
}


Shop.Emoji.buy = function(shop,emoji){


  emoji.bought = true;

  Shop.settleBalance(shop,-emoji.price);
  Shop.Emoji.select(shop,emoji);
  Text.changeContent(shop.iap.text[1], shop.balance+"    ");
  Shop.renderBalance(shop);
  Storage.saveEmoji(shop,emoji);
}

Shop.Emoji.canBuy = function(balance,emoji){

  return(!emoji.bought && balance >= emoji.price);
}

Shop.Emoji.definePosition = function(shop){

  var grid = shop.emoji.grid,
      content = grid.content,
      rows = grid.rows,
      columns = grid.columns,
      index = 0,
      rect;

  for(let i=0; i<rows; i++){

    for(let k=0; k<columns; k++){

      rect = content[i][k];
      shop.emojis[index].position = {};
      shop.emojis[index].position.x = rect.midX;
      shop.emojis[index].position.y = rect.midY;
      index++;
      if(index >= shop.emojis.length){ return; }
    }

  }

}

Shop.Emoji.render = function(shop,emoji,ctx){

  var c = ctx,
      width = shop.emoji.grid.rectWidth*.8,
      height = shop.emoji.grid.rectHeight*.76,
      fontSize = width/3,
      s = 6,
      w = 2,
      h = 2;

  // background
  c.save();
  c.beginPath();
  c.translate(emoji.position.x,emoji.position.y);
  c.fillStyle = emoji.selected ? "#4f4f4f" : "#050505";
  c.moveTo(0,0-height/h);
  c.lineTo(0 + (width/w-width/s),-height/h);
  c.lineTo(0 + (width/w-width/s) + width/s, 0);
  c.lineTo(0 + (width/w-width/s), 0 + height/h);
  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);

  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
  c.lineTo(0,0-height/h);

  c.fill();

  c.closePath();
  c.restore();

  if(!emoji.bought){

    // draw lock
    Path.renderLock({
        position: {
            x: emoji.position.x,
            y: emoji.position.y-height/10
        },
        size: fontSize*.8,
        fillStyle: "#fff",
        holeFillStyle: "#000"
    },c);

    // draw price
    c.beginPath();
    c.font = fontSize*0.5+"px "+" Bai Jamjuree";
    c.fillStyle = "white";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(emoji.price, emoji.position.x-fontSize/5, emoji.position.y+height/4);
    c.fill();
    c.closePath();


    // draw gem / currency
    c.beginPath();
    c.font = fontSize*0.4+ "px "+" JoyPixels";
    c.fillStyle = "white";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(shop.currency, emoji.position.x+fontSize/2, emoji.position.y+height/4);
    c.fill();
    c.closePath();

  }else{

    // draw emoji
    if(emoji.index == 0){
      c.beginPath();
      c.fillStyle = "#fff";
      c.arc(emoji.position.x, emoji.position.y,fontSize/2,0,Math.PI*2);
      c.fill();

    }else{

    //  c.save();
      c.beginPath();
      c.font = fontSize+ "px "+" JoyPixels";
    //  c.filter = emoji.filter;
      c.fillStyle = "#000";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(emoji.good,emoji.position.x, emoji.position.y);
      c.fill();
      c.closePath();
    //  c.restore();
    }
  }

}

Shop.Emoji.renderArea = function(shop,options){

    var c = shop.emoji.context,
        emoji = options.emoji,
        width = cWidth/3,
        height = cWidth/3,
        x = emoji.position.x-width/2,
        y = emoji.position.y-height/2;

    c.clearRect(x,y,width,height);
    Shop.Emoji.render(shop,emoji,c);
}


Shop.Emoji.getSelectedEmoji = function(shop){

    var emojis = shop.emojis;

    for(let i=0; i<emojis.length; i++){
        if(emojis[i].selected){
            return emojis[i];
        }
    }
}

Shop.Emoji.setSelected = function(shop,emoji){
  shop.emoji.selected = emoji;
}

Shop.Emoji.clicked = function(pGrid,click,event){


  if(!!!click)
    return false;

  if(!!click && !click.connection)
    return false;


  var grid = pGrid.content,
      rect = grid[click.row][click.column],
      width = pGrid.rectWidth*.8,
      height = pGrid.rectHeight*.8,
      edgeX = rect.midX - width/2,
      edgeY = rect.midY - height/2,
      clickX = event.clientX,
      clickY = event.clientY;

  if(clickX >= edgeX && clickX <= edgeX + width &&
     clickY >= edgeY && clickY <= edgeY + height){
       return click.connection;
  }else{
      return false;
  }


}


Shop.Emoji.getImageData = function(shop){

  var c = shop.emoji.context,
      canvas = shop.emoji.canvas;

  shop.emoji.imageData = c.getImageData(0, 0, canvas.width,canvas.height);

}

Shop.Emoji.putImageData = function(shop){
    shop.emoji.context.putImageData(shop.emoji.imageData,0,0);
}


// EMOJIS -------------------------------
Shop.Emojis = {};

Shop.Emojis.render = function(shop){

  var emojis = shop.emojis;

  for(let i=0; i<emojis.length; i++){
    Shop.Emoji.render(shop,emojis[i],shop.emoji.context);
  }

}

// SHOP EVENTS ------------------------
Shop.Events = {};

Shop.Events.on = function(eventName,shop,callback){

  if(!!shop.events[eventName])
    shop.events[eventName].push(callback);
  else
    shop.events[eventName] = [];
    shop.events[eventName].push(callback);

}

// shop events, at least partly, triggered aT the bottom
Shop.Events.trigger = function(eventName,shop,eventObj){

  if(!shop.events[eventName]){
    return;
  }

  var eventObject = !eventObj ? {} : eventObj;
  var event = shop.events[eventName];

  // calls callbackfunctions related to that event
  for(let i=0; i<event.length; i++){
    event[i](eventObject);
  }

}








// LEVEL -----------------------
var Level = {};


Level.createContainer = function(){

    var levels = [];

    return levels;
}

Level.create = function(options){

    var level = {
        tilemap: options.tilemap,
        points: options.points,
        balls: options.balls,
        gridTranslation: options.gridTranslation,
        timeLimit: options.timeLimit,
        bestTime: options.bestTime,
        completed: false,
        locked: true,
        stars: null,
        gems: null
    }
    return level;
}

Level.clicked = function(pGrid,click,event){

  if(!!click && !click.connection){
      if(click.connection !== 0)
        return false;
  }

  var grid = pGrid.content,
      rect = grid[click.row][click.column],
      width = pGrid.rectWidth*.8,
      height = pGrid.rectHeight*.8,
      edgeX = rect.midX - width/2,
      edgeY = rect.midY - height/2,
      clickX = event.clientX,
      clickY = event.clientY;

  if(clickX >= edgeX && clickX <= edgeX + width &&
     clickY >= edgeY && clickY <= edgeY + height){
       return click.connection;
  }else{
      return false;
  }


}

Level.build = function(game){

    var grid = game.grid,
        level = game.currentLevel,
        body;



    for(let i=grid.columns-1; i>=0; i--)
      Level.buildRow(game,i);



    for(let i=0; i<level.balls; i++){
      body = Ball.create(game,0,0,game.ball.radius);

        Body.setPosition(body,{
            x: game.ball.initialX,
            y: game.ball.initialY
        });

        World.add(game.world,body);
    }

    Borders.addNew(game);

}

Level.buildRow = function(game,row){

    var grid = game.grid,
        content = grid.content,
        columns = grid.columns,
        level = game.currentLevel,
        tilemap = level.tilemap,
        index,
        body,
        rect,
        divisor;

    for(let i=tilemap.length; i>tilemap.length-columns; ){
      i--;

      index = tilemap[i];

      if(!!!index)
        continue;


        divisor = index > 10 ? Number((index).toString().split('').slice(0,1)) : 1;
        0

      index = divisor > 1 ?  Number((index).toString().split('').slice(1,2)) : Number((index).toString().split('').slice(0,1));


      if(level.completed && index === 6)
        continue;

      body = Level.chooseBody(game,index);
      rect = content[row][i%columns];

      Body.setPosition(body,{
          x: rect.midX,
          y: rect.midY
      });
      body.points = level.points/divisor;

      Grid.connect(grid,row,i%columns,body);
      Game.Vars.addNewSquare(game,body);
      Square.setAlpha(body,0);
      World.add(game.world,body);


    }


     game.currentLevel.tilemap.splice(tilemap.length-columns,columns);


}

Level.chooseBody = function(game,index){

    var width = game.square.width,
        height = game.square.height,
        radius = game.ball.radius*1.5;

    if(index >=1 && index <= 4){
        return Triangle.create(game,0,0,width,height,index);
    }

    switch(index){
        case 5:
            return Square.create(game,0,0,width,height);
        //  break;
        case 6:
            return Gem.create(game,0,0,radius);
        //  break;
        case 7:
            return Spreader.create(game,0,0,radius,"x");
        //  break;
        case 8:
            return Spreader.create(game,0,0,radius,"y");
        //  break;
        case 9:
            return Spreader.create(game,0,0,radius,"north",80);
        //  break;
    }
}


Level.play = function(level,game){

    Game.Events.trigger("init",game,{
        level: level
    });

}

Level.getLocked = function(level){
  return level.locked;
}

Level.convertTimeToMsec = function(time){
  return time.min * 1000 * 60 + time.sec * 1000;
}

Level.setCompleted = function(level,boolean){
    level.completed = boolean;
}

Level.setLocked = function(level,boolean){
    level.locked = boolean;
}

Level.setStars = function(level,stars){
    level.stars = stars;
}

Level.changedStars = function(level,stars){
    return level.stars < stars;
}

Level.set = function(level,game){

  var metrics = Game.getMetrics(game),
      stars = metrics.stars;

  Level.setCompleted(level,true);

  if(Level.changedStars(level,stars))
    Level.setStars(level,stars);

}

Level.getByIndex = function(container,index){
    return container[index];
}

Level.convertTilemap = function(level){

    var tilemapOld = level.tilemap[0].split(","),
        array = Array.from(tilemapOld),
        tilemapNew = [];

    for(let i=0; i<array.length; i++)
      tilemapNew[i] = Number(array[i]);



      level.tilemap = tilemapNew;


}

Level.getGems = function(level){

    var tilemap = level.tilemap,
        gems = 0;

    for(let i in tilemap){
        if(tilemap[i] === 6)
          gems++;
    }
    return gems;
}

// LEVELS --------------------
var Levels = {};

Levels.add = function(container,level){

    level.index = container.length;

    Level.convertTilemap(level);

    level.gems = Level.getGems(level);


    container.push(level);
}

Levels.set = function(levels,level,game,context){

    var nextLevel = levels[level.index+1];



    Level.set(level,game);
    Level.Map.renderLevel(level,context);

    if(!!nextLevel){
      Level.setLocked(nextLevel,false);
      Level.Map.renderLevel(nextLevel,context);
    }
    Storage.saveLevels(levels,!!nextLevel ? [level.index,nextLevel.index] : [level.index]);
}


// LEVEL MAP --------------------
Level.Map = {};

Level.Map.create = function(bar){

    var map = {
        events: []
    };




    map.div = Elements.div({
        width: "100vw",
        height: "99vh",
        position: {x: 0, y: "1vh"},
        zIndex: 8,
        scrollable: true
    });

    map.grid = Grid.create(0,0,cWidth,cWidth/4*26,26,4);



    map.topBar = bar;

    map.canvas = Elements.canvas({
        width: "100vw",
        height: map.grid.height+"px",
        position: {x: 0, y: 0},
        background: "#252525"
    });

    map.topBar.context = map.topBar.canvas.getContext("2d");

    map.context = map.canvas.getContext("2d");

    return map;

}

Level.Map.render = function(map){

    var c = map.context,
        grid = map.grid,
        columns = grid.columns,
        rows = grid.rows,
        width = grid.rectWidth*.8,
        height = grid.rectHeight*.8,
        counter = 0,
        level,
        rect;



    for(let i=rows-1; i>=0; i--){

      for(let k=0; k<columns; k++){
          if(counter >= map.levels.length){ break; }
          rect = i%2===1 ? grid.content[i][k] : grid.content[i][columns-1-k];
          rect.connection = counter;

          level = map.levels[counter];
          level.row = i;
          level.column = k;

          level.render = {
              position: {
                x: rect.midX,
                y: rect.midY
              },
              width: width,
              height: height
          };
          counter++;


          Level.Map.renderLevel(level,c);

      }

    }

    Level.Map.renderArrows(map);

}

Level.Map.renderLevel = function(level,ctx){

    var c = ctx,
        x = level.render.position.x,
        y = level.render.position.y,
        width = level.render.width,
        height = level.render.height,
        stars = level.stars,
        fillStyle = "#0f0f0f",
        w = 2,
        h = 2,
        s = 6;



     // background
  c.save();
  c.beginPath();
  c.translate(x,y);
  c.fillStyle = fillStyle;
  c.moveTo(0,0-height/h);
  c.lineTo(0 + (width/w-width/s),-height/h);
  c.lineTo(0 + (width/w-width/s) + width/s, 0);
  c.lineTo(0 + (width/w-width/s), 0 + height/h);
  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);

  c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
  c.lineTo(0,0-height/h);

  c.fill();

  c.closePath();
  c.restore();


  if(level.locked){
    Path.renderLock({
      position: {
        x: x,
        y: y
      },
      size: width/3,
      fillStyle: "orange",
      holeFillStyle: "black"
    },c);
  }else{

    // level number
    c.beginPath();
    c.fillStyle = "orange";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold "+width/4+"px Bai Jamjuree";
    c.fillText(level.index+1,x,y-height/4);

    if(level.completed){
      c.font = "bold "+width/8+"px Bai Jamjuree";
      c.fillStyle = "#00ff25";
      c.fillText("COMPLETED",x,y);
    }else{
      c.font = "bold "+width/8+"px Bai Jamjuree";
      c.fillStyle = "#00ff25";
      c.fillText("PLAY!",x,y);
    }
    if(!stars){
      stars = [];
      for(let i=0; i<3; i++){
        stars[i] = {gray: true};
      }
    }else {
      var length = stars;
      stars = [];
      for(let i=0; i<length; i++){
        stars.splice(i,0,{gray: false});
      }
      for(let i=0; i<3-length; i++){
        stars.unshift({gray: true});
      }
    }



    Star.renderGroup({
        stars: stars,
        fontSize: width/6,
        position: {
            x: x,
            y: y + height*.26
        },
        textAlign: "center",
        textBaseline: "middle",
        fillStyle: "#0f0f0f",
        gap: 1,
        background: fillStyle
    },c);

  }


}

Level.Map.renderBalance = function(map,shop){

    var context = map.topBar.context,
        text = map.topBar.text;

    Elements.clearArea({
      context: context,
      position: {
          x: text[1].position.x,
          y: text[1].position.y+text[1].fontSize/2
      },
      width: cWidth/2,
      height: cWidth*.1,
    });

    Text.changeContent(text[1],shop.balance+"    ");
    Text.render(text[1],context);
    Text.render(text[2],context);
}

Level.Map.renderTopBar = function(map,shop){

    var bar = map.topBar,
        c = bar.context,
        buttons = bar.buttons,
        text = bar.text;

    Level.Map.renderBalance(map,shop);

    for(let i in buttons)
      Button.render(buttons[i],c);

    for(let i in text)
      Text.render(text[i],c);


    Path.renderBackArrow({
      position: {
          x: buttons[0].position.x,
          y: buttons[0].position.y
      },
      size: buttons[0].height/2,
      fillStyle: "#ffffff"
    },c);

}


Level.Map.renderArrows = function(map){

    var c = map.context,
        grid = map.grid,
        rows = grid.rows,
        cols = grid.columns,
        rectH = grid.rectHeight,
        rectW = grid.rectWidth,
        content = grid.content,
        rect,
        direction,
        x,
        y,
        cond = rows-1 % 2 === 1 ? 1:0;


    for(let i=rows-1; i>0; i--){



      for(let k=0; k<cols; k++){

        direction = k == 0 ? "top" : i % 2 === cond ? "left" : "right";
        rect = direction !== "top" ? content[i][k] : i % 2 === cond ? content[i][k+(cols-1)] : content[i][k];

        x = direction === "top" ? rect.midX : rect.midX - rectW/2;
        y = direction === "top" ? rect.midY + rectH/2 : rect.midY;


        if(!!!rect.connection)
          continue;

        Path.renderArrow({
            position: {
                x: x,
                y: y
            },
            size: rectW / 10,
            fillStyle:"hsl(39,100%,40%)",
            direction: direction
        },c);

      }

    }

}

// LEVEL MAP EVENTS -----------------
Level.Map.Events = {};

Level.Map.Events.on = function(eventName,map,callback){

  if(!!map.events[eventName])
    map.events[eventName].push(callback);
  else
    map.events[eventName] = [];
    map.events[eventName].push(callback);

}


Level.Map.Events.trigger = function(eventName,map,eventObj){

  if(!map.events[eventName]){
    return;
  }

  var eventObject = !eventObj ? {} : eventObj;
  var event = map.events[eventName];


  for(let i=0; i<event.length; i++){
    event[i](eventObject);
  }

}



// LEVEL OVERVIEW MENU ---------------
Level.Preview = {};

Level.Preview.create = function(){

    var preview = {

        tilemap: [],
        grid: Grid.create(1,1,1,1,1,1),
        rim: Path.create({
            points: [{x: 0, y: 0}]
        }),
        elements: [
          Elements.canvas({
            width: "100vw",
            height: "100vh",
            position: {
              x: 0, y: 0
            },
            zIndex: 9,
            background: "transparent",
          }),
          Elements.canvas({
            width: "60vw",
            height: "100vh",
            position: {
              x: 0, y: 0
            },
            zIndex: 9,
            background: "transparent",
          }),
          Elements.div({
            width: "60vw",
            height: "80vw",
            position: {x: "20vw", y: (cHeight-cWidth*.8) / 2.4+"px"},
            zIndex: 10,
            scrollable: true
          })
        ],
        background: Menu.createBackground({
          position: {
            x: cWidth/2,
            y: cHeight/2
          },
          width: cWidth*.8,
          height: cWidth*1.2,
          fillStyle: "#1f1f1f",
          strokeStyle: "#00bfff",
          lineWidth: cWidth/80
        }),
        buttons: [
          Button.create({
            size: "large",
            position: {
              x: cWidth*.5,
              y: cWidth*1.2
            },
            width: cWidth*.4,
            height: cWidth*.08,
            render: {
              background: "#00bfff",
              text: {
                fontSize: cWidth*.14/2,
                content: "OK"
               }
             },
             callback: function(){
                App.Layers.show(app,"game");
                Grid.fadeIn(game,game.grid,game.timer,20);
             }
          }),
        ],
    }

    preview.context = preview.elements[0].getContext("2d");

    preview.scrollContext = preview.elements[1].getContext("2d");

    preview.elements[2].style.borderTop = "2px solid #00bfff";
    preview.elements[2].style.borderBottom = "2px solid #00bfff";

    return preview;
}



Level.Preview.modify = function(preview,game){

    preview.tilemap = game.currentLevel.tilemap.slice();

    var columns = game.grid.columns,
        rows = preview.tilemap.length / columns,
        width = cWidth*.6,
        height = width/columns*rows,
        x = 0,//(cWidth - width) / 2,
        y = 0;//cHeight*.5 - height/1.8;


    preview.grid = Grid.create(x, y, width, height, rows, columns);

    preview.rim = Path.create({
        points: [
          {x: x, y: y },
          {x: x + width, y: y},
          {x: x + width, y: y + height},
          {x: x, y: y + height}
        ],
        fillStyle: "#ffff00",
        strokeStyle: "#4dd2ff",
        fill: false, //true,
        lineWidth: cWidth/100,
        lineJoin: "miter",
        lineCap: "square",
        close: true
    });

    var scrollCanvas = preview.elements[1];

    scrollCanvas.style.height = preview.grid.height+"px";


     return Elements.display( preview.elements[2], "block").then(() => {
    Elements.display( scrollCanvas, "block");

  }).then(() => {
      Elements.setPixelRatio( scrollCanvas );
      preview.elements[2].scrollTop = 900;
  });





}

Level.Preview.build = function(preview){

    var tilemap = preview.tilemap,
        grid = preview.grid,
        x = grid.position.x,
        y = grid.position.y,
        width = grid.width,
        height = grid.height;

    for(let i=(tilemap.length / grid.columns )- 1; i>=0; i--)
      Level.Preview.buildRow(preview,i);





}





Level.Preview.buildRow = function(preview,row){

    var c = preview.scrollContext,
        grid = preview.grid,
        content = grid.content,
        columns = grid.columns,
        tilemap = preview.tilemap,
        index,
        body,
        rect,
        divisor;

    for(let i=tilemap.length; i>tilemap.length-columns; ){
      i--;

      index = tilemap[i];

      if(!!!index){
        if(index === 0)
          index = 0;
        else
          continue;
      }else{
        divisor = index > 10 ? Number((index).toString().split('').slice(0,1)) : 1;


        index = divisor > 1 ?  Number((index).toString().split('').slice(1,2)) : Number((index).toString().split('').slice(0,1));
      }






  //    if(index >= 6)
   //     continue;
      rect = content[row][i%columns];
       Level.Preview.applyBody(grid,rect,index,c);





      //Grid.connect(grid,row,i%columns,body);



    }


     preview.tilemap.splice(tilemap.length-columns,columns);



}

Level.Preview.applyBody = function(grid,rect,index,context){

    var x = rect.midX,
        y = rect.midY,
        width = grid.rectWidth*.9,
        height = grid.rectHeight*.9;

    if(index >= 1 && index <= 4){
        Path.renderTriangle(x, y, width, height, index-1, "#32cbff", context);
    }

    switch(index){
        case 5:
            Path.renderSquare(x, y, width, height, "#0098cc", context);
          break;
        case 6:
/*
            Path.renderGem({
              position: {
                x: x,
                y: y
              },
              size: width,
              fillStyle: "#bfff00",
            },context); */
          break;
        case 7:

            Spreader.render({
              position: {
                x: x,
                y: y
              },
              circleRadius: width/4,
              diffusion: "x",
              render: {
                strokeStyle: "#ff00bf",
                strokeVisible: true
              }
            },context);

          break;
        case 8:
            Spreader.render({
              position: {
                x: x,
                y: y
              },
              circleRadius: width/4,
              diffusion: "y",
              render: {
                strokeStyle: "#ff00bf",
                strokeVisible: true
              }
            },context);
          break;
        case 9:
            Spreader.render({
              position: {
                x: x,
                y: y
              },
              circleRadius: width/4,
              diffusion: "north",
              render: {
                strokeStyle: "#ff00bf",
                strokeVisible: true
              }
            },context);
          break;
    }


}


Level.Preview.render = function(preview,context){

    var c = context,
        tilemap = preview.tilemap,
        buttons = preview.buttons,
        background = preview.background,
        rim = preview.rim;

    Path.render(background,c);


    Button.render(buttons[0],c);

    Level.Preview.build(preview,game);

  //  Path.render(rim, c);
}


// BAR -----------------------------
var Bar = {};

Bar.create = function(options){

    var bar = {
        context: options.context || null,
        fillStyle: options.fillStyle || "pink",
        position: {
            x: options.position.x,
            y: options.position.y
        },
        width: options.width,
        height: options.height,
        text: options.text || [],
        buttons: options.buttons || []
    };

    return bar;
}

Bar.render = function(bar,context){

    var c = !bar.context ? context : bar.context;

    c.beginPath();
    c.fillStyle = bar.fillStyle;
    c.fillRect(bar.position.x,bar.position.y,bar.width,bar.height);

    if(bar.text){
      for(let i=0; i<bar.text.length;i++)
        Text.render(bar.text[i],c);
    }

    if(bar.buttons){
      for(let i in bar.buttons)
        Button.render(bar.buttons[i],c);
    }

}



// PATH --------------------------
var Path = {};

Path.create = function(options){

    var path = {
        points: options.points || [],
        fillStyle: options.fillStyle || "#fff",
        strokeStyle: options.strokeStyle || "#fff",
        fill: options.fill || false,
        lineWidth: options.lineWidth || 5,
        lineJoin: options.lineJoin || "round",
        lineCap: options.lineCap || "round",
        close: options.close || false
    }
    return path;

}

Path.render = function(path,ctx){

    var c = ctx,
        points = path.points,
        point;

    c.beginPath();
    c.moveTo(points[0].x,points[0].y)
    for(let i=1; i<points.length; i++){
        point = points[i];
        c.lineTo(point.x,point.y);
    }
    c.strokeStyle = path.strokeStyle;
    c.lineWidth = path.lineWidth;
    c.lineJoin = path.lineJoin;
    c.lineCap = path.lineCap;
    if(path.fill){
        c.fillStyle = path.fillStyle;
        c.fill();
    }
    if(path.close){
        c.closePath();
    }
    c.stroke();
    c.closePath();


}

Path.renderLock = function(options,context){

  var c = context,
      x = options.position.x,
      y = options.position.y,
      width = options.size*.8,
      height = options.size*1.2,
      fillStyle = options.fillStyle,
      holeFillStyle = options.holeFillStyle;


  c.fillStyle = fillStyle;

  // body
  c.beginPath();
  c.moveTo(x - width/2,y);
  c.lineTo(x - width/2, y + height/2);
  c.lineTo(x + width/2, y + height/2);
  c.lineTo(x + width/2, y);
  c.closePath();
  c.fill();


  var w = width * .06,
      wOut = width * .16;
  // key hole
  c.beginPath();
  c.moveTo(x - w, y + height*.1);
  c.lineTo(x - wOut, y + height*.175);
  c.lineTo(x - w, y + height*.25);
  c.lineTo(x - w, y + height*.4);
  c.lineTo(x + w, y + height*.4);
  c.lineTo(x + w, y + height*.25);
  c.lineTo(x + wOut, y + height*.175);
  c.lineTo(x + w, y + height*.1);
  c.closePath();
  c.fillStyle = holeFillStyle;
  c.fill();

  var rim = {w: width*.38, h: height*.4};
  // head
  c.beginPath();
  c.moveTo(x - rim.w, y);
  c.lineTo(x - rim.w, y - rim.h);
  c.lineTo(x + rim.w, y - rim.h);
  c.lineTo(x + rim.w, y);
  c.strokeStyle = fillStyle;
  c.lineWidth = width*.06;
  c.stroke();



}

Path.renderHomeSymbol = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        width = options.size*.8,
        height = options.size*1.2,
        fillStyle = options.fillStyle,
        strokeStyle = options.strokeStyle,
        lineWidth = options.size/20,
        gap = height*.05,
        doorW = width *.1,
        doorH = height*.2;

    // roof
    c.beginPath();
    c.moveTo(x-width/2,y-gap);
    c.lineTo(x+width/2,y-gap);
    c.lineTo(x,y-height*.5-gap);
    c.closePath();
    c.fillStyle = fillStyle;
    c.fill();

    // body
    c.beginPath();
    c.moveTo(x-width/2,y);
    c.lineTo(x+width/2,y);
    c.lineTo(x+width/2,y+height/2);
    c.lineTo(x-width/2,y+height/2);
    c.closePath();
    c.fill();

    // door
    c.beginPath();
    c.moveTo(x-doorW,y+height/2);
    c.lineTo(x-doorW,y+height/2-doorH);
    c.lineTo(x+doorW,y+height/2-doorH);
    c.lineTo(x+doorW,y+height/2);
    c.strokeStyle = strokeStyle;
    c.lineWidth = lineWidth;
    c.stroke();


}

Path.renderBackground = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        width = options.width,
        height = options.height,
        fillStyle = options.fillStyle,
        stroke = options.stroke,
        size = options.size,
        w = 2,
        h = 2,
        s;

    switch(size){

        case "small":
            s = 6;
          break;
        case "large":
            s = 8;
          break;
    }


    c.save();
c.beginPath();
c.translate(x,y)

c.fillStyle = fillStyle;
c.moveTo(0,0-height/h);
c.lineTo(0 + (width/w-width/s),-height/h);
c.lineTo(0 + (width/w-width/s) + width/s, 0);
c.lineTo(0 + (width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
c.lineTo(0,0-height/h);

c.fill();

if(stroke){
    c.strokeStyle = stroke.style;
    c.lineWidth = stroke.lineWidth;
    c.stroke();
}

c.restore();

}

Path.renderPlaySymbol = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        width = options.size*.8,
        height = options.size,
        fillStyle = options.fillStyle;

    c.beginPath();
    c.moveTo(x-width/2,y-height/2);
    c.lineTo(x+width/2,y);
    c.lineTo(x-width/2,y+height/2);
    c.closePath();
    c.fillStyle = fillStyle;
    c.fill();
}


Path.renderSpeaker = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        size = options.size,
        width = size,
        height = size,
        status = options.status,
        fillStyle = options.fillStyle,
        speaker = {
            x: x-width/4-width*.1,
            y: y,
            width: width/2,
            height: height*.6
        },
        sign = {
            x: x+ width/4 + width*.1,
            y: y,
            width: width/2,
            height: height/2
        };

    var sp = speaker,
        si = sign;

    // speaker
    c.beginPath();
    c.moveTo(sp.x+sp.width/2, sp.y+sp.height);
    c.lineTo(sp.x+sp.width/2, sp.y-sp.height);
    c.lineTo(sp.x-sp.width*.3, sp.y-sp.height*.4);
    c.lineTo(sp.x-sp.width*.7, sp.y-sp.height*.4);
    c.lineTo(sp.x-sp.width*.7, sp.y+sp.height*.4);
    c.lineTo(sp.x-sp.width*.3, sp.y+sp.height*.4);
    c.closePath();
    c.fillStyle = fillStyle;
    c.fill();


    // sign
    switch(status){

      case "on":

          c.beginPath();
          c.moveTo(si.x-si.width*.5, si.y-si.height*.3);
          c.lineTo(si.x-si.width*.4, si.y-si.height*.2);
          c.lineTo(si.x-si.width*.4, si.y+si.height*.2);
          c.lineTo(si.x-si.width*.5, si.y+si.height*.3);

          c.moveTo(si.x-si.width*.25, si.y-si.height*.6);
          c.lineTo(si.x-si.width*.05, si.y-si.height*.4);
          c.lineTo(si.x-si.width*.05, si.y+si.height*.4);
          c.lineTo(si.x-si.width*.25, si.y+si.height*.6);

          c.moveTo(si.x-si.width*.0, si.y-si.height*.9);
          c.lineTo(si.x+si.width*.3, si.y-si.height*.6);
          c.lineTo(si.x+si.width*.3, si.y+si.height*.6);
          c.lineTo(si.x-si.width*.0, si.y+si.height*.9);

        break;
      case "off":

        c.beginPath();
        c.moveTo(si.x-si.width/2, si.y-si.height/2);
        c.lineTo(si.x+si.width/2, si.y+si.height/2);

        c.moveTo(si.x+si.width/2, si.y-si.height/2);
        c.lineTo(si.x-si.width/2, si.y+si.height/2);

      break;

    }

    c.strokeStyle = fillStyle;
    c.lineWidth = size/10;
    c.lineCap = "square";
    c.stroke();

}

Path.renderShareSymbol = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        size = options.size,
        width = size,
        height = size*1.1,
        fillStyle = options.fillStyle,
        one = {
            x: x + width/2,
            y: y - height/2
        },
        two = {
            x: x - width/2,
            y: y
        },
        three = {
            x: x + width/2,
            y: y + height/2
        },
        r = size/4,
        PI = Math.PI;

    c.fillStyle = fillStyle;
    c.beginPath();
    c.arc(one.x, one.y, r, 0, PI*2);
    c.fill();
    c.beginPath();
    c.arc(two.x, two.y, r, 0, PI*2);
    c.fill();
    c.beginPath();
    c.arc(three.x, three.y, r, 0, PI*2);
    c.fill();




    c.beginPath();
    c.moveTo(one.x, one.y);
    c.lineTo(two.x, two.y);
    c.lineTo(three.x, three.y);
    c.strokeStyle = fillStyle;
    c.lineWidth = size/5;
    c.stroke();

}

Path.renderShoppingCart = function(options,context){

  var c = context,
      x = options.position.x,
      y = options.position.y,
      size = options.size,
      width = size* 1.2,
      height = size* 1,
      strokeStyle = options.fillStyle,
      radius = size*.1,
      lineWidth = size*.1;

  c.fillStyle = strokeStyle;
  c.strokeStyle = strokeStyle;
  c.lineWidth = lineWidth;
  c.beginPath();

  c.arc(x - width*.24, y + height*.45 + radius*1.4, radius, 0 ,Math.PI*2);
  c.fill();

  c.beginPath();
  c.arc(x + width*.4 - radius, y + height*.45 + radius*1.4, radius, 0 ,Math.PI*2);
  c.fill();

  c.beginPath();
  c.moveTo(x - width*.4, y + height*.45);

  // bottom
  c.lineTo(x + width*.4, y + height*.45);
  c.lineTo(x + width*.3, y + height*.2);
  c.stroke();

  //body
  c.save();
  c.beginPath();
  c.moveTo(x + width*.3, y + height*.2)
  c.lineTo(x + width*.4, y - height*.4);
  c.lineTo(x - width/2, y - height*.38);
  c.lineTo(x - width*.4, y + height*.14);
  c.lineTo(x + width*.3, y + height*.2);
  c.lineTo(x + width*.4, y - height*.4);
  c.stroke();
//  c.fill();
  c.clip();
  c.beginPath();

  c.lineWidth = lineWidth/1.8;
  for(let i=0; i<10; i++){
      c.beginPath();
      c.moveTo(x-width/2+width*i/6, y-height);
      c.lineTo(x-width/2+width*i/8, y+height);

      c.stroke();
  }
  for(let i=0; i<10; i++){
      c.beginPath();
      c.moveTo(x-width, y-height/1.8+height/6*i);
      c.lineTo(x+width, y-height/2+height/6*i);

      c.stroke();
  }

  c.beginPath();
  c.restore();

  // handlebar
  c.moveTo(x + width*.4, y - height*.4);
  c.lineTo(x + width*.4, y - height*.48);
  c.lineTo(x + width*.6, y - height*.55);
  c.stroke();



}

Path.renderFilmCoil = function(options,context){

    var c = context,
        width = options.width,
        height = options.height,
        currency = options.currency,
        x = options.position.x - width/2,
        y = options.position.y,
        fillStyle = options.fillStyle,
        holeFillStyle = options.holeFillStyle,
        holeH = height*.1,
        holeW = width*.04,
        gap = holeW*1.5,
        distance = holeW + gap;

    c.beginPath();
    c.fillStyle = fillStyle;
    c.fillRect(x - width/2, y - height/2, width, height);

    c.fillStyle = holeFillStyle;

    for(let i=0; i<width/distance; i++){
      c.fillRect(x - width/2.1 + distance*i, y - height/2 + holeH*.6,holeW,holeH);
    }

    for(let i=0; i<width/distance; i++){
      c.fillRect(x - width/2.1 + distance*i, y + height/2 - holeH*1.4, holeW, holeH);
    }

    Path.renderPlaySymbol({
        position: {
          x: x-width*.28,
          y: y
        },
        fillStyle: "#fff",
        size: height*.5
    },context);

    c.font = "bold "+height*.5+"px Bai Jamjuree";

    c.textBaseline = "middle";
    c.fillText("+20    ", x+width*.16, y);

    c.font = height*.4+"px JoyPixels";
    c.fillText(currency, x+width*.36, y);

    c.textAlign = "left";
    c.font = "bold "+height*.5+"px Bai Jamjuree";
    c.fillText("watch a", x+width/1.8, y-height*.2);

    c.fillText("video", x+width/1.8, y+height*.2);

}


Path.renderStar = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        size = options.size,
        fillStyle = options.fillStyle,
        background = options.background,
        startAngle = Math.PI*1.5,
        angle = Math.PI/5,
        radius = size,
        sin = Math.sin(startAngle),
        cos = Math.cos(startAngle);

    if(!!background){
      Elements.renderArea({
        position: {
          x: x,
          y: y
        },
        width: size*2.4,
        height: size*2.4,
        fillStyle: background,
        context: c
      });
    }

    c.fillStyle = fillStyle;
    c.beginPath();
    c.moveTo(x+cos*radius,y+sin*radius);
    for(let i=1; i<10; i++){



      sin = Math.sin(startAngle+angle*i);
      cos = Math.cos(startAngle+angle*i);
      radius = i%2 === 1 ? size*.4 : size;


      c.lineTo(x+cos*radius, y+sin*radius);

    }
    c.closePath();
    c.fill();

}

Path.renderBackArrow = function(options,context){

    var c = context,
        size = options.size,
        fillStyle = options.fillStyle,
        x = options.position.x,
        y = options.position.y;

    c.beginPath();
    c.strokeStyle = fillStyle;
    c.lineWidth = size/8;
    c.moveTo(x + size/4,y - size/2);
    c.lineTo(x - size/4, y);
    c.lineTo(x + size/4,y + size/2);
    c.stroke();
}


Path.renderSquare = function(x,y,width,height,color,context){

    var c = context;

    c.fillStyle = color;
    c.fillRect(x-width/2, y- height/2, width,height);
}

Path.renderTriangle = function(x,y,width,height,edge,color,context){

    var c = context,
        edges = [
          [{x: x-width/2, y: y-height/2},
           {x: x+width/2, y: y-height/2},
           {x: x-width/2, y: y+height/2}
          ],
          [{x: x+width/2, y: y-height/2},
           {x: x+width/2, y: y+height/2},
           {x: x-width/2, y: y-height/2}
          ],
          [{x: x+width/2, y: y+height/2},
           {x: x-width/2, y: y+height/2},
           {x: x+width/2, y: y-height/2}
          ],
          [{x: x-width/2, y: y+height/2},
           {x: x-width/2, y: y-height/2},
           {x: x+width/2, y: y+height/2},
          ]
        ];

    var tri = edges[edge];

    c.fillStyle = color;
    c.beginPath();
    c.moveTo(tri[0].x, tri[0].y);
    c.lineTo(tri[1].x, tri[1].y);
    c.lineTo(tri[2].x, tri[2].y);
    c.closePath();
    c.fill();
}

Path.renderLogoBall = function(x,y,radius,color,context){

    var c = context,
        length = radius,
        stroke = [
          {x: x+radius*1.2, y: y-radius*.5},
          {x: x+radius*1.5, y: y},
          {x: x+radius*1.2, y: y+radius*.5},
        ];


    // ball
    c.beginPath();
    c.fillStyle = "#66cc00";//color;
    c.strokeStyle = color;
    c.arc(x,y,radius,0,Math.PI*2);
    c.fill();


    // lines
    c.strokeStyle = "#5bb700";
    c.beginPath();
    c.moveTo(stroke[0].x,stroke[0].y);
    c.lineTo(stroke[0].x + length, stroke[0].y);
    c.closePath();
    c.stroke();

    c.strokeStyle = "#51a300";
    c.beginPath();
    c.moveTo(stroke[1].x,stroke[1].y);
    c.lineTo(stroke[1].x + length, stroke[1].y);
    c.closePath();
    c.stroke();

    c.strokeStyle = "#5bb700";
    c.beginPath();
    c.moveTo(stroke[2].x,stroke[2].y);
    c.lineTo(stroke[2].x + length, stroke[2].y);
    c.closePath();
    c.stroke();

}



Path.renderLogo = function(options,context){

      var c = context,
          x = options.position.x,
          y = options.position.y,
          size = options.size,//rect's size
          cols = 19,
          rows = 3,
          rectWidth = size,
          rectHeight = size,
          width = rectWidth * cols,
          height = rectHeight * rows,
          sWidth = rectWidth*.9,
          sHeight = rectHeight*.9,
          row = [],
          col = [];

      for(let i=0; i<rows; i++)
        row[i] = y-height/2+rectHeight*i+rectHeight/2;

      for(let i=0; i<cols; i++)
        col[i] = x-width/2+rectWidth*i+rectWidth/2;

  /*
      "#00e5e5"
      "#cc0000"
      "#cd00cd"
      "hsl(90,100%,35%)"
      "hsl(220,90%,50%)"
      "green"
      "#cc0000"
  */

      /*
      // B
  Path.renderTriangle(col[2], row[2], sWidth,sHeight,0,"#27ff00",c);

  Path.renderSquare(col[0], row[0], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[0], row[1], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[0], row[2], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[1], row[0], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[1], row[1], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[1], row[2], sWidth,sHeight,"#27ff00",c);
  Path.renderSquare(col[2], row[1], sWidth,sHeight,"#27ff00",c);

  // A
  Path.renderTriangle(col[4], row[0], sWidth,sHeight,2,"#00a7ff",c);
  Path.renderTriangle(col[5], row[1], sWidth,sHeight,3,"#00a7ff",c);
  Path.renderTriangle(col[6], row[0], sWidth,sHeight,3,"#00a7ff",c);

  Path.renderSquare(col[4], row[1], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[4], row[2], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[5], row[0], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[6], row[1], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[6], row[2], sWidth,sHeight,"#00a7ff",c);


  // L
  Path.renderSquare(col[8], row[0], sWidth,sHeight,"#d800ff",c);
  Path.renderSquare(col[8], row[1], sWidth,sHeight,"#d800ff",c);
  Path.renderSquare(col[8], row[2], sWidth,sHeight,"#d800ff",c);
  Path.renderSquare(col[9], row[2], sWidth,sHeight,"#d800ff",c);

  // L
  Path.renderSquare(col[11], row[0], sWidth,sHeight,"#ff5800",c);
  Path.renderSquare(col[11], row[1], sWidth,sHeight,"#ff5800",c);
  Path.renderSquare(col[11], row[2], sWidth,sHeight,"#ff5800",c);
  Path.renderSquare(col[12], row[2], sWidth,sHeight,"#ff5800",c);

  // S
  Path.renderTriangle(col[14], row[0], sWidth,sHeight,2,"#00a7ff",c);
  Path.renderTriangle(col[14], row[1], sWidth,sHeight,1,"#00a7ff",c);
  Path.renderTriangle(col[14], row[2], sWidth,sHeight,1,"#00a7ff",c);
  Path.renderTriangle(col[16], row[0], sWidth,sHeight,0,"#00a7ff",c);
  Path.renderTriangle(col[16], row[1], sWidth,sHeight,3,"#00a7ff",c);
  Path.renderTriangle(col[16], row[2], sWidth,sHeight,0,"#00a7ff",c);

  Path.renderSquare(col[15], row[0], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[15], row[1], sWidth,sHeight,"#00a7ff",c);
  Path.renderSquare(col[15], row[2], sWidth,sHeight,"#00a7ff",c);

  // :
  Path.renderSquare(col[18], row[0], sWidth,sHeight,"#d800ff",c);
  Path.renderSquare(col[18], row[2], sWidth,sHeight,"#d800ff",c);

      */
      // I
      Path.renderSquare(col[0], row[0], sWidth,sHeight,"#eb2c14",c);
      Path.renderSquare(col[0], row[1], sWidth,sHeight,"#eb2c14",c);
      Path.renderSquare(col[0], row[2], sWidth,sHeight,"#eb2c14",c);

      // N
      Path.renderTriangle(col[2], row[0], sWidth,sHeight,3,"#0085ff",c);
      Path.renderTriangle(col[3], row[1], sWidth,sHeight,1,"#0085ff",c);
      Path.renderTriangle(col[4], row[2], sWidth,sHeight,1,"#0085ff",c);

      Path.renderSquare(col[2], row[1], sWidth,sHeight,"#0085ff",c);
      Path.renderSquare(col[2], row[2], sWidth,sHeight,"#0085ff",c);
      Path.renderSquare(col[4], row[0], sWidth,sHeight,"#0085ff",c);
      Path.renderSquare(col[4], row[1], sWidth,sHeight,"#0085ff",c);


      // T
      Path.renderSquare(col[0+7], row[4-4], sWidth,sHeight,"#d800ff",c);
      Path.renderSquare(col[1+7], row[4-4], sWidth,sHeight,"#d800ff",c);
      Path.renderSquare(col[2+7], row[4-4], sWidth,sHeight,"#d800ff",c);
      Path.renderSquare(col[1+7], row[5-4], sWidth,sHeight,"#d800ff",c);
      Path.renderSquare(col[1+7], row[6-4], sWidth,sHeight,"#d800ff",c);

      // I
      Path.renderSquare(col[4+7], row[4-4], sWidth,sHeight,"#ff5800",c);
      Path.renderSquare(col[4+7], row[5-4], sWidth,sHeight,"#ff5800",c);
      Path.renderSquare(col[4+7], row[6-4], sWidth,sHeight,"#ff5800",c);

      // M
      Path.renderSquare(col[6+7], row[4-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[6+7], row[5-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[6+7], row[6-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[7+7], row[4-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[7+7], row[5-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[8+7], row[4-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[8+7], row[5-4], sWidth,sHeight,"#27ff00",c);
      Path.renderSquare(col[8+7], row[6-4], sWidth,sHeight,"#27ff00",c);


      // E
      Path.renderTriangle(col[11+7], row[4-4], sWidth,sHeight,0,"#00a7ff",c);
      Path.renderTriangle(col[11+7], row[6-4], sWidth,sHeight,3,"#00a7ff",c);

      Path.renderSquare(col[10+7], row[4-4], sWidth,sHeight,"#00a7ff",c);
      Path.renderSquare(col[10+7], row[5-4], sWidth,sHeight,"#00a7ff",c);
      Path.renderSquare(col[10+7], row[6-4], sWidth,sHeight,"#00a7ff",c);
      Path.renderSquare(col[11+7], row[5-4], sWidth,sHeight,"#00a7ff",c);







    //  Path.renderLogoBall(col[8],row[1], rectHeight*.8, "#fff",c);


}


Path.renderArrow = function(options,context){

    var c = context,
        direction = options.direction,
        size = options.size,
        x = direction === "top" ? options.position.x : direction === "left" ? options.position.x + size/4 : options.position.x - size/4,
        y = direction === "top" ? options.position.y - size/4 : options.position.y,
        fillStyle = options.fillStyle,
        points = [
          {x: x, y: y},
          {x: x - size/2, y: y - size/2},
          {x: x + size/2, y: y - size/2},
          {x: x + size/2, y: y + size/2},
          {x: x - size/2, y: y + size/2}
        ],
        directions = [
          [ points[2], points[0], points[3] ],
          [ points[4], points[0], points[3] ],
          [ points[1], points[0], points[4] ]
        ];




    var dir = direction === "top" ? directions[1] : direction === "left" ? directions[0] : directions[2];

    switch(direction){

        case "top":
        //  c.translate(0,size/2);
            break;
        case "left":
          c.translate(-size/2,0);
            break;
        case "right":
          c.translate(size/2,0);
            break;
    }


    c.beginPath();
  //  c.strokeStyle = fillStyle;
    c.fillStyle = fillStyle;
    c.moveTo(dir[0].x,dir[0].y);
    c.lineTo(dir[1].x,dir[1].y);
    c.lineTo(dir[2].x,dir[2].y);
   // c.lineWidth = size/10;
   // c.stroke();
    c.fill();

    switch(direction){

        case "top":
       //   c.translate(0,-size/2);
            break;
        case "left":
          c.translate(size/2,0);
            break;
        case "right":
          c.translate(-size/2,0);
            break;
    }

}

Path.renderPauseSymbol = function(options,context){

  var c = context,
      size = options.size,
      fillStyle = options.fillStyle,
      x = options.position.x,
      y = options.position.y,
      height = size,
      dist = size/4;


  c.beginPath();

  c.strokeStyle = fillStyle;
  c.lineWidth = size/6;

  c.moveTo(x-dist,y-height/2);
  c.lineTo(x-dist,y+height/2);
  c.stroke();

  c.moveTo(x+dist,y-height/2);
  c.lineTo(x+dist,y+height/2);
  c.stroke();


}




// COUNTER ----------------------------------
var Counter = {};

Counter.create = function(options){

  var counter = {
      position: {
          x: options.position.x,
          y: options.position.y
      },
      width: options.width,
      height: options.height,
      initialCount: options.count,
      count: options.count,
      text: options.text || [],
      particles: [],
      particle: {
          radius: options.particle.radius,
          fillStyle: options.particle.fillStyle,
          velocity: options.particle.velocity,
          velocityRange: options.particle.velocityRange,
          constraint: 100,
          amount: options.particle.amount
      }
  }
  return counter;
}

Counter.render = function(counter,context){
    var c = context,
        p = counter.position,
        width = counter.width,
        height = counter.height,
        particle = counter.particle,
        particles = counter.particles,
        part,
        w = 2,
        h = 2,
        s = 6;


    c.save();
    c.beginPath();
    c.translate(p.x,p.y)

c.fillStyle = counter.fillStyle;
c.moveTo(0,0-height/h);
c.lineTo(0 + (width/w-width/s),-height/h);
c.lineTo(0 + (width/w-width/s) + width/s, 0);
c.lineTo(0 + (width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + height/h);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s) + -width/s, 0);
c.lineTo(0 + (width/w-width/s) + -2*(width/w-width/s), 0 + -height/h);
c.lineTo(0,0-height/h);

c.fill();

//c.strokeStyle = counter.strokeStyle;
//c.lineWidth = counter.lineWidth;
c.stroke();

c.clip();

c.beginPath();
c.fillStyle = particle.fillStyle;
for(let i=0; i < particles.length; i++){

    part = particles[i];

   c.beginPath();
   c.arc(part.position.x,part.position.y,particle.radius,0,Math.PI*2);
    c.fill();

}
c.closePath();
c.restore();

  for(let i in counter.text){
    Text.render(counter.text[i],context);
  }



}

Counter.initParticles = function(counter){

  var particles = counter.particles,
      particle = counter.particle,
      width = counter.width,
      height = counter.height,
      r = particle.radius,
      x = counter.position.x,
      y = counter.position.y,
      vel = particle.velocity,
      vRange = particle.velocityRange;

  for(let i=0; i<particle.amount; i++){
    particles.push({
        position: {
          x: Common.randomNumber(-width/2,width/2),
          y: Common.randomNumber(height/2+r,height*1.5)
        },
        velocity: {
            x: 0,
            y: Common.randomNumber(vel.y-vRange.y,vel.y+vRange.y)
        }
    });
  }

}

Counter.animateParticles = function(counter){

  var particle = counter.particle,
      particles = counter.particles,
      constraint = particle.constraint,
      position = counter.position,
      height = counter.height,
      part;

  for(let i=0; i<particles.length; i++){
      part = particles[i];

      part.position.y += part.velocity.y;

      if(part.position.y < height/2 - height * (constraint/100) ){

        part.position.y += height+particle.radius;
        }
  }

}

Counter.run = function(menu,timer,app,game){

    var ctx = menu.context,
        counter = menu.counter;



    Audio.play(audios,"clock");
    Counter.initParticles(menu.counter);

    counter.countInterval = Timer.setInterval2(timer,1000,function(){

        Text.changeContent(counter.text[0],counter.count--);
        Counter.render(counter,ctx);

    },counter.count,function(){
        Counter.clear(counter,timer,app);
        Game.Events.trigger("lost",game);

    });

    menu.counter.partInterval = Timer.setInterval2(timer,14,function(){
        Counter.animateParticles(counter);
        Counter.render(counter,ctx);

    });





}

Counter.clear = function(counter,timer,app){


    counter.count = counter.initialCount;
    counter.particles.length = 0;

    Audio.stop(audios,"clock");
    Timer.clear(timer,counter.countInterval);
    Timer.clear(timer,counter.partInterval);
    App.Layers.hide(app,"admenu");
    App.Layers.show(app,"game");

}


// MENU ----------------------------
var Menu = {};

Menu.createBackground = function(options){

    var w = options.width,
        h = options.height,
        x = options.position.x,
        y = options.position.y,
        wDelta = w*.08,
        hDelta = h*.08,
        fillStyle = options.fillStyle,
        strokeStyle = options.strokeStyle,
        lineWidth = options.lineWidth;

    var path = Path.create({
            points: [
              {x: x-w/2,
               y: y-h/2+hDelta
              },
              {x: x-w/2+wDelta,
               y: y-h/2
              },
              {x: x+w/2-wDelta,
               y: y-h/2
              },
              {x: x+w/2,
               y: y-h/2+hDelta
              },

              {x: x+w/2,
               y: y+h/2-hDelta
              },
              {x: x+w/2-wDelta,
               y: y+h/2
              },
              {x: x-w/2+wDelta,
               y: y+h/2
              },
              {x: x-w/2,
               y: y+h/2-hDelta
              },

            ],
            fill: true,
            fillStyle: fillStyle,
            strokeStyle: strokeStyle,
            close: true,
            lineWidth: lineWidth,
            lineJoin: "miter"
        });


    return path;
}


// AD REVIVAL MENU ---------------------------
var AdMenu = {};

AdMenu.create = function(options){

    var admenu = {
    //    position: {
    //        x: options.position.x,
    //        y: options.position.y
    //    },
    //    width: options.width,
    //    height: options.height,
        text: options.text || [],
        buttons: options.buttons || [],
        paths: options.paths || [],
        counter: options.counter

    }

    return admenu;
}

AdMenu.render = function(menu,context){

    var c = context,
        x = menu.position.x,
        y = menu.position.y,
        width = menu.width,
        height = menu.height;


    for(let i in menu.paths){
      Path.render(menu.paths[i],c);
    }

    for(let i in menu.buttons){
      Button.render(menu.buttons[i],c);
    }
    for(let i in menu.text){
      Text.render(menu.text[i],c);
    }




}




// STAR ----------------------------
var Star = {};


Star.render = function(options,context){

    var c = context,
        x = options.position.x,
        y = options.position.y,
        background = options.background,
        star = "\u{2B50}",
        fontSize = options.fontSize;

    if(!!background){
      Elements.renderArea({
        position: {
          x: x,
          y: y
        },
        width: fontSize,
        height: fontSize,
        fillStyle: background,
        context: c
      });
    }
    c.font = fontSize+"px JoyPixels";
    c.textBaseline = "middle";
    c.textAlign = "center";
    c.fillText(star,x,y);
}


Star.renderGroup = function(options,context){

  var c = context,
      stars = options.stars,
      fontSize = options.fontSize,
      position = options.position,
      fillStyle = "#4f4f4f",
      textAlign = options.textAlign,
      background = options.background,
      gap = fontSize* (options.gap || 1.4);



    switch(textAlign){

      case "left":

        for(let i=1; i<=stars.length; i++){
          if(stars[i-1].gray){

            Path.renderStar({
              position: {
                x: position.x + gap*i,
                y: position.y
              },
              size: fontSize/2,
              fillStyle: fillStyle,
              background: background
            },c);

          }else{

            Star.render({
              position: {
                x: position.x + gap*i,
                y: position.y
              },
              fontSize: fontSize,
              background: background
            },c);

          }

        }

        break;

      case "right":

        for(let i=-1; i>=stars.length; i--){
          if(stars[i*-1-1].gray){

            Path.renderStar({
              position: {
                x: position.x + gap*i,
                y: position.y
              },
              size: fontSize/2,
              fillStyle: fillStyle,
              background: background
            },c);

          }else{

            Star.render({
              position: {
                x: position.x + gap*i,
                y: position.y
              },
              fontSize: fontSize,
              background: background
            },c);

          }

        }
        break;
      default:
        var start = -(stars.length-1)/2,
            k = 0;
        for(let i=start; i<start+stars.length; i++){


          if(stars[k++].gray){

            Path.renderStar({
              position: {
                x: position.x + gap*-i,
                y: position.y
              },
              size: fontSize/2,
              fillStyle: fillStyle,
              background: background
            },c);

          }else{



            Star.render({
              position: {
                x: position.x + gap*-i,
                y: position.y
              },
              fontSize: fontSize*.8,
              background: background
            },c);


          }

        }
        break;

    }



}

// LOSE MENU -------------------------
var LoseMenu = {};

LoseMenu.create = function(x,y,width,height,buttonCallbacks){

    var menu = {
        position: {
            x: x,
            y: y
        },
        width: width,
        height: height,
        canvas: [
            Elements.canvas({
                width: "100vw",
                height: "100vh",
                position: {
                    x: 0, y: 0
                },
                zIndex: 9,
                background: "transparent",
            })
        ],
        text: [
            Text.create({
                position: {
                    x: x,
                    y: y - height*.22
                },
                fontSize: width/14,
                font: "Bai Jamjuree",
                fontWeight: "bold",
                fillStyle: "#cc0000",
                textBaseline: "middle",
                content: "JUST TRY"
            }),
            Text.create({
                position: {
                    x: x,
                    y: y - height*.15
                },
                fontSize: width/14,
                font: "Bai Jamjuree",
                fontWeight: "bold",
                fillStyle: "#cc0000",
                textBaseline: "middle",
                content: "IT AGAIN!"
            }),
            Text.create({
                position: {
                    x: x - width*.1,
                    y: y - width*.05
                },
                fontSize: width/15,
                fontWeight: "500",
                content: " ",//bestOne
                textAlign: "right"
            }),
            Text.create({
                position: {
                    x: x - width*.1,
                    y: y + width*.02
                },
                fontSize: width/15,
                fontWeight: "500",
                content: " ",// bestTwo
                textAlign: "right"
            }),
            Text.create({
                position: {
                    x: x,
                    y: y - height*.4
                },
                fontSize: width/10,
                fontWeight: "bold",
                fillStyle: "red",
                textAlign: "center",
                content: "DEFEAT"
            })
        ],
        buttons: [
        Button.create({
            size: "large",
            position: {
                x: x,
                y: y + height*.16
            },
            width: width*.7,
            height: width*.12,
            render: {
                background: "#ff0000",
                text: {
                    content: "TRY AGAIN",
                    fontSize: width*.06
                }
            },
            callback: buttonCallbacks[0],
        }),
        ],
        background: Menu.createBackground({
            position: {
                x: x,
                y: y
            },
            width: width*.9,
            height: height,
            fillStyle: "#1f1f1f",
            strokeStyle: "#cc0000",
            lineWidth: cWidth/60
        })
    }
    menu.context = menu.canvas[0].getContext("2d");

    return menu;


}

LoseMenu.render = function(menu){

    var c = menu.context,
        background = menu.background,
        text = menu.text,
        buttons = menu.buttons;



    Path.render(background,c);

    for(let i in text)
      Text.render(text[i],c);

    for(let i in buttons)
      Button.render(buttons[i],c);

    Star.renderGroup({
        stars: [ {gray: false}, {gray:false}, {gray: false} ],
        fontSize: menu.width/20,
        position: {
            x: menu.position.x + menu.width*.1,
            y: text[2].position.y
        },
        textAlign: "left",
        textBaseline: "middle"
    },c);

    Star.renderGroup({
        stars: [  {gray:false}, {gray: false} ],
        fontSize: menu.width/20,
        position: {
            x: menu.position.x + menu.width*.1,
            y: text[3].position.y
        },
        textAlign: "left",
        textBaseline: "middle"
    },c);

    Star.renderGroup({
        stars: [  {gray:true}, {gray: true}, {gray: true} ],
        fontSize: menu.width/6,
        position: {
            x: menu.position.x,
            y: menu.position.y + menu.height*.34
        },
        textAlign: "center",
        textBaseline: "middle"
    },c);
}


LoseMenu.run = function(app,game,menu){

  var context = menu.context,
      metrics = Game.getMetrics(game),
      text = menu.text,
      background = menu.background,
      one,
      stringOne,
      two,
      stringTwo;

  Elements.renderArea({
        position: {
            x: text[2].position.x-text[2].fontSize,
            y: text[2].position.y
        },
        width: text[2].fontSize*4,
        height: text[2].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });
    Elements.renderArea({
        position: {
            x: text[3].position.x-text[3].fontSize,
            y: text[3].position.y
        },
        width: text[3].fontSize*4,
        height: text[3].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });

  one = Calculator.convertToMinSec(metrics.bestOne);
  two = Calculator.convertToMinSec(metrics.bestTwo);
  stringOne = one.sec < 10 ? one.min+":0"+one.sec : one.min+":"+one.sec;
  stringTwo = two.sec < 10 ? two.min+":0"+two.sec : two.min+":"+two.sec;
  Text.changeContent(text[2],stringOne);
  Text.changeContent(text[3],stringTwo);
  Text.render(text[2],context);
  Text.render(text[3],context);

  App.Layers.show(app,"losemenu");


}



// WIN MENU --------------------------
var WinMenu = {};

WinMenu.create = function(x,y,width,height,buttonCallbacks){

    var menu = {

        position: {
            x: x,
            y: y
        },
        width: width,
        height: height,
        canvas: [
            Elements.canvas({
                width: "100vw",
                height: "100vh",
                position: {
                    x: 0, y: 0
                },
                zIndex: 9,
                background: "transparent",
            })
        ],
        text: [
            Text.create({
                position: {
                    x: x,
                    y: y - height*.2
                },
                fontSize: width/5,
                fontWeight: "bold",
                textBaseline: "middle",
                content: "1:47"
            }),
            Text.create({
                position: {
                    x: x - width*.1,
                    y: y - width*.05
                },
                fontSize: width/15,
                fontWeight: "500",
                content: " ",//bestOne
                textAlign: "right"
            }),
            Text.create({
                position: {
                    x: x - width*.1,
                    y: y + width*.02
                },
                fontSize: width/15,
                fontWeight: "500",
                content: " ",// bestTwo
                textAlign: "right"
            }),
            Text.create({
                position: {
                    x: x,
                    y: y - height*.4
                },
                fontSize: width/10,
                fontWeight: "bold",
                fillStyle: "limegreen",
                textAlign: "center",
                content: "COMPLETED"
            })
        ],
        buttons: [
          Button.create({
            size: "large",
            position: {
                x: x,
                y: y + height*.16
            },
            width: width*.7,
            height: width*.12,
            render: {
                background: "limegreen",
                text: {
                    content: "NEXT LEVEL",
                    fontSize: width*.06
                }
            },
            callback: buttonCallbacks[0],
        }),
      ],
        background: Menu.createBackground({
            position: {
                x: x,
                y: y
            },
            width: width*.9,
            height: height,
            fillStyle: "#1f1f1f",
            strokeStyle: "limegreen",
            lineWidth: cWidth/60
        })
    }
    menu.context = menu.canvas[0].getContext("2d");

    return menu;

}

WinMenu.render = function(menu){

    var context = menu.context,
        text = menu.text,
        stars = menu.stars,
        buttons = menu.buttons,
        background = menu.background;

    Path.render(background,context);

    Elements.renderArea({
        position: {
            x: text[1].position.x-text[1].fontSize,
            y: text[1].position.y
        },
        width: text[1].fontSize*4,
        height: text[1].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });
    Elements.renderArea({
        position: {
            x: text[2].position.x-text[2].fontSize,
            y: text[2].position.y
        },
        width: text[2].fontSize*4,
        height: text[2].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });

    for(let i in text)
      Text.render(text[i],context);

    for(let i in buttons){
      Button.render(buttons[i],context);
    }

    Star.renderGroup({
        stars: [ {gray: false}, {gray:false}, {gray: false} ],
        fontSize: menu.width/20,
        position: {
            x: menu.position.x + menu.width*.1,
            y: text[1].position.y
        },
        textAlign: "left",
        textBaseline: "middle"
    },context);

    Star.renderGroup({
        stars: [  {gray:false}, {gray: false} ],
        fontSize: menu.width/20,
        position: {
            x: menu.position.x + menu.width*.1,
            y: text[2].position.y
        },
        textAlign: "left",
        textBaseline: "middle"
    },context);

}

WinMenu.run = function(app,game,menu){

  var context = menu.context,
      metrics = Game.getMetrics(game),
      seconds = metrics.timeLeft/1000,
      text = game.winMenu.text,
      background = menu.background,
      fillStyle = game.winMenu.background.fillStyle,
      count = 1000,
      stars = [ {gray: true}, {gray: true}, {gray: false} ],
      time,
      string,
      one,
      stringOne,
      two,
      stringTwo;


    Elements.renderArea({
        position: {
            x: text[1].position.x-text[1].fontSize,
            y: text[1].position.y
        },
        width: text[1].fontSize*4,
        height: text[1].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });
    Elements.renderArea({
        position: {
            x: text[2].position.x-text[2].fontSize,
            y: text[2].position.y
        },
        width: text[2].fontSize*4,
        height: text[2].fontSize,
        fillStyle: background.fillStyle,
        context: context
    });


  one = Calculator.convertToMinSec(metrics.bestOne);
  two = Calculator.convertToMinSec(metrics.bestTwo);
  stringOne = one.sec < 10 ? one.min+":0"+one.sec : one.min+":"+one.sec;
  stringTwo = two.sec < 10 ? two.min+":0"+two.sec : two.min+":"+two.sec;
  Text.changeContent(text[1],stringOne);
  Text.changeContent(text[2],stringTwo);
  Text.render(text[1],context);
  Text.render(text[2],context);

  App.Layers.show(app,"winmenu");

  game.countUp = Timer.setInterval(game.timer,seconds,function(){

    time = Calculator.convertToMinSec(count);
    if(time.sec >= 10)
      string = time.min+":"+time.sec;
    else
      string = time.min+":0"+time.sec;

    Text.changeContent(text[0],string);
    Elements.renderArea({
        position: {
            x: text[0].position.x,
            y: text[0].position.y
        },
        width: cWidth/2.5,
        height: text[0].fontSize,
        fillStyle: fillStyle,
        context: context
    });
    Text.render(text[0],context);

    if(count === metrics.bestTwo){
      Audio.play(audios,"ping");
      stars.splice(1,1,{gray:false});
      renderStars();
    }
    if(count === metrics.bestOne){
      Audio.play(audios,"ping");
      stars.splice(0,1,{gray:false});
      renderStars();
    }



    count += 1000;
  });

  function renderStars(){
    Star.renderGroup({
        stars: stars.slice(),
        fontSize: menu.width/10,
        position: {
            x: menu.position.x,
            y: menu.position.y + menu.height*.35
        },
        textAlign: "center",
        textBaseline: "middle",
        gap: 1.8,
        background: fillStyle
    },context);
   }
   renderStars();
}









// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$---GAME---$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$







































var app = App.create();




var audios = Audio.createContainer();

Audio.add(audios,{
  id: "new-round",
  path: "assets/audio/newRound.wav"
});
Audio.add(audios,{
  id: "bubble",
  path: "assets/audio/blopQ.wav"
});
Audio.add(audios,{
  id: "menu",
  path: "assets/audio/singlePing.wav"
});
Audio.add(audios,{
  id: "click",
  path: "assets/audio/newClick.wav"
});
Audio.add(audios,{
  id: "clock",
  path: "assets/audio/shortClock.mp3"
});
Audio.add(audios,{
  id: "ping",
  path: "assets/audio/singlePing.wav"
});
Audio.add(audios,{
  id: "gem",
  path: "assets/audio/ngem.wav",//"assets/audio/gemBreak.wav"
});




var errors = Error2.createContainer();

Error2.add(errors,"adNotLoad",Error2.create({
    text: "You're lucky, Ad did not load"
}));
Error2.add(errors,"noConnection",Error2.create({
    text: "No connection, please check your internet connection"
}));
Error2.add(errors,"adNotAvailable",Error2.create({
    text: "video is currently not available"
}));
Error2.add(errors,"availableSoonIAP",Error2.create({
    position: {
      y: "25vh"
    },
    text: "available soon!"
}));
Error2.add(errors,"availableSoonNoAd",Error2.create({
    position: {
      y: "70vh"
    },
    text: "available soon!"
}));








var mainMenu = App.Layers.create({

    elements: [
        Elements.canvas({
            width: "100vw",
            height: "100vh",
            position: {x: 0, y: 0},
            zIndex: 9,
            background: "#1f1f1f",
        })
    ],
    append: function(){
        Elements.append(document.body,this.elements[0]);
    },
    buttons: [
    Button.create({
        size: "large",
        position: {
            x: cWidth/2,
            y: cHeight/2 - cHeight*.03
        },
        width: cWidth*.7,
        height: cWidth*.12,
        render: {
            background: "#eb2c14",
            text: {
                content: "PLAY",
                fontSize: cWidth*.06,
            }
        },
        callback: function(){
          Game.Vars.setMode(game,"level");
          App.Layers.render(app,"pausemenu");
          Level.Map.Events.trigger("show",levelMap);
          App.Layers.show(app,"levelmap");
        }
    }),
    Button.create({
        size: "large",
        position: {
            x: cWidth/2,
            y: App.getTabletMode(app) ? cHeight/2 + cHeight*.08 : cHeight/2 + cHeight*.07
        },
        width: cWidth*.7,
        height: cWidth*.12,
        render: {
            background: "#0085ff",
            text: {
                content: "RATE",
                fontSize: cWidth*.06,
            }
        },
        callback: function(){
          callback2();
        }
    }),
    Button.create({ // share
        size: "small",
        position: {
            x: cWidth/2 - cWidth*.1,
            y: cHeight/2 + cHeight*.3
        },
        width: cWidth*.16,
        height: cWidth*.125,
        render: {
            background: "#4dff00",
            text: {
                content: " "
            }
        },
        callback: function(){
          callback2();
        }
    }),
    Button.create({
        size: "small",
        position: {
            x: cWidth/2 + cWidth*.1,
            y: cHeight/2 + cHeight*.3
        },
        width: cWidth*.16,
        height: cWidth*.125,
        render: {
            background: "#00ccff",
            text: {
                fontSize: cWidth*.16/2,
                content: " "
            }
        },
        callback: function(){
          App.Layers.show(app,"shop");
          Shop.Events.trigger("open",shop);
        }
    }),
    Button.create({ // sound
        size: "small",
        position: {
            x: cWidth/2 - cWidth*.3,
            y: cHeight/2 + cHeight*.3
        },
        width: cWidth*.16,
        height: cWidth*.125,
        render: {
            background: "#b200ff",
            text: {
                content: " "
            }
        },
        callback: function(){
            Audio.setStatus(audios,audios.status === "on" ? "off" : "on")
            Audio.renderSpeaker(audios.status);
        }
    }),
    Button.create({
        size: "small",
        position: {
            x: cWidth/2 + cWidth*.3,
            y: cHeight/2 + cHeight*.3
        },
        width: cWidth*.16,
        height: cWidth*.125,
        render: {
            background: "#ff3300",
            text: {
                content: " "
            }
        },
        callback: function(){
            Error2.throw(errors, "availableSoonNoAd");
        }
    }),/*
    Button.create({
        size: "large",
        position: {
            x: cWidth/2,
            y: cHeight/2 + cHeight*.03
        },
        width: cWidth*.7,
        height: cWidth*.11,
        render: {
            background: "#6600cc",
            text: {
                content: "CHALLENGE",
                fontSize: cWidth*.06,
            }
        },
        callback: function(){



                Game.Vars.setMode(game,"score");
                App.Layers.render(app,"pausemenu");
                Game.Events.trigger("init", game, {
                    level: ScoreGame.randomizeLevel(sGame,game)
                });
        }
    }),*/
    ],
    render: [ function(ctx){

        var c = ctx;
        var btns = mainMenu.buttons;


        Buttons.render(mainMenu.buttons);


        c.beginPath();
        c.textAlign = "center";
        c.textBaseline = "bottom";
        c.font = "bold "+btns[5].width/5+"px Bai Jamjuree";
        c.fillStyle = "white";
c.fillText("NO",btns[5].position.x,btns[5].position.y);
        c.textBaseline = "top";
c.fillText("ADS",btns[5].position.x,btns[5].position.y);


        Path.renderShareSymbol({
            position: {
              x: btns[2].position.x,
              y: btns[2].position.y
            },
            fillStyle: "#fff",
            size: btns[2].width/4,
        },c);

        Path.renderShoppingCart({
            position: {
              x: btns[3].position.x,
              y: btns[3].position.y
            },
            fillStyle: "#fff",
            size: btns[3].width/2.6,
        },c);

        Path.renderLogo({
          position: {
            x: cWidth/2,
            y: cHeight*.25
          },
          size: cWidth*.04//cWidth*.035
        },c);

    }

    ]


});
App.Layers.add(app,"mainmenu",mainMenu);
App.Layers.render(app,"mainmenu");


var shop = Shop.create({
        emojis: [],
        iaps: [],
        events: [],
        currency: "\u{1F48E}",
        balance: 0,
        emoji: {
            index: 0,
            selected: null,
            nextIndex: function(){
              return this.index++;
            },
            imageData: null,
            grid: App.getTabletMode(app) ? Grid.create(cWidth*.05,0,cWidth*.9,cWidth*.9/3*10,10,3) : Grid.create(0,0,cWidth,cWidth/3*10,10,3),
            div: Elements.div({
                width: "100vw",//cWidth+"px",
                height: "60vh",//cHeight*.6+"px",
                position: {
                    x: "0vw",
                    y: "40vh"
                },
                zIndex: 7,
                scrollable: true
            }),
            canvas: Elements.canvas({
                width: "100vw",
                height: App.getTabletMode(app) ? Math.round( cWidth*.9/3 )*10+"px" : Math.round( cWidth/3 )*10+"px",
                position: {
                    x: "0vw", y: "0vh"
                },
                zIndex: 7,
                background: "#1f1f1f",
            })
        },
        iap: {
            index: 0,
            nextIndex: function(){
              return this.index++;
            },
            text: [
            Text.create({
              position: { x: cWidth/2, y: cHeight*.4*.15 },
              fontSize: cWidth*.1,
              fontWeight: "bold ",
              content: "SHOP"
            }),
            Text.create({
              position: {
                x: App.getTabletMode(app) ? cWidth*.93 : cWidth*.98,
                y: App.getTabletMode(app) ? cHeight*.4*.11 : cHeight*.4*.12
              },
              fontSize: cWidth*.04,
              textAlign: "right",
              textBaseline: "middle",
              fontWeight: "bold ",
              content: "gems"
            }),
            Text.create({
              position: {
                x: App.getTabletMode(app) ? cWidth*.93 : cWidth*.98,
                y: App.getTabletMode(app) ? cHeight*.4*.11 : cHeight*.4*.12
              },
              font: "JoyPixels",
              fontSize: cWidth*.035,
              textAlign: "right",
              textBaseline: "middle",
              fontWeight: "bold ",
              content: "\u{1F48E}"
            }),
            ],
            grid: App.getTabletMode(app) ? Grid.create(cWidth*.05,cHeight*.4*.55-cWidth/3/2,cWidth*.9,cWidth*.8/3,1,3) : Grid.create(cWidth*.02,cHeight*.4*.52-cWidth/3/2,cWidth*.96,cWidth*.9/3,1,3),
            canvas: Elements.canvas({
                width: "100vw",
                height: "40vh",
                position: {
                    x: 0, y: 0
                },
                positionAttribute: "fixed",
                zIndex: 8,
                background: "#1f1f1f",
            }),
            buttons: [
              Button.create({
                  size: "small",
                  position: {
                      x: App.getTabletMode(app) ? cWidth*.15 : cWidth*.1,
                      y: cHeight*.4*.15
                  },
                  width: cWidth*.09,
                  height: cWidth*.12,
                  render: {
                      background: "transparent",
                      text: {
                          content: " "
                      }
                  },
                  callback: function(){
                      Shop.Events.trigger("close",shop,{});
                      App.Layers.show(app,"mainmenu");

                  }
              }),
              Button.create({
                  size: "large",
                  position: {
                      x: cWidth*.5,
                      y: cHeight*.34
                  },
                  width:  cWidth*.8,
                  height: App.getTabletMode(app) ? cWidth*.09 : cWidth*.1,
                  render: {
                      background: "#05b8cc",
                      text: {
                          fontSize: cWidth*.06,
                          content: " ",
                          fontWeight: "400"
                      }
                  },
                  callback: function(){
                    if(that.network.getConnection()){
                      //that.showRewardVideo();
                    }else{
                      Error2.throw(errors,"noConnection");
                    }
                  }
              })
            ]
        }
});

Shop.Emoji.add(shop,{ price: 0, good: "\u{1F30D}", index: shop.emoji.nextIndex(), filter: "brightness(0) invert(1)" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F30D}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F3B1}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{26BD}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F3C0}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F383}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{2660}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{2B50}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F47D}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F4C0}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F369}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F43C}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{2744}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F35F}", index: shop.emoji.nextIndex(), filter: "none" });

Shop.Emoji.add(shop,{ price: 200, good: "\u{1F436}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F438}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F427}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F433}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F341}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F49C}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F381}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F422}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F417}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F338}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{26C4}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{2693}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F420}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F344}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F98B}", index: shop.emoji.nextIndex(), filter: "none" });
Shop.Emoji.add(shop,{ price: 200, good: "\u{1F37F}", index: shop.emoji.nextIndex(), filter: "none" });





Shop.Emoji.definePosition(shop);

Shop.IAP.add(shop,{ price: "0.99$", good: shop.currency,amount: 1000, index: shop.iap.nextIndex(),callback: function(){
  Error2.throw(errors, "availableSoonIAP");
} });
Shop.IAP.add(shop,{ price: "1.99$", good: shop.currency,amount: 2500, index: shop.iap.nextIndex(),callback: function(){
  Error2.throw(errors, "availableSoonIAP");
}  });
Shop.IAP.add(shop,{ price: "2.99$", good: shop.currency,amount: 4500, index: shop.iap.nextIndex(),callback: function(){
  Error2.throw(errors, "availableSoonIAP");
} })


Shop.IAP.definePosition(shop);


var shopLayer = App.Layers.create({
  elements: [
    shop.emoji.canvas,
    shop.emoji.div,
    shop.iap.canvas
  ],
  append: function(){
    Elements.append(document.body,this.elements[1]);
    Elements.append(document.body,this.elements[2]);
  //  Elements.append(this.elements[1],this.elements[0]);
    //setTimeout(() => {
      Elements.append(this.elements[1],this.elements[0]);

    //},1000)
  },
  buttons: [
    shop.iap.buttons[0],
    shop.iap.buttons[1]
  ],
  render: [
    function(ctx){

    },
    function(ctx){

    }
  ]

});
App.Layers.add(app,"shop",shopLayer);
App.Layers.hide(app,"shop");
App.Layers.render(app,"shop");


var adMenu = AdMenu.create({
  position: {
      x: cWidth/2,
      y: cHeight/2
  },
  width: 100,
  height: 100,
  text: [
      Text.create({
          position: {
              x: cWidth/2,
              y: cHeight/2+cWidth*.02
          },
          content: " ",
          fontSize: cWidth/16,
          fontWeight: "400",
          font: "Chewy",
          fillStyle: "#a929ee"
      })
  ],
  buttons: [
      Button.create({
        size: "large",
        position: {
          x: cWidth/2,
          y: cHeight/2-cWidth*.1
        },
        width: cWidth*.6,
        height: cWidth*.1,
        render: {
        background: "#a929ee",
        stroke: {
            style: "white",
            lineWidth: cWidth/100
        },
        text: {
          fontSize: cWidth*.06,
          content: "LAST CHANCE!",
          fontWeight: "400"
        }
        },
        callback: function(){
            Counter.clear(adMenu.counter,game.timer,app);
            if(App.getAdsEnabled(app)){
              that.showRewardVideo();
            }else{
              Game.revive(game);
              Game.Vars.setInput(game, true);
              Game.Events.trigger("pauseend",game,{});
            }
        }
      }),
      Button.create({
        size: "large",
        position: {
          x: cWidth/2,
          y: cHeight/2+cWidth*.12
        },
        feedBack: false,
        width: cWidth*.6,
        height: cWidth*.1,
        render: {
        background: "#434343",
        stroke: {
            style: "grey",
            lineWidth: 1,//cWidth/200
        },
        text: {
          fontSize: cWidth*.06,
          content: "GIVE UP",
          fontWeight: "400"
        }
        },
        callback: function(){
            Counter.clear(adMenu.counter,game.timer,app);
            Game.Events.trigger("lost",game,{});
        }
      })
  ],
  paths: [
      Menu.createBackground({
          position: {
              x: cWidth/2,
              y: cHeight*.5
          },
          width: cWidth*.8,
          height: cWidth,
          fillStyle: "#1f1f1f",
          strokeStyle: "#a929ee",
          lineWidth: cWidth/100
      })
  ],
  counter: Counter.create({
      position: {
          x: cWidth/2,
          y: cHeight*.5-cWidth/2
      },
      width: cWidth*.4,
      height: cWidth*.3,
      count: 5,
      text: [
          Text.create({
              position: {
                  x: cWidth/2,
                  y: cHeight*.5-cWidth/2
              },
              content: "num",
              fontSize: cWidth/6,
              fontWeight: "bold",
              font: "Bai Jamjuree",
              fillStyle: "#a929ee"
          })
      ],
      particle: {
          radius: cWidth/200,
          fillStyle: "magenta",
          velocity: {
              x: 0,
              y: -cWidth/60
          },
          velocityRange: {
              x: 0,
              y: 0
          },
          amount: 50
      }
  })
});



var adMenuLayer = App.Layers.create({
  pseudo: true,
  elements: [
      Elements.canvas({
          width: "100vw",
          height: "100vh",
          position: {
              x: 0, y: 0
          },
          zIndex: 10,
          background: "transparent",
      })
  ],
  append: function(){
    Elements.append(document.body,this.elements[0]);
    adMenu.context = this.elements[0].getContext("2d");
  },
  buttons: [
    adMenu.buttons[0],
    adMenu.buttons[1]
  ],
  render: [
    function(ctx){
        Path.render(adMenu.paths[0],ctx);
        Button.render(adMenu.buttons[0],ctx);
        Button.render(adMenu.buttons[1],ctx);
        Text.render(adMenu.text[0],ctx);
    }
  ]

});
App.Layers.add(app,"admenu",adMenuLayer);
App.Layers.hide(app,"admenu");
App.Layers.render(app,"admenu");






var game = Game.create();
Game.init(game,app);

var sGame = ScoreGame.create(game);

var gameLayer = App.Layers.create({
    elements: [
        game.canvas,
        game.streakCanvas,
        game.barCanvas,
        game.touchCanvas
    ],
    append: function(){
        Elements.append(document.body,this.elements[0]);
        Elements.append(document.body,this.elements[1]);
        Elements.append(document.body,this.elements[2]);
        Elements.append(document.body,this.elements[3]);
    },
    buttons: [
        game.topBar.buttons[0],
        game.bottomBar.buttons[0]
    ],
    render: [
        function(){},
        function(){},
        function(){}
    ]
});
App.Layers.add(app,"game",gameLayer);
App.Layers.render(app,"game");
App.Layers.hide(app,"game");


var pauseLayer = App.Layers.create({
    pseudo: true,
    elements: [
        Elements.canvas({
                width: "100vw",
                height: "100vh",
                position: {
                    x: 0, y: 0
                },
                zIndex: 9,
                background: "transparent",
            })
    ],
    append: function(){
         Elements.append(document.body,this.elements[0]);

    },
    buttons: [
        Button.create({
          size: "large",
          position: {
              x: cWidth*.5,
              y: cHeight/2-cWidth*.2
          },
          width: cWidth*.5,
          height: cWidth*.1,
          render: {
              background: "orange",
                text: {
                  fontSize: cWidth*.06,
                  content: "CONTINUE",
                  fontWeight: "600 "
                }
          },
          callback: function(){
            Game.Events.trigger("pauseend",game,{});
            App.Layers.hide(app,"pausemenu");
            App.Layers.show(app,"game");
          }
        }),
        Button.create({
          size: "large",
          position: {
              x: cWidth*.5,
              y: cHeight/2+cWidth*.08
          },
          width: cWidth*.5,
          height: cWidth*.1,
          render: {
              background: "grey",
                text: {
                  fontSize: cWidth*.06,
                  content: "GIVE UP",
                  fontWeight: "600 ",
                  fillStyle: "#eaeaea"
                }
          },
          callback: function(){
            Game.Events.trigger("close",game);
            App.Layers.hide(app,"game");
            App.Layers.hide(app,"pausemenu");

            switch(Game.Vars.getMode(game)){

              case "level":
                  Level.Map.Events.trigger("show",levelMap);
                  App.Layers.show(app,"levelmap");
                break;

              case "score":
                  App.Layers.show(app,"mainmenu");
                break;
            }

          }
        }),
        Button.create({ // home
          size: "small",
          position: {
              x: cWidth*.35,
              y: cHeight/2+cWidth*.3
          },
          width: cWidth*.16,
          height: cWidth*.12,
          render: {
              background: "#e59400",
              text: {
                fontSize: cWidth*.06,
                content: " ",
              }
          },
          callback: function(){
            Game.Events.trigger("close",game);
           App.Layers.hide(app,"pausemenu");
           App.Layers.hide(app,"game"); App.Layers.show(app,"mainmenu");

          }
        }),
        Button.create({ // sound
          size: "small",
          position: {
              x: cWidth*.65,
              y: cHeight/2+cWidth*.3
          },
          width: cWidth*.16,
          height: cWidth*.12,
          render: {
              background: "#e59400",
              text: {
                fontSize: cWidth*.06,
                content: " ",
              }
          },
          callback: function(){
            Audio.setStatus(audios,audios.status === "on" ? "off" : "on");
            Audio.renderSpeaker(audios.status);
          }
        }),
        Button.create({
          size: "large",
          position: {
              x: cWidth*.5,
              y: cHeight/2-cWidth*.06
          },
          width: cWidth*.5,
          height: cWidth*.1,
          render: {
              background: "#fba014",
                text: {
                  fontSize: cWidth*.06,
                  content: "REPLAY",
                  fontWeight: "600 ",
                  fillStyle: "#fff"
                }
          },
          callback: function(){
            Game.Events.trigger("replay",game);

          }
        }),
        Button.create({
          size: "large",
          position: {
              x: cWidth*.5,
              y: cHeight/2-cWidth*.06
          },
          width: cWidth*.5,
          height: cWidth*.1,
          render: {
              background: "#ffa500",
                text: {
                  fontSize: cWidth*.06,
                  content: "RATE",
                  fontWeight: "600 ",
                  fillStyle: "#fff"
                }
          },
          callback: function(){

                callback2();
          }
        }),
        Button.create({
          size: "large",
          position: {
              x: cWidth*.5,
              y: cHeight/2+cWidth*.08
          },
          width: cWidth*.5,
          height: cWidth*.1,
          render: {
              background: "#ffa500",
                text: {
                  fontSize: cWidth*.06,
                  content: "SHARE",
                  fontWeight: "600 ",
                  fillStyle: "#fff"
                }
          },
          callback: function(){
            callback2();
          }
        }),
    ],
    paths: [
      Menu.createBackground({
          position: {
              x: cWidth/2,
              y: cHeight/2
          },
          width: cWidth*.7,
          height: cWidth,
          fillStyle: "#1f1f1f",
          strokeStyle: "orange",
          lineWidth: cWidth/100
      })
    ],
    render: [
        function(c){
            var bg = {
            y: cHeight*.5-cWidth/2,
            width: cWidth*.34,
            height: cWidth*.25
         },
         buttons = pauseLayer.buttons;
          Path.render(pauseLayer.paths[0],c);

            Path.renderBackground({
              position: {
                x: cWidth/2,
                y: bg.y
              },
              width: bg.width,
              height: bg.height,
              stroke: {
                  style: "orange",
                  lineWidth: pauseLayer.paths[0].lineWidth,
              },
              size: "small"
            },c);

            Path.renderPlaySymbol({
                position: {
                    x: cWidth/2,
                    y: bg.y
                },
                size: bg.width/3,
                fillStyle: "orange",
            },c);


            Button.render(pauseLayer.buttons[0],c);
        //    Button.render(pauseLayer.buttons[1],c);
            Button.render(pauseLayer.buttons[2],c);
            Button.render(pauseLayer.buttons[3],c);
        //    Button.render(pauseLayer.buttons[4],c);

            switch( Game.Vars.getMode(game) ){

              case "level":
                    Button.render(pauseLayer.buttons[1],c);
                    Button.render(pauseLayer.buttons[4],c);
                break;

              case "score":
                    Button.render(pauseLayer.buttons[5],c);
                    Button.render(pauseLayer.buttons[6],c);
                break;
            }

            Path.renderHomeSymbol({
                position: {
                    x: buttons[2].position.x,
                    y: buttons[2].position.y
                },
                size: buttons[2].width/3,
                fillStyle: "#fff",
                strokeStyle: buttons[2].render.background
            },c);

            Path.renderSpeaker({
                position: {
                    x: buttons[3].position.x,
                    y: buttons[3].position.y
                },
                size: buttons[3].width/3,
                fillStyle: "#fff",
                status: audios.status
            },c);

        },

    ]
});
App.Layers.add(app,"pausemenu",pauseLayer);
App.Layers.render(app,"pausemenu");
App.Layers.hide(app,"pausemenu");




game.winMenu = WinMenu.create(cWidth/2,cHeight/2,cWidth*.9,cWidth*1.2,[
        function(){
            var index = game.currentLevel.index,
                level = levelMap.levels[index+1];
            Game.Events.trigger("close",game,{});

           if(!!!level){
             App.Layers.show(app,"levelmap");
             App.Layers.hide(app,"winmenu");
             App.Layers.hide(app,"game");
             return;
           }
            Game.Events.trigger("init",game,{
                level: level
            });

            if(that.network.getConnection() && App.getAdsEnabled(app))
              that.showInterstitial();
      }
]);


var winLayer = App.Layers.create({
    pseudo: true,
    elements: [
        game.winMenu.canvas[0]
    ],
    append: function(){
         Elements.append(document.body,this.elements[0]);
    },
    buttons: [
      game.winMenu.buttons[0]
    ],
    render: [
        function(c){
          WinMenu.render(game.winMenu);
        },

    ]
});
App.Layers.add(app,"winmenu",winLayer);
App.Layers.render(app,"winmenu");
App.Layers.hide(app,"winmenu");



game.loseMenu = LoseMenu.create(cWidth/2,cHeight/2,cWidth*.9,cWidth*1.2,[
  function(){

    switch(Game.Vars.getMode(game)){

      case "level":
          Game.Events.trigger("replay",game);
        break;

      case "score":

          Game.Events.trigger("close",game,{});
          ScoreGame.setScore(sGame,0);
          Game.Events.trigger("init",game,{
              level: ScoreGame.randomizeLevel(sGame,game)
          });

        break;
    }

  }
]);


var loseLayer = App.Layers.create({
    pseudo: true,
    elements: [
        game.loseMenu.canvas[0]
    ],
    append: function(){
         Elements.append(document.body,this.elements[0]);
    },
    buttons: [
      game.loseMenu.buttons[0]
    ],
    render: [
        function(c){
          LoseMenu.render(game.loseMenu);
        },

    ]
});
App.Layers.add(app,"losemenu",loseLayer);
App.Layers.render(app,"losemenu");
App.Layers.hide(app,"losemenu");



var preview = Level.Preview.create();

var previewLayer = App.Layers.create({
    pseudo: true,
    elements: [
        preview.elements[0],
        preview.elements[1],
        preview.elements[2]
    ],
    append: function(){
         Elements.append(document.body,this.elements[0]);
         Elements.append(document.body,this.elements[2]);
         Elements.append(this.elements[2],this.elements[1]);
    },
    buttons: [
      preview.buttons[0]
    ],
    render: [
        function(c){
            Level.Preview.render(preview,c);
        },

    ]
});
App.Layers.add(app,"preview",previewLayer);
App.Layers.render(app,"preview");
App.Layers.hide(app,"preview");


// helps with measurements -----
var topBar = {
    height: cHeight*.1,
} //----
var levelMap = Level.Map.create({
  text: [
      Text.create({
          position: {
              x: cWidth/2,
              y: topBar.height/2
          },
          fillStyle: "orange",
          fontSize: cWidth*.08,
          textBaseline: "middle",
          fontWeight: "bold ",
          content: "MAP"
      }),
      Text.create({
          position: {
              x: cWidth*.99,
              y: topBar.height/2 - cWidth*.07/2 // topBar.height*.05
          },
          fillStyle: "#fff",
          fontSize: cWidth*.04,
          textAlign: "right",
          font: "Bai Jamjuree",
          textBaseline: "top",
          fontWeight: "bold ",
          content: " ",
      }),
      Text.create({
          position: {
              x: cWidth*.99,
              y: topBar.height/2 - cWidth*.07/2
          },
          fillStyle: "#fff",
          fontSize: cWidth*.035,
          textAlign: "right",
          font: "JoyPixels",
          textBaseline: "top",
          content: shop.currency,
      })
  ],
  buttons: [
    Button.create({
        size: "small",
        position: {
          x: cWidth*.08,
          y: topBar.height/2
        },
        width: cWidth*.1,
        height: cWidth*.08,
        render: {
          background:  "transparent",
          text: {
            content: " "
           }
         },
         callback: function(){
            App.Layers.show(app,"mainmenu");
         }
    }),
  ],
  canvas: Elements.canvas({
    width: "100vw",
    height: topBar.height+"px",
    position: {x: 0, y: 0},
    zIndex: 10,
    background: "#1f1f1f"
  }),
});

var levelmap = App.Layers.create({

    elements: [
        levelMap.div,
        levelMap.canvas,
        levelMap.topBar.canvas
    ],
    append: function(){
Elements.append(document.body,this.elements[0]);
Elements.append(this.elements[0],this.elements[1]);
Elements.append(document.body,this.elements[2]);
// guarantees scroll to the very end
this.elements[0].scrollTop = this.elements[1].offsetHeight;
    },
    buttons: [
        levelMap.topBar.buttons[0]
    ],
    render: [ function(){

    }

    ]


});
App.Layers.add(app,"levelmap",levelmap);
App.Layers.render(app,"levelmap");
App.Layers.hide(app,"levelmap");




levelMap.levels = Level.createContainer();

/*
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 22,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "05,00,05,05,05,05,05,"+
        "05,00,01,00,00,02,05,"+
        "05,04,03,05,05,00,05,"+
        "05,05,05,05,01,03,05,"+
        "05,01,00,00,03,05,05,"+
        "01,03,05,05,05,05,05,"+
        "00,00,00,00,00,00,05"
    ]
}));
*/

// 1
Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 5,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 15}
    ],
    tilemap : [
       "00,00,00,00,00,00,00,"+
       "00,05,00,05,00,05,00,"+
       "00,00,05,00,05,00,00,"+
       "00,00,00,00,00,00,00,"+
       "00,00,00,00,00,00,00,"+
       "00,00,00,00,00,00,00,"+
       "00,00,00,00,00,00,00 "
    ]
}));
// 2
Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 10,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
        {min: 0, sec: 45},
        {min: 0, sec: 30}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,05,00,25,00,05,00,"+
        "01,00,00,00,00,00,02,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 3
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 30,
    gridTranslation: true,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,21,00,00,25,"+
        "25,00,00,22,00,00,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00"
    ]
}));
// 4
Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 60},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,05,06,06,06,05,00,"+
        "00,00,25,06,25,00,00,"+
        "00,00,00,45,00,00,00,"+
        "00,00,45,06,45,00,00,"+
        "00,23,06,05,06,24,00,"+
        "00,00,00,06,00,00,00,"+
        "00,45,45,45,45,45,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,05,06,00,00,00,"+
        "00,00,00,00,45,00,00,"+
        "00,00,25,00,00,00,00,"+
        "00,00,00,00,05,00,00,"+
        "00,00,00,00,00,00,00"
    ]
}));
// 5
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 1, sec: 0},
      {min: 0, sec: 40}
    ],
    tilemap : [
        "00,00,06,06,06,00,00,"+
        "00,06,23,06,24,06,00,"+
        "00,00,25,06,25,00,00,"+
        "00,00,25,25,25,00,00,"+
        "00,00,00,00,00,00,00,"+
        "21,00,00,00,22,00,23,"+
        "24,00,21,00,00,00,22,"+
        "00,00,00,06,00,00,00,"+
        "05,01,05,07,05,02,05,"+
        "00,00,00,00,00,00,00,"+
        "05,05,05,09,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00"
    ]
}));

//  6
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 10,
    gridTranslation: true,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "06,05,00,05,00,05,06,"+
        "05,06,05,00,05,06,05,"+
        "00,05,06,05,06,05,00,"+
        "05,00,05,06,05,00,05,"+
        "00,05,06,05,06,05,00,"+
        "05,06,05,00,05,06,05,"+
        "06,00,00,00,00,00,06 "
    ]
}));
// 7
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 45},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,25,00,00,00,"+
        "00,00,23,06,24,00,00,"+
        "00,23,06,05,06,24,00,"+
        "00,06,05,05,05,06,00,"+
        "00,22,06,05,06,21,00,"+
        "00,00,00,06,00,00,00,"+
        "05,01,01,07,05,05,05,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,06,00,00,05,"+
        "01,00,00,06,00,05,05,"+
        "04,00,00,02,00,00,05,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 8
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 40},
    bestTime: [
      {min: 0, sec: 55},
      {min: 0, sec: 40}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,05,00,00,00,"+
        "00,00,01,05,02,00,00,"+
        "00,05,04,05,03,05,00,"+
        "05,05,05,09,05,05,05,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,05,00,00,00,"+
        "00,00,23,05,24,00,00,"+
        "21,06,00,06,45,06,45,"+
        "21,06,00,06,45,06,45,"+
        "01,00,00,02,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 9
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 0, sec: 50},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,00,43,06,44,00,00,"+
        "00,43,06,06,06,44,00,"+
        "05,05,05,07,05,05,05,"+
        "00,00,00,05,00,00,00,"+
        "41,00,00,08,00,00,42,"+
        "00,00,00,42,00,00,00,"+
        "00,00,00,41,00,00,00,"+
        "44,00,00,42,00,00,00,"+
        "00,00,00,41,00,00,43,"+
        "00,00,00,00,00,00,00 "
    ]
}));

// 10
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 50},
      {min: 0, sec: 40}
    ],
    tilemap : [
        "03,05,04,09,03,05,04,"+
        "05,05,05,05,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "05,05,02,00,01,05,05,"+
        "00,21,06,09,06,22,06,"+
        "21,06,23,00,24,06,22,"+
        "00,00,00,00,00,00,00,"+
        "24,24,00,07,00,23,23,"+
        "00,00,00,00,00,00,00 "
    ]
}));

// 11
Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "06,00,00,07,00,00,06,"+
        "05,04,03,05,04,03,05,"+
        "00,00,05,05,05,00,00,"+
        "01,00,00,07,00,00,02,"+
        "00,00,03,00,04,00,00,"+
        "05,05,05,00,05,05,05,"+
        "01,00,02,00,01,00,02,"+
        "00,00,06,09,06,00,00,"+
        "00,00,06,00,06,00,00,"+
        "00,00,25,00,25,00,00,"+
        "00,00,25,00,25,00,00,"+
        "04,00,00,02,00,00,00,"+
        "00,00,00,01,00,00,03 "
    ]
}));
// 12
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,00,05,06,05,00,00,"+
        "00,05,00,05,00,05,00,"+
        "45,45,45,00,45,45,45,"+
        "00,00,00,05,00,00,00,"+
        "00,00,03,06,04,00,00,"+
        "05,05,05,06,05,05,05,"+
        "00,05,00,06,00,05,00,"+
        "24,24,24,09,23,23,23,"+
        "00,00,00,06,00,00,00,"+
        "00,01,06,06,06,02,00,"+
        "00,45,00,00,00,45,00,"+
        "00,45,00,00,00,45,00,"+
        "00,08,00,07,00,08,00,"+
        "00,05,00,00,00,05,00,"+
        "00,00,00,01,00,02,00,"+
        "00,00,00,45,00,06,00,"+
        "00,00,00,45,00,06,00,"+
        "00,00,00,45,00,06,00,"+
        "00,00,00,45,00,06,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 13
Levels.add(levelMap.levels,Level.create({
    balls: 4,
    points: 4,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "05,05,05,05,05,05,05,"+
        "05,00,05,00,05,00,05,"+
        "00,05,00,05,00,05,00,"+
        "05,00,05,00,05,00,05,"+
        "00,05,00,05,00,05,00,"+
        "41,06,06,06,06,06,42,"+
        "00,41,00,00,00,00,00,"+
        "00,00,00,41,00,06,45,"+
        "44,00,00,41,00,06,45,"+
        "00,44,00,41,00,06,45,"+
        "00,00,44,41,00,06,45,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 14
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 25}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,41,06,42,00,00,"+
        "00,00,06,45,06,00,00,"+
        "00,00,45,06,45,00,00,"+
        "01,06,06,06,06,06,02,"+
        "00,05,05,05,05,05,00,"+
        "00,00,01,00,02,00,00,"+
        "00,01,00,00,00,02,00,"+
        "01,25,25,25,25,25,02,"+
        "00,06,00,00,00,06,00,"+
        "00,00,00,06,00,00,00,"+
        "00,25,00,06,00,25,00,"+
        "00,06,00,00,00,06,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

// 15
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "01,42,42,06,42,42,00,"+
        "04,00,00,00,00,00,02,"+
        "01,00,00,00,00,00,03,"+
        "04,00,00,00,00,00,02,"+
        "01,00,00,00,00,00,03,"+
        "04,00,00,00,00,00,02,"+
        "00,45,45,01,00,00,03 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
   balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,00,06,00,00,00,"+
        "00,00,06,25,06,00,00,"+
        "00,06,25,25,25,06,00,"+
        "06,25,25,25,25,25,06,"+
        "06,05,45,09,45,05,06,"+
        "00,06,05,45,05,06,00,"+
        "00,00,06,45,06,00,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,00,05,06,05,00,00,"+
        "00,05,05,06,05,05,00,"+
        "05,05,05,06,05,05,05,"+
        "00,05,05,09,05,05,00,"+
        "00,00,05,05,05,00,00,"+
        "00,00,00,05,00,00,00,"+
        "45,00,45,00,45,41,00,"+
        "45,45,45,00,45,45,00,"+
        "45,00,45,00,45,44,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,44,00,43,00,00,"+
        "00,00,42,45,41,00,00,"+
        "00,00,00,45,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,00,00,05,00,"+
        "00,00,00,00,05,00,00,"+
        "00,00,00,00,00,05,00,"+
        "00,00,00,00,00,05,00,"+
        "00,00,00,00,05,05,00,"+
        "00,00,00,00,05,00,00,"+
        "00,00,00,05,00,00,00,"+
        "00,06,25,25,25,06,00,"+
        "06,25,05,25,05,25,06,"+
        "25,25,25,03,25,25,25,"+
        "25,25,25,25,25,25,25,"+
        "06,25,05,05,05,25,06,"+
        "00,06,25,25,25,06,00,"+
        "00,00,06,25,06,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,45,25,05,25,45,00,"+
        "00,00,00,06,00,00,00,"+
        "06,00,45,06,45,00,06,"+
        "00,25,06,25,06,25,00,"+
        "05,00,05,06,05,00,05,"+
        "00,05,00,05,00,05,00,"+
        "01,06,00,09,00,06,02,"+
        "06,06,00,00,00,06,06,"+
        "00,00,05,06,05,00,00,"+
        "00,05,06,05,06,05,00,"+
        "00,05,06,05,06,05,00,"+
        "00,00,05,06,05,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 20
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,00,02,05,01,00,05,"+
        "05,00,00,06,00,00,05,"+
        "05,06,00,00,00,06,05,"+
        "05,05,06,00,06,05,05,"+
        "06,05,05,09,05,05,06,"+
        "00,00,00,00,00,00,00,"+
        "05,05,05,07,05,05,05 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec:  5}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "45,00,00,00,00,00,00,"+
        "00,45,45,00,45,05,05,"+
        "00,00,00,45,05,05,05,"+
        "00,00,00,00,05,25,25,"+
        "00,00,00,00,05,25,25,"+
        "01,00,00,00,05,25,25,"+
        "00,01,00,00,05,25,25,"+
        "00,00,00,25,00,00,00,"+
        "00,00,25,00,25,00,00,"+
        "00,06,00,06,00,06,00,"+
        "00,00,06,06,06,00,00,"+
        "00,00,00,06,00,00,00,"+
        "05,05,06,06,06,05,05,"+
        "06,05,05,06,05,05,06,"+
        "06,06,05,05,05,06,06,"+
        "06,06,05,05,05,06,06,"+
        "06,05,05,06,05,05,06,"+
        "05,05,06,06,06,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "06,05,06,06,06,05,06,"+
        "05,05,05,05,05,05,05,"+
        "05,05,05,09,05,05,05,"+
        "05,05,05,09,05,05,05,"+
        "05,05,05,09,05,05,05,"+
        "05,05,05,09,05,05,05,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,07,05,05,05,05,00,"+
        "00,00,00,05,00,00,00,"+
        "00,00,05,00,05,00,00,"+
        "00,06,06,06,06,06,00,"+
        "00,00,03,09,04,00,00,"+
        "00,00,00,00,00,00,00,"+
        "45,45,45,00,00,00,45,"+
        "06,06,06,41,00,45,07,"+
        "00,06,00,41,00,08,00,"+
        "00,09,00,42,00,45,00,"+
        "00,00,00,42,00,05,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 10,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "04,00,00,04,00,00,03,"+
        "05,04,03,05,04,03,05,"+
        "02,05,05,05,05,05,01,"+
        "06,02,05,05,05,01,06,"+
        "06,03,05,05,05,04,06,"+
        "03,05,01,00,02,05,04,"+
        "05,01,00,00,00,02,05 "
    ]
}));
// 25
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 40},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,06,00,06,00,06,00,"+
        "00,05,00,05,00,05,00,"+
        "00,05,05,05,05,05,00,"+
        "00,25,09,25,09,25,00,"+
        "00,25,25,06,25,25,00,"+
        "00,22,25,25,25,21,00,"+
        "00,00,22,25,21,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "03,05,04,00,03,05,04,"+
        "05,09,05,00,05,09,05,"+
        "02,05,01,00,02,05,01,"+
        "03,05,01,00,00,05,01,"+
        "05,01,00,00,00,05,00,"+
        "02,05,00,00,02,05,00,"+
        "00,05,00,00,00,05,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,03,00,00,03,"+
        "00,00,03,05,00,03,05,"+
        "00,03,05,05,05,05,05,"+
        "03,07,05,05,05,05,06,"+
        "02,05,05,05,05,05,05,"+
        "00,00,05,05,00,02,05,"+
        "00,00,00,02,00,00,02 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,05,00,00,00,05,00,"+
        "06,02,05,00,05,01,06,"+
        "00,06,02,05,01,06,00,"+
        "02,05,06,09,06,05,01,"+
        "06,02,05,06,05,01,06,"+
        "00,06,02,05,01,06,00,"+
        "00,00,06,06,06,00,00,"+
        "00,00,06,06,06,00,00,"+
        "00,06,03,05,04,06,00,"+
        "06,03,05,06,05,04,06,"+
        "03,05,06,00,06,05,04,"+
        "00,06,00,00,00,06,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,00,05,00,00,00,"+
        "00,03,05,05,05,04,00,"+
        "00,00,04,09,03,00,00,"+
        "00,00,04,00,03,00,00,"+
        "00,00,00,00,00,00,00,"+
        "02,05,01,00,02,05,01,"+
        "00,00,02,05,01,00,00,"+
        "00,00,06,06,06,00,00,"+
        "03,05,04,06,03,05,04,"+
        "05,09,05,09,05,09,05,"+
        "02,05,01,06,02,05,01,"+
        "00,00,06,06,06,00,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 30
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 30,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 40},
      {min: 0, sec: 25}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "05,05,00,00,00,05,05,"+
        "00,05,05,06,05,05,00,"+
        "00,00,05,05,05,00,00,"+
        "00,00,00,05,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,06,05,06,05,06,00,"+
        "02,05,06,05,06,05,01,"+
        "00,00,00,00,00,00,00,"+
        "00,08,00,09,00,08,00,"+
        "02,05,05,05,05,05,05,"+
        "00,02,01,00,02,01,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 32,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 40},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,03,05,04,00,00,"+
        "00,03,05,05,05,04,00,"+
        "00,05,45,05,45,05,00,"+
        "00,05,06,25,06,05,00,"+
        "00,05,06,25,06,05,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));



Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 40},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,01,03,05,04,02,00,"+
        "01,03,06,06,06,04,02,"+
        "00,05,06,09,06,05,00,"+
        "04,02,06,06,06,01,03,"+
        "00,04,02,05,01,03,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,00,06,05,00,06,05,"+
        "00,06,05,00,06,05,05,"+
        "06,05,00,06,05,05,06,"+
        "05,00,06,05,05,06,06,"+
        "00,06,05,05,06,06,05,"+
        "06,05,05,06,00,05,00,"+
        "00,05,00,00,00,05,00,"+
        "05,05,05,00,05,05,05,"+
        "00,05,05,05,05,05,00,"+
        "00,00,06,05,06,00,00,"+
        "00,06,05,06,05,06,00,"+
        "06,05,06,00,06,05,06,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "04,06,02,05,01,06,03,"+
        "05,04,06,09,06,03,05,"+
        "00,05,00,06,00,05,00,"+
        "00,00,02,06,01,00,00,"+
        "04,06,00,00,00,06,03,"+
        "05,04,06,09,06,03,05,"+
        "00,05,04,06,03,05,00,"+
        "00,06,05,00,05,06,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 35
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "00,00,45,06,00,45,00,"+
        "00,06,45,45,00,06,45,"+
        "00,45,06,00,00,45,06,"+
        "00,00,00,09,00,00,00,"+
        "23,25,25,25,25,25,24,"+
        "25,25,25,25,25,25,25,"+
        "05,05,05,05,05,05,05,"+
        "45,45,45,45,45,45,45,"+
        "22,25,25,25,25,25,21,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 8,
    points: 16,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "05,00,06,03,00,00,05,"+
        "05,00,03,05,06,03,00,"+
        "05,00,05,06,03,05,00,"+
        "02,05,05,00,05,00,00,"+
        "06,45,45,45,45,45,06,"+
        "06,45,45,45,45,45,00,"+
        "06,45,45,45,45,45,06,"+
        "06,45,45,45,45,45,06,"+
        "06,42,45,45,45,41,06,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 50,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,00,06,00,00,"+
        "04,00,06,00,00,00,03,"+
        "05,00,03,05,04,00,05,"+
        "05,05,05,09,05,05,05,"+
        "05,00,02,05,01,00,05,"+
        "01,00,00,00,06,00,02,"+
        "00,06,00,06,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 40},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "00,03,05,07,05,04,00,"+
        "03,05,06,06,06,05,04,"+
        "05,08,06,09,06,08,05,"+
        "02,05,06,06,06,05,01,"+
        "00,02,05,07,05,01,00,"+
        "00,00,02,05,01,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 45},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "00,05,01,00,05,01,00,"+
        "00,01,06,00,01,06,00,"+
        "04,06,06,03,00,04,06,"+
        "05,04,03,05,00,05,04,"+
        "00,00,00,00,00,00,00,"+
        "00,02,05,00,02,05,00,"+
        "00,06,02,00,06,02,00,"+
        "04,00,09,04,00,00,03,"+
        "05,04,00,05,04,03,05,"+
        "00,00,00,00,00,00,00,"+
        "00,03,00,03,09,04,00,"+
        "03,05,03,05,00,05,04,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 40
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,00,00,04,00,"+
        "00,06,03,00,02,05,04,"+
        "00,03,05,01,00,02,00,"+
        "06,00,01,06,04,00,06,"+
        "00,03,00,02,05,04,00,"+
        "03,05,01,00,02,06,00,"+
        "00,01,00,00,00,24,00,"+
        "00,00,06,00,22,25,24,"+
        "06,00,23,06,00,22,00,"+
        "06,23,25,21,00,00,00,"+
        "00,00,21,00,00,06,00,"+
        "00,00,00,24,00,00,00,"+
        "00,00,22,25,24,06,00,"+
        "06,00,00,22,00,24,00,"+
        "00,43,00,00,22,25,24,"+
        "43,45,41,06,00,22,00,"+
        "00,41,00,00,44,00,00,"+
        "06,00,00,42,45,44,00,"+
        "00,00,00,00,42,00,00,"+
        "00,43,00,06,00,43,00,"+
        "43,45,41,00,43,45,41,"+
        "00,41,00,06,06,41,00,"+
        "00,00,00,00,06,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,02,05,01,00,00,"+
        "00,00,00,06,00,00,00,"+
        "00,00,03,06,04,00,00,"+
        "00,03,05,06,05,04,00,"+
        "03,05,06,06,06,05,04,"+
        "05,06,03,06,04,06,05,"+
        "06,03,05,00,05,04,06,"+
        "03,05,00,00,00,05,04,"+
        "05,00,02,07,01,00,05,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 55,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "00,00,05,09,05,00,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,05,00,00,00,"+
        "02,05,00,05,00,05,01,"+
        "00,02,05,05,05,01,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "06,06,06,05,06,06,06,"+
        "06,06,06,05,06,06,06,"+
        "06,06,06,05,06,06,06,"+
        "00,00,03,05,04,00,00,"+
        "00,00,05,05,05,00,00,"+
        "00,00,05,08,05,00,00,"+
        "00,00,05,05,05,00,00,"+
        "00,00,05,05,05,44,00,"+
        "00,00,05,05,05,45,44,"+
        "00,00,05,05,05,45,45,"+
        "00,23,05,05,08,45,45,"+
        "23,25,08,05,05,45,45,"+
        "25,25,05,05,05,45,45,"+
        "25,25,05,05,05,45,45,"+
        "25,25,05,05,05,45,45,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,03,05,05,05,04,00,"+
        "03,05,06,06,06,05,04,"+
        "05,05,06,06,06,05,05,"+
        "02,05,06,06,06,05,01,"+
        "00,02,05,06,05,01,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,05,00,00,00 "
    ]
}));

// 45
Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "03,06,00,00,00,06,04,"+
        "02,04,06,06,06,03,01,"+
        "00,02,05,05,05,01,00,"+
        "00,00,04,00,03,00,00,"+
        "02,04,02,05,01,03,01,"+
        "00,05,00,00,00,05,00,"+
        "03,01,03,05,04,02,04,"+
        "00,00,01,00,02,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 15,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "06,00,00,00,00,00,00,"+
        "04,06,00,06,06,06,00,"+
        "05,04,06,04,04,04,06,"+
        "05,05,05,05,05,05,05,"+
        "05,01,00,01,00,02,06,"+
        "01,06,06,05,05,05,06,"+
        "06,00,00,06,06,06,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 35,
    points: 50,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap :  [
        "03,05,05,03,05,05,03,"+
        "05,00,05,05,00,05,05,"+
        "06,06,06,06,06,06,06,"+
        "03,05,05,03,05,05,03,"+
        "05,00,05,05,00,05,05,"+
        "06,06,06,06,06,06,06,"+
        "00,03,04,00,03,04,00,"+
        "00,05,05,00,05,05,00,"+
        "00,00,03,05,00,03,05,"+
        "00,03,05,05,03,05,05,"+
        "03,05,00,05,05,00,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));



Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,06,05,06,00,00,"+
        "00,06,03,05,04,06,00,"+
        "06,03,05,06,05,04,06,"+
        "03,05,06,06,06,05,04,"+
        "05,05,05,05,05,05,07,"+
        "05,05,05,05,05,07,05,"+
        "05,05,05,05,07,05,05,"+
        "05,05,05,07,05,05,05 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 45},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,02,04,"+
        "06,06,06,05,05,05,05,"+
        "03,01,00,00,00,03,01,"+
        "05,05,05,05,06,06,06,"+
        "02,04,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

// 50
Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 50,
    gridTranslation: true,
    timeLimit: {min: 3, sec: 0},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,06,05,00,05,05,00,"+
        "05,00,05,00,06,05,00,"+
        "06,05,05,00,00,00,00,"+
        "00,00,00,00,05,00,05,"+
        "05,00,06,00,06,00,00,"+
        "05,00,05,05,00,05,06,"+
        "00,00,00,00,00,05,00,"+
        "05,06,00,06,05,00,00,"+
        "00,00,05,00,00,05,00,"+
        "06,00,05,00,00,06,05,"+
        "00,05,00,00,05,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,05,00,05,00,05,"+
        "05,00,06,00,06,00,06,"+
        "00,05,00,05,00,05,00,"+
        "05,00,00,00,05,00,05,"+
        "00,06,05,00,05,00,00,"+
        "00,05,00,06,00,05,00,"+
        "05,06,00,05,00,00,05,"+
        "00,00,05,00,06,05,00,"+
        "00,00,00,00,00,00,00,"+
        "05,05,05,07,05,05,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "05,05,05,25,05,05,05,"+
        "05,00,00,06,43,45,05,"+
        "05,06,00,43,45,41,05,"+
        "25,45,45,09,41,00,25,"+
        "05,00,00,06,00,00,05,"+
        "05,06,00,00,00,06,05,"+
        "05,05,05,25,05,05,05 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "03,05,04,06,03,00,04,"+
        "00,05,00,00,05,05,05,"+
        "02,05,01,06,02,00,01,"+
        "06,00,06,06,06,00,06,"+
        "03,00,04,06,03,05,04,"+
        "05,05,05,00,00,05,00,"+
        "02,00,01,06,02,05,01 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 50,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 35},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,06,00,00,03,04,00,"+
        "00,00,06,00,05,05,00,"+
        "03,05,04,00,02,01,00,"+
        "02,05,01,00,00,06,00,"+
        "00,06,00,06,03,05,04,"+
        "03,05,04,06,02,05,01,"+
        "02,05,01,00,00,06,00,"+
        "00,06,00,06,03,05,04,"+
        "03,05,04,00,02,05,01,"+
        "02,05,01,06,06,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 100,
    gridTranslation: false,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,01,02,05,01,02,05,"+
        "01,00,00,06,00,00,02,"+
        "04,00,06,00,06,00,03,"+
        "05,06,00,09,00,06,05,"+
        "01,00,06,00,06,00,02,"+
        "04,00,00,06,00,00,03,"+
        "05,04,03,00,04,03,05 "
    ]
}));
// 55
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 70,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "00,04,00,05,00,03,00,"+
        "02,05,06,05,06,05,01,"+
        "00,06,00,05,00,06,00,"+
        "05,05,05,09,05,05,05,"+
        "00,06,00,05,00,06,00,"+
        "03,05,06,05,06,05,04,"+
        "00,01,00,05,00,02,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 5,
    points: 10,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "01,00,02,05,01,00,02,"+
        "00,01,06,06,06,02,00,"+
        "04,06,01,09,02,06,03,"+
        "05,06,00,00,00,06,05,"+
        "01,06,04,00,03,06,02,"+
        "00,04,00,00,00,03,00,"+
        "04,00,00,00,00,00,03 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 50,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 40},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,00,05,00,00,05,00,"+
        "00,05,00,05,05,00,05,"+
        "06,00,06,00,06,00,06,"+
        "00,05,05,00,05,05,00,"+
        "05,06,06,05,06,06,05,"+
        "00,05,05,06,05,05,00,"+
        "00,00,06,06,06,00,00,"+
        "00,05,05,00,05,05,00,"+
        "05,06,06,05,06,06,05,"+
        "05,06,06,05,06,06,05,"+
        "00,05,05,00,05,05,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 58
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 90,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,03,05,04,00,00,"+
        "00,05,00,05,00,05,00,"+
        "00,00,00,00,00,00,00,"+
        "01,01,06,07,06,02,02,"+
        "04,04,06,07,06,03,03,"+
        "01,01,06,07,06,02,02,"+
        "04,04,06,07,06,03,03,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 80,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,05,05,05,00,00,"+
        "00,04,00,00,00,03,00,"+
        "00,05,04,09,03,05,00,"+
        "00,00,05,06,05,00,00,"+
        "00,00,00,05,00,00,00,"+
        "05,00,02,05,01,00,05,"+
        "00,05,00,00,00,05,00,"+
        "00,00,01,01,02,00,00,"+
        "00,00,04,00,02,00,00,"+
        "05,00,04,03,03,00,05,"+
        "00,05,00,00,00,05,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 60
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 50,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,00,00,00,05,00,00,"+
        "00,00,00,05,05,05,00,"+
        "06,05,06,00,00,06,00,"+
        "00,05,05,05,00,05,00,"+
        "06,00,06,00,00,05,00,"+
        "05,05,00,05,06,05,06,"+
        "00,06,00,05,00,00,00,"+
        "05,00,00,06,00,05,00,"+
        "05,05,05,00,05,05,06,"+
        "00,00,00,00,00,05,00,"+
        "05,00,06,05,00,00,00,"+
        "05,05,00,00,00,06,00,"+
        "05,06,00,05,05,00,00,"+
        "00,00,00,00,05,00,05,"+
        "00,05,05,06,05,00,05,"+
        "00,05,05,00,00,00,05,"+
        "00,06,00,00,06,00,05,"+
        "00,05,05,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 20,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 50},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "06,00,00,00,03,04,00,"+
        "04,06,00,03,06,06,04,"+
        "05,04,06,05,05,05,05,"+
        "01,02,04,05,05,05,05,"+
        "00,06,02,05,05,05,05,"+
        "00,00,06,05,05,05,05,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 70,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "03,04,00,00,00,03,04,"+
        "02,05,04,06,03,05,01,"+
        "00,02,01,06,02,01,00,"+
        "00,06,06,09,06,06,00,"+
        "00,03,04,06,03,04,00,"+
        "03,05,01,06,02,05,04,"+
        "02,01,00,00,00,02,01 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 8,
    points: 12,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 25},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "06,06,06,05,06,06,06,"+
        "06,02,06,06,06,01,05,"+
        "06,06,03,05,04,06,06,"+
        "05,05,05,05,05,05,05,"+
        "05,05,05,07,05,05,05,"+
        "05,05,05,05,05,05,05,"+
        "02,05,05,05,05,05,01,"+
        "00,02,05,05,05,01,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,45,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));



Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 80,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "03,04,06,03,06,03,04,"+
        "02,05,04,05,03,05,01,"+
        "06,02,05,05,05,01,06,"+
        "02,05,05,05,05,05,04,"+
        "06,03,05,05,05,04,06,"+
        "03,05,01,05,02,05,04,"+
        "02,01,06,01,06,02,01 "
    ]
}));
// 65
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 70,
    gridTranslation: false,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "01,02,05,01,05,01,02,"+
        "04,06,02,06,01,06,03,"+
        "05,04,06,06,06,03,05,"+
        "04,06,06,06,06,06,02,"+
        "05,01,06,06,06,02,05,"+
        "01,06,03,06,04,06,02,"+
        "04,03,05,03,05,04,03 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 40,
    points: 60,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "01,05,00,07,00,05,02,"+
        "05,00,06,00,06,00,05,"+
        "00,06,03,05,04,06,00,"+
        "08,00,05,09,05,00,08,"+
        "00,06,02,05,01,06,00,"+
        "05,00,06,00,06,00,05,"+
        "04,05,00,07,00,05,03 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "06,06,06,05,05,05,01,"+
        "03,05,05,05,06,06,06,"+
        "06,06,06,05,05,05,01,"+
        "03,05,05,05,06,06,06,"+
        "06,06,06,05,05,05,01,"+
        "03,05,05,05,06,06,00,"+
        "00,06,06,05,05,05,01,"+
        "03,05,05,05,00,06,00,"+
        "00,06,06,05,05,05,01,"+
        "03,05,05,05,06,06,00,"+
        "00,06,00,05,05,05,01,"+
        "03,05,05,05,00,06,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 16,
    points: 16,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "00,00,05,06,05,00,00,"+
        "00,03,05,05,05,04,00,"+
        "05,05,05,05,05,05,05,"+
        "05,00,05,06,05,06,05,"+
        "05,06,05,06,05,00,05,"+
        "05,00,05,06,05,06,05,"+
        "05,06,05,06,05,00,05,"+
        "05,00,05,06,05,06,05,"+
        "05,06,41,06,05,00,05,"+
        "05,00,00,00,05,06,05,"+
        "45,00,00,00,05,00,00,"+
        "00,00,00,00,45,00,00,"+
        "00,00,00,00,45,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 35,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "00,03,05,09,05,04,00,"+
        "03,05,06,06,06,05,04,"+
        "05,06,03,06,04,06,05,"+
        "05,03,05,00,05,04,05,"+
        "05,05,00,00,00,05,05,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 70
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "45,45,45,45,45,45,45,"+
        "45,06,06,06,06,06,25,"+
        "45,06,05,05,05,06,25,"+
        "45,06,05,06,05,06,25,"+
        "45,06,05,06,06,06,25,"+
        "45,06,25,25,25,25,25,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 50,
    points: 80,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 40},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "25,06,00,05,00,06,25,"+
        "05,45,06,05,06,45,05,"+
        "25,06,00,05,00,06,25,"+
        "05,45,06,05,06,45,05,"+
        "25,06,00,05,00,06,25,"+
        "05,45,06,05,06,45,05,"+
        "25,00,00,05,00,00,25 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 4,
    points: 1,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 10},
    bestTime: [
      {min: 0, sec: 2},
      {min: 0, sec: 1}
    ],
    tilemap : [
        "05,00,05,00,05,00,05,"+
        "05,00,05,00,05,00,05,"+
        "05,00,05,00,05,00,05,"+
        "05,00,05,00,05,00,05,"+
        "05,00,05,00,05,00,05,"+
        "05,00,05,00,05,00,05,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,00,00,08,00,00,00,"+
        "03,00,00,00,00,45,00,"+
        "00,06,24,00,06,00,04,"+
        "00,00,00,05,00,00,41,"+
        "02,00,00,00,00,07,00,"+
        "00,06,00,24,05,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));



Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,06,05,05,05,06,00,"+
        "00,00,00,06,00,00,00,"+
        "05,05,05,06,05,05,05,"+
        "00,00,00,06,00,00,00,"+
        "00,06,05,05,05,06,00,"+
        "00,00,00,06,00,00,00,"+
        "05,05,05,06,05,05,05,"+
        "00,00,00,06,00,00,00,"+
        "00,06,05,05,05,06,00,"+
        "00,00,00,06,00,00,00,"+
        "05,05,05,06,05,05,05,"+
        "00,00,00,06,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 75
Levels.add(levelMap.levels,Level.create({
    balls: 15,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 10},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,05,00,05,00,00,"+
        "06,06,00,00,00,06,06,"+
        "02,05,00,06,00,05,01,"+
        "00,00,06,06,06,00,00,"+
        "00,00,03,05,04,00,00,"+
        "00,00,00,06,00,00,00,"+
        "03,05,05,06,05,05,04,"+
        "02,05,05,06,05,05,01,"+
        "00,00,06,06,06,00,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "05,06,05,00,00,00,00,"+
        "00,05,00,00,00,05,00,"+
        "00,00,00,00,05,06,05,"+
        "00,05,00,00,00,05,00,"+
        "05,06,05,00,00,00,00,"+
        "00,05,00,00,00,05,00,"+
        "00,00,00,00,05,06,05,"+
        "00,05,00,00,00,05,00,"+
        "05,06,05,00,00,00,00,"+
        "00,05,00,00,05,00,00,"+
        "00,00,00,05,06,05,00,"+
        "00,00,00,00,05,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 100,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 40},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "03,05,06,07,06,05,04,"+
        "08,25,06,00,06,25,08,"+
        "03,05,06,07,06,05,04,"+
        "00,25,06,00,06,25,00,"+
        "03,05,06,07,06,05,04,"+
        "00,25,06,00,06,25,00,"+
        "03,05,06,07,06,05,04 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 25,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,05,05,05,05,05,05,"+
        "00,05,00,06,06,06,00,"+
        "05,05,00,05,05,05,05,"+
        "00,06,06,05,00,00,00,"+
        "05,05,05,05,00,05,05,"+
        "00,00,06,06,06,05,00,"+
        "05,05,05,05,05,05,00,"+
        "00,00,00,06,06,06,06,"+
        "05,05,05,05,05,05,05,"+
        "00,00,06,06,06,00,00,"+
        "05,05,05,05,05,05,00,"+
        "00,00,06,06,06,05,00,"+
        "05,05,05,05,00,05,05,"+
        "06,06,06,05,00,00,00,"+
        "05,05,00,05,05,05,05,"+
        "06,05,00,00,06,06,06,"+
        "06,05,05,05,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 8,
    points: 12,
    gridTranslation: false,
    timeLimit: {min: 0, sec: 30},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "05,06,05,00,05,00,05,"+
        "06,00,00,06,00,00,00,"+
        "05,00,45,00,45,00,05,"+
        "00,06,00,06,00,06,00,"+
        "45,00,05,00,05,00,45,"+
        "00,00,00,06,00,00,06,"+
        "05,00,05,00,05,06,05 "
    ]
}));
// 80
Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 10},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "25,25,25,00,00,00,00,"+
        "00,25,00,06,06,00,00,"+
        "43,25,06,45,45,06,06,"+
        "23,25,25,25,25,25,25,"+
        "03,05,04,00,03,05,04,"+
        "05,25,05,00,05,25,05,"+
        "02,05,01,00,02,05,01 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "25,45,05,09,05,45,25,"+
        "25,45,05,05,05,45,25,"+
        "25,45,06,06,06,45,25,"+
        "25,45,45,45,45,45,25,"+
        "25,06,06,06,06,06,25,"+
        "25,25,25,25,25,25,25,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 8,
    points: 8,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,00,00,00,03,04,00,"+
        "00,00,00,00,02,01,00,"+
        "03,04,00,05,06,06,05,"+
        "02,01,00,02,05,05,01,"+
        "00,00,00,00,02,01,00,"+
        "05,06,06,05,00,00,00,"+
        "02,05,05,01,00,00,00,"+
        "00,02,01,00,00,03,04,"+
        "00,00,00,00,00,02,01,"+
        "03,04,00,00,00,00,00,"+
        "02,01,00,05,06,06,05,"+
        "00,00,00,02,05,05,01,"+
        "00,00,00,00,02,01,00,"+
        "00,00,00,00,00,00,00,"+
        "05,06,06,05,00,00,00,"+
        "02,05,05,01,00,03,04,"+
        "00,02,01,00,00,02,01,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 60,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,06,05,05,05,06,00,"+
        "03,06,05,09,05,06,04,"+
        "05,06,05,05,05,06,05,"+
        "05,00,06,06,06,00,05,"+
        "05,05,05,05,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "43,45,44,06,43,45,44,"+
        "45,06,45,45,45,06,45,"+
        "06,06,06,06,06,06,06,"+
        "45,06,45,45,45,06,45,"+
        "42,45,41,06,42,45,41,"+
        "05,05,05,05,05,05,05,"+
        "00,06,00,00,00,06,00 "
    ]
}));
// 85
Levels.add(levelMap.levels,Level.create({
    balls: 35,
    points: 70,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 15}
    ],
    tilemap : [
        "02,05,06,00,06,05,01,"+
        "00,02,05,06,05,01,00,"+
        "00,00,02,06,01,00,00,"+
        "00,00,03,06,04,00,00,"+
        "00,03,05,06,05,04,00,"+
        "03,05,06,00,06,05,04,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 15,
    points: 15,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "06,05,06,00,00,06,00,"+
        "00,06,00,00,06,05,06,"+
        "06,00,02,01,00,06,00,"+
        "05,06,03,04,00,02,01,"+
        "06,00,00,00,00,03,04,"+
        "02,01,00,03,04,00,06,"+
        "03,04,00,02,01,06,05,"+
        "00,00,00,00,00,00,06,"+
        "01,02,00,00,00,03,04,"+
        "04,03,01,02,00,02,01,"+
        "00,00,04,03,00,00,00,"+
        "00,06,00,00,00,01,02,"+
        "06,05,06,00,00,03,04,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 20},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "03,06,06,06,00,00,00,"+
        "05,03,03,03,06,00,00,"+
        "05,05,05,05,03,06,00,"+
        "05,05,05,05,05,06,00,"+
        "02,05,05,05,05,06,00,"+
        "06,02,05,05,01,06,00,"+
        "00,06,06,06,06,00,00"
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,02,05,05,05,05,06,"+
        "04,06,02,05,05,05,06,"+
        "05,04,00,02,05,05,06,"+
        "05,05,00,00,05,05,06,"+
        "05,05,04,00,02,05,06,"+
        "05,05,05,00,00,05,06,"+
        "05,05,01,00,06,05,06,"+
        "05,01,00,00,03,05,06,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 32,
    points: 48,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "00,05,06,06,06,05,00,"+
        "00,05,05,05,05,05,00,"+
        "06,00,00,00,00,00,06,"+
        "05,05,00,00,00,05,05,"+
        "06,05,00,09,00,05,06,"+
        "05,05,00,00,00,05,05,"+
        "06,00,00,00,00,00,06,"+
        "05,05,00,00,00,05,05,"+
        "06,05,00,00,00,05,06,"+
        "05,05,00,00,00,05,05,"+
        "06,00,00,00,00,00,06,"+
        "05,05,05,00,05,05,05,"+
        "06,06,05,00,05,06,06,"+
        "05,05,05,00,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,45,45,45,45,45,00,"+
        "00,45,00,00,00,45,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 90
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 34,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,03,05,05,05,04,00,"+
        "08,05,01,02,02,05,08,"+
        "08,05,01,00,03,05,08,"+
        "08,05,04,04,03,05,08,"+
        "08,02,05,05,05,01,08,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

/*
Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 22,
    gridTranslation: false,
    timeLimit: {min: 1, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "05,05,05,05,05,05,05,"+
        "05,05,05,05,05,05,01,"+
        "05,05,05,05,05,01,03,"+
        "05,05,05,05,01,03,05,"+
        "05,05,01,00,03,05,05,"+
        "05,01,03,05,05,05,05,"+
        "01,03,05,05,05,05,05 "
    ]
}));
*/


Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 25,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 40},
      {min: 0, sec: 30}
    ],
    tilemap : [
        "00,00,03,00,03,05,01,"+
        "00,06,05,00,00,00,00,"+
        "03,00,02,00,03,06,00,"+
        "05,03,05,01,05,00,03,"+
        "02,00,06,00,02,06,05,"+
        "00,03,05,01,00,00,02,"+
        "00,00,00,04,00,06,00,"+
        "00,06,00,05,00,00,00,"+
        "00,04,00,01,03,05,01,"+
        "00,05,06,06,00,00,06,"+
        "06,01,00,04,00,03,00,"+
        "00,00,00,05,06,05,00,"+
        "02,05,01,01,00,02,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,00,00,25,25,00,"+
        "06,06,00,00,25,25,00,"+
        "05,05,00,00,06,06,00,"+
        "05,05,00,00,25,25,00,"+
        "06,06,00,00,25,25,00,"+
        "45,45,00,00,06,06,06,"+
        "45,45,00,00,05,05,05,"+
        "06,06,06,00,05,05,05,"+
        "25,25,25,00,00,06,06,"+
        "25,25,25,00,00,45,45,"+
        "06,06,00,06,06,45,45,"+
        "05,05,00,25,25,00,00,"+
        "05,05,00,25,25,06,06,"+
        "00,00,00,00,00,45,45,"+
        "00,00,00,00,00,45,45,"+
        "00,00,00,00,00,00,00 "
    ]
}));


Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 8,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "45,41,06,06,03,03,03,"+
        "45,41,06,06,05,05,05,"+
        "45,41,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "05,04,06,25,25,25,00,"+
        "05,04,06,22,22,22,00,"+
        "05,04,00,00,00,00,00,"+
        "00,00,00,00,00,45,41,"+
        "06,24,24,24,06,45,41,"+
        "06,25,25,25,06,45,41,"+
        "06,00,00,00,00,00,00,"+
        "44,44,44,06,43,43,43,"+
        "05,05,05,06,05,05,05,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 20,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "05,05,05,06,05,05,05,"+
        "05,06,06,06,05,06,05,"+
        "05,05,05,06,05,06,05,"+
        "25,25,25,06,00,00,00,"+
        "06,06,25,06,25,25,25,"+
        "25,25,25,06,25,06,25,"+
        "00,00,00,06,25,06,25,"+
        "05,06,05,06,00,00,00,"+
        "05,06,05,06,45,45,45,"+
        "05,05,05,06,06,06,45,"+
        "00,00,00,06,45,45,45,"+
        "45,45,45,06,00,00,00,"+
        "45,06,45,06,45,06,45,"+
        "45,06,45,06,45,06,45,"+
        "00,00,00,00,45,45,45,"+
        "00,00,00,00,00,00,00 "
    ]
}));
// 95
Levels.add(levelMap.levels,Level.create({
    balls: 25,
    points: 35,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,00,03,05,04,00,00,"+
        "00,03,05,06,05,04,00,"+
        "03,05,06,06,06,05,04,"+
        "05,06,06,09,06,06,05,"+
        "02,05,06,06,06,05,01,"+
        "00,02,05,06,05,01,00,"+
        "00,03,05,00,05,04,00,"+
        "03,05,06,00,06,05,04,"+
        "05,06,00,09,00,06,05,"+
        "02,05,06,00,06,05,01,"+
        "00,02,05,00,05,01,00,"+
        "00,03,05,00,05,04,00,"+
        "03,05,06,00,06,05,04,"+
        "05,06,00,09,00,06,05,"+
        "02,05,06,00,06,05,01,"+
        "00,02,05,00,05,01,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 68,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 30},
      {min: 0, sec: 20}
    ],
    tilemap : [
        "00,00,00,06,03,04,06,"+
        "00,00,00,03,05,05,04,"+
        "00,00,00,02,05,05,01,"+
        "00,00,00,06,02,01,06,"+
        "06,03,04,06,00,00,00,"+
        "03,25,25,04,00,00,00,"+
        "02,25,25,01,00,00,00,"+
        "06,02,01,06,00,00,00,"+
        "00,00,00,06,23,24,06,"+
        "00,00,00,23,45,45,24,"+
        "00,00,00,22,45,45,21,"+
        "00,00,00,06,22,21,06,"+
        "06,43,44,06,00,00,00,"+
        "43,45,45,44,00,00,00,"+
        "42,45,45,41,00,00,00,"+
        "06,42,41,06,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 20,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 10},
      {min: 0, sec: 5}
    ],
    tilemap : [
        "00,00,23,25,24,00,00,"+
        "00,23,05,05,05,24,00,"+
        "23,25,00,05,25,05,24,"+
        "00,45,00,05,00,45,00,"+
        "45,45,45,05,45,45,45,"+
        "45,45,45,05,45,45,45,"+
        "45,45,45,05,45,45,45,"+
        "00,00,00,05,00,00,00,"+
        "00,00,06,05,06,00,00,"+
        "00,06,06,05,06,06,00,"+
        "06,06,03,05,04,06,06,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 8,
    points: 16,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 0},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "06,05,06,00,00,00,00,"+
        "05,05,05,00,00,00,00,"+
        "06,05,06,00,00,00,00,"+
        "00,00,00,00,06,05,06,"+
        "00,06,05,06,05,05,05,"+
        "00,05,05,05,06,05,06,"+
        "00,06,05,06,06,25,06,"+
        "06,45,06,00,25,25,25,"+
        "45,45,45,00,06,25,06,"+
        "06,45,06,00,00,00,00,"+
        "00,00,00,06,25,06,00,"+
        "06,05,06,25,25,25,00,"+
        "05,05,05,06,25,06,00,"+
        "06,05,06,00,00,00,00,"+
        "00,00,00,00,06,05,06,"+
        "00,00,00,00,05,05,05,"+
        "00,00,00,00,06,05,06,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 24,
    points: 48,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "06,00,00,06,05,05,00,"+
        "00,00,06,05,05,05,05,"+
        "06,00,00,00,05,05,00,"+
        "00,45,45,00,00,06,00,"+
        "45,45,45,45,06,00,00,"+
        "00,45,45,00,00,05,06,"+
        "00,00,06,00,05,05,05,"+
        "00,25,25,00,05,05,05,"+
        "25,25,25,25,00,05,00,"+
        "00,25,25,00,00,06,06,"+
        "00,00,06,00,25,25,00,"+
        "06,05,00,25,25,25,25,"+
        "05,05,05,00,25,25,00,"+
        "05,05,05,00,06,00,00,"+
        "00,05,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 10,
    points: 5,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 15},
      {min: 0, sec: 10}
    ],
    tilemap : [
        "03,05,03,05,03,05,04,"+
        "05,00,05,00,05,00,05,"+
        "02,05,02,05,02,05,01,"+
        "06,06,06,06,06,05,00,"+
        "03,05,04,05,03,05,04,"+
        "05,00,05,00,05,00,05,"+
        "01,05,01,05,02,05,01,"+
        "00,05,06,06,06,06,06,"+
        "03,05,03,05,03,05,04,"+
        "05,00,05,00,05,00,05,"+
        "02,05,02,05,02,05,01,"+
        "06,06,06,06,06,05,00,"+
        "03,05,04,05,04,05,04,"+
        "05,00,05,00,05,00,05,"+
        "02,05,01,05,01,05,01,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
/*
Levels.add(levelMap.levels,Level.create({
    balls: 4,
    points: 4,
    gridTranslation: true,
    timeLimit: {min: 1, sec: 30},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "05,05,06,00,06,05,05,"+
        "05,05,05,00,05,05,05,"+
        "06,05,01,00,02,05,06,"+
        "00,00,06,05,06,00,00,"+
        "01,00,05,05,05,00,02,"+
        "00,45,00,00,00,45,00,"+
        "01,00,00,00,00,00,02,"+
        "00,03,45,09,45,04,00,"+
        "00,45,06,06,06,45,00,"+
        "00,45,06,06,06,45,00,"+
        "00,45,06,06,06,45,00,"+
        "00,02,45,45,45,01,00,"+
        "04,00,00,00,00,00,03,"+
        "00,00,00,00,00,00,00 "
    ]
}));

Levels.add(levelMap.levels,Level.create({
    balls: 30,
    points: 40,
    gridTranslation: true,
    timeLimit: {min: 2, sec: 30},
    bestTime: [
      {min: 0, sec: 5},
      {min: 0, sec: 3}
    ],
    tilemap : [
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,03,05,04,00,00,"+
        "00,03,01,00,02,04,00,"+
        "03,01,00,00,00,02,04,"+
        "01,00,03,05,04,00,02,"+
        "00,03,01,06,02,04,00,"+
        "03,01,06,06,06,02,04,"+
        "01,06,03,06,04,06,02,"+
        "06,06,06,09,06,06,06,"+
        "04,06,02,06,01,06,03,"+
        "02,04,06,06,06,03,01,"+
        "00,02,04,06,03,01,00,"+
        "04,00,02,05,01,00,03,"+
        "02,04,00,00,00,03,01,"+
        "00,02,04,00,03,01,00,"+
        "00,00,02,05,01,00,00,"+
        "00,00,00,00,00,00,00,"+
        "00,00,00,00,00,00,00 "
    ]
}));
*/
        // ---------------
        // EVENTS ON --------------------


        // has to be triggered at the very end

        App.Events.on("init",app,function(){



           app.layers["currentLayer"] = "mainmenu";

           //Elements.append(document.body,logo);

           App.Layers.render(app,"mainmenu");
           App.Layers.render(app,"pausemenu");
           App.Layers.render(app,"winmenu");
           App.Layers.render(app,"losemenu");
           App.Layers.render(app,"admenu");

           App.Layers.show(app,"mainmenu");

           Shop.Events.trigger("init",shop);

           Level.Map.Events.trigger("init",levelMap,{});

           Audio.renderSpeaker(audios.status);



        });

        App.Events.on("viewchange",app,function(e){
            if(!e.pseudoLayer)
              App.Layers.hide(app,e.currentLayer);

        //set only buttons of current layer active
            app.layers["lastLayer"] = e.currentLayer;
            Buttons.setActive(app.layers[e.currentLayer].buttons,false);
            Buttons.setActive(app.layers[e.newLayer].buttons,true);

        });



        App.Events.on("click",app,function(e){

        //observe buttons related to current layer
            if(!!!e.currentLayer)
              Buttons.observe(app.layers["mainmenu"].buttons,e);
            else
              Buttons.observe(app.layers[e.currentLayer].buttons,e);

        });



        Shop.Events.on("init",shop,function(){


            Storage.overrideBalance(shop).then(() => {

              Storage.overrideEmojis(shop).then(() => {



              }).then(() => {

                  App.Layers.show(app,"shop"); // make imageData available

                    if(!!!shop.emojis[0].bought)
                      Shop.Emoji.buy(shop,shop.emojis[0]);

                    Storage.overrideSelectedEmoji(shop).then(() => {

                      Shop.Emoji.setSelected(shop,Shop.Emoji.getSelectedEmoji(shop));

                      Elements.setPixelRatio(shop.emoji.canvas);  // debug weird pixelratio bug


                        Shop.render(shop);

                        Shop.Emoji.getImageData(shop);

                        Elements.setPixelRatio(shop.emoji.canvas,1);  // debug weird pixelratio bug


                        App.Layers.show(app,"mainmenu");

                        setTimeout(() => {
                          //that.splashScreen.hide();
                        },800);



                    }).catch((e) => console.log("error: override"+e))



            }).catch((e) => console.log("error: overrideEmojis"+e))

          }).catch((e) => console.log("error: overrideBalance"+e))



        });

        Shop.Events.on("open",shop,function(){


            Elements.setPixelRatio(shop.emoji.canvas);
            Shop.Emoji.putImageData(shop);
            Text.changeContent(shop.iap.text[1], shop.balance+"    ");
            Shop.renderBalance(shop);
        });


        Shop.Events.on("close",shop,function(e){
          Shop.Emoji.setSelected(shop,Shop.Emoji.getSelectedEmoji(shop));
          Shop.Emoji.getImageData(shop);
          Elements.setPixelRatio(shop.emoji.canvas,1);  // debug weird pixelratio bug
        });

        Shop.Events.on("emojiclick",shop,function(e){

            var emoji = Shop.Emoji.clicked(shop.emoji.grid, Grid.clicked(shop.emoji.grid,e), e );


            if(!!emoji){

            var selected = Shop.Emoji.getSelectedEmoji(shop);
              if( Shop.Emoji.canBuy(shop.balance,emoji) ){
                  Shop.Emoji.buy(shop,emoji);
                  Shop.Emoji.select(shop,emoji);
              }else if( emoji.bought ){
                  Shop.Emoji.select(shop,emoji);
              }
              Shop.Emoji.renderArea(shop,{
                emoji: emoji
              });
              Shop.Emoji.renderArea(shop,{
                emoji: selected
              });
            }

         //   App.Layers.render(app,"shop");

        });

        Shop.Events.on("iapclick",shop,function(e){

            var iap = Shop.IAP.clicked(shop.iap.grid, Grid.clicked(shop.iap.grid,e), e );

            if(!!iap){
              iap.callback();
            }

        });

        Level.Map.Events.on("show",levelMap,function(){
           App.Layers.hide(app,"losemenu");
           App.Layers.hide(app,"winmenu");
            Level.Map.renderBalance(levelMap,shop);
        });


        Level.Map.Events.on("click",levelMap,function(e){

            var index = Level.clicked(levelMap.grid,Grid.clicked(levelMap.grid,e),e);

            if(index !== 0 && !index)
              return;

            if( Level.getLocked(levelMap.levels[index]) )
              return;

            Level.play(levelMap.levels[index],game);
            if(that.network.getConnection() && App.getAdsEnabled(app))
              that.showInterstitial();
        });

        Level.Map.Events.on("init",levelMap,function(){

           Level.setLocked(levelMap.levels[0],false);
           Storage.overrideLevels(levelMap.levels).then(() => {
             Level.Map.render(levelMap);
             Level.Map.renderTopBar(levelMap,shop);
           });
        });





        Game.Events.on("init",game,function(e){

if(e.level.index == 0)
  callback1();

if(e.level.index == 2)
  callback2();
            Game.Vars.setCurrentLevel(game,e.level);

            Level.Preview.modify(preview,game)
            .then(() => {
              Level.Preview.render(preview, preview.context);
              App.Layers.show(app,"preview");
            })

            Game.Vars.setInput(game, false);

            Game.Vars.Level.setAllSquares(game);

            Game.Vars.Level.setRounds(game)

            Game.renderBallText(game);

            Audio.setReady(audios,"bubble",true);

            Level.build(game);
            Balls.Text.set(game.balls,shop.emoji.selected);

            Squares.update(game.squares);


            switch(Game.Vars.getMode(game)){

              case "level":
                    Text.changeContent(game.topBar.text[1],e.level.index+1);
                    Bar.render(game.topBar,game.barContext);
                  break;
              case "score":
                    Bar.render(game.topBar,game.barContext);

                    Elements.renderArea({
                          position: {
                            x: game.topBar.text[1].position.x,
                            y: game.topBar.text[1].position.y
                          },
                          width: game.topBar.text[1].fontSize*2,
                          height: game.topBar.text[1].fontSize,
                          fillStyle:  game.topBar.fillStyle,
                          context: game.barContext
                      });
                      ScoreGame.renderBarText(sGame,game.barContext);

                  break;

            }


            Bar.render(game.bottomBar,game.barContext);


            Path.renderPauseSymbol({
              position: {
                x: game.topBar.buttons[0].position.x,
                y: game.topBar.buttons[0].position.y
              },
              size: game.topBar.buttons[0].height*.6,
              fillStyle: "dimgray"
            },game.barContext);

            Path.render(game.bottomBar.paths[0],game.barContext);
            Path.render(game.bottomBar.paths[1],game.barContext);

            Game.runCountdown(game);

            Game.run(game);

            LoadingBall.run(game,{
              position: {
                x: game.ball.initialX,
                y: game.ball.initialY
              },
              radius: game.ball.radius,
              circles: null,
              bgColor: "#fff",
              fgColor:  "#1f1f1f"
            },game.barContext);

            if( ( !that.network.getConnection() && App.getAdsEnabled(app) ) || !App.getAdsEnabled(app)  ){
              LoadingBall.clear(game);
              Game.Vars.setInput(game, true);
            }else{
              Game.Events.trigger("pausestart",game,{});
            }

            App.Layers.show(app,"game");


        });


        Game.Events.on("touchstart",game,function(e){

            Touch.vars.start.x = e.clientX;
            Touch.vars.start.y = e.clientY;
            Game.clearBallText(game.ballText,game.barContext);
        });

        Game.Events.on("touchmove",game,function(e){

            Touch.vars.move.x = e.clientX;
            Touch.vars.move.y = e.clientY;

            if(Game.needsInput(game)){
              TouchStreak.render({
                start: Touch.vars.start,
                move: Touch.vars.move,
                context: game.streakContext,
                ball: game.ball
              });
              BallStreak.render(game.ball,{
                start: Touch.vars.start,
                move: Touch.vars.move,
                context: game.streakContext
              });
            }
        });

        Game.Events.on("touchend",game,function(e){


            if(Game.needsInput(game)){

              var angle = Calculator.streakAngle({
                start: Touch.vars.start,
                move: Touch.vars.move,
              });

              if(Calculator.angleConstraint(angle)){


             Game.clearBallText(game.ballText,game.barContext);
              Game.Vars.setIsActive(game,true);
              Balls.shoot(game,game.balls,game.timer,game.ball.speed);
             Game.Vars.setInput(game,false);
              Game.Vars.clearReadyBalls(game);

              }
            }

            TouchStreak.clear(game.streakContext);
            Touch.resetVars();
        });


        Game.Events.on("newround",game,function(){


          Game.Vars.clearNewSquares(game);
          Game.Vars.setIsActive(game,false);

          Timer.clear(game.timer,game.shootTimeouts);
          Game.Vars.clearShootTimeouts(game);
          Balls.setMask(game.balls,0x0002);
          Balls.setVelocity(game.balls,{x:0,y:0});

          Timer.setInterval2(game.timer,15,function(){
             Balls.translateToPoint(game.balls,{
                 x: game.ball.initialX,
                 y: game.ball.initialY-.5
             },.2)
          },50);

          game.newRoundTimeout = Timer.setDelay(game.timer,900,function(){

            Balls.setMask(game.balls,0x0001);

            Squares.outsource(game);

            if(Game.squaresDown(game)){
              Game.Events.trigger("lose",game,{});
            }else{
              Audio.play(audios,"new-round");
              Game.newRound(game);
            }


          });



        });


        Game.Events.on("lose",game,function(){

            Game.stop(game);
            if(!Game.Vars.getAdUsed(game) && that.network.getConnection())
              Game.Events.trigger("admenu",game,{});
            else
              Game.Events.trigger("lost",game,{});
        });

        Game.Events.on("lost",game,function(){
            Audio.play(audios,"menu");
            Game.Events.trigger("pausestart",game,{});
            LoseMenu.run(app,game,game.loseMenu);
            Timer.clear(game.timer,game.countdown);
            Timer.clear(game.timer,game.countdownTimeout);
        });

        Game.Events.on("admenu",game,function(){


            Audio.play(audios,"menu");
            Game.Events.trigger("pausestart",game,{});
            Game.Vars.setAdUsed(game,true);
            App.Layers.show(app,"admenu");

            Counter.run(adMenu,game.timer,app,game);

        });

        Game.Events.on("win",game,function(){

            switch(Game.Vars.getMode(game)){

                case "level":

                  Game.Events.trigger("pausestart",game,{});
                  Levels.set(levelMap.levels,Level.getByIndex(levelMap.levels,game.currentLevel.index),game,levelMap.context);
                  Shop.settleBalance(shop,Game.getMetrics(game).gems);
                  Audio.play(audios,"menu");
                  WinMenu.run(app,game,game.winMenu);

                    break;

                case "score":

                  Shop.settleBalance(shop,Game.getMetrics(game).gems);
                  ScoreGame.increaseScore(sGame);
                  if( ScoreGame.getScore(sGame) > ScoreGame.getBest(sGame) )
                    ScoreGame.setBest(sGame, ScoreGame.getScore(sGame) );

                  Game.Events.trigger("close",game,{});
                  Game.Events.trigger("init",game,{
                      level: ScoreGame.randomizeLevel(sGame,game)
                  });

                    break;
            }
        });

        Game.Events.on("close",game,function(){
            Game.clear(game);
        });

        Game.Events.on("pausemenu",game,function(){
            // Audio.play(audios,"menu");
            Game.Events.trigger("pausestart", game, {});
            App.Layers.show(app,"pausemenu");
        })

        Game.Events.on("pausestart",game,function(){
            Game.startPause(game);
        });

        Game.Events.on("pauseend",game,function(){
            Game.endPause(game);
        });

        Game.Events.on("replay",game,function(){
          var index = game.currentLevel.index,
              levels = levelMap.levels;

          App.Layers.hide(app,"pausemenu");
          Game.Events.trigger("close",game);
          Game.Events.trigger("init",game,{
            level: Level.getByIndex(levels,index)
          });

          if(that.network.getConnection() && App.getAdsEnabled(app))
            that.showInterstitial();
        });



        Matter.Events.on(game.engine, "collisionEnd", function(e){

          var pairs = e.pairs,
              pair,
              bodyA,// always circle
              bodyB;

          for(let i=0; i<pairs.length; i++){

            pair = pairs[i];

            if(pair.bodyA.label === "Square" ||
               pair.bodyA.label === "Triangle"){
                if(pair.bodyB.label === "Ball"){
                    bodyA = pair.bodyB;
                    bodyB = pair.bodyA;
                }else{
                    continue;
                }
            }else if(pair.bodyB.label === "Square" || pair.bodyB.label === "Triangle"){
                if(pair.bodyA.label === "Ball"){
                    bodyA = pair.bodyA;
                    bodyB = pair.bodyB;
                }else{
                    continue;
                }
            }else{
                continue;
            }

            Square.hit(game,bodyB);


          }

        });

        Matter.Events.on(game.engine, "collisionStart", function(e){

          var pairs = e.pairs,
              pair,
              bodyA,// always circle
              bodyB;

          for(let i=0; i<pairs.length; i++){

            pair = pairs[i];

            if(pair.bodyA.label === "Floor"){
                if(pair.bodyB.label === "Ball"){
                    bodyA = pair.bodyB;
                    bodyB = pair.bodyA;
                }else{
                    continue;
                }
            }else if(pair.bodyB.label === "Floor"){
                if(pair.bodyA.label === "Ball"){
                    bodyA = pair.bodyA;
                    bodyB = pair.bodyB;
                }else{
                    continue;
                }
            }else{
                continue;
            }

            Ball.Text.setRotating(bodyA,false);
            Ball.Text.setRotation(bodyA,0);
            Body.setVelocity(bodyA,{x: 0,y: 0});
            Game.Vars.addCollidingBall(game,bodyA);
            Ball.setReady(bodyA,true);
            Game.Vars.addReadyBall(game,bodyA);
             if(Game.Vars.getReadyBalls(game).length >= Game.Vars.getBalls(game).length){
                Game.Events.trigger("newround",game,{});
            }


          }

        });

        Matter.Events.on(game.engine, "collisionStart", function(e){

          var pairs = e.pairs,
              pair,
              bodyA,// always ball
              bodyB;

          for(let i=0; i<pairs.length; i++){

            pair = pairs[i];

            if(pair.bodyA.label === "Gem"){
                if(pair.bodyB.label === "Ball"){
                    bodyA = pair.bodyB;
                    bodyB = pair.bodyA;
                }else{
                    continue;
                }
            }else if(pair.bodyB.label === "Gem"){
                if(pair.bodyA.label === "Ball"){
                    bodyA = pair.bodyA;
                    bodyB = pair.bodyB;
                }else{
                    continue;
                }
            }else{
                continue;
            }
            Game.Vars.addBallGemCollision(game,{
                body: bodyA,
                velocity: Object.assign({},bodyA.velocity)
            });
            Audio.play(audios,"gem");
            Gem.fadeOut(bodyB,game);


          }

        });

        Matter.Events.on(game.engine, "collisionStart", function(e){

          var pairs = e.pairs,
              pair,
              bodyA,// always ball
              bodyB;

          for(let i=0; i<pairs.length; i++){

            pair = pairs[i];

            if(pair.bodyA.label === "Spreader"){
                if(pair.bodyB.label === "Ball"){
                    bodyA = pair.bodyB;
                    bodyB = pair.bodyA;
                }else{
                    continue;
                }
            }else if(pair.bodyB.label === "Spreader"){
                if(pair.bodyA.label === "Ball"){
                    bodyA = pair.bodyA;
                    bodyB = pair.bodyB;
                }else{
                    continue;
                }
            }else{
                continue;
            }


            Body.setPosition(bodyA,bodyB.position);
            Ball.setMask(bodyA, 0x0008);
            Game.Vars.addBallSpreaderCollision(game,{
                bodyA: bodyA,
                bodyB: bodyB,
                spreaded: false
            });


          }

        });

        Matter.Events.on(game.engine, "afterTick", function(e){

          var body,
              balls = game.collidingBalls;

          for(let i=0; i<balls.length; i++){
              body = balls[i];
              body.positionImpulse.y = 0;
              game.ball.initialX = body.position.x;
              balls.splice(i,1);
          }

          Balls.Text.rotate(game.balls,40);


          var bgc = game.ballGemCollisions;

          for(let i=0; i<bgc.length; i++){
              body = bgc[i].body;
              Body.setVelocity(body,bgc[i].velocity);
              bgc.splice(i,1);
          }

          Spreaders.collisionEnd(game,game.ballSpreaderCollisions);

        });

        Matter.Events.on(game.render, "afterRender", function(e){


          var context = e.source.context;

          Square.Dust.run(Game.Vars.getSquareDust(game),game,context); Render.ballText(game.balls,context,shop.selected);
          Render.ballText(game.balls,context,shop.selected);
          Spreaders.render(game.spreaders,context);
          Render.gemText(game.gems,context);

          Render.squareText(game.squares,context);
        });






        // ---------
        // TRIGGERING EVENTS -------------



        document.addEventListener("click",function(e){

            App.Events.trigger("click",app,{
                currentLayer: app.layers['currentLayer'],
                clientX: e.clientX,
                clientY: e.clientY
            });

        })


        shop.emoji.canvas.addEventListener("click",function(e){

          Shop.Events.trigger("emojiclick",shop,{clientX: e.clientX, clientY: e.clientY - cHeight*.4 + shop.emoji.div.scrollTop});
        });
        shop.iap.canvas.addEventListener("click",function(e){
          Shop.Events.trigger("iapclick",shop,e);
        });


        levelMap.canvas.addEventListener("click",function(e){
            Level.Map.Events.trigger("click",levelMap,{
                clientX: e.clientX,
                clientY: e.clientY + levelMap.div.scrollTop
            });

        });



        game.touchCanvas.addEventListener("touchstart",function(e){

            Game.Events.trigger("touchstart",game,{
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });

        });

        game.touchCanvas.addEventListener("touchmove",function(e){

            Game.Events.trigger("touchmove",game,{
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });

        });

        game.touchCanvas.addEventListener("touchend",function(e){

            Game.Events.trigger("touchend",game,{});

        });


        document.addEventListener('admob.interstitial.open', () => {
          if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "levelmap" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "winmenu"){
            Game.Events.trigger("pausestart",game,{});
          }
        });
        document.addEventListener('admob.interstitial.load', () => {

          if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "levelmap" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "winmenu" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "pausemenu" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "losemenu" ){

               Game.Events.trigger("pauseend",game,{});
               Grid.fadeIn(game,game.grid,game.timer,20);
               LoadingBall.clear(game);
               Game.Vars.setInput(game, true);
          }


        })
        document.addEventListener('admob.interstitial.load_fail', () => {
      //    if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "admenu"){
      //      Error2.throw(errors,"adNotLoad");
      //      Game.Events.trigger("pauseend",game,{});
      //    }
          if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "levelmap" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "winmenu" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "pausemenu" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "losemenu" ){

                Game.Events.trigger("pauseend",game,{});
                Grid.fadeIn(game,game.grid,game.timer,20);
                LoadingBall.clear(game);
                Game.Vars.setInput(game, true);
          }

        });
        document.addEventListener('admob.interstitial.close', () => {
        //  if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "admenu"){
        //    Game.Events.trigger("pauseend",game,{});
//
        //  }
          if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "levelmap" ||
             App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "winmenu"){
          //  Game.Events.trigger("pauseend",game,{});
          }
        });


        document.addEventListener('admob.reward_video.load', () => {
            if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "admenu"){

            }
        });
        document.addEventListener('admob.reward_video.load_fail', () => {
            // input hasnt been set to true yet, because admenu interrupted normal call to newround, which would set input to true
            if(App.getCurrentLayer(app) === "game" && App.getLastLayer(app) === "admenu" && !Game.needsInput(game)){
                Game.Events.trigger("pauseend",game,{});
                Game.Vars.setInput(game, true);

                if( !that.network.getConnection() )
                  Error2.throw(errors,"adNotLoad");


                if(Game.squaresDown(game))
                  Game.Events.trigger("lose",game,{});
            }
        });
        document.addEventListener('admob.reward_video.complete', () => {
          switch(App.getCurrentLayer(app)){
            case  "game":
              Game.revive(game);
            //  Game.newRound(game);
              //0 Game.Vars.setInput(game, true);
                break;
            case "shop":
              Shop.settleBalance(shop,20);
              Text.changeContent(shop.iap.text[1], shop.balance+"    ");
              Shop.renderBalance(shop);
                break;
          }
        });
        document.addEventListener('admob.reward_video.close', () => {
            if(App.getCurrentLayer(app) === "game"){
              Game.Events.trigger("pauseend",game,{});
              Game.Vars.setInput(game, true);

              if(Game.squaresDown(game))
                Game.Events.trigger("lose",game,{});

            }

        });







        setTimeout(() => {


            App.Events.trigger("init",app);



        },300);

















}
