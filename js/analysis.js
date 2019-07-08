var svgHeight = 475;
var svgWidth = 900;

var leftMargin = 60;
var rightMargin = 260;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/analysis/correlations.csv').then(function(csv) {
    var labelsLineBreak = [['HIV/AIDS', 'Rate', ''],
                        ['Infant', 'Mortality', 'Rate'],
                        ['IAP', 'Application', 'Rate'],
                        ['Newborn', 'Disease', 'Rate']]

    csv.forEach(function(entry) {
        entry['Correlation with Poverty Rate'] = +entry['Correlation with Poverty Rate'];
        entry['Correlation'] = Math.round(entry['Correlation with Poverty Rate']*1000)/1000;
    });

    var corrSvg = d3.select("#corr-chart")
        .append("svg")
        .attr("class", 'svg')
        .attr("height", svgHeight - 20)
        .attr("width", svgWidth);

    var corrChart = corrSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(csv.map(d => d['Value']))
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(csv, d => d['Correlation'])*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    corrChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    corrChart.append("g")
        .call(yAxis);

    corrChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Population Statistic");

    corrChart.select('g')
        .selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .text(d => d[0]);

    for (i=1; i<3; i++) {
        corrChart.select('g')
            .selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', 15 + 10*i)
            .attr('x', -1)
            .text(d => d[i])
    };

    corrChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -40)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Correlation Coefficient");

    function mouseover(d) {
        var selectedIndex = csv.indexOf(d)
        corrLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        corrChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = csv.indexOf(d)
        corrLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        corrChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    corrChart.selectAll('rect')
        .data(csv)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Value']))
        .attr('y', d => yScale(d['Correlation']))
        .attr('width', (chartWidth - 16)/csv.length)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['Correlation']))
        .attr('fill', '#33cccc')
        .attr("stroke", "grey");

    var corrLabels = corrChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['Value']) + (chartWidth - 16)/(2*csv.length))
        .attr('y', d => yScale(d['Correlation']))
        .attr('font-size', 12)
        .text(d => d['Correlation'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');
});

d3.csv('../data/analysis/othercoeffs.csv').then(function(csv) {
    var labelsLineBreak = [['HIV/', 'AIDS', 'Rate'],
                        ['Infant', 'Mortality', 'Rate'],
                        ['IAP', 'Application', 'Rate'],
                        ['Newborn', 'Disease', 'Rate']]

    var usedLabels = [];
    var organized = [];

    function selectColor(value) {
        if (value === 1) {
            return "black"
        }
        else if (value > .9) {
            return "#33cc33"
        }
        else if (value > .6) {
            return "#85e085"
        }
        else if (value > .5) {
            return "#c2f0c2"
        }
        else {
            return "#eafaea"
        }
    }

    csv.forEach(function(entry) {
        Object.keys(entry).forEach(function(key) {
            if (key != 'Factor' && !(usedLabels.includes(key))) {
                var newEntry = {};
                newEntry['Factor'] = entry['Factor'];
                newEntry['Other Factor'] = key;
                newEntry[key] = +entry[key];
                newEntry[key] = Math.round(newEntry[key]*1000)/1000;
                organized.push(newEntry);
            };
        });
        usedLabels.push(entry['Factor']);
    });

    var interSvg = d3.select("#inter-chart")
        .append("svg")
        .attr("class", 'svg')
        .attr("height", svgHeight - 20)
        .attr("width", svgWidth);

    var interChart = interSvg.append("g")
        .attr("transform", `translate(${leftMargin + 10}, ${topMargin + 40})`);

    var xScale = d3.scaleBand()
        .domain(csv.map(d => d['Factor']))
        .range([chartWidth, 0]);
    var yScale = d3.scaleBand()
        .domain(csv.map(d => d['Factor']))
        .range([0, chartHeight]);

    var xAxis = d3.axisTop(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xLabels = interChart.append("g")
        .call(xAxis);
    var yLabels = interChart.append("g")
        .call(yAxis);

    xLabels.selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text(d => d[0]);

    for (i=1; i<3; i++) {
        xLabels.selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', -30 + 10*i)
            .attr('x', -1)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'ideographic')
            .text(d => d[i])
    };

    yLabels.selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .attr('y', -6)
        .attr('x', -35)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text(d => d[0]);

    for (i=1; i<3; i++) {
        yLabels.selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', -4 + 10*i)
            .attr('x', -35)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'ideographic')
            .text(d => d[i])
    };

    interChart.selectAll('rect')
        .data(organized)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Other Factor']))
        .attr('y', d => yScale(d['Factor']))
        .attr('width', chartWidth/4)
        .style('opacity', .7)
        .transition()
        .delay(400)
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', chartHeight/4)
        .attr('fill', d => selectColor(d[d['Other Factor']]))
        .attr("stroke", "grey");

    interChart.append('g')
        .selectAll('text')
        .data(organized)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['Other Factor']) + chartWidth/8)
        .attr('y', d => yScale(d['Factor']) + chartHeight/8)
        .attr('font-size', 12)
        .transition()
        .delay(400)
        .duration(d => 1000 + 200*csv.indexOf(d))
        .text(d => d[d['Other Factor']])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central');
});

d3.csv('../data/analysis/combined.csv').then(function(csv) {
    csv.forEach(function(entry) {
        entry['HIV/AIDS Rate'] = +entry['HIV/AIDS Rate'];
        entry['Disease Rate per 100,000'] = +entry['Disease Rate per 100,000'];
        if (entry['Race'] === 'Native Hawaiian and Other Pacific Islander') {
            csv.splice(csv.indexOf(entry), 1);
        }
    });

    console.log(csv);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(csv, d => d['HIV/AIDS Rate'])*1.1])
        .range([0, chartWidth]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(csv, d => d['Disease Rate per 100,000'])*1.1])
        .range([chartHeight, 0]);

    var twoSvg = d3.select('#two-chart')
        .append('svg')
        .attr('class', 'svg')
        .attr('height', svgHeight - 20)
        .attr('width', svgWidth);

    var twoChart = twoSvg.append('g')
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    twoChart.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis);

    twoChart.append('g')
        .call(yAxis);

    twoChart.append('text')
        .text('HIV/AIDS Rate (Per 100,000)')
        .attr('x', chartWidth/2)
        .attr('y', chartHeight + 50)
        .attr('text-anchor', 'middle')

    twoChart.append('text')
        .text('Disease Rate (Per 100,000)')
        .attr('x', -chartHeight/2)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')

    var intercept = 35.0420874;
    var slope = 0.27393774;

    var lineData = [{"x": 0, "y":intercept}, {"x": 1050, "y":intercept+slope*1050}];

    console.log(lineData);

    var drawLine = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

    function mouseover(d) {
        var selectedIndex = csv.indexOf(d)
        raceLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        hivLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        disorderLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        twoChart.selectAll('circle')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = csv.indexOf(d)
        raceLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        hivLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        disorderLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        twoChart.selectAll('circle')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    twoChart.append('path')
        .transition()
        .delay(800)
        .duration(2200)
        .attr("d", drawLine(lineData))
        .attr('stroke', 'lightgrey')
        .attr("stroke-width", 2);
    
    twoChart.selectAll('circle')
        .data(csv)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d['HIV/AIDS Rate']))
        .attr('cy', d => yScale(d['Disease Rate per 100,000']))
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .delay(800)
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('r', 10)
        .attr('opacity', .7)
        .attr('fill', '#dd99ff')
        .attr("stroke", "grey");

    var raceLabels = twoChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['HIV/AIDS Rate']) + 11)
        .attr('y', d => yScale(d['Disease Rate per 100,000']) + 13)
        .attr('font-size', 12)
        .text(d => d['Race'])
        .attr('visibility', 'hidden')

    var hivLabels = twoChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['HIV/AIDS Rate']) + 11)
        .attr('y', d => yScale(d['Disease Rate per 100,000']) + 25)
        .attr('font-size', 12)
        .text(d => 'HIV/AIDS Rate: ' + d['HIV/AIDS Rate'])
        .attr('visibility', 'hidden')

    var disorderLabels = twoChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['HIV/AIDS Rate']) + 11)
        .attr('y', d => yScale(d['Disease Rate per 100,000']) + 37)
        .attr('font-size', 12)
        .text(d => 'Disease Rate: ' + d['Disease Rate per 100,000'])
        .attr('visibility', 'hidden');
});