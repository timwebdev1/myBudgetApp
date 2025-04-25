import React from 'react';

function SplitPopup({ transaction, onClose }) {
    if (!transaction) {
        return null; // No transaction to display if none is selected
    }

    const splits = transaction.splits || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 p-2 rounded-full"
                >
                    X
                </button>
                <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
                <div className="space-y-4">
                    <p><strong>Transaction ID:</strong> {transaction.id}</p>
                    <p><strong>Amount:</strong> {transaction.amount}</p>
                    <p><strong>Description:</strong> {transaction.description}</p>
                    <p><strong>Created On:</strong> {new Date(transaction.createdDate).toLocaleDateString()}</p>
                </div>

                {/* Split Details Section */}
                <h3 className="text-lg font-medium mt-6">Split Transaction Details</h3>
                {splits && splits.length > 0 ? (
                    <table className="w-full mt-4 table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Split Amount</th>
                                <th className="px-4 py-2 text-left">Tag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {splits.map((split, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">{split.splitAmount}</td>
                                    <td className="px-4 py-2">{split.tag != null? split.tag.name : "No Tag"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="mt-2">No splits available for this transaction.</p>
                )}
            </div>
        </div>
    );
}

export default SplitPopup;
