
import { useParams } from "react-router-dom";
import TransactionList from "./TransactionList";



function TransactionSearch() {
    const { budget_id } = useParams();
  



    return(
       <>
        
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray">Transaction Search</h3>

        <div className="flex justify-center items-center">
                <TransactionList budget_id={budget_id} />
        </div>
            
        </>
    )

}

export default TransactionSearch;