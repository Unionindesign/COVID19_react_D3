import React, { useState, useEffect } from "react";
import "axios";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import { csv } from "d3";
import _ from "lodash";

//pages
import USAMap from "../src/pages/usaMap/usamap";

function App() {
  // const [bingData, setBingData] = useState([]);
  const [usaLatestData, setUsaLatestData] = useState([]);
  const [censusData, setCensusData] = useState([]);
  const [loadingBingData, setLoadingBingData] = useState(false);
  // const [isDataLoaded, setIsDataLoaded] = useState(false);

  // retrieve data from the Microsoft BING covid tracker when the app loads
  useEffect(() => {
    //declare an async function to get the raw data from the Github repo
    async function getBingData() {
      // set loading state
      setLoadingBingData(true);
      //URL path for Microsoft Bing COVID tracker data
      const bing_url =
        "https://raw.githubusercontent.com/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv";
      //csv file of demographic data from census API wrangled with python
      const census_url = "./usa_county_demographics.csv";

      await csv(bing_url).then((data) => {
        //load data to application state
        // setBingData(data);
        console.log("Full Covid Data: ", data);
        const usaData = data.filter(
          (country) => country.Country_Region === "United States"
        );
        //get the latest date in the data set
        const dates = _.compact(data.map((d) => d.Updated));
        const maxDate = new Date(dates.slice(-1)[0]).toDateString();
        const usaLatestData = usaData.filter(
          (d) => new Date(d.Updated).toDateString() === maxDate
        );
        const formattedLatestUsData = usaLatestData.map((d) => {
          return {
            state: d.AdminRegion1.trim(),
            county: d.AdminRegion2.split(" ")[0].trim(),
            covid_cases: parseInt(d.Confirmed),
            covid_deaths: parseInt(d.Deaths),
            covid_recovered: parseInt(d.Recovered),
            change_cases: parseInt(d.ConfirmedChange),
            change_deaths: parseInt(d.DeathsChange),
            change_recovered: parseInt(d.RecoveredChange),
          };
        });
        console.log("Latest Date: ", maxDate);
        // console.log("Latest US Covid Data: ", formattedLatestUsData);
        setUsaLatestData(formattedLatestUsData);
      });

      await csv(census_url).then((census_data) => {
        // console.log("Full Census Data: ", census_data);
        const formattedCensusData = census_data.map((c) => {
          return {
            county: c.county.trim(),
            state: c.state.trim(),
            stateNum: parseInt(c.state_num),
            countyFips: parseInt(c.county_fips_x),
            percentBlack: parseFloat(c.percent_african_american),
            percentWhite: parseFloat(c.percent_caucasian),
            percentAsian: parseFloat(c.percent_asian),
            percentHispanic: parseFloat(c.percent_hispanic),
            percentNative: parseFloat(c.percent_native_american),
            percentRepublican: parseFloat(c.republican),
            population: parseInt(c.population),
            popDensity: parseFloat(c.pop_density),
            medianAge: parseInt(c.median_age),
            perCapitaIncome: parseFloat(c.per_capita_income),
            medianGrossRent: parseFloat(c.median_gross_rent),
            medianHomeValue: parseFloat(c.median_home_value),
          };
        });
        setCensusData(formattedCensusData);
        // console.log("Census Data: ", formattedCensusData);
      });

      //turn off loading state
      setLoadingBingData(false);
    }
    // call the function, and use [] empty array as the 2nd arg to the useEffect hook so it runs when the component is mounted to the DOM
    getBingData();
  }, []);

  return (
    <BrowserRouter basename="/">
      <div className="App">
        {/* <Header /> */}
        <Route exact path="/">
          {/* <LandingPage /> */}
          <h1>{loadingBingData ? "loading..." : "Welcome"}</h1>
        </Route>
        <Route exact path="/usamap">
          <USAMap usaLatestData={usaLatestData} censusData={censusData} />
        </Route>
        {/* <Route path="/amselect" >
					<AMData />
				</Route> */}
        <Route path="/state">{/* <AMData /> */}</Route>
      </div>
    </BrowserRouter>
  );
}

export default App;
