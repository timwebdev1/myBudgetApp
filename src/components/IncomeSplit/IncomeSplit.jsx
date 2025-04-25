import { useState } from "react";
import api from "../../services/api";

function IncomeSplit(){
    const [totalIncome, setTotalIncome] = useState('');
    const [allocatedFunds, setAllocatedFunds] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, serError] = useState(null)

    const defaultAllocations = {
        'Rent/Mortage' : 40,
        'Food' : 30,
        'Clothing' : 10,
        'Misc.' : 20
    };

    // Handle total income input change
    const handleIncomeChange = (e) => {
        const income = e.target.value;
        setTotalIncome(income);

        // Calculate the allocated funds based on total income and default percentages
        const newAllocatedFunds = {};
        for (const tag in defaultAllocations) {
            newAllocatedFunds[tag] = (income * defaultAllocations[tag]) / 100;
        }

        setAllocatedFunds(newAllocatedFunds); // Update the allocated funds
    };

    const handleSubmit = async() =>{
        const incomeSplitDto = {
            totalIncome : par (totalIncome),
            allocations : allocatedFunds,
        };
        
        try{
            setLoading(true);
            serError(null);

            const response = await api.post("/api/transactions/split-income", incomeSplitDto);

            if(response.status === 201){
                alert("income split successfully created!");
            }
        } catch (err){
            serError("failed to create income split.");
            console.error(err);
        }finally{
            setLoading(false);
        }
    };

    return(
        <div>
            <h1> Income Split Allocator</h1>
            <div>
                <label>Total Income :
                    <input type="number" value={totalIncome} onChange={handleIncomeChange} placeholder="Enter youe total income" />
                </label>
            </div>
            <h3>Allocate Funds for each tags</h3>
            {Object.keys(defaultAllocations).map((tag) =>(
                <div key={tag}>
                    <label> {tag} ({defaultAllocations[tag]}%):
                        <div>${allocatedFunds[tag].toFixed(2)}</div>
                    </label>
                </div>
            ))}
            /* Optional: Display Total Allocated (optional sum verification) */
                <div>
                    <label> Total Allocated: 
                        <div>${Object.values(allocatedFunds).reduce((acc, value) => acc + value, 0).toFixed(2)}</div>
                    </label>
                </div>
                <div>{loading ?(
                    <button disabled> Loading...</button>) : (
                        <button onClick={handleSubmit}>Submit Income Split</button>)}
                </div>
                {error && <div style={{color: 'red'}}>{error}</div>
                
                }

        </div>
    )
}
export default IncomeSplit;
