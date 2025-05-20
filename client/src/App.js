import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css';
import AuthForm from './authForm/authForm';
import Home from './home/home';
import ProductDetails from './productDetails/productDetails';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<AuthForm />}/>
        <Route path='/home' element={<Home />}/>
        <Route path='/productdetails/:id' element={<ProductDetails />}/>
      </Routes>
    </Router>
  )
}

export default App;
