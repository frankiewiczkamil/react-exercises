import React, { MutableRefObject, useRef } from "react";

const isoDateAt = (deltaDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
};
const url = (date: string) => {
  return `https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=${date}&end_date=${date}&hourly=pressure_msl`;
};
type WeatherData = {
  hourly: {
    pressure_msl: number[];
    time: string[];
  };
  hourly_units: {
    pressure_msl: string;
    time: string;
  };
};

type WeatherDataProps = Record<string, number>;
export default function FetchingExample() {
  const [weatherData, setWeatherData] = React.useState<WeatherDataProps>({});
  const [delta, setDelta] = React.useState(-25);
  const date = isoDateAt(delta);
  const fetchWeather = async (abortController: AbortController) => {
    try {
      const response = await fetch(url(date), {
        signal: abortController.signal,
      });
      const json: WeatherData = await response.json();
      const timeAndPressure: Record<string, number> = {};
      json.hourly.time.forEach((time, i) => {
        timeAndPressure[time.substring(11)] = json.hourly.pressure_msl[i];
      });

      setWeatherData(timeAndPressure);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        console.log("aborting redundant request");
      } else {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    const abortController = new AbortController();
    fetchWeather(abortController);
    return () => abortController.abort();
  }, [delta]);

  const abortControllerRef: MutableRefObject<AbortController | null> =
    useRef(null);

  const attemptToAbort = useRef(0);
  const refresh = async () => {
    attemptToAbort.current++;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    await fetchWeather(abortControllerRef.current);
    abortControllerRef.current = null;
  };
  return (
    <div>
      <h1>Fetching atmosphere pressure data</h1>
      <p>{date}</p>
      <button onClick={() => setDelta(delta - 1)}>prev day</button>
      <button onClick={refresh}>refresh</button>
      <button onClick={() => setDelta(delta + 1)}>next day</button>
      <WeatherDataTable weatherData={weatherData} />
    </div>
  );
}

function WeatherDataTable({ weatherData }: { weatherData: WeatherDataProps }) {
  return (
    <table style={{ marginTop: "5rem" }}>
      <thead>
        <tr>
          <td style={{ border: "solid" }}>hour</td>
          {Object.keys(weatherData).map((time) => (
            <th key={time} style={{ border: "solid" }}>
              {time}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style={{ border: "solid" }}>pressure</th>
          {Object.keys(weatherData).map((time) => (
            <td key={time} style={{ border: "solid" }}>
              {weatherData[time]}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
