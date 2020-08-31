import React, { useState, useEffect, useRef } from "react";
import { json, scaleThreshold } from "d3"; //select, geoPath, geoAlbers
import _ from "lodash";
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
//alasql
const alasql = window.alasql;


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
      html: `
  <div><b>${object.properties.NAME} ${object.properties.LSAD}, ${object.properties.state}</b></div>
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
    if(_.isEmpty(props.usaLatestData || _.isEmpty(props.censusData))) return;
    console.log("Props: ", props)
    setLoadingGEOJSON(true);
    async function getUSAGeoJSON() {
        await json(geoJsonPath).then((data) => {
          
          //format geoJSON
          let c = props.censusData;
          let u = props.usaLatestData;
          const combinedData = alasql(
            "SELECT c.*, u.covid_cases, u.covid_deaths FROM ? c LEFT JOIN ? u ON c.county = u.county AND c.state = u.state",
            [c, u]
          )
      
          console.log("Combined USA Data from props: ", combinedData);
       

          data.features.forEach(feature => {
            combinedData.forEach(d => {
              //TODO - the county number != countyfips! Will have to join on county name, and get a state number or value into the Covid data...
              if (parseInt(feature.properties.COUNTY) === d.countyFips){
                feature.properties.percentBlack = d.percentBlack;
                feature.properties.covidCases = d.covid_cases;
                feature.properties.covidDeaths = d.covid_deaths;
                feature.properties.medianAge = d.medianAge;
                feature.properties.medianGrossRent = d.medianGrossRent;
                feature.properties.medianHomeValue = d.medianHomeValue;
                feature.properties.percentNative = d.percentNative;
                feature.properties.percentAsian = d.percentAsian;
                feature.properties.percentWhite = d.percentWhite;
                feature.properties.precentHispanic = d.precentHispanic;
                feature.properties.population = d.population;
                feature.properties.popDensity = d.popDensity;
                feature.properties.state = d.state;

              }
            })
                    
          })
          console.log("GeoJSON: ", data); 
          setGeoJSON(data);
          setLoadingGEOJSON(false);
        });
    }
    getUSAGeoJSON();
  }, [props]);

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
      getElevation: (f) => f.properties.covidCases *100,//Math.sqrt(f.properties.county) * 10000,
      getFillColor: (f) => COLOR_SCALE(f.properties.percentBlack),
      getLineColor: [255, 255, 255],
      pickable: true,
    }),
  ];
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
