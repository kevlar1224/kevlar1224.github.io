var svgHeight = 475;
var svgWidth = 900;

var leftMargin = 60;
var rightMargin = 260;
var topMargin = 25;
var bottomMargin = 95

var chartHeight = svgHeight - topMargin - bottomMargin;
var chartWidth = svgWidth - leftMargin - rightMargin;

d3.csv('../data/hiv/race.csv').then(function(csv) {
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
    
    csv.forEach(function(entry) {      
        order.forEach(function(race) {
            if (entry['Race'] === race) {
                entry['HIV/AIDS Rate'] = +entry['HIV/AIDS Rate'];
                entry['HIV/AIDS Count'] = +entry['HIV/AIDS Count'];
                entry['AIDS Rate'] = +entry['AIDS Rate'];
                entry['HIV (non-AIDS) Rate'] = +entry['HIV (non-AIDS) Rate'];
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
        .domain([0, d3.max(ordered, item => item['HIV/AIDS Rate'])*1.1])
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
        .attr("y", -45)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("HIV/AIDS Rate (Per 100,000)");

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
        .attr('y', d => yScale(d['HIV/AIDS Rate']))
        .attr('width', (chartWidth - 16)/7)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .duration(d => 1000 + 200*ordered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['HIV/AIDS Rate']))
        .attr('fill', d => d['Color'])
        .attr("stroke", "grey");

    var rateLabels = rateChart.append('g')
        .selectAll('text')
        .data(ordered)
        .enter()
        .append('text')
        .style('text-align', 'center')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['HIV/AIDS Rate']))
        .attr('width', (chartWidth - 16)/7)
        .attr('font-size', 12)
        .text(d => d['HIV/AIDS Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    console.log(rateChart.attr('width'))

    var typeOrdered = ordered.map(entry => entry);

    var typeSvg = d3.select("#type-chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var typeChart = typeSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(order)
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(typeOrdered, item => item['AIDS Rate'])*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    typeChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    typeChart.append("g")
        .call(yAxis);

    typeChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Race/Ethnicity");

    typeChart.select('g')
        .selectAll('.tick')
        .select('text')
        .data(labelsLineBreak)
        .text(d => d[0]);

    for (i=1; i<5; i++) {
        typeChart.select('g')
            .selectAll('.tick')
            .select('text')
            .data(labelsLineBreak)
            .append('tspan')
            .attr('y', 15 + 10*i)
            .attr('x', -1)
            .text(d => d[i])
    };

    typeChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -45)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("HIV/AIDS Rate (Per 100,000)");

    function typeMouseover(d) {
        var selectedIndex = typeOrdered.indexOf(d)
        hivLabels
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        aidsLabels
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        typeChart.selectAll('rect')
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function typeMouseout(d) {
        var selectedIndex = typeOrdered.indexOf(d)
        hivLabels
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        aidsLabels
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        typeChart.selectAll('rect')
            .filter(d => typeOrdered.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    typeChart.selectAll('rect')
        .data(typeOrdered)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Race']))
        .attr('y', d => yScale(d['HIV (non-AIDS) Rate']))
        .attr('width', (chartWidth - 16)/14)
        .style('opacity', .7)
        .on('mouseover', d => typeMouseover(d))
        .on('mouseout', d => typeMouseout(d))
        .transition()
        .delay(800)
        .duration(d => 1000 + 200*typeOrdered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['HIV (non-AIDS) Rate']))
        .attr('fill', '#009999')
        .attr("stroke", "grey");

    typeChart.append('g')
        .selectAll('rect')
        .data(typeOrdered)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['AIDS Rate']))
        .attr('width', (chartWidth - 16)/14)
        .style('opacity', .7)
        .on('mouseover', d => typeMouseover(d))
        .on('mouseout', d => typeMouseout(d))
        .transition()
        .delay(800)
        .duration(d => 1000 + 200*typeOrdered.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['AIDS Rate']))
        .attr('fill', 'lightblue')
        .attr("stroke", "grey");

    var hivLabels = typeChart.append('g')
        .selectAll('text')
        .data(typeOrdered)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/28)
        .attr('y', d => yScale(d['HIV (non-AIDS) Rate']))
        .attr('font-size', 12)
        .text(d => d['HIV (non-AIDS) Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    var aidsLabels = typeChart.append('g')
        .selectAll('text')
        .data(typeOrdered)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Race']) + (chartWidth - 16)/28 + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['AIDS Rate']))
        .attr('font-size', 12)
        .text(d => d['AIDS Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');

    var legend = typeSvg.append('g')
        .attr('transform',`translate(${chartHeight + 75}, 100)`)

    legend.append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', '#009999')
        .attr('x', 20)
        .attr('y', 20)

    legend.append('text')
        .attr('x', 45)
        .attr('y', 36)
        .text('HIV (non-AIDS) Rate')

    legend.append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', 'lightblue')
        .attr('x', 20)
        .attr('y', 40)

    legend.append('text')
        .attr('x', 45)
        .attr('y', 56)
        .text('AIDS Rate')
    
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
    newOrdered.push({'Race': 'Less Than 1%', 'HIV/AIDS Count': otherTotal, 'Color':'grey'})

    var radius = chartHeight/2;

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius*.1)
        .padAngle(.02)
        .padRadius(radius)
        .cornerRadius(4);

    var pie = d3.pie()
        .value(d => d['HIV/AIDS Count']);

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
        .data(newOrdered.sort(function(a, b){return b['HIV/AIDS Count'] - a['HIV/AIDS Count']}))
        .enter()
        .append('rect')
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', d => d.Color)
        .attr('x', 20)
        .attr('y', d => 20 *(1 + newOrdered.indexOf(d)))

    legend.selectAll('text')
        .data(newOrdered.sort(function(a, b){return b['HIV/AIDS Count'] - a['HIV/AIDS Count']}))
        .enter()
        .append('text')
        .attr('x', 45)
        .attr('y', d => 16+20*(1 + newOrdered.indexOf(d)))
        .text(d => `${d['Race']} - ${Math.round(d['HIV/AIDS Count']*100/povTotal)}%`);

});


d3.csv('data/hiv/age.csv').then(function(csv) {
    csv.forEach(function(entry) {
        entry['HIV/AIDS Population Rate'] = +entry['HIV/AIDS Population Rate'];
    });

    var ageSvg = d3.select("#age-chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

    var ageChart = ageSvg.append("g")
    .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
    .domain(csv.map(d => d['Demographic Type']))
    .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(csv, item => item['HIV/AIDS Population Rate'])*1.1])
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
    .text("Age");

    ageChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight/2)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'ideographic')
    .attr("y", -45)
    .text("HIV/AIDS Rate (Per 100,000)");

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
        .attr('x', d => xScale(d['Demographic Type']))
        .attr('y', d => yScale(d['HIV/AIDS Population Rate']))
        .attr('width', (chartWidth - 16)/7)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .delay(1200)
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['HIV/AIDS Population Rate']))
        .attr('fill', '#ffff99')
        .attr("stroke", "grey");

    var ageLabels = ageChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Demographic Type']) + (chartWidth - 16)/14)
        .attr('y', d => yScale(d['HIV/AIDS Population Rate']))
        .attr('font-size', 12)
        .text(d => d['HIV/AIDS Population Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');
});

d3.csv('data/hiv/gender.csv').then(function(csv) {
    csv.forEach(function(entry) {
        entry['HIV/AIDS Population Rate'] = +entry['HIV/AIDS Population Rate'];
    });

    var genderSvg = d3.select("#gender-chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var genderChart = genderSvg.append("g")
        .attr("transform", `translate(${leftMargin}, ${topMargin})`);

    var xScale = d3.scaleBand()
        .domain(csv.map(d => d['Demographic Type']))
        .range([8, chartWidth - 8]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(csv, item => item['HIV/AIDS Population Rate'])*1.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    genderChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
    genderChart.append("g")
        .call(yAxis);

    genderChart.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 60})`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("Age");

    genderChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight/2)
        .attr("y", -45)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .text("HIV/AIDS Rate (Per 100,000)");

    function mouseover(d) {
        var selectedIndex = csv.indexOf(d)
        genderLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'visible');
        genderChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', 1);
    };

    function mouseout(d) {
        var selectedIndex = csv.indexOf(d)
        genderLabels
            .filter(d => csv.indexOf(d) === selectedIndex)
            .attr('visibility', 'hidden');
        genderChart.selectAll('rect')
            .filter(d => csv.indexOf(d) === selectedIndex)
            .style('opacity', .7);
    };

    genderChart.selectAll('rect')
        .data(csv)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d['Demographic Type']))
        .attr('y', d => yScale(d['HIV/AIDS Population Rate']))
        .attr('width', (chartWidth - 16)/2)
        .style('opacity', .7)
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .transition()
        .delay(1200)
        .duration(d => 1000 + 200*csv.indexOf(d))
        .attr('height', d => chartHeight - yScale(d['HIV/AIDS Population Rate']))
        .attr('fill', '#ff9966')
        .attr("stroke", "grey");

    var genderLabels = genderChart.append('g')
        .selectAll('text')
        .data(csv)
        .enter()
        .append('text')
        .attr('x', d => xScale(d['Demographic Type']) + (chartWidth - 16)/4)
        .attr('y', d => yScale(d['HIV/AIDS Population Rate']))
        .attr('font-size', 12)
        .text(d => d['HIV/AIDS Population Rate'])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'ideographic')
        .attr('visibility', 'hidden');
});