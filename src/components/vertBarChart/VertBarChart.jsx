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
// import faker from 'faker';

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
            position: 'top',
        },
        title: {
            display: true,
            text: 'Yearly Income v. Expense',
        },
    },
};

export function VertBarChart({ yearlyIncome, yearlyExpenses }) {

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Income',
                data: yearlyIncome,
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
            },
            {
                label: 'Expense',
                data: yearlyExpenses,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
            },
        ],
    };

    return (
        <>
            <div className='size-4/12 flex justify-start items-center min-h-screen'>
                <Bar options={options} data={data} />
            </div>
        </>
    )
}
