import React, {useState} from 'react';
import api from '../../services/api.js';
import {useNavigate, Link} from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

function CreateBudget(){

    const { user } = useAuth();
    const [name, setName] = useState('');


    const {budgetService} = api;
    const navigate = useNavigate();

    if (!user) {
            console.log("User is not defined. Please log in.");
        return (
          <div className="flex justify-center items-center min-h-screen bg-black">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-black">Please log in to add transactions</p>
              <Link to="/login">
                <button
                  className="mt-4 w-full py-2 bg-lightblue text-white rounded-md hover:bg-green 
                            hover:text-black focus:outline-none focus:ring-2 focus:ring-blue"
                >
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        );
      }

      const handleSubmit = async(e) => {
        e.preventDefault();

        if (!user || !user.userId) {
            console.error("🚨 Error: User is not defined in handleSubmit!");
            alert("Authentication issue detected. Please log in again.");
            return;
          }

          const budget = {
                name
            }

          const params = {
            user_id: user.userId
          }

          try{
            const response = await budgetService.add(budget, params);
            console.log("Budget created: ", response);
            alert("Budget created successfully!");
            navigate("/profile")

          } catch (error) {
            console.log("Budget error: ", error);
            alert("Error saving budget. Please try again.");

          }
      };

      return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center mb-6 text-black">New Budget</h1>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 text-black">
                        <label>Budget Name
                            <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md bg-white"
                            />
                        </label>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="my-8 mx-4 px-4 flex-1 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                        Create Budget
                        </button>
                        <Link to="/profile" className="flex-1">
                            <button
                              type="button"
                              className="my-8 mx-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
                </div>
            </div>


        </>

      );

}

export default CreateBudget;