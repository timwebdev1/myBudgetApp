
import React, { useState, useEffect } from 'react'
// import axios from 'axios'
import { PieChart } from '../../components/pieChart/PieChart'
import { VertBarChart } from '../../components/vertBarChart/VertBarChart'
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BudgetOverview from '../../components/BudgetOverview/BudgetOverview';
import BudgetNotes from '../../components/budgetNotes/BudgetNotes';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { transService, budgetService, tagService } = api;

  const [budgetName, setBudgetName] = useState("")
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [yearlyIncome, setYearlyIncome] = useState([])
  const [yearlyExpenses, setYearlyExpenses] = useState([])
  const [budget_id, setBudgetId] = useState("");
  const [budgetList, setBudgetList] = useState([]);
  const [monthIncomeTotal, setMonthIncomeTotal] = useState(0)
  const [monthExpensesTotal, setMonthExpensesTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const user_id = user?.userId;

  useEffect(() => {
    const loadBudgetList = async () => {
      if(user && user_id){
        try {
          setLoading(true)
          setError(null)
        const result = await budgetService.getByUser(user_id);
        setBudgetList(result);
      } catch (error) {
        console.error("Error fetching budget data", error);
        setError("Failed to load budgets")
      } finally {
        setLoading(false)
      }
    }
    };
    loadBudgetList();
  }, [user, user_id, budgetService]);

  const handleChange = (e) => {
    setBudgetId(e.target.value);

    // Reset previous data when changing budget
    setMonthlyExpenses([])
    setYearlyIncome([])
    setYearlyExpenses([])
  }

  const findMonthlyExpenses = async () => {
    try {
      setMonthlyExpenses([])

      // Removed axios and transitioning to api service instead
      // const fetchData = await axios.get(`http://localhost:8080/api/transactions/budget/${budget_id}`)
      // const tagsData = await axios.get(`http://localhost:8080/api/tags/user/${user_id}`)

      const fetchData = await transService.getAll(budget_id, {});
      const tagsData = await tagService.getUserTags(user_id);
      
      let date = new Date().toISOString()
      let yearMonth = date.slice(0, 7)

      // Handle the transformed data structure from transService.getAll
      let allTransactions = [];
      fetchData.forEach(transaction => {
        if (transaction.hasChildren && transaction.splits) {
          // Add child transactions
          allTransactions.push(...transaction.splits.map(split => ({
            ...split,
            income: transaction.income,
            createdData: transaction.createdDate
          })));
        } else {
          allTransactions.push(transaction);
        }
      });

      let filterArr = allTransactions.filter(obj => !obj.income && obj.createdDate.startsWith(yearMonth))

      let tagExpenseObj = {}

      filterArr.forEach(item => 
        {
          if(item.tagId != null)
          {
          let tag = tagsData.find(tag =>  tag.id === item.tagId)?.name || 'Unknown'

          if (tagExpenseObj[tag]) {
            tagExpenseObj[tag] += item.amount
          } else {
            tagExpenseObj[tag] = item.amount
          }
          }
          else if (item.splits) {
            item.splits.forEach(split =>{
              var tagIdParsed = parseInt(split.tag.substring(7,8));
              let tag = tagsData.find(tag =>  tag.id === tagIdParsed)?.name || 'Unknown'

              if (tagExpenseObj[tag]) {
                tagExpenseObj[tag] += split.splitAmount
              } else {
                tagExpenseObj[tag] = split.splitAmount
              }
            });
          }
      })

      let expenses = [];
      for (let tag in tagExpenseObj) {
        expenses.push({ [tag]: tagExpenseObj[tag] });
      }

      setMonthlyExpenses(expenses)
    } catch (e) {
      console.error("Error fetching monthly expenses:", e)
      setError("Failed to load monthly expenses")
    }
  }

  const findYearlyData = async () => {
    try {
      setError(null)
      // const fetchData = await axios.get(`http://localhost:8080/api/transactions/budget/${budget_id}`)
      const fetchData = await transService.getAll(budget_id, {});

      let date = new Date()
      let year = date.getFullYear().toString()

      // Handle the transformed data structure
      let allTransactions = [];
      fetchData.forEach(transaction => {
        if (transaction.hasChildren && transaction.splits) {
          allTransactions.push(...transaction.splits.map(split => ({
            ...split,
            income: transaction.income,
            createdDate: transaction.createdDate
          })));
        } else {
          allTransactions.push(transaction);
        }
      });

      let filterYearIncome = allTransactions.filter(obj => obj.income && obj.createdDate.startsWith(year))
      let filterYearExpenses = allTransactions.filter(obj => !obj.income && obj.createdDate.startsWith(year))

      let yearIncome = []
      let yearExpenses = []

      for (let month = 1; month <= 12; month++) {
        let monthYear
        if (month < 10) {
          monthYear = year + "-0" + month.toString()
        } else {
          monthYear = year + "-" + month.toString()
        }

        let monthIncome = filterYearIncome.filter(obj => obj.createdDate.startsWith(monthYear))
        let monthExpenses = filterYearExpenses.filter(obj => obj.createdDate.startsWith(monthYear))

        let totalMonthIncome = 0
        let totalMonthExpenses = 0

        monthIncome.forEach(obj => {
          totalMonthIncome += obj.amount
        })

        monthExpenses.forEach(obj => {
          totalMonthExpenses += obj.amount
        })

        yearIncome[month - 1] = totalMonthIncome
        yearExpenses[month - 1] = totalMonthExpenses
      }

      setYearlyIncome(yearIncome)
      setYearlyExpenses(yearExpenses)
    } catch (e) {
      console.error("Error fetching yearly data:", e);
      setError("Failed to load yearly data")
    }
  };

  const findMonthData = async () => {
    try {
      setError(null)
      // const fetchData = await axios.get(`http://localhost:8080/api/transactions/budget/${budget_id}`)
      const fetchData = await transService.getAll(budget_id, {});

      let date = new Date().toISOString()
      let yearMonth = date.slice(0, 7)

      // Handle the transformed data structure
      let allTransactions = [];
      fetchData.forEach(transaction => {
        if (transaction.hasChildren && transaction.splits) {
          allTransactions.push(...transaction.splits.map(split => ({
            ...split,
            income: transaction.income,
            createdDate: transaction.createdDate
          })));
        } else {
          allTransactions.push(transactions);
        }
      });

      let filterMonthIncome = allTransactions.filter(obj => obj.income && obj.createdDate.startsWith(yearMonth))
      let filterMonthExpenses = allTransactions.filter(obj => !obj.income && obj.createdDate.startsWith(yearMonth))

      let totalMonthIncome = 0
      let totalMonthExpenses = 0

      filterMonthIncome.forEach(obj => {
        totalMonthIncome += obj.amount
      })

      filterMonthExpenses.forEach(obj => {
        totalMonthExpenses += obj.amount
      })

      setMonthIncomeTotal(totalMonthIncome)
      setMonthExpensesTotal(totalMonthExpenses)
    } catch (e) {
      console.error("Error fetching month data:", e);
      setError("Failed to load monthly totals")
    }
  }

  useEffect(() => {
    if (budget_id && user_id) {
      const loadAllData = async () => {
        setLoading(true)
        try {
          await Promise.all([
      findMonthlyExpenses(),
      findYearlyData(),
      findMonthData()
          ]);
        } catch (error) {
          console.error("Error loading data:", error)
        } finally {
          setLoading(false)
        }
      } 
      loadAllData();
    }
  }, [budget_id, user_id]);

  if (!user) {
    return <div>Please log in to access your profile.</div>
  }


  return (
    <>
      <h1 className='text-6xl'>Profile: {user.username}</h1>
      <p>{budgetName}</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div>
        <Link to="/budget/add">
          <button className="my-8 mx-2 px-4 rounded-full px-4 py-2 bg-blue-500 text-white">Create Budget</button>
        </Link>
        <Link to="/transaction/add">
          <button className="my-8 mx-2 px-4 rounded-full px-4 py-2 bg-blue-500 text-white">Add Transaction</button>
        </Link>
      </div>
      
      <div>
        <select id="budgetSelect" value={budget_id} onChange={handleChange} className="mx-4" disabled={loading}>
          <option value=''>Please Select a Budget</option>
          {budgetList.map(budget => (
            <option key={budget.id} value={budget.id}>{budget.name}</option>
          ))}
        </select>
        <button 
          className="rounded-full px-4 py-2 bg-blue-500 text-white" 
          onClick={(e) => { 
            console.log("Navigating to: ", `/transaction/budget/${budget_id}`); 
            navigate(`/transaction/budget/${budget_id}`) 
          }}
          disabled={!budget_id}
        >
          Search Transactions
        </button>
      </div>

      {loading && <div>Loading data...</div>}

      <div className="flex space-x-20">
        <PieChart budgetName={budgetName} monthlyExpenses={monthlyExpenses} />
        <BudgetNotes monthIncomeTotal={monthIncomeTotal} monthExpensesTotal={monthExpensesTotal} />
        <VertBarChart yearlyIncome={yearlyIncome} yearlyExpenses={yearlyExpenses} />
      </div>
      <BudgetOverview monthlyExpenses={monthlyExpenses} />
    </>
  )
}


export default Profile;