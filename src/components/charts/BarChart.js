import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { currency } from '../../components/Currency';
import { useAuthContext } from '../../context/AuthContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
        },
        title: {
            display: true,
        },
    },
};

const labels = ['1st Week', '2nd Week', '3rd Week', '4th Week'];

const dummy = {
    labels: [],
    datasets: [],
};

const BarChart = ({ data }) => {

    return <Bar  className='ddddff' options={options} data={data ?? dummy} />;
}

export default BarChart
