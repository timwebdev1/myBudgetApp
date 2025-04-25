import React, {useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import api from '../../services/api.js';
import SplitPopup from './SplitPopup.jsx';

function TransactionList({budget_id}) {

    console.log("Received budget ID", budget_id);

    const [transactions, setTransactions] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedTransaction, setSelectedTransactions] = useState(null);
    
    const {transService} = api;

    useEffect(() => {

        const fetchAllTransactions = async() => {
            if (!budget_id) {
                console.error("No budget ID");
                return;
            }
            try{
                const results = await transService.getAll(budget_id);
                console.log("raw transaction data:", results );

                const processedTransactions = await Promise.all(
                    results.map(async (transaction) => {
                        // Create a new object for this transaction
                        let enrichedTransaction = { ...transaction };
                        try {
                            // Get tag data if transaction has a tagId
                            if (transaction.tagId) {
                                const tagData = await transService.getTag(transaction.tagId);
                                enrichedTransaction.tag = tagData;
                            }

                    // Get split data if exists
                    if (transaction.splits && transaction.splits.length > 0) {
                        // Get tag data for each split
                        const splitsWithTags = await Promise.all(transaction.splits.map(async (split) => {
                            console.log("Split in ProcessedTransactions:", split)
                            console.log("TagId", split.tag.substring(7,8));
                            if (split.tagId) {
                                const splitTagData = await transService.getTag(split.tagId);
                                return { ...split, tag: splitTagData };
                            }
                           
                            return {...split, tagId:split.tag.substring(7,8)};
                        }));
                        enrichedTransaction.splits = splitsWithTags;
                    }
                       
                    }

                 catch (error) {
                    console.error(`Error processing transaction ${transaction.id}:`, error);
                 }
                    return enrichedTransaction; // Return transaction even if tag fetch fails
            })
        
    );
            console.log("Processed transactions:", processedTransactions);
            setTransactions(processedTransactions);
        } catch (error) {
            console.error('Could not fetch transactions:', error);
        }
        };

        if(budget_id){
            fetchAllTransactions();
        }
       
    }, [budget_id, transService]);

    const formatDate= (dateStr) => {
        const dateObj = new Date(dateStr);
        return dateObj.toLocaleDateString('en-US', {
            
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        })
    }

    const handleDelete = async (transactionId) => {
        const confirmed = window.confirm("Are you sure you want to delete this transaction? This cannot be undone.")
        if(confirmed){
            try {
                await transService.delete(transactionId);
                setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
                alert('Transaction deleted successfully!');
                } catch (error) {
                console.error('Error deleting transaction', error);
                alert('Error deleting transaction. Plesae try again.');
            }
        } else {
            console.log("Did not delete transaction.")
        }
    }

    // Handle viewing split details
    const handleViewSplit = async (transactionId) => {
        console.log("View Split clicked for transaction ID:", transactionId);
        try {
            const transaction = transactions.find(t => t.id === transactionId);
            console.log("Found transaction:", transaction);
            if (transaction && transaction.splits) {
                console.log("Splits found:", transaction.splits);
                const splitsWithTags = await Promise.all(
                    transaction.splits.map(async (split) => {
                        console.log("Split Data:", split);
                        if (split.tagId) {
                            const tagData = await transService.getTag(split.tagId);
                            console.log("Tag data for split:", tagData);
                            return { ...split, tag: tagData };
                        }
                        return { ...split, tag: null };
                    })
                );
                 console.log("Enriched transaction with splits and tags:", { ...transaction, splits: splitsWithTags });
                setSelectedTransactions({
                    ...transaction,
                    splits: splitsWithTags
                });
                console.log("Selected transaction state after update:", selectedTransaction);
               
                setIsPopupVisible(true);
                console.log(selectedTransaction);   
            } else {
                console.error(`Transaction with ID ${transactionId} not found`);
            }
        } catch (error) {
            console.error("Error fetching split data:", error);
            alert("Failed to fetch split data.");
        }
    };

    // Close the split popup
    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedTransactions(null);
    };
    

    return(
        <div>
            <div class="my-8">
            <SearchBar setTransactions = {setTransactions} budget_id={budget_id} />
            </div>
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">ID</th>
                        <th scope="col" class="px-6 py-3">Amount</th>
                        <th scope="col" class="px-6 py-3">Tag</th>
                        <th scope="col" class="px-6 py-3">Description</th>
                        <th scope="col" class="px-6 py-3">Created On</th>
                        <th scope="col" class="px-6 py-3">Action</th>
                        <th scope="col" class="px-6 py-3">Split transaction</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (<tr><td>No transactions available</td></tr>) : (
                    transactions.map((transaction,index) => (
                        <tr key={index} class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                            <td class="px-6 py-4">{transaction.id}</td>
                            <td class="px-6 py-4">{transaction.amount}</td>
                            <td class="px-6 py-4">{transaction.splits && transaction.splits.length > 0 ? 'No tag' : (transaction.tag ? transaction.tag.name : 'No tag')}</td>
                            <td class="px-6 py-4">{transaction.description}</td>
                            <td class="px-6 py-4">{transaction.createdDate ? formatDate(transaction.createdDate) : 'No Date'}</td>
                            <td class="px-6 py-4">
                                <button 
                                    onClick={() => handleDelete(transaction.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                Delete
                                </button>
                            </td>
                            <td class="px-6 py-4">
                            <button 
                                   onClick={() =>handleViewSplit(transaction.id) } 
                                   disabled = {!transaction.splits || transaction.splits.length === 0}
                                   className={`${
                                    transaction.splits && transaction.splits.length > 0
                                        ? 'text-green-500 hover:text-green-700 cursor-pointer' 
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                                >
                                View Split
                                </button>
                                </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            {isPopupVisible && selectedTransaction && (
                <SplitPopup
                    transaction={selectedTransaction}
                    onClose={closePopup} // Close the popup
                />
            )}
        </div>
    );
};

export default TransactionList;