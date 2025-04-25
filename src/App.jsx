import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import Home from './pages/home/Home';
import About from './pages/about/About';
import Login from '.components/Login/Login';
import Register from '.components/Register/Register';
import Profile from './pages/profile/Profile';
import Transaction from '.components/Transaction/Transaction'
import IncomeSplit from '.components/IncomeSplit/IncomeSplit'
import Contact from './pages/contact/Contact';
import TransactionSearch from '.components/TransactionSearch/TransactionSearch';


import NavHeader from '.components/navHeader/NavHeader';
import Footer from '.components/footer/Footer';

import { AuthProvider } from './context/AuthContext';
import CreateBudget from '.components/CreateBudget/CreateBudget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavHeader></NavHeader>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/about' element={<About />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/profile' element={<Profile />}/>
          <Route path='/transaction/add' element={<Transaction />}/>
          <Route path='/incomeSplit' element={<IncomeSplit />}/>
          <Route path='/contact' element={<Contact />}/>
          <Route path='/transaction/budget/:budget_id' element={<TransactionSearch/>}/>
          <Route path='/budget/add' element={<CreateBudget />}/>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
