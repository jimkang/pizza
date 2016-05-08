var director = require('director');
var probable = require('probable');
var d3 = require('d3-selection');
var d3hierarchy = require('d3-hierarchy');
var packSiblings = d3hierarchy.packSiblings;
var packEnclose = d3hierarchy.packEnclose;
var accessor = require('accessor');

// var linkMarginLeft = 32;

var routes = {
  '/topping/:imgurl/desc/:desc': renderToppings,
  // '/thing/:imgurl/desc/:desc/width/:width/height/:height': renderImageRespectingSize,
};

var bgStyleTable = probable.createTableFromDef({
  '0-59': 'background-white',
  '60-89': 'background-black',
  '90-99': 'background-overworld'
});

(((((((function go() {
  var router = director.Router(routes);
  router.init();
})()))))));

// function renderImageRespectingSize(imgurl, desc, thingWidth, thingHeight) {
//   renderImage(imgurl, desc, false, thingWidth, thingHeight);
// }

function renderToppings(imgurl, desc) {
  setBackgroundStyle();

  var toppingsContainer = d3.select('#toppings');
  var imgSrc = decodeURIComponent(imgurl);
  var alt = decodeURIComponent(desc);

  var width = 125;
  var height = 125;

  var toppingData = generateToppingData(
    [
      {
      imgurl: imgurl,
      desc: desc
      }
    ],
    100
  );

  packSiblings(toppingData);

  var containerTransform = getTransformToFitToppings({
    toppingData: toppingData,
    fitTo: {
      width: 1024,
      height: 960
    }
  });
  toppingsContainer.attr('transform', containerTransform);

  var toppings = toppingsContainer.selectAll('.topping').data(toppingData, accessor());

  var entered = toppings.enter().append('image')
    .attr('xlink:href', imgSrc)
    .attr('x', left)
    .attr('y', top)
    .attr('width', diameter)
    .attr('height', diameter)
    .classed('topping', true);

  entered.append('desc').text(accessor('desc'));

  if (probable.roll(8) === 0) {
    // thingImg.classList.add('flipped');
  }

  function left(d) {
    return d.x - width/2;
  }

  function top(d) {
    return d.y - height/2;
  }

  function diameter(d) {
    return d.r * 2;
  }
}

function generateToppingData(imagePacks, baseRadius) {
  var toppingData = [];
  var numberOfToppings = 5 + probable.rollDie(6);
  if (probable.roll(4) === 0) {
    numberOfToppings += probable.rollDie(20);
  }

  for (var i = 0; i < numberOfToppings; ++i) {
    var imagePack = probable.pickFromArray(imagePacks);
    toppingData.push({
      id: 'topping-' + i,
      r: baseRadius/2 + probable.roll(baseRadius),
      imgurl: imagePack.imgurl,
      desc: imagePack.desc
    });
  }
  return toppingData;
}

function getTransformToFitToppings(opts) {
    var toppingData;
    var width;
    var height;

    if (opts) {
      toppingData = opts.toppingData;
      width = opts.fitTo.width;
      height = opts.fitTo.height;
   }

   var smallestDimension = width < height ? width : height;
   var neededRadius = smallestDimension/2;
   var toppingCircleSize = packEnclose(toppingData);
   var scaleFactor = neededRadius / toppingCircleSize.r;
   // I don't know why it's 11/24 instead of 1/2.
   var midPoint = 11/24;
   var transform = 'translate(' + width * midPoint + ', ' + height * midPoint + ')';
   transform += ' scale(' + scaleFactor + ')';
   return transform;
}

function setBackgroundStyle() {
  document.body.classList.add(bgStyleTable.roll());
}
