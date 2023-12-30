const containerId = 'container';
const windowHeight = window.innerHeight;
const paddingTop = 200;
const containerWidth = document.querySelector('.app-body').offsetWidth;
const imgSize = document.querySelector('#container').offsetWidth;
const containerCenterY = imgSize / 2;
let savedImage;

TouchEmulator();
Konva.hitOnDragEnabled = true;
Konva.captureTouchEventsEnabled = true;

let stage = new Konva.Stage({
  container: 'container',
  width: imgSize,
  height: imgSize,
});

let layer1 = new Konva.Layer();
let layer2 = new Konva.Layer();
let transformer = new Konva.Transformer();
let yoda;

stage.add(layer1, layer2);

var photo = new Image();
photo.onload = function () {
  var realWidth = photo.width;
  var realHeight = photo.height;
  var newHeight = (realHeight * imgSize) / realWidth;
  var newWidth = imgSize;

  if (newHeight > imgSize + newHeight / 2) {
    newHeight = imgSize;
    newWidth = (realWidth * imgSize) / realHeight;
  }

  if (yoda) {
    yoda.destroy();
  }

  yoda = new Konva.Image({
    x: 0,
    y: containerCenterY - newHeight / 2,
    image: photo,
    width: newWidth,
    height: newHeight,
    draggable: true,
    dragBoundFunc: function (pos) {
      var leftLimit = (newWidth * yoda.scaleX()) / 2;
      var topLimit = (newHeight * yoda.scaleY()) / 2;
      var rightLimit = imgSize - leftLimit;
      var bottomLimit = imgSize - topLimit;

      var newX = pos.x < -leftLimit ? -leftLimit : pos.x;
      newX = newX > rightLimit ? rightLimit : newX;
      var newY = pos.y < -topLimit ? -topLimit : pos.y;
      newY = newY > bottomLimit ? bottomLimit : newY;
      return {
        x: newX,
        y: newY,
      };
    },
  });

  var initialScale = 1;
  var hammertime = new Hammer(yoda, { domEvents: true });
  hammertime.get('pinch').set({ enable: true });

  yoda.on('pinchstart', function (ev) {
    initialScale = yoda.scaleX();
  });

  yoda.on('pinchmove', function (ev) {
    var newScale = initialScale * ev.evt.gesture.scale;
    yoda.scaleX(newScale);
    yoda.scaleY(newScale);
  });

  yoda.on('wheel', function (e) {
    e.evt.preventDefault();
    var oldScale = yoda.scaleX();
    var pointer = stage.getPointerPosition();
    var mousePointTo = {
      x: (pointer.x - yoda.x()) / oldScale,
      y: (pointer.y - yoda.y()) / oldScale,
    };

    var newScale = e.evt.deltaY < 0 ? oldScale * 1.05 : oldScale * 0.95;

    yoda.scaleX(newScale);
    yoda.scaleY(newScale);

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    yoda.position(newPos);
    layer1.batchDraw();
  });

  layer1.add(transformer);
  transformer.visible(false);
  yoda.on('click', visibleTransformer);
  yoda.on('tap', visibleTransformer);

  stage.on('click', hideTransformer);
  stage.on('tap', hideTransformer);

  layer1.add(yoda);
};

function visibleTransformer() {
  transformer.nodes([yoda]);
  transformer.visible(true);
  layer1.draw();
}

function hideTransformer(e) {
  if (e.target === stage) {
    transformer.visible(false);
    layer1.draw();
  }
}

var frame = new Image();
frame.onload = function () {
  var yodaBackground = new Konva.Image({
    x: 0,
    y: 0,
    image: frame,
    width: imgSize,
    height: imgSize,
  });

  layer2.add(yodaBackground);
};
frame.src = '/assets/img/background.png';
layer2.listening(false);

function downloadURI(uri, name) {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

document.getElementById('btn-save').addEventListener(
  'click',
  function () {
    transformer.visible(false);
    layer1.draw();
    var dataURL = stage.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, 'avatar.png');
  },
  false
);

let btnUpload = document.querySelector('#btn-upload');
let input = document.querySelector('#file');
btnUpload.onclick = function () {
  input.click();
};

input.addEventListener('change', function () {
  var file = this.files[0];
  var reader = new FileReader();
  reader.onloadend = function () {
    savedImage = reader.result;
    photo.src = savedImage;
  };
  reader.readAsDataURL(file);
});
