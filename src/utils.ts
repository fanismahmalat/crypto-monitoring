import { IFormatedHistoricalData } from "./interfaces";

export const formatData = (data: number[][]) => {
  let finalData: IFormatedHistoricalData = {
    labels: [],
    datasets: [
      {
        label: "Price",
        data: [],
        backgroundColor: "rgb(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
    ],
  };

  // Convert dates from timestamp to mm/dd/yy format
  let dates = data.map((val) => {
    const ts = val[0];
    let date = new Date(ts * 1000);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let final = `${day}/${month}/${year}`;
    return final;
  });

  // Coinbase API returns multiple price values, we want the ending price for that day
  let priceArr = data.map((val) => {
    return val[4];
  });

  // Reverse price array so it is in chronological order
  priceArr.reverse();

  // Do same for dates
  dates.reverse();

  // Set data labels as the date array for ChartJS
  finalData.labels = dates;

  // Price array will be used as dataset for ChartJS
  finalData.datasets[0].data = priceArr;

  return finalData;
};
