import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function ProductsPage({ user, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
    
    // Setup Socket.IO for real-time updates
    const socket = io(BACKEND_URL);
    
    socket.on('product_updated', (updatedProduct) => {
      console.log(' Product updated:', updatedProduct.title);
      setProducts(prevProducts => {
        const index = prevProducts.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          const newProducts = [...prevProducts];
          newProducts[index] = updatedProduct;
          return newProducts;
        } else {
          return [updatedProduct, ...prevProducts];
        }
      });
    });

    return () => socket.close();
  }, [searchQuery, sortBy, sortOrder, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const skip = (currentPage - 1) * 50;
      
      const params = new URLSearchParams({
        search: searchQuery,
        sort: sortBy,
        order: sortOrder,
        limit: '50',
        skip: skip.toString()
      });

      const response = await fetch(`${BACKEND_URL}/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.total);
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: '#f44336' };
    if (quantity < 10) return { label: 'Low Stock', color: '#ff9800' };
    if (quantity < 50) return { label: 'Medium Stock', color: '#2196f3' };
    return { label: 'In Stock', color: '#4caf50' };
  };

  if (loading && products.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249',
        color: '#BCB9AC'
      }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#123249',
      minHeight: '100vh'
    }}>
      {/* Search and Sort Section */}
      <div style={{
        backgroundColor: 'rgba(188, 185, 172, 0.1)',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(188, 185, 172, 0.2)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Search products by name, SKU, type, or vendor..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '14px 20px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['title', 'total_inventory'].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                style={{
                  padding: '14px 28px',
                  minHeight: '50px',
                  backgroundColor: sortBy === field ? '#BCB9AC' : 'transparent',
                  color: sortBy === field ? '#123249' : '#BCB9AC',
                  border: `2px solid #BCB9AC`,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (sortBy !== field) {
                    e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (sortBy !== field) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {field === 'title' && 'Name'}
                {field === 'total_inventory' && 'Stock'}
                {sortBy === field && (
                  <span style={{ fontSize: '16px' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {products.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'rgba(188, 185, 172, 0.1)',
            padding: '60px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#BCB9AC',
            fontSize: '16px',
            border: '1px solid rgba(188, 185, 172, 0.2)'
          }}>
            {searchQuery ? 'No products found matching your search' : 'No products available'}
          </div>
        ) : (
          products.map((product) => {
            const stockStatus = getStockStatus(product.total_inventory);
            
            return (
              <div key={product._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(188, 185, 172, 0.3)';
                e.currentTarget.style.borderColor = '#BCB9AC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  height: '280px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="color: #999; font-size: 14px;">No Image</div>';
                      }}
                    />
                  ) : (
                    <div style={{ color: '#999', fontSize: '14px' }}>No Image</div>
                  )}
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Product Title */}
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#123249',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '44px'
                  }}>
                    {product.title}
                  </h3>

                  {/* Stock Status Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: stockStatus.color,
                    color: 'white',
                    borderRadius: '50px',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    {stockStatus.label}
                  </div>

                  {/* Total Inventory */}
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#123249',
                    marginBottom: '12px'
                  }}>
                    {product.total_inventory} <span style={{ fontSize: '16px', color: '#666', fontWeight: '400' }}>units</span>
                  </div>

                  {/* Sale Price */}
                  {(product.formatted_price || product.price) && (
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#4caf50',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '6px'
                    }}>
                      {product.formatted_price ? (
                        product.formatted_price
                      ) : (
                        <>
                          <span style={{ fontSize: '18px', color: '#666' }}>Sale Price</span>
                          {Number(product.price).toLocaleString('en-PK')}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '14px 28px',
              minHeight: '50px',
              backgroundColor: currentPage === 1 ? 'rgba(188, 185, 172, 0.3)' : '#BCB9AC',
              color: currentPage === 1 ? '#666' : '#123249',
              border: 'none',
              borderRadius: '50px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 185, 172, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '14px', color: '#BCB9AC', fontWeight: '500' }}>
            Page <strong style={{ fontSize: '16px' }}>{currentPage}</strong> of <strong style={{ fontSize: '16px' }}>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '14px 28px',
              minHeight: '50px',
              backgroundColor: currentPage === totalPages ? 'rgba(188, 185, 172, 0.3)' : '#BCB9AC',
              color: currentPage === totalPages ? '#666' : '#123249',
              border: 'none',
              borderRadius: '50px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 185, 172, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}