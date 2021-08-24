var data = [
  {name: 'Item', value: 30, pct: '1%'},
  {name: 'Item', value: 20, pct: '1%'},
  {name: 'Item', value: 25, pct: '1%'},
  {name: 'Item', value: 25, pct: '1%'},

];

data.sort(function(a, b){
    return b.value - a.value;
});

var svg = d3.select('svg'),
    canvas = d3.select('#responsive'),
    art = d3.select('#art'),
    labels = d3.select('#labels');

var d3Pie = d3.layout.pie();
d3Pie.value(function(d) {
    return d.value;
});

var cDim = {
  height: 400,
  width: 400,
  innerRadius: 30,
  outerRadius: 130,
  labelRadius: 190
};

svg.attr({
  height: cDim.height,
  width: cDim.width
});

canvas.attr('transform', 'translate(' + (cDim.width/2.3) + ', ' + (cDim.height/2.4) + ')');

var pieData = d3Pie(data);

var pieArc = d3.svg.arc()
                .innerRadius(cDim.innerRadius)
                .outerRadius(cDim.outerRadius);


var colors = d3.scale.category20();

var enteringArcs = art.selectAll('.wedge').data(pieData).enter();

enteringArcs.append('path')
            .attr('class', 'wedge')
            .attr('d', pieArc)
            .style('fill', function(d, i){ return colors(i); });



var enteringLabels = labels.selectAll('.label').data(pieData).enter();
var labelGroups = enteringLabels.append('g').attr('class', 'label');

var lines = labelGroups.append('line').attr({
  x1: function(d, i) {
    return pieArc.centroid(d)[0];
  },
  y1: function(d) {
    return pieArc.centroid(d)[1];
  },
  x2: function(d) {
    var centroid = pieArc.centroid(d),
        midAngle = Math.atan2(centroid[1], centroid[0]);
    return Math.cos(midAngle) * cDim.labelRadius;
  },
  y2: function(d) {
    var centroid = pieArc.centroid(d),
        midAngle = Math.atan2(centroid[1], centroid[0]);
    return Math.sin(midAngle) * cDim.labelRadius;
  },
  
  'class': 'label-line',
  'stroke': function(d, i) {
    return colors(i);
  }
});

var textLabels = labelGroups.append('text').attr({
    x: function(d, i) {
      var centroid = pieArc.centroid(d),
          midAngle = Math.atan2(centroid[1], centroid[0]),
          x = Math.cos(midAngle) * cDim.labelRadius,
          sign = x > 0? 1: -1;
      return x + (5*sign);
    },
  
    y: function(d, i) {
      var centroid = pieArc.centroid(d),
          midAngle = Math.atan2(centroid[1], centroid[0]),
          y = Math.sin(midAngle) * cDim.labelRadius;
      return y;
    },
  
    'text-anchor': function(d, i) {
      var centroid = pieArc.centroid(d),
          midAngle = Math.atan2(centroid[1], centroid[0]),
          x = Math.cos(midAngle) * cDim.labelRadius;
      return x > 0? 'start' : 'end';
    },
  
    'class': 'label-text'
}).text(function(d){
  return d.data.name + ' ( ' + d.data.pct + ' ) ';
})

var alpha = 0.5,
    spacing = 15;

function relax() {
  var again = false;
  textLabels.each(function(d, i) {
       var a = this,
           da = d3.select(a),
           y1 = da.attr('y');
        textLabels.each(function(d, j) {
           var b = this;
            if (a === b) {
              return ;
            }
          
            db = d3.select(b);
            if (da.attr('text-anchor') !== db.attr('text-anchor')) {
              return ;
            }
          
            var y2 = db.attr('y');
            deltaY = y1 - y2;
            
            if (Math.abs(deltaY) > spacing) {
              return ;
            }
          
            again = true;
            sign = deltaY > 0? 1: -1;
            var adjust = sign * alpha;
            da.attr('y', +y1 + adjust);
            db.attr('y', +y2 - adjust);
        });
  });
  
  if (again) {
      var labelElements = textLabels[0];
      lines.attr('y2', function(d, i) {
          var labelForLine = d3.select(labelElements[i]);
          return labelForLine.attr('y');
      });
      setTimeout(relax, 20);
  }
}

relax();

