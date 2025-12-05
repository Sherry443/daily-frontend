import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

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
      console.log('📦 Product updated:', updatedProduct.title);
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
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Orders
          </button>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Products Inventory</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Total: <strong>{totalProducts}</strong> products
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, <strong>{user.name}</strong>
          </span>
        </div>
      </div>

      {/* Search and Sort Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Sort by:
            </span>
            {['title', 'total_inventory', 'product_type'].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: sortBy === field ? '#1976d2' : '#f0f0f0',
                  color: sortBy === field ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {field === 'title' && 'Name'}
                {field === 'total_inventory' && 'Stock'}
                {field === 'product_type' && 'Type'}
                {sortBy === field && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {products.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'white',
            padding: '60px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#999',
            fontSize: '16px'
          }}>
            {searchQuery ? 'No products found matching your search' : 'No products available'}
          </div>
        ) : (
          products.map((product) => {
            const stockStatus = getStockStatus(product.total_inventory);
            
            return (
              <div key={product._id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}>
                {/* Product Image */}
                {product.image_url && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
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
                  </div>
                )}

                <div style={{ padding: '16px' }}>
                  {/* Product Title */}
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.title}
                  </h3>

                  {/* Product Info */}
                  <div style={{ marginBottom: '12px' }}>
                    {product.product_type && (
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                        <strong>Type:</strong> {product.product_type}
                      </div>
                    )}
                    {product.vendor && (
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                        <strong>Vendor:</strong> {product.vendor}
                      </div>
                    )}
                  </div>

                  {/* Stock Status Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: stockStatus.color,
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {stockStatus.label}
                  </div>

                  {/* Total Inventory */}
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '12px'
                  }}>
                    {product.total_inventory} <span style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>units</span>
                  </div>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div style={{
                      borderTop: '1px solid #eee',
                      paddingTop: '12px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '8px'
                      }}>
                        Variants ({product.variants.length}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {product.variants.map((variant, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            padding: '6px 8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px'
                          }}>
                            <span style={{ color: '#666' }}>
                              {variant.title} {variant.sku && `(${variant.sku})`}
                            </span>
                            <span style={{
                              fontWeight: '600',
                              color: variant.inventory_quantity === 0 ? '#f44336' : 
                                     variant.inventory_quantity < 10 ? '#ff9800' : '#4caf50'
                            }}>
                              {variant.inventory_quantity} units
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {product.tags.map((tag, idx) => (
                        <span key={idx} style={{
                          padding: '4px 8px',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Last Updated */}
                  <div style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#999',
                    textAlign: 'right'
                  }}>
                    Updated: {new Date(product.updated_at).toLocaleString('en-PK')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1976d2',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '14px', color: '#666' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1976d2',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}