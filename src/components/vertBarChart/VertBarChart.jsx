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

export function VertBarChart({ yearlyIncome = [], yearlyExpenses = [] }) {
//  Handle empty or invalid data
if (!Array.isArray(yearlyIncome) || !Array.isArray(yearlyExpenses)) {
    return (
        <div className='size-4/12 flex justify-center items-center min-h-screen'>
            <div className='text-center'>
                <p>No yearly data available</p>
                <p className='text-sm text-gray-500'>Select a budget to view yearly comparison</p>
            </div>
        </div>
    );
}

// Check if arrays have data (not all zeros)
const hasIncomeData = yearlyIncome.some(value => value > 0);
const hasExpenseData = yearlyExpenses.some(value => value > 0);

if (!hasIncomeData && !hasExpenseData) {
    return (
        <div className='size-4/12 flex justify-center items-center min-h-screen'>
            <div className='text-center'>
                <p>No income or expense data for this year</p>
            </div>
        </div>
    );
}

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
