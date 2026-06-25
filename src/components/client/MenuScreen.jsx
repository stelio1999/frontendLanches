// src/components/client/MenuScreen.jsx//
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const MenuScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { addItem,removeItem, getItemQuantity } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(['all', ...categoriesRes.data.data]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.title} adicionado ao carrinho!`);
  };
  const handleRemoveFromCart = (product) => {
  removeItem(product.id);
};

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="product" count={6} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Cardápio
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
              transition: 'all var(--transition-normal)',
            }}
          >
            <FilterIcon />
          </button>
        </div>

        {/* Search Bar */}
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar pratos..."
        />

        {/* Categories */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-xxl) 0',
                color: 'var(--text-secondary)',
              }}
            >
              <p style={{ fontSize: '1.2rem' }}>Nenhum produto encontrado</p>
              <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
                Tente ajustar sua busca ou filtros
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)',
              }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    quantity={getItemQuantity(product.id)}
                      onRemove={() => handleRemoveFromCart(product)}

                    onAdd={() => handleAddToCart(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuScreen;