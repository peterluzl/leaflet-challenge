let earthquakeData = []

const getData = () => {
  window.fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
    .then(res => res.json())
    .then(res => dealData(res))
}

getData()

const dealData = (data) => {
  const features = data.features
  const res = []
  features.map(e => {
    res.push(
      {
        mag: +e.properties.mag,
        id: e.id,
        title: e.properties.title,
        status: e.properties.status,
        long: e.geometry.coordinates[0],
        lat: e.geometry.coordinates[1]
      }
    )
  })
  earthquakeData = res
  drawMap(res)
}

const drawMap = (data) => {
  if (!data) data = earthquakeData
  const map = L.map('map').setView([40, -115], 5)
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 6,
  }).addTo(map)

  L.svg().addTo(map)

  const legendData = [
    {
      name: '0-1',
      color: '#B7F34D'
    },
    {
      name: '1-2',
      color: '#E1F24C'
    },
    {
      name: '2-3',
      color: '#F3DB4C'
    },
    {
      name: '3-4',
      color: '#F3BA4D'
    },
    {
      name: '4-5',
      color: '#F0A76B'
    },
    {
      name: '5+',
      color: '#F06B6B'
    }]

  const svg = d3.select("#map")
    .select("svg")
  svg.selectAll("myCircles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).x })
    .attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).y })
    .attr("r", d => {
      if (d.mag <= 1) return 4
      if (d.mag <= 2) return 7
      if (d.mag <= 3) return 10
      if (d.mag <= 4) return 13
      if (d.mag <= 5) return 16
      if (d.mag > 5) return 20
      return 5
    })
    .style("fill", d => {
      if (d.mag <= 1) return '#B7F34D'
      if (d.mag <= 2) return '#E1F24C'
      if (d.mag <= 3) return '#F3DB4C'
      if (d.mag <= 4) return '#F3BA4D'
      if (d.mag <= 5) return '#F0A76B'
      if (d.mag > 5) return '#F06B6B'
      return '#B7F34D'
    })
    .attr("stroke", d => {
      if (d.mag <= 1) return '#B7F34D'
      if (d.mag <= 2) return '#E1F24C'
      if (d.mag <= 3) return '#F3DB4C'
      if (d.mag <= 4) return '#F3BA4D'
      if (d.mag <= 5) return '#F0A76B'
      if (d.mag > 5) return '#F06B6B'
      return '#B7F34D'
    })
    .attr("stroke-width", 2)
    .attr('z-index', 1000)
    .attr('pointer-events', 'visible')
    .on('mouseover', d => {
      console.log(d);
      console.log(this);
      const text = d.title
      console.log(text);
      const x = map.latLngToLayerPoint([d.lat, d.long]).x
      const y = map.latLngToLayerPoint([d.lat, d.long]).y
      console.log(x,y);
      d3.select(map.getContainer()).append("text")
        .text(text)
        .attr("x", d => window.innerWidth - 60 )
        .attr('y', d => window.innerHeight - 135)
        .attr('z-index', 10000)
        .attr("class", "tooltip")
    })
    .on('mouseout', d => {
      d3.select(map.getContainer()).select(".tooltip").remove()
    })

  svg
    .selectAll("myLegend")
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'cicle-text')
    .append("text")
    .attr('x', d => {
      return window.innerWidth - 60
    })
    .attr('y', function (d, i) { return window.innerHeight - 135 + i * 20 })
    .text(function (d) { return '■ ' + d.name; })
    .style("fill", function (d) { return d.color })
    .style("font-size", 15)
    .style("background-color", '#FFF')
    .style("width", 120)
    .style("height", 320)

  // Function that update circle position if something change
  function update() {
    d3.selectAll("circle")
      .attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).x })
      .attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).y })
      .attr("r", function (d) {
        if (d.mag <= 1) return 4
        if (d.mag <= 2) return 7
        if (d.mag <= 3) return 10
        if (d.mag <= 4) return 13
        if (d.mag <= 5) return 16
        if (d.mag > 5) return 20
        return 5
      })

    d3
      .selectAll("myLegend")
      .attr('x', d => {
        return window.innerWidth - 60
      })
      .attr('y', function (d, i) { return window.innerHeight - 135 + i * 20 })
      .text(function (d) { return '■ ' + d.name; })
      .style("fill", function (d) { return d.color })
  }

  // If the user change the map (zoom or drag), I update circle position:
  map.on("moveend", update)
  window.addEventListener("resize", update);
}
