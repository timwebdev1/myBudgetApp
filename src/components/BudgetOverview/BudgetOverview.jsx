import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api"; // Assuming this has the API services
import moment from "moment";
import { split } from "postcss/lib/list";

const BudgetOverview = ({ monthlyExpenses }) => {
  const { user } = useAuth();
  const [budgetList, setBudgetList] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tags, setTags] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: moment().startOf("month"),
    endDate: moment().endOf("month"),
  });

  // Fetch budgets and tags
  useEffect(() => {
    const fetchBudgetAndTags = async () => {
      if (!user?.userId) {
        console.error("User ID is not available");
        return;
      }

      try {
        const budgets = await api.budgetService.getByUser(user.userId);
        setBudgetList(budgets);

        const tagsResponse = await api.tagService.getUserTags(user.userId);
        setTags(tagsResponse);
      } catch (error) {
        console.error("Error fetching budget or tag data", error);
      }
    };

    if (user?.userId) {
      fetchBudgetAndTags();
    }
  }, [user]);

  // Fetch transactions based on selected budget
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedBudget) return;

      try {
        const transactionsResponse = await api.transService.getTransactionsForBudget(selectedBudget.id);
        setTransactions(transactionsResponse);
      } catch (error) {
        console.error("Error fetching transactions", error);
      }
    };

    if (selectedBudget) {
      fetchTransactions();
    }
  }, [selectedBudget]);

  // Group transactions by tags and filter by date range
  useEffect(() => {
    const filterAndGroupTransactions = () => {
      if (transactions.length === 0) return;

      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = moment(transaction.date);
        return transactionDate.isBetween(selectedDateRange.startDate, selectedDateRange.endDate, "day", "[]");
      });

      // Group transactions by tag ID and sum the amounts
      const groupedData = {};

      filteredTransactions.forEach((transaction) => {
        if (transaction.splits && transaction.splits.length > 0) {
          // Process split transactions correctly
          transaction.splits.forEach((split) => {
              const splitTagId = split.tagId;
              const splitAmount = split.splitAmount;

              if (splitTagId && splitAmount) {
                  if (!groupedData[splitTagId]) {
                      groupedData[splitTagId] = {
                          tagName: tags.find(tag => tag.id === splitTagId)?.name || 'Unknown',
                          amount: 0,
                      };
                  }
                  groupedData[splitTagId].amount += splitAmount;
              }
          });
        } else{
        transaction.tags.forEach((tag) => {
          if (!groupedData[tag.id]) {
            groupedData[tag.id] = {
              tagName: tag.name,
              amount: 0,
            };
          }
          groupedData[tag.id].amount += transaction.amount;
        });
        
        // // Process split transaction if they exists
        // if(transaction.splits && transaction.splits.length > 0){
        //   transaction.splits.forEach((split) => {
        //     const splitTagId = split.tagId;
        //     const splitAmount = split.splitAmount;

        //     if(splitTagId && splitAmount){
        //       if(!groupedData[splitTagId]){
        //         groupedData[splitTagId] ={
        //           tagName : 'Unknown',
        //           splitAmount : 0,
        //         };
        //       }
        //       groupedData[splitTagId].splitAmount += splitAmount;
        //     }
        //   })
        }
      });

      // Convert the grouped data into an array and store in state
      setGroupedTransactions(Object.values(groupedData));
    };

    filterAndGroupTransactions();
  }, [transactions, selectedDateRange, tags]);

  // Handle budget selection
  const handleBudgetChange = (e) => {
    const selected = budgetList.find((budget) => budget.id === e.target.value);
    setSelectedBudget(selected);
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange((prev) => ({
      ...prev,
      [name]: moment(value),
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Budget Overview</h2>

      {/* Date Range Filter */}
      <div className="mb-6">
        <label className="block text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={selectedDateRange.startDate.format("YYYY-MM-DD")}
          onChange={handleDateRangeChange}
          className="mt-2 p-2 border border-gray-300 rounded-md"
        />
        <label className="block text-gray-700 mt-4">End Date</label>
        <input
          type="date"
          name="endDate"
          value={selectedDateRange.endDate.format("YYYY-MM-DD")}
          onChange={handleDateRangeChange}
          className="mt-2 p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Grouped Transactions Table */}
      {selectedBudget && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Transactions for {selectedBudget.name}</h3>

          <h4 className="text-lg font-medium mb-2">
            Grouped by Tag for {selectedDateRange.startDate.format("MMM YYYY")}
          </h4>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tag</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {groupedTransactions.map((group, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-800">{group.tagName}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">${group.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display Monthly Expenses */}
      {monthlyExpenses && monthlyExpenses.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Monthly Expenses</h4>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tag</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthlyExpenses.map((expense, index) => {
                const tag = Object.keys(expense)[0]; // Get the tag (e.g., 'Food', 'Rent')
                const amount = expense[tag]; // Get the corresponding expense amount
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-800">{tag}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">${amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
