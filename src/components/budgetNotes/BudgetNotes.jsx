import React from 'react'

const BudgetNotes = ({ monthIncomeTotal, monthExpensesTotal }) => {
    console.log(monthIncomeTotal);
    console.log(monthExpensesTotal);

    let percentage = monthExpensesTotal / monthIncomeTotal

    const findPercentage = () => {
        if (monthExpensesTotal === 0 && monthIncomeTotal === 0) {
            return;
        }

        if (monthIncomeTotal === 0) {
            return (
                <div className="flex justify-center items-center min-h-[60vh] text-red-900 font-bold border-2 border-[#FF7F7F] bg-[#FF7F7F]/50 mt-[20vh] p-6">
                    <h1 className="underline text-6xl">Analysis</h1>
                    <br />
                    <p>Keep an eye on your spending! Try to add more income or decrease spending to prevent going too much into debt!</p>
                    <br />
                    <p>This month you have spent ${monthExpensesTotal}, while you have earned ${monthIncomeTotal}. You have no income.</p>
                </div>
            )
        }

        if (percentage < 0.5) {
            return (
                <div className="flex flex-col justify-center items-center min-h-[60vh] text-green-900 font-bold border-2 border-[#BBFF9E] bg-[#BBFF9E]/50 mt-[20vh] p-6">
                    <h1 className="underline text-6xl">Analysis</h1>
                    <br />
                    <p>Top tier budgeting!</p>
                    <br />
                    <p>This month you have spent ${monthExpensesTotal}, while you have earned ${monthIncomeTotal}. That is {(percentage * 100).toFixed(3)}% of your income.</p>
                </div>
            )
        }

        if (percentage < 0.7 && percentage >= 0.5) {
            return (
                <div className="flex flex-col justify-center items-center min-h-[60vh] text-blue-900 font-bold border-2 border-[#A7C7E7] bg-[#A7C7E7]/50 mt-[20vh] p-6">
                    <h1 className="underline text-6xl">Analysis</h1>
                    <br />
                    <p>You're doing great!</p>
                    <br />
                    <p>This month you have spent ${monthExpensesTotal}, while you have earned ${monthIncomeTotal}. That is {(percentage * 100).toFixed(3)}% of your income.</p>
                </div>
            )
        }

        if (percentage < 0.8 && percentage >= 0.7) {
            return (
                <div className="flex flex-col justify-center items-center min-h-[60vh] text-orange-900 font-bold border-2 border-[#F9DE87] bg-[#F9DE87]/50 mt-[20vh] p-6">
                    <h1 className="underline text-6xl">Analysis</h1>
                    <br />
                    <p>You are doing normal and saving the minimum recommended amount. Consider decreasing your expenses and increasing your savings, if possible, to better prepare for the future.</p>
                    <br />
                    <p>This month you have spent ${monthExpensesTotal}, while you have earned ${monthIncomeTotal}. That is {(percentage * 100).toFixed(3)}% of your income.</p>
                </div>
            )
        }

        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-900 font-bold border-2 border-[#FF7F7F] bg-[#FF7F7F]/50 mt-[20vh] p-6">
                <h1 className="underline text-6xl">Analysis</h1>
                <br />
                <p>Keep an eye on your spending! Try to add more income or decrease spending to prevent going too much into debt!</p>
                <br />
                <p>This month you have spent ${monthExpensesTotal}, while you have earned ${monthIncomeTotal}. That is {(percentage * 100).toFixed(3)}% of your income.</p>
            </div>
        )
    }

    return (
        <>
            <div className='size-3/12'>
                {findPercentage()}
            </div>
        </>
    )
}

export default BudgetNotes