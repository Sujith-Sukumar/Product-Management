import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './productDetails.css'
import Navbar from '../navbar/navbar'

function ProductDetails() {
    const navigate = useNavigate()
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ram, setRam] = useState('4 GB');
    const [quantity, setQuantity] = useState(1);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState({});


    useEffect(() => {
        fetch(`https://product-management-bk7y.onrender.com/api/products/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then((data) => {
                setProduct(data);
                setEditedProduct(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);
    const getPriceByRam = () => {
        if (!product) return 0;

        const basePrice = product.price;

        switch (ram) {
            case '8 GB':
                return basePrice + basePrice / 2;
            case '16 GB':
                return basePrice * 2;
            default:
                return basePrice;
        }
    };
    const totalPrice = getPriceByRam() * quantity;

    const bybutton = (event) => {
        event.preventDefault()
        const bydata = {
            name: product.name,
            price: totalPrice,
            ram: ram,
            quantity: quantity,
            image: product.image,
            productId: product._id
        }
        const token = localStorage.getItem('token');
        fetch('https://product-management-bk7y.onrender.com/api/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(bydata),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data.message);
                alert('Purchase successful');
            })
            .catch((err) => console.error('Error:', err));
    }
    const addToWishlist = (product) => {
        if (wishlistIds.includes(product._id)) {
            alert('This item is already in your wishlist.');
            return;
        }
        const token = localStorage.getItem('token');
        fetch('https://product-management-bk7y.onrender.com/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image
            }),
        })
            .then((res) => {
                if (res.status === 409) {
                    throw new Error('This item is already in your wishlist.');
                }
                if (!res.ok) throw new Error('Failed to add to wishlist');
                return res.json();
            })
            .then((data) => {
                console.log(data.message);
                alert('Added to wishlist');
                setWishlistIds(prev => [...prev, product._id]); // Track added item
            })
            .catch((err) => {
                alert(err.message);
                console.error(err.message);
            });
    };
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleEditChange = (field, value) => {
        setEditedProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = () => {
        fetch(`https://product-management-bk7y.onrender.com/api/product/edit${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price: Number(editedProduct.price),
                count: Number(editedProduct.count),
            }),
        })
            .then(res => res.json())
            .then(data => {
                alert('Product updated successfully');
                setProduct(data.product);
                setIsEditing(false);
            })
            .catch(err => {
                console.error('Update error:', err);
                alert('Failed to update product');
            });
    };

    const deleteProduct = async (id) => {
        try {
            const res = await fetch(`https://product-management-bk7y.onrender.com/api/products/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Product deleted successfully');
                navigate('/home')
                // Optionally, refetch product list or remove the deleted product from state
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    return (

        <div>
            <Navbar />
            <div className="product-container">
                <div className="breadcrumb">
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>Home &nbsp;</span> &gt;&nbsp; <span style={{ color: '#374151' }}> Product details &nbsp; &gt;</span>
                </div>
                <div className="product-details">
                    <div className="image-gallery">
                        <img src={product.image} alt="Laptop" className="main-image" />
                        <div className="thumbnail-container">
                            <img src={product.image} alt="Thumbnail 1" className="thumbnail" />
                            <img src={product.image} alt="Thumbnail 2" className="thumbnail" />
                        </div>
                    </div>
                    <div className="product-info">
                        <h2>{product.name}</h2>
                        <p className="price">${product ? totalPrice.toFixed(2) : '0.00'}</p>
                        <p className="availability">
                            <span style={{ color: 'black' }}>Availability :</span> <span className="check-icon">✔</span> In stock
                        </p>
                        <p className="stock-note">Hurry up! only {product.count} product{product.count > 1 ? 's' : ''}  left in stock!</p>
                        <div className='line'></div>
                        <div className="option">
                            <label>Ram:</label>
                            <div className="ram-options">
                                {['4 GB', '8 GB', '16 GB'].map(option => (
                                    <button
                                        key={option}
                                        className={ram === option ? 'selected' : ''}
                                        onClick={() => setRam(option)}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="option">
                            <label>Quantity:</label>
                            <div className="quantity-control">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>

                        <div className="action-buttons">
                            {!isEditing ? (
                                <>
                                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit product</button>
                                    <button className="buy-btn" onClick={bybutton}>Buy it now</button>
                                    <button className="del-btn" onClick={() => deleteProduct(product._id)}>DEL</button>
                                    <button className="fav-btn" onClick={() => addToWishlist(product)}>♡</button>

                                </>
                            ) : (
                                <>
                                    <div className="edit-form">
                                        <div className="option">
                                            <label>Price:</label>
                                            <input
                                                type="number"
                                                value={editedProduct.price}
                                                onChange={(e) => handleEditChange('price', e.target.value)}
                                            />
                                        </div>

                                        <div className="option">
                                            <label>Stock:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={editedProduct.count}
                                                onChange={(e) => handleEditChange('count', e.target.value)}
                                            />
                                        </div>

                                        <div className="edit-buttons">
                                            <button onClick={handleSaveEdit}>Save</button>
                                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                                        </div>
                                    </div>



                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails
