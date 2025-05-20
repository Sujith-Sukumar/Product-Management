import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from '../navbar/navbar';

export default function Home() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedCategory, setExpandedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [productss, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoriesData, setCategoriesData] = useState([]);
    const [subCategoriesMap, setSubCategoriesMap] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        count: '',
        brand: '',
        image: null,
    });
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubCategoryName, setNewSubCategoryName] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch products');
                return res.json();
            })
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategoriesData(data);
                data.forEach(cat => {
                    fetch(`http://localhost:5000/api/subcategories/${cat._id}`)
                        .then(res => res.json())
                        .then(subs => {
                            setSubCategoriesMap(prev => ({ ...prev, [cat._id]: subs }));
                        });
                });
            });
    }, []);

    const handleAddCategory = async () => {
        const res = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategoryName }),
        });
        const data = await res.json();
        alert('Category added');
        setCategoriesData(prev => [...prev, data]);
        setShowAddCategoryModal(false);
    };

    const handleAddSubCategory = async () => {
        const res = await fetch('http://localhost:5000/api/subcategories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSubCategoryName, categoryId: selectedCategory }),
        });
        const data = await res.json();
        alert('Subcategory added');
        setSubCategoriesMap(prev => ({
            ...prev,
            [selectedCategory]: [...(prev[selectedCategory] || []), data]
        }));
        setShowAddSubCategoryModal(false);
    };

    const handleAddProduct = async () => {
        const selectedCat = categoriesData.find(cat => cat._id === selectedCategory);
        const selectedSub = (subCategoriesMap[selectedCategory] || []).find(sub => sub._id === selectedSubCategory);

        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('price', productData.price);
        formData.append('count', productData.count);
        formData.append('Description', productData.Description);
        formData.append('product', selectedCat ? selectedCat.name : '');
        formData.append('brand', selectedSub ? selectedSub.name : '');
        formData.append('category', selectedCategory);
        formData.append('subcategory', selectedSubCategory);
        formData.append('image', productData.image);

        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        console.log('add product data', data);

        alert('Product added');
        setShowModal(false);
    };

    const filteredProducts = productss.filter(product => {
        const selectedCatName = categoriesData.find(cat => cat._id === expandedCategory)?.name;
        const selectedSubName = subCategoriesMap[expandedCategory]?.find(sub => sub._id === selectedSubCategory)?.name;

        const matchesCategory = !expandedCategory || product.product?.toLowerCase() === selectedCatName?.toLowerCase();
        const matchesSubCategory = !selectedSubCategory || product.brand?.toLowerCase() === selectedSubName?.toLowerCase();

        return matchesCategory && matchesSubCategory;
    });


    const itemsPerPage = 6;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error}</p>;

    const addToWishlist = (product) => {
        const token = localStorage.getItem('token');
        if (wishlistIds.includes(product._id)) {
            alert('Already in wishlist.');
            return;
        }

        fetch('http://localhost:5000/api/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image
            })
        })
            .then(res => {
                if (res.status === 409) throw new Error('Already in wishlist');
                if (!res.ok) throw new Error('Failed to add to wishlist');
                return res.json();
            })
            .then(() => {
                alert('Added to wishlist');
                setWishlistIds(prev => [...prev, product._id]);
            })
            .catch(err => {
                alert(err.message);
            });
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <aside className="sidebar">
                    <h2 style={{ color: '#1e3a8a' }}>Categories</h2>
                    <ul>
                        <li
                            onClick={() => {
                                setExpandedCategory('');
                                setSelectedSubCategory('');
                            }}
                            style={{ cursor: 'pointer', marginBottom: '10px' }}
                        >
                            All categories
                        </li>
                        {categoriesData.map((cat) => (
                            <li key={cat._id}>
                                <div
                                    className="category"
                                    onClick={() => {
                                        const isExpanded = expandedCategory === cat._id;
                                        setExpandedCategory(isExpanded ? '' : cat._id);
                                        setSelectedCategory(cat._id);
                                        setSelectedSubCategory('');
                                    }}
                                >
                                    {cat.name} {subCategoriesMap[cat._id]?.length ? (expandedCategory === cat._id ? '⌄' : '>') : ''}
                                </div>
                                {expandedCategory === cat._id && subCategoriesMap[cat._id]?.length > 0 && (
                                    <ul className="subcategories" style={{ paddingLeft: '20px' }}>
                                        {subCategoriesMap[cat._id].map(sub => (
                                            <li
                                                key={sub._id}
                                                onClick={() => setSelectedSubCategory(sub._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {sub.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="main">
                    <div className="button-group">
                        <button className="button" onClick={() => setShowAddCategoryModal(true)}>Add category</button>
                        <button className="button" onClick={() => setShowAddSubCategoryModal(true)}>Add sub category</button>
                        <button className="button" onClick={() => setShowModal(true)}>Add product</button>
                    </div>

                    <div className="product-grid">
                        {currentProducts.map(product => (
                            <div key={product._id} className="product-card" onClick={() => navigate(`/productdetails/${product._id}`)}>
                                <span className='heart-icon' onClick={(e) => { e.stopPropagation(); addToWishlist(product); }}>♡</span>
                                <img src={product.image} alt={product.name} />
                                <div className="product-name">{product.name}</div>
                                <div className="product-price">{product.price}</div>
                                <div className="starss">{Array(5).fill().map((_, i) => (<span key={i}>★</span>))}</div>
                            </div>
                        ))}
                    </div>

                    <div className="footer">
                        <div>{filteredProducts.length} items</div>
                        <div className="pagination">
                            {[...Array(totalPages)].map((_, idx) => {
                                const pageNum = idx + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={currentPage === pageNum ? 'active' : ''}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="rows-select">
                            Show
                            <select>
                                <option>10 rows</option>
                                <option>20 rows</option>
                                <option>50 rows</option>
                            </select>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Add Product</h2>
                        <input type="text" placeholder="Title" className="input small" onChange={e => setProductData({ ...productData, name: e.target.value })} />
                        <input type="number" placeholder="Price" className="input small" onChange={e => setProductData({ ...productData, price: e.target.value })} />
                        <input type="number" placeholder="Quantity" className="input small" onChange={e => setProductData({ ...productData, count: e.target.value })} />
                        <input type="text" placeholder="Description" className="input" onChange={e => setProductData({ ...productData, Description: e.target.value })} />
                        <select className="input" onChange={e => setSelectedCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            {categoriesData.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                        <select className="input" onChange={e => setSelectedSubCategory(e.target.value)}>
                            <option value="">Select Subcategory</option>
                            {(subCategoriesMap[selectedCategory] || []).map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                        <input type="file" className="input" onChange={e => setProductData({ ...productData, image: e.target.files[0] })} />
                        <div className="modal-actions">
                            <button className="add-btn" onClick={handleAddProduct}>ADD</button>
                            <button className="discard-btn" onClick={() => setShowModal(false)}>DISCARD</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Add Category</h2>
                        <input type="text" placeholder="Enter category name" className="input" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                        <div className="modal-actions">
                            <button className="add-btn" onClick={handleAddCategory}>ADD</button>
                            <button className="discard-btn" onClick={() => setShowAddCategoryModal(false)}>DISCARD</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add SubCategory Modal */}
            {showAddSubCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Add Sub Category</h2>
                        <select className="input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            {categoriesData.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <input type="text" placeholder="Enter sub category name" className="input" value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} />
                        <div className="modal-actions">
                            <button className="add-btn" onClick={handleAddSubCategory}>ADD</button>
                            <button className="discard-btn" onClick={() => setShowAddSubCategoryModal(false)}>DISCARD</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
