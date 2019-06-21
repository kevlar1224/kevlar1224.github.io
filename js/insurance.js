var svgHeight = 475;
var svgWidth = 900;

var leftMargin = 60;
var rightMargin = 260;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/insurance/race.csv').then(function(csv) {
    console.log(csv);
    var order = ['American Indian and/or Alaska Native', 'Asian', 
                'Black or African American', 'Hispanic', 'Mixed Race',
                'Native Hawaiian and Other Pacific Islander', 'White'];

    var labelsLineBreak = [['American', 'Indian', 'and/or','Alaska', 'Native'], 
                ['Asian', '','','',''],['Black or','African','American', '', ''], 
                ['Hispanic', '','','',''], ['Mixed Race', '','','',''],
                ['Native','Hawaiian','and Other','Pacific','Islander'], 
                ['White', '','','','']];

    var colors = ['lightgreen', '#009999', 'lightblue', '#ffff99', '#ff9966',
                '#ff6699', '#cc66ff', 'grey'];

    var ordered = [];
    
    order.forEach(function(race) {
        csv.forEach(function(entry) {      
            if (entry['Race'] === race) {
                entry['Insurance Application Rate'] = +entry['Insurance Application Rate'];
                entry['Number of Applicants'] = +entry['Number of Applicants'];
                entry['Color'] = colors[order.indexOf(race)]
                ordered.push(entry);
            };}
        );
    });

    var rateSvg = d3.select("#rate-chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var rateChart = rateSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(order)
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ordered, item => item['Insurance Application Rate'])*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    rateChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    rateChart.append("g")
        .call(yAxis);

    rateChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Race/Ethnicity");

    rateChart.select('g')
        .selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .text(d => d[0]);

    for (i=1; i<5; i++) {
        rateChart.select('g')
            .selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', 15 + 10*i)
            .attr('x', -1)
            .text(d => d[i])
    };

    rateChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -35)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Insurance Application Rate (Per 100,000)");

    function mouseover(d) {
        var selectedIndex = ordered.indexOf(d)
        rateLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        rateChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = ordered.indexOf(d)
        rateLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        rateChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    rateChart.selectAll('rect')
        .data(ordered)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Race']))
        .attr('y', d => yScale(d['Insurance Application Rate']))
        .attr('width', (chartWidth - 16)/7)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Insurance Application Rate']))
        .attr('fill', d => d['Color'])
        .attr("stroke", "grey");

    var rateLabels = rateChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['Insurance Application Rate']))
        .attr('font-size', 12)
        .text(d => d['Insurance Application Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    var povTotal = 0;
    ordered.forEach(function(entry) {
        povTotal += entry['Number of Applicants'];
    });

    var otherTotal = 0;
    var newOrdered = [];
    var newColors = [];
    var newLabels = [];
    ordered.forEach(function(entry) {
        if (entry['Number of Applicants']/povTotal < .01) {
            otherTotal += entry['Number of Applicants'];
        }
        else {
            newOrdered.push(entry)
            newColors.push(colors[ordered.indexOf(entry)])
            newLabels.push(labelsLineBreak[ordered.indexOf(entry)])
        };
    });
    
    colors.push('grey');
    newOrdered.push({'Race': 'Less Than 1%', 'Number of Applicants': otherTotal, 'Color':'grey'})

    var radius = chartHeight/2;

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius*.1)
        .padAngle(.02)
        .padRadius(radius)
        .cornerRadius(4);

    var pie = d3.pie()
        .value(d => d['Number of Applicants']);

    var popSvg = d3.select("#pop-chart")
        .append("svg")
        .attr("height", svgHeight - 40)
        .attr("width", svgWidth);

    var popChart = popSvg.append("g")
        .attr("transform", `translate(${leftMargin + radius}, ${topMargin + radius})`);

    var arcGroup = popChart.selectAll('.arc')
        .data(pie(newOrdered))
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
        .delay(500)
        .duration(d => 2000 + 200*pie(newOrdered).indexOf(d))
        .attrTween('d', tweenPie)
        .attr('stroke', '#d9d9d9')

    var legend = popSvg.append('g')
        .attr('transform',`translate(${chartHeight + 75}, 100)`)

    legend.selectAll('rect')
        .data(newOrdered.sort(function(a, b){return b['Number of Applicants'] - a['Number of Applicants']}))
        .enter()
        .append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', d => d.Color)
        .attr('x', 20)
        .attr('y', d => 20 *(1 + newOrdered.indexOf(d)))

    legend.selectAll('text')
        .data(newOrdered.sort(function(a, b){return b['Number of Applicants'] - a['Number of Applicants']}))
        .enter()
        .append('text')
        .attr('x', 45)
        .attr('y', d => 16+20*(1 + newOrdered.indexOf(d)))
        .text(d => `${d['Race']} - ${Math.round(d['Number of Applicants']*100/povTotal)}%`);
});

d3.csv('../data/insurance/age.csv').then(function(csv) {
    console.log(csv);

    var ageSvg = d3.select("#age-chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

    var ageChart = ageSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(csv.map(entry => entry['Age']))
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(csv, item => item['Percent'])*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    ageChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    ageChart.append("g")
        .call(yAxis);

    ageChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Age Group");

    ageChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -35)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Insurance Application Rate (Per 100,000)");

    function mouseover(d) {
        var selectedIndex = csv.indexOf(d)
        ageLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        ageChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = csv.indexOf(d)
        ageLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        ageChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    ageChart.selectAll('rect')
        .data(csv)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Age']))
        .attr('y', d => yScale(d['Percent']))
        .attr('width', (chartWidth - 16)/7)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Percent']))
        .attr('fill', '#ff6699')
        .attr("stroke", "grey");

    var ageLabels = ageChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Age']) + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['Percent']))
        .attr('font-size', 12)
        .text(d => d['Percent'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');
});
