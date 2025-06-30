import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function PieChart({ monthlyExpenses = [] }) {
// Handle empty or invalid data
if (!Array.isArray(monthlyExpenses) || monthlyExpenses.length === 0) {
    return (
        <div className='size-4/12 flex justify-center items-center min-h-screen'>
            <div className='text-center'>
                <p>No expense data available</p>
                <p className='text-sm text-gray-500'>Select a budget to view expense breakdown</p>
            </div>
        </div>
    );
}

    const labels = []
    const values = []

    for (let expense of monthlyExpenses) {
        for (let tag in expense) {
            labels.push(tag)
            values.push(expense[tag])
        }
    }

// Check if we have valid data after processing
if (labels.length === 0 || values.length === 0) {
    return (
        <div className='size-4/12 flex justify-center items-center min-h-screen'>
            <div className='text-center'>
                <p>No expense data for this month</p>
            </div>
        </div>
    );
}

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Monthly Amount: ',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 71, 0.2)',
                    'rgba(106, 90, 205, 0.2)',
                    'rgba(255, 165, 0, 0.2)',
                    'rgba(34, 193, 195, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 71, 1)',
                    'rgba(106, 90, 205, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(34, 193, 195, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
                    <div className='size-4/12 flex justify-start items-center min-h-screen'>
                <Pie data={data} />
            </div>
    );
}

