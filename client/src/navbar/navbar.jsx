import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import './navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [showWishlist, setShowWishlist] = useState(false);
  const [showcartlist, setShowcartlist] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartlistItems, setcartlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showcartlist) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/search/buy', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
        .then((res) => res.ok ? res.json() : Promise.reject('Failed to load wishlist'))
        .then(setcartlistItems)
        .catch(console.error);
    }
  }, [showcartlist]);
  useEffect(() => {
    if (showWishlist) {
      const token = localStorage.getItem('token');

      fetch('http://localhost:5000/api/wishlisted', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
        .then((res) => res.ok ? res.json() : Promise.reject('Failed to load wishlist'))
        .then(setWishlistItems)
        .catch(console.error);
    }
  }, [showWishlist]);
  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    fetch(`http://localhost:5000/api/products/search?name=${encodeURIComponent(searchTerm)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then((data) => {
        setSearchResults(data);
        // console.log('Search Results:', data);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Search error:', err);
      });
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    navigate('/');
  }
  return (
    <>
      <header className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search any things"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="actions">
          <div className="icon-wrapper" onClick={() => setShowWishlist(true)}>
            <FaHeart />&nbsp;
            <span className="badge">{wishlistItems.length}</span>
          </div>
          <span className="signin" onClick={handleLogout} style={{ cursor: 'pointer' }}>&nbsp;logout&nbsp;</span>
          <div className="icon-wrapper" onClick={() => setShowcartlist(true)}>
            <FaShoppingCart />&nbsp;
            <span className="badge">{cartlistItems.length}</span>
          </div>
          <span className="cart-text">&nbsp;Cart</span>
        </div>
      </header>

      {showWishlist && (
        <div className="wishlist-drawer">
          <div className="wishlist-header">
            <span style={{ color: 'white', marginTop: '20px', marginLeft: '40px' }}>
              <span className="slide-icon">♡</span>&nbsp;Items
            </span>
            <button className='undo-btn' onClick={() => setShowWishlist(false)} style={{ border: 'none', color: "white", marginTop: '15px' }}>&gt;</button>
          </div>
          {wishlistItems.length === 0 ? (
            <p className="empty-msg">No items in wishlist.</p>
          ) : (
            wishlistItems.map(item => (
              <div className="wishlist-item" key={item._id}>
                <img src={item.image} alt={item.name} />
                <div
                  style={{ cursor: 'pointer' }} onClick={() => navigate(`/productdetails/${item.productId._id}`)}>
                  <p className="wishlist-name">{item.name}</p>
                  <p>${item.price}</p>
                  <div className="stars">⭐️⭐️⭐️⭐️☆</div>
                </div>
                <button className="remove-btn" onClick={() => {
                  fetch(`http://localhost:5000/api/wishlist/delete/${item.name}`, {
                    method: 'DELETE',
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      alert(data.message);
                      setWishlistItems((prev) => prev.filter(w => w.name !== item.name));
                    })
                    .catch((err) => {
                      console.error('Failed to remove item:', err);
                    });
                }}>✕</button>
              </div>
            ))
          )}
        </div>
      )}

      {showcartlist && (
        <div className="wishlist-drawer">
          <div className="wishlist-header">
            <span style={{ color: 'white', marginTop: '20px', marginLeft: '40px' }}>
              <span className="slide-icon"><FaShoppingCart /></span>&nbsp;Items
            </span>
            <button className='undo-btn' onClick={() => setShowcartlist(false)} style={{ border: 'none', color: "white", marginTop: '15px' }}>&gt;</button>
          </div>
          {cartlistItems.length === 0 ? (
            <p className="empty-msg">No items in cart.</p>
          ) : (
            cartlistItems.map(item => (
              <div className="wishlist-item" key={item._id}>
                <img src={item.image} alt={item.name} />
                <div
                  style={{ cursor: 'pointer' }} onClick={() => navigate(`/productdetails/${item.productId._id}`)}>
                  <p className="wishlist-name">Name : {item.name}</p>
                  <p className="wishlist-name">Ram : {item.ram}</p>
                  <p className="wishlist-name">Quantity : {item.quantity}</p>
                  <p>Price$ : {item.price}</p>
                </div>
                <button className="remove-btn" onClick={() => {
                  fetch(`http://localhost:5000/api/buy/delete/${item.name}`, {
                    method: 'DELETE',
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      alert(data.message);
                      setcartlistItems((prev) => prev.filter(w => w.name !== item.name));
                    })
                    .catch((err) => {
                      console.error('Failed to remove item:', err);
                    });
                }}>✕</button>
              </div>
            ))
          )}
        </div>
      )}

      {searchResults.length > 0 && showResults && (
        <div style={{ padding: '10px', background: '#f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: '#1e3a8a' }}>Search Results:</h4>
            <button
              onClick={() => setShowResults(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#333',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {searchResults.map((item) => (
              <div
                onClick={() => navigate(`/productdetails/${item._id}`)}
                key={item._id}
                style={{
                  width: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  padding: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <img
                  style={{ width: '80px', height: '80px' }}
                  src={item.image}
                  alt={item.name}
                  className="search-card-img"
                />
                <h5 style={{ margin: '10px 0 5px' }}>{item.name}</h5>
                <p style={{ color: '#1e3a8a', fontWeight: 'bold' }}>${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}


    </>
  );
}

export default Navbar;
