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
import React, { useEffect, useState } from "react";

import apiPath from "../constants/apiPath";
import { Severty, ShowToast } from "../helper/toast";
import useRequest from "../hooks/useRequest";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  BarElement
);

export const options = {
  type: "line",
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
      text: "Analysis Report",
    },
  },
};

const labels = ["Q1", "Q2", "Q3", "Q4"];

export const UserQuarterlyChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  const { request } = useRequest();

  const barChartData = {
    labels: labels,
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
    const arr = [0, 0, 0, 0, 0, 0];
    const result = data.map(({ interval, count }) => {
      const findIndex = labels?.findIndex(
        (item) => item?.toLowerCase() == interval?.toLowerCase()
      );
      if (findIndex != -1) {
        arr[findIndex] = count;
      } else {
        arr[findIndex] = 0;
      }
    });
    console.log(arr, "llll");
    setChartData(arr);
  }, []);

  return (
    <div>
      <Line options={options} data={barChartData} />
    </div>
  );
};

export default UserQuarterlyChart;
