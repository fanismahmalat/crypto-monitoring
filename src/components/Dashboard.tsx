import React from "react";
import { Line } from "react-chartjs-2";

import { IFormatedHistoricalData } from "../interfaces";

interface IProps {
  price: string;
  data: IFormatedHistoricalData;
}

const Dashboard: React.FC<IProps> = ({ price, data }) => {
  const opts = {
    tooltips: {
      intersect: false,
      mode: "index",
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (price === "0.00") {
    return <p>Please select a currency pair</p>;
  }

  return (
    <div className="dashboard">
      <h2>{`$${price}`}</h2>

      <div className="chart-container">
        <Line type="dash" data={data} options={opts} />
      </div>
    </div>
  );
};

export default Dashboard;
