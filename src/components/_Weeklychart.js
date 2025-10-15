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
import moment from "moment";
import { Skeleton } from "antd";

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

function getLastSixWeeks() {
  const lastSixWeeks = [];
  for (let i = 5; i >= 0; i--) {
    const startDate = moment().subtract(i, "weeks").startOf("isoWeek");
    const weekNumber = startDate.isoWeek();
    lastSixWeeks.push({
      startDate: startDate.format("DD-MM-YYYY"),
      weekNumber: weekNumber,
    });
  }
  return lastSixWeeks;
}

export const UserWeeklyChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const lastSixWeeks = getLastSixWeeks();

  const barChartData = {
    labels: lastSixWeeks.map(({ startDate }) => startDate),
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
    data?.map(({ interval, count }) => {
      const findIndex = lastSixWeeks.findIndex(
        ({ weekNumber }) => weekNumber == parseInt(interval)
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

export default UserWeeklyChart;

function getLastSixWeeks1() {
  const lastSixWeeks = [];
  for (let i = 5; i >= 0; i--) {
    lastSixWeeks.push(
      moment().subtract(i, "weeks").startOf("isoWeek").format("YYYY-MM-DD")
    );
  }
  return lastSixWeeks;
}
