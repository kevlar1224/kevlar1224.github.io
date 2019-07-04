var svgHeight = 475;
var svgWidth = 900;

var leftMargin = 60;
var rightMargin = 260;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/insurance/race.csv').then(function(csv) {
    var order = ['American Indian and/or Alaska Native', 'Asian', 
                'Black or African American', 'Hispanic', 'Mixed Race',
                'Native Hawaiian and Other Pacific Islander', 'White'];

    var colors = ['lightgreen', '#009999', 'lightblue', '#ffff99', '#ff9966',
                '#ff6699', '#cc66ff', 'grey'];

    var ordered = [];
    
    order.forEach(function(race) {
        csv.forEach(function(entry) {      
            if (entry['Race'] === race) {
                entry['Population Size'] = +entry['Population Size'];
                entry['Color'] = colors[order.indexOf(race)]
                ordered.push(entry);
            };}
        );
    });

    var popTotal = 0;
    ordered.forEach(function(entry) {
        popTotal += entry['Population Size'];
    });

    ordered.forEach(function(entry) {
        if (entry['Population Size']*100/popTotal < 1) {
            entry['Label'] = `${entry['Race']} - Less Than 1%`;
        }
        else {
            entry['Label'] = `${entry['Race']} - ${Math.round(entry['Population Size']*100/popTotal)}%`;
        }
    })

    var radius = chartHeight/2;

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius*.1)
        .padAngle(.02)
        .padRadius(radius)
        .cornerRadius(4);

    var pie = d3.pie()
        .value(d => d['Population Size']);

    var popSvg = d3.select("#pop-chart")
        .append("svg")
        .attr("height", svgHeight - 40)
        .attr("width", svgWidth);

    var popChart = popSvg.append("g")
        .attr("transform", `translate(${leftMargin + radius}, ${topMargin + radius})`);

    popChart.append('text')
        .attr('transform', `translate(${chartWidth/2 - 100}, ${chartHeight/2 + 20})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Population Size by Race (in 2018)");

    var arcGroup = popChart.selectAll('.arc')
        .data(pie(ordered))
        .enter()
        .append('g')
        .attr('class', 'arc');

    function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) { return arc(i(t)); };
    }

    arcGroup.append('path')
        .attr('fill', d => d.data.Color)
        .transition()
        .duration(d => 2000 + 200*pie(ordered).indexOf(d))
        .attrTween('d', tweenPie)
        .attr('stroke', '#d9d9d9')

    var legend = popSvg.append('g')
        .attr('transform',`translate(${chartHeight + 75}, 100)`)

    legend.selectAll('rect')
        .data(ordered.sort(function(a, b){return b['Population Size'] - a['Population Size']}))
        .enter()
        .append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', d => d.Color)
        .attr('x', 20)
        .attr('y', d => 20 *(1 + ordered.indexOf(d)))

    legend.selectAll('text')
        .data(ordered.sort(function(a, b){return b['Population Size'] - a['Population Size']}))
        .enter()
        .append('text')
        .attr('x', 45)
        .attr('y', d => 16+20*(1 + ordered.indexOf(d)))
        .text(d => d['Label']);

});