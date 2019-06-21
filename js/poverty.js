var svgHeight = 475;
var svgWidth = 900;

var leftMargin = 60;
var rightMargin = 260;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/poverty/race/total.csv').then(function(data) {
    console.log(data);
    var order = ['American Indian and/or Alaska Native', 'Asian', 
                'Black or African American', 'Hispanic', 'Mixed Race',
                'Native Hawaiian and Other Pacific Islander', 'White', 'Other'];

    var labelsLineBreak = [['American', 'Indian', 'and/or','Alaska', 'Native'], 
                ['Asian', '','','',''],['Black or','African','American', '', ''], 
                ['Hispanic', '','','',''], ['Mixed Race', '','','',''],
                ['Native','Hawaiian','and Other','Pacific','Islander'], 
                ['White', '','','',''], ['Other', '','','','']];

    var colors = ['lightgreen', '#009999', 'lightblue', '#ffff99', '#ff9966',
                '#ff6699', '#cc66ff', 'grey']

    var ordered = [];
    
    order.forEach(function(race) {
        var current = data.forEach(function(entry) {      
            if (entry['Race'] === race) {
                entry['Percent'] = +entry['Percent'];
                entry['Population'] = +entry['Population'];
                entry['Poverty'] = +entry['Poverty'];
                entry['Color'] = colors[order.indexOf(race)];
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
        .domain([0, d3.max(ordered, item => item.Percent)*1.1])
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
        .text("Poverty Rate (%)");

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
        .attr('y', d => yScale(d['Percent']))
        .attr('width', (chartWidth - 16)/8)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Percent']))
        .attr('fill', d => d['Color'])
        .attr("stroke", "grey");

    var rateLabels = rateChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/16)
        .attr('y', d => yScale(d['Percent']))
        .attr('width', (chartWidth - 16)/7)
        .attr('font-size', 12)
        .text(d => d['Percent'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    var povTotal = 0;
    ordered.forEach(function(entry) {
        povTotal += entry['HIV/AIDS Count'];
    });

    var otherTotal = 0;
    var newOrdered = [];
    var newColors = [];
    var newLabels = [];
    ordered.forEach(function(entry) {
        if (entry['HIV/AIDS Count']/povTotal < .01) {
            otherTotal += entry['HIV/AIDS Count'];
        }
        else {
            newOrdered.push(entry)
            newColors.push(colors[ordered.indexOf(entry)])
            newLabels.push(labelsLineBreak[ordered.indexOf(entry)])
        };
    });
    
    colors.push('grey');
    newOrdered.push({'Race': 'Less Than 1%', 'Poverty': otherTotal, 'Color':'grey'})

    var povTotal = 0;
    ordered.forEach(function(entry) {
        povTotal += entry['Poverty'];
    });

    var otherTotal = 0;
    newOrdered.forEach(function(entry) {
        if (entry['Poverty']/povTotal < .01) {
            otherTotal += entry['Poverty'];
            newOrdered.splice(newOrdered.indexOf(entry), 1);
            colors.splice(newOrdered.indexOf(entry), 1);
            labelsLineBreak.splice(newOrdered.indexOf(entry), 1);
        };
    });

    var radius = chartHeight/2;

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius*.1)
        .padAngle(.02)
        .padRadius(radius)
        .cornerRadius(4);

    var pie = d3.pie()
        // .sort(null)
        .value(d => d['Poverty']);

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
        .data(newOrdered.sort(function(a, b){return b['Poverty'] - a['Poverty']}))
        .enter()
        .append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', d => d.Color)
        .attr('x', 20)
        .attr('y', d => 20 *(1 + newOrdered.indexOf(d)))

    legend.selectAll('text')
        .data(newOrdered.sort(function(a, b){return b['Poverty'] - a['Poverty']}))
        .enter()
        .append('text')
        .attr('x', 45)
        .attr('y', d => 16+20*(1 + newOrdered.indexOf(d)))
        .text(d => `${d['Race']} - ${Math.round(d['Poverty']*100/povTotal)}%`);
});

d3.csv('data/poverty/type/total.csv').then(function(csv) {
    var colors = ['lightgreen', '#009999', 'lightblue'];

    csv.forEach(function(entry) {
        entry['Percent'] = +entry['Percent'];
        entry['Population'] = +entry['Population'];
        entry['Poverty'] = +entry['Poverty'];
    });

    var typeSvg = d3.select("#type-chart")
        .append("svg")
        .attr("height", svgHeight - 50)
        .attr("width", svgWidth);

    var typeChart = typeSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(csv.map(entry => entry['Type']))
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(csv, item => item.Percent)*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    typeChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    typeChart.append("g")
        .call(yAxis);

    typeChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 40})`)
        .attr('text-anchor', 'middle')
        .text("Poverty Type");

    typeChart.select('g')
        .selectAll('.tick')
        .select('text')
        .data(csv)
        .text(d => d['Type']);

    typeChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -35)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Poverty Rate (%)");

    function mouseover(d) {
        var selectedIndex = csv.indexOf(d)
        typeLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        typeChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = csv.indexOf(d)
        typeLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        typeChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    typeChart.selectAll('rect')
        .data(csv)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Type']))
        .attr('y', d => yScale(d['Percent']))
        .attr('width', (chartWidth - 16)/3)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Percent']))
        .attr('fill', d => colors[csv.indexOf(d)])
        .attr("stroke", "grey");

    var typeLabels = typeChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['Type']) + (chartWidth-16)/6)
        .attr('y', d => yScale(d['Percent']))
        .attr('font-size', 12)
        .text(d => d['Percent'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    // typeChart.selectAll('rect')
    //     .data(csv)
    //     .enter()
    //     .append('rect')
    //     .attr('x', d => xScale(d['Type']))
    //     .attr('y', d => yScale(d['Percent']))
    //     .attr('width', (chartWidth - 16)/3)
    //     .transition()
    //     .delay(1000)
    //     .duration(d => 1000 + 200*csv.indexOf(d))
    //     .attr('height', d => chartHeight - yScale(d['Percent']))
        // .attr('fill', d => colors[csv.indexOf(d)])
    //     .attr("stroke", "grey")
});