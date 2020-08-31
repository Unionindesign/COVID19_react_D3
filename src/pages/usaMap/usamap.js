import React, { useState, useEffect, useRef } from "react";
import { json, scaleThreshold } from "d3"; //select, geoPath, geoAlbers
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import {
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight,
} from "@deck.gl/core";
// import { scaleThreshold } from "d3-scale";



const geoJsonPath = "./gz_2010_us_050_00_500k.json";
// const geoJsonS3Path = "https://geojson-sm.s3.us-east-2.amazonaws.com/usa/statesAndCountiesTopo.json";
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// TODO: build map style selector?
const mapStyle = "mapbox://styles/mapbox/dark-v9";

export const COLOR_SCALE = scaleThreshold()
  .domain([
    -0.6,
    -0.45,
    -0.3,
    -0.15,
    0,
    0.15,
    0.3,
    0.45,
    0.6,
    0.75,
    0.9,
    1.05,
    1.2,
  ])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38],
  ]);

const INITIAL_VIEW_STATE = {
  latitude: 39.254,
  longitude: -104.13,
  zoom: 4,
  maxZoom: 16,
  pitch: 45,
  bearing: 0,
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true,
});

const landCover = [
  [
    [-104.0, 39.196],
    [-104.0, 39.324],
    [-104.306, 39.324],
    [-104.306, 39.196],
  ],
];

function getTooltip({ object }) {
  return (
    object && {
      html: `\
  <div><b>tooltip</b></div>
  `,
    }
  );
}

const USAMap = (props) => {
  const [loadingGeoJSON, setLoadingGEOJSON] = useState(false);
  const [geoJSON, setGeoJSON] = useState([]);
  // const svgRef = useRef();
  const mapContainerRef = useRef();

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  useEffect(() => {
    setLoadingGEOJSON(true);
    async function getUSAGeoJSON() {
      await json(geoJsonPath).then((data) => {
        console.log("GeoJSON: ", data);
        console.log("Mapbox: ", MAPBOX_TOKEN);
        //format geoJSON using



        setGeoJSON(data);
        setLoadingGEOJSON(false);
      });
    }
    getUSAGeoJSON();
  }, [props.usaLatestData]);

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: "ground",
      data: landCover,
      stroked: false,
      getPolygon: (f) => f,
      getFillColor: [0, 0, 0, 0],
    }),
    new GeoJsonLayer({
      id: "geojson",
      data: geoJSON,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f) => Math.sqrt(f.properties.county) * 10000,
      getFillColor: (f) => COLOR_SCALE(f.properties.growth),
      getLineColor: [255, 255, 255],
      pickable: true,
    }),
  ];
  console.log("")
  return (
    <div className="map-container" ref={mapContainerRef}>
      {loadingGeoJSON ? <p>loading</p> : <p>Map</p>}
      <DeckGL
        layers={layers}
        effects={effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    </div>
  );
};
export default USAMap;




//for D3 map

// import topojson from "topojson";
// import { feature } from "topojson-client";
// import geoJSON from "./statesAndCountiesTopo.json";

// useEffect(() => {
//   const svg = select(svgRef.current);
//   const { width, height } = mapContainerRef.current.getBoundingClientRect();

//   const projection = geoAlbers().fitSize([width, height]);
//   const pathGenerator = geoPath().projection(projection);
//   const counties = feature(geoJSON, geoJSON.objects.counties).features;
//   svg
//     .selectAll(".county")
//     .data(counties)
//     .join("path")
//     .attr("class", "county")
//     .attr("d", (feature) => pathGenerator(feature));
// }, [geoJSON]);

//return ( )
      {/* <svg ref={svgRef}></svg> */}
