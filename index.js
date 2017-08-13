/**
 * Created by Goofy on 2017/7/29.
 */

var canvas = document.querySelector('#BiuBiuBee');
var ctx = canvas.getContext && canvas.getContext('2d');

var Starfield = function(speed, opacity, numStars, clear) {
  var stars = document.createElement('canvas');
  stars.width = Game.width;
  stars.height = Game.height;

  var starCtx = stars.getContext('2d');
  var offset = 0;

  if (clear) {
    starCtx.fillStyle = '#000';
    starCtx.fillRect(0, 0, stars.width, stars.height);
  }
  starCtx.fillStyle = '#FFF';
  starCtx.globalAlpha = opacity;
  for (var i = 0; i < numStars; i++) {
    starCtx.fillRect(
      Math.floor(Math.random() * stars.width),
      Math.floor(Math.random() * stars.height),
      2,
      2
    )
  }
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;
    if (intOffset > 0) {
      ctx.drawImage(stars, 0, remaining, stars.width, intOffset, 0, 0, stars.width, intOffset);
    }
    if (remaining > 0) {
      ctx.drawImage(stars, 0, 0, stars.width, remaining, 0, intOffset, stars.width, remaining)
    }
  }

  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  }
}

var TitleSceen = function(title, subtitle, callback) {
  this.step = function(dt) {
    if (Game.keys['fire'] && callback) {
      callback();
    }
  }
  this.draw = function(ctx) {
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(title, Game.width / 2, Game.height / 2);
    ctx.font = 'bold 20px Arial';
    ctx.fillText(subtitle, Game.width / 2, Game.height / 2 + 40);
  }
}

var SpriteSheet = new function() {
  this.map = {};
  this.load = function(spriteData, callback) {
    this.map = spriteData;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = './src/img/sprites.png';
  };
  this.draw = function(ctx, sprite, x, y, frame) {
    var s = this.map[sprite];
    if (!frame) {
      frame = 0;
    }
    ctx.drawImage(this.image, s.sx + frame * s.w, s.sy, s.w, s.h, x, y, s.w, s.h);
  }
};

var Game = new function() {
  var self = this;
  // 初始化
  this.initialize = function(canvasElementId, spriteData, callback) {
    this.canvas = document.querySelector(canvasElementId);
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');

    if (!ctx) {
      // 不支持2d上下文设置，提示用户
      return alert('请升级你的浏览器');
    }

    SpriteSheet.load(spriteData, callback);

    var KEY_CODES = {
      37: 'left',
      39: 'right',
      32: 'fire'
    };

    this.keys = {};
    this.setupInput = function() {
      window.addEventListener('keydown', function(e) {
        if (KEY_CODES[e.keyCode]) {
          self.keys[KEY_CODES[e.keyCode]] = true;
          e.preventDefault();
        }
      }, false);
      window.addEventListener('keyup', function(e) {
        if (KEY_CODES[e.keyCode]) {
          self.keys[KEY_CODES[e.keyCode]] = false;
          e.preventDefault();
        }
      }, false)

    }

    this.setupInput();

    this.loop();
  };

  var boards = [];
  this.loop = function() {
    var dt = 300 / 1000;
    for (var i = 0, len = boards.length; i < len; i++) {
      if (boards[i]) {
        boards[i].step(dt);
        boards[i] && boards[i].draw(self.ctx);
      }
    }
    setTimeout(self.loop, 30);
  };

  this.setBoard = function(num, board) {
    boards[num] = board;
  }
};

// function startGame() {
//   // 开始游戏
//   SpriteSheet.load({
//         ship: {sx: 0, sy: 0, w: 18, h: 35, frames: 3},
//       },
//       function () {
//         SpriteSheet.draw(ctx, "ship", 0, 0);
//         SpriteSheet.draw(ctx, "ship", 100, 50);
//         SpriteSheet.draw(ctx, "ship", 150, 100, 1);
//       }
//   )
// }

var sprites = {
  ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
  missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
  enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
  enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
  explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
  enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1, }
};
var playGame = function() {
  // Game.setBoard(3, new TitleSceen('BiuBiuBee Invasion', 'Game Started'));
  Game.setBoard(3, new PlayerShip());
}
var startGame = function() {
  // SpriteSheet.draw(Game.ctx,"ship",100,100,0);
  Game.setBoard(0, new Starfield(20, 0.4, 100, true));
  Game.setBoard(1, new Starfield(50, 0.6, 100));
  Game.setBoard(2, new Starfield(100, 1, 50));
  Game.setBoard(3, new TitleSceen('BiuBiuBee', 'Press space to start playing', playGame));
}
window.addEventListener('load', function() {
  Game.initialize('#BiuBiuBee', sprites, startGame)
})

var PlayerShip = function() {
  this.w = SpriteSheet.map['ship'].w;
  this.h = SpriteSheet.map['ship'].h;
  this.x = Game.width / 2 - this.w / 2;
  this.y = Game.height - 10 - this.h;
  this.vx = 0;
  this.maxVel = 200;
  this.step = function(dt) {
    if (Game.keys['left']) {
      this.vx = -this.maxVel;
    } else if (Game.keys['right']) {
      this.vx = this.maxVel;
    } else {
      this.vx = 0;
    }

    this.x += this.vx + dt;

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > Game.width - this.w) {
      this.x = Game.width - this.w;
    }
  }
  this.draw = function(ctx) {
    SpriteSheet.draw(ctx, 'ship', this.x, this.y)
  }
}

var GameBoard = function() {
  var board = this;

  // The current list of objects
  this.objects = [];
  this.cnt = {};

  // Add a new object to the object list
  this.add = function(obj) {
    obj.board = this;
    this.objects.push(obj);
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
    return obj;
  };

  // Mark an object for removal
  this.remove = function(obj) {
    var idx = this.removed.indexOf(obj);
    if (idx == -1) {
      this.removed.push(obj);
      return true;
    } else {
      return false;
    }
  };
  // this.remove = function(obj) {
  //   var wasStillAlive = this.removed.indexOf(obj) != -1;
  //   if (wasStillAlive) {
  //     this.removed.push(obj);
  //   }
  //   return wasStillAlive;
  // };

  // Reset the list of removed objects
  this.resetRemoved = function() { this.removed = []; };

  // Removed an objects marked for removal from the list
  this.finalizeRemoved = function() {
    for (var i = 0, len = this.removed.length; i < len; i++) {
      var idx = this.objects.indexOf(this.removed[i]);
      if (idx != -1) {
        this.cnt[this.removed[i].type]--;
        this.objects.splice(idx, 1);
      }
    }
  };

  // Call the same method on all current objects 
  this.iterate = function(funcName) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, len = this.objects.length; i < len; i++) {
      var obj = this.objects[i];
      obj[funcName].apply(obj, args);
    }
  };

  // Find the first object for which func is true
  this.detect = function(func) {
    for (var i = 0, val = null, len = this.objects.length; i < len; i++) {
      if (func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

  // Call step on all objects and them delete
  // any object that have been marked for removal
  this.step = function(dt) {
    this.resetRemoved();
    this.iterate('step', dt);
    this.finalizeRemoved();
  };

  // Draw all the objects
  this.draw = function(ctx) {
    this.iterate('draw', ctx);
  };

  // Check for a collision between the 
  // bounding rects of two objects
  this.overlap = function(o1, o2) {
    return !((o1.y + o1.h - 1 < o2.y) || (o1.y > o2.y + o2.h - 1) ||
      (o1.x + o1.w - 1 < o2.x) || (o1.x > o2.x + o2.w - 1));
  };

  // Find the first object that collides with obj
  // match against an optional type
  this.collide = function(obj, type) {
    return this.detect(function() {
      if (obj != this) {
        var col = (!type || this.type & type) && board.overlap(obj, this);
        return col ? this : false;
      }
    });
  };


};