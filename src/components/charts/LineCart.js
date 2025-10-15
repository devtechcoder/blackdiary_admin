import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  const dummy = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [null, null, null, null, null, null, null, null, null, null, null, null], // Starting from June
        borderColor: '#F3E008',
        tension: 0.1,
        spanGaps: true, // Add this option
      },
      {
        label: 'Dataset 2',
        data: [null, null, null, null, null, null, null, null, null, null, null, null], // Starting from June
        borderColor: '#383B42',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: true, // Add this option
        // yAxisID: 'y1',
      },
    ],
  };
  
  const LineChart = ({ data}) => {
  
  
    const options = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      plugins: {
        legend: {
          display: data ? true :false, // Hide the dataset label
        },
      },
    };
  
    return (
      <div>
        <Line
          data={data ?? dummy}
          options={options}
        />
      </div>
    )
  }
  
  export default LineChart