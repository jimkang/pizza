var probable = require('probable');
var d3 = require('d3-selection');
var d3hierarchy = require('d3-hierarchy');
var packSiblings = d3hierarchy.packSiblings;
var packEnclose = d3hierarchy.packEnclose;
var accessor = require('accessor');
var RouteState = require('route-state');

// var linkMarginLeft = 32;

var bgStyleTable = probable.createTableFromDef({
  '0-59': 'background-white',
  '60-89': 'background-black',
  '90-99': 'background-overworld'
});

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  routeState.routeFromHash();
})();

// function renderImageRespectingSize(imgurl, desc, thingWidth, thingHeight) {
//   renderImage(imgurl, desc, false, thingWidth, thingHeight);
// }

function followRoute({ toppingURL, desc }) {
  renderToppings(toppingURL, desc);
}

function renderToppings(imgurl, desc) {
  setBackgroundStyle();

  var toppingsContainer = d3.select('#toppings');

  var width = 125;
  var height = 125;

  var toppingData = generateToppingData({ imgurl, desc }, 100);
  packSiblings(toppingData);

  var containerTransform = getTransformToFitToppings({
    toppingData,
    fitTo: {
      width: 1024,
      height: 960
    }
  });
  toppingsContainer.attr('transform', containerTransform);

  var toppings = toppingsContainer
    .selectAll('.topping')
    .data(toppingData, accessor());

  var entered = toppings
    .enter()
    .append('image')
    .attr('xlink:href', imgurl)
    .attr('x', left)
    .attr('y', top)
    .attr('width', diameter)
    .attr('height', diameter)
    .attr('transform', rotateAroundCenter)
    .classed('topping', true);

  entered.append('desc').text(desc);

  function left(d) {
    return d.x - width / 2;
  }

  function top(d) {
    return d.y - height / 2;
  }

  function diameter(d) {
    return d.r * 2;
  }

  function rotateAroundCenter(d) {
    return 'rotate(' + d.rotation + ' ' + d.x + ' ' + d.y + ')';
  }
}

function generateToppingData(imagePack, baseRadius) {
  var toppingData = [];
  var numberOfToppings = 5 + probable.rollDie(6);
  if (probable.roll(4) === 0) {
    numberOfToppings += probable.rollDie(20);
  }

  for (var i = 0; i < numberOfToppings; ++i) {
    toppingData.push({
      id: 'topping-' + i,
      r: baseRadius / 2 + probable.roll(baseRadius),
      imgurl: imagePack.imgurl,
      desc: imagePack.desc,
      rotation: probable.roll(360)
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
  var neededRadius = smallestDimension / 2;
  var toppingCircleSize = packEnclose(toppingData);
  var scaleFactor = neededRadius / toppingCircleSize.r;
  var midPoint = 0.5;
  var transform =
    'translate(' + width * midPoint + ', ' + height * midPoint + ')';
  transform += ' scale(' + scaleFactor + ')';
  return transform;
}

function setBackgroundStyle() {
  document.body.classList.add(bgStyleTable.roll());
}
