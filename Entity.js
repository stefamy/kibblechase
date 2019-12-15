var bones = [];

Entity = function() {
  var self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id: ""
  };
  self.update = function() {
    self.updatePosition();
  };
  self.updatePosition = function() {
    self.x += self.spdX;
    self.y += self.spdY;
  };
  self.getDistance = function(pt) {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
  };
  return self;
};

Entity.getFrameUpdateData = function() {
  var pack = {
    player: Player.update(),
    truck: Truck.update(truck)
  };
  return pack;
};

Truck = function() {
  var self = Entity();
  self.spdX = 15;
  self.level = Math.floor(Math.random() * 2);
  self.y = self.level * 275 + 200;
  self.facingRight = true;

  var super_update = self.update;
  self.update = function() {
    self.updateDirection();
    super_update();
  };

  self.updateDirection = function() {
    if (self.x > 900 || self.x < -150) {
      self.spdX = -self.spdX;
      self.facingRight = !self.facingRight;
      self.level = Math.floor(Math.random() * 2);
      self.y = self.level * 275 + 200;
    }
  };
  return self;
};

Truck.update = function(truck) {
  var pack = [];
  truck.update();
  for (i = 0; i < bones.length; i++) {
    bones[i].update();
    bones[i].checkCollision();
    if (bones[i].life > 120) {
      destroyElem(bones, bones[i]);
    }
  }
  if (Math.random() > 0.9) {
    bones.push(Bone(truck));
  }
  pack.push({
    x: truck.x,
    y: truck.y,
    facingRight: truck.facingRight,
    bones: bones
  });
  return pack;
};

var truck = Truck();

function Bone(parent) {
  var self = Entity();
  self.x = parent.x;
  self.y = parent.y;
  self.originalY = parent.y;
  self.originalX = parent.x;
  self.spdX = 1 + getRandomInt(3);
  self.spdY = 1 + getRandomInt(3);
  self.life = 0;
  if (Math.random() < 0.5) {
    self.spdY = -self.spdY;
  }
  if (Math.random() < 0.5) {
    self.spdX = -self.spdX;
  }
  self.frame = 1 + getRandomInt(3);

  var super_update = self.update;
  self.update = function() {
    self.updateDirection();
    self.life++;
    super_update();
  };

  self.updateDirection = function() {
    if (
      Math.abs(self.originalY - self.Y) > 10 ||
      Math.abs(self.originalX - self.x) > 40
    ) {
      self.spdX = 0;
      self.spdY = 0;
    }
  };

  self.checkCollision = function() {
    for (var i in Player.list) {
      var p = Player.list[i];
      if (self.getDistance(p) < 32) {
        p.score += 1;
        self.life = 120;
      }
    }
  };

  return self;
}

function destroyElem(lst, elem) {
  var i;
  for (i = 0; i < lst.length; i += 1) {
    if (lst[i] === elem) {
      lst[i] = null;
      lst.splice(i, 1);
      break;
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

Player = function(id) {
  var self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.score = 0;
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.maxSpd = 10;
  self.facingRight = true;
  self.level = Math.floor(Math.random() * 3) + 1;
  self.y = self.level * 200 - 100;

  var super_update = self.update;
  self.update = function() {
    self.updateSpd();
    super_update();
  };

  self.updatePosition = function() {
    self.x += self.spdX;
    self.y += self.spdY;
  };

  self.updateSpd = function() {
    if (self.pressingRight) {
      self.spdX = self.maxSpd;
      self.facingRight = true;
    } else if (self.pressingLeft) {
      self.spdX = -self.maxSpd;
      self.facingRight = false;
    } else self.spdX = 0;
    if (self.pressingUp) self.spdY = -self.maxSpd;
    else if (self.pressingDown) self.spdY = self.maxSpd;
    else self.spdY = 0;
  };
  Player.list[id] = self;
  return self;
};
Player.list = {};
Player.onConnect = function(socket) {
  var player = Player(socket.id);
  socket.on("keyPress", function(data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
  });
};
Player.onDisconnect = function(socket) {
  delete Player.list[socket.id];
};
Player.update = function() {
  var pack = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    player.update();
    pack.push({
      x: player.x,
      y: player.y,
      score: player.score,
      facingRight: player.facingRight,
      number: player.number
    });
  }
  return pack;
};
