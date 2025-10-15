import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import React, { useEffect, useState } from "react";

import apiPath from "../constants/apiPath";
import { Severty, ShowToast } from "../helper/toast";
import useRequest from "../hooks/useRequest";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  BarElement,
);

const labels = [
  "Jan",
  "Fab",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const options = {
  type: "line",
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Analysis Report",
    },
  },
};

const dummyBarChartData = {
  labels: ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Count",
      data: [1, 0, 30, 50, 20, 40, 10, 0],
      backgroundColor: "rgba(52, 122, 226, 0.16)",
      borderColor: "red",
      borderWidth: 1,
      pointStyle: "circle",
      pointRadius: 10,
      pointHoverRadius: 15,
    },
  ],
};

export const UserMonthlyChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
 

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Count",
        data: chartData,
        backgroundColor: "rgba(52, 122, 226, 0.16)",
        borderColor: "red",
        borderWidth: 1,
        pointStyle: "circle",
        pointRadius: 10,
        pointHoverRadius: 15,
      },
    ],
  };

  useEffect(() => {


    let datasets = labels.map((ff, index) => {
      const find = data.find(
        (item) => parseInt(item.interval) - 1 == index,
      );
      if (find) {
        return find.count;
      }
      return null;
    });


    setChartData(datasets);


  }, []);

  return (
    <div>
      <Line
        borderColor="#1EB564"
        options={options}
        data={barChartData ?? dummyBarChartData}
      />
    </div>
  );
};


export default UserMonthlyChart;
