var svgHeight = 475;
var svgWidth = 1100;

var leftMargin = 60;
var rightMargin = 460;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/newborn/groupedRace.csv').then(function(csv) {
    var order = ['American Indian and/or Alaska Native', 'Asian', 
                'Black or African American', 'Hispanic or Latino', 'Mixed Race',
                'White', 'Not Reported', 'Other'];

    var orderLabels = ['American Indian and/or Alaska Native', 'Asian', 
                'Black or African American', 'Hispanic', 'Mixed Race', 
                'White', 'Not Reported', 'Other'];

    var labelsLineBreak = [['American', 'Indian', 'and/or','Alaska', 'Native'], 
                ['Asian', '','','',''], ['Black or','African','American', '', ''], 
                ['Hispanic', '','','',''], ['Mixed Race', '','','',''],
                ['White', '','','','']];

    var colors = ['lightgreen', '#009999', 'lightblue', '#ffff99', '#ff9966',
                '#cc66ff', 'grey', '#cccccc'];

    var ordered = [];
    
    order.forEach(function(race) {
        csv.forEach(function(entry) {      
            if (entry['Race/Ethnicity'] === race) {
                entry['Race'] = entry['Race/Ethnicity'];
                entry['Race Label'] = orderLabels[order.indexOf(race)];
                entry['Rate per 100,000'] = +entry['Rate per 100,000'];
                entry['Case Count'] = +entry['Case Count'];
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
        .domain([0, d3.max(ordered, item => item['Rate per 100,000'])*1.1])
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
        .text("Rate per 100,000 (Per 100,000)");

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
        .attr('y', d => yScale(d['Rate per 100,000']))
        .attr('fill', d => d['Color'])
        .attr('width', (chartWidth - 16)/8)
        .attr("stroke", "grey")
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Rate per 100,000']));

    var rateLabels = rateChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Race']) + 15)
        .attr('y', d => yScale(d['Rate per 100,000']) - 6)
        .attr('font-size', 12)
        .text(d => d['Rate per 100,000'])
        .attr('visibility', 'hidden');

    var povTotal = 0;
    ordered.forEach(function(entry) {
        povTotal += entry['Case Count'];
    });

    var otherTotal = 0;
    ordered.forEach(function(entry) {
        if (entry['Case Count']/povTotal < .01) {
            otherTotal += entry['Case Count'];
            ordered.splice(ordered.indexOf(entry), 1);
            colors.splice(ordered.indexOf(entry), 1);
            labelsLineBreak.splice(ordered.indexOf(entry), 1);
        };
    });
    
    colors.push('grey');
    ordered.push({'Race Label': 'Less Than 1%', 'Case Count': otherTotal, 'Color':'grey'})

    var radius = chartHeight/2;

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius*.1)
        .padAngle(.02)
        .padRadius(radius)
        .cornerRadius(4);

    var pie = d3.pie()
        .value(d => d['Case Count']);

    var popSvg = d3.select("#pop-chart")
        .append("svg")
        .attr("height", svgHeight - 40)
        .attr("width", svgWidth);

    var popChart = popSvg.append("g")
        .attr("transform", `translate(${leftMargin + radius}, ${topMargin + radius})`);

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
        .delay(400)
        .duration(d => 2000 + 200*pie(ordered).indexOf(d))
        .attrTween('d', tweenPie)
        .attr('stroke', '#d9d9d9')

    var legend = popSvg.append('g')
        .attr('transform',`translate(${chartHeight + 75}, 100)`)

    legend.selectAll('rect')
        .data(ordered.sort(function(a, b){return b['Case Count'] - a['Case Count']}))
        .enter()
        .append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', d => d.Color)
        .attr('x', 20)
        .attr('y', d => 20 *(1 + ordered.indexOf(d)))

    legend.selectAll('text')
        .data(ordered.sort(function(a, b){return b['Case Count'] - a['Case Count']}))
        .enter()
        .append('text')
        .attr('x', 45)
        .attr('y', d => 16+20*(1 + ordered.indexOf(d)))
        .text(d => `${d['Race Label']} - ${Math.round(d['Case Count']*100/povTotal)}%`);
});

d3.csv('../data/newborn/diseasesByRace.csv').then(function(csv) {
    var order = ['American Indian and/or Alaska Native', 'Asian', 
        'Black or African American', 'Hispanic or Latino', 'Mixed Race', 'White'];

    var labelsLineBreak = [['American', 'Indian', 'and/or','Alaska', 'Native'], 
        ['Asian', '','','',''], ['Black or','African','American', '', ''], 
        ['Hispanic', '','','',''], ['Mixed Race', '','','',''],
        ['White', '','','','']];

    var colors = ['lightgreen', '#009999', 'lightblue', '#ffff99', '#ff9966', '#cc66ff'];

    var ordered = [];
    var grouped = [];
    
    order.forEach(function(race) {
        var current = [];
        csv.forEach(function(entry) {      
            if (entry['Race/Ethnicity'] === race) {
                entry['Race'] = entry['Race/Ethnicity'];
                entry['Rate per 100,000'] = +entry['Rate per 100,000'];
                entry['Color'] = colors[order.indexOf(race)];
                current.push(entry);
            };}
        );

        current = current.sort(function(a, b){return b['Rate per 100,000'] - a['Rate per 100,000']});
        current = current.slice(0,3);

        current.forEach(entry => ordered.push(entry));
        grouped.push(current[0]);
    });

    var groupedSvg = d3.select("#grouped-chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var groupedChart = groupedSvg.append("g")
        .attr("transform", `translate(${leftMargin + 15}, ${topMargin})`);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ordered, item => item['Rate per 100,000'])])
        .range([chartHeight, 0]);

    var xScale = d3.scaleBand()
        .domain(grouped.map(entry => entry['Race']))
        .range([8, chartWidth - 8]);

    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    groupedChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    groupedChart.append("g")
        .call(yAxis);

    groupedChart.select('g')
        .selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .text(d => d[0]);

    for (i=1; i<5; i++) {
        groupedChart.select('g')
            .selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', 15 + 10*i)
            .attr('x', -1)
            .text(d => d[i])
    };

    groupedChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Disorder");
        
    groupedChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -50)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Rate per 100,000 (Per 100,000)");

    function mouseover(d) {
        var selectedIndex = ordered.indexOf(d)
        groupedLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        groupedChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = ordered.indexOf(d)
        groupedLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        groupedChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    groupedChart.selectAll('rect')
        .data(ordered)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Race']) + (ordered.indexOf(d)%3)*(chartWidth - 16)/ordered.length)
        .attr('y', d => yScale(d['Rate per 100,000']))
        .attr('width', (chartWidth-16)/ordered.length)
        .attr('fill', d => d['Color'])
        .attr("stroke", "grey")
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .delay(800)
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Rate per 100,000']));

    var groupedLabels = groupedChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Race']) + 
            (ordered.indexOf(d)%3)*(chartWidth)/ordered.length +  2)
        .attr('y', d => yScale(d['Rate per 100,000']) - 6)
        .attr('font-size', 12)
        .text(d => d['Disorder Type'] + ' - ' + d['Rate per 100,000'])
        .attr('visibility', 'hidden');
});

d3.csv('../data/newborn/disorders.csv').then(function(csv) {
    console.log(csv);

    var ordered = csv.sort(function(a,b) {return b['Case Count']-a['Case Count']}).slice(0,10)
    console.log(ordered);

    var disorderSvg = d3.select("#disease-chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var disorderChart = disorderSvg.append("g")
        .attr("transform", `translate(${leftMargin + 15}, ${topMargin})`);

    var yScale = d3.scaleLinear()
        .domain([0, ordered[0]['Case Count']*1.1])
        .range([chartHeight, 0]);

    var xScale = d3.scaleBand()
        .domain(ordered.map(entry => ordered.indexOf(entry)))
        .range([8, chartWidth - 8]);

    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale).tickValues([]);

    disorderChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    disorderChart.append("g")
        .call(yAxis);

    disorderChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 35})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Disorder");
        
    disorderChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -50)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Case Count");

    function mouseover(d) {
        var selectedIndex = ordered.indexOf(d)
        disorderLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        disorderChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = ordered.indexOf(d)
        disorderLabels
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        disorderChart.selectAll('rect')
            .filter(d => ordered.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    disorderChart.selectAll('rect')
        .data(ordered)
        .enter()
        .append('rect')
        .attr('x', d => xScale(ordered.indexOf(d)))
        .attr('y', d => yScale(d['Case Count']))
        .attr('width', (chartWidth - 16)/ordered.length)
        .attr('fill', '#cc66ff')
        .attr("stroke", "grey")
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .delay(800)
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Case Count']));

    var disorderLabels = disorderChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .attr('x', d => xScale(ordered.indexOf(d)) + 5)
        .attr('y', d => yScale(d['Case Count']))
        .attr('font-size', 12)
        .text(d => d['Disorder Type'] + ' - ' + d['Case Count'])
        // .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');
});