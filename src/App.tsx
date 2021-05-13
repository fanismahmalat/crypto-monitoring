import React from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";

import { formatData } from "./utils";
import { ICurrency, IFormatedHistoricalData } from "./interfaces";

const App: React.FC = () => {
  const [currencies, setCurrencies] = React.useState<ICurrency[]>([]);
  const [currentPair, setCurrentPair] = React.useState("");
  const [price, setPrice] = React.useState("0.00");
  const [pastData, setPastData] = React.useState<IFormatedHistoricalData>({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: "",
        borderColor: "",
        fill: true,
      },
    ],
  });

  const ws = React.useRef<WebSocket | null>(null);
  const url = "https://api.pro.coinbase.com";
  let firstRender = React.useRef<Boolean>(false);

  React.useEffect(() => {
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");

    const apiCall = async () => {
      await fetch(url + "/products")
        .then((res) => res.json())
        .then((data: ICurrency[]) => {
          // Filter EUR currencies
          let euroCurrencies = data.filter(
            (cur) => cur.quote_currency === "EUR"
          );

          // Sort alphabetically
          euroCurrencies = euroCurrencies.sort((a, b) => {
            if (a.base_currency < b.base_currency) {
              return -1;
            }
            if (a.base_currency > b.base_currency) {
              return 1;
            }
            return 0;
          });

          setCurrencies(euroCurrencies);
        });

      firstRender.current = true;
    };

    apiCall();
  }, []);

  React.useEffect(() => {
    if (!firstRender.current) {
      return;
    }

    let msg = {
      type: "subscribe",
      product_ids: [currentPair],
      channels: ["ticker"],
    };

    let jsonMsg = JSON.stringify(msg);
    ws.current!.send(jsonMsg);

    const historicalDataURL = `${url}/products/${currentPair}/candles?granularity=86400`;

    const fetchHistoricalData = async () => {
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data: number[][]) => {
          let formattedData = formatData(data);
          setPastData(formattedData);
        });
    };

    fetchHistoricalData();

    ws.current!.onmessage = (e) => {
      let data = JSON.parse(e.data);
      console.log(e);

      if (data.type !== "ticker") {
        return;
      }

      if (data.product_id === currentPair) {
        setPrice(data.price);
      }
    };
  }, [currentPair]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let unsubMsg = {
      type: "unsubscribe",
      product_ids: [currentPair],
      channels: ["ticker"],
    };

    let unsub = JSON.stringify(unsubMsg);

    ws.current!.send(unsub);

    setCurrentPair(e.target.value);
  };

  return (
    <div className="container">
      <select name="currency" value={currentPair} onChange={handleSelect}>
        {currencies.map((cur, idx) => {
          return (
            <option key={idx} value={cur.id}>
              {cur.display_name}
            </option>
          );
        })}
      </select>

      <Dashboard price={price} data={pastData} />
    </div>
  );
};

export default App;
