// src/components/kitchen/ProductManagement.jsx//
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    category: '',
    image: null,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?active=false'),
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        subtitle: product.subtitle || '',
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || '',
        image: null,
        isActive: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        price: '',
        category: '',
        image: null,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      price: '',
      category: '',
      image: null,
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Verifique se os dados existem antes de criar o FormData
    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // Adicione os campos de texto
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isActive', formData.isActive); // Certifique-se que o backend espera 'isActive'

      // Adicione a imagem apenas se ela existir
      if (formData.image) {
        data.append('image', formData.image); 
      }

      // 2. O AXIOS DEVE TER O HEADER CORRETO
      // Se o seu 'api' (services/api.js) já estiver configurado com axios.create,
      // verifique se ele não está forçando 'Content-Type: application/json'
      const response = await api({
        method: editingProduct ? 'put' : 'post',
        url: editingProduct ? `/products/${editingProduct.id}` : '/products',
        data: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(editingProduct ? 'Atualizado!' : 'Criado!');
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await api.patch(`/products/${product.id}/toggle`, {
        isActive: !product.is_active
      });
      toast.success(`Produto ${product.is_active ? 'desativado' : 'ativado'}`);
      fetchData();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Produto excluído com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="product" count={4} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Gerenciar Produtos
        </h1>
        <AnimatedButton
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<AddIcon />}
        >
          Novo
        </AnimatedButton>
      </div>

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--spacing-md)',
      }}>
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <GlassCard style={{ 
              padding: 'var(--spacing-md)',
              opacity: product.is_active ? 1 : 0.5,
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--border)',
                marginBottom: 'var(--spacing-sm)',
              }}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
                    color: 'white',
                  }}>
                    🍔
                  </div>
                )}
                {!product.is_active && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}>
                    INATIVO
                  </div>
                )}
              </div>

              <h4 style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)',
                lineHeight: 1.2,
              }}>
                {product.title}
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                {product.category}
              </p>
              <p style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--secondary)',
                marginBottom: 'var(--spacing-sm)',
              }}>
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                }).format(product.price)}
              </p>

              <div style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => handleOpenModal(product)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                  }}
                >
                  <EditIcon style={{ fontSize: 14 }} />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(product)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                  }}
                >
                  {product.is_active ? <CancelIcon style={{ fontSize: 14 }} /> : <CheckIcon style={{ fontSize: 14 }} />}
                  {product.is_active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--error)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DeleteIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-md)',
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl)',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)',
              }}>
                <h3 style={{ fontWeight: 700 }}>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px var(--spacing-md)',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                      transition: 'all var(--transition-normal)',
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px var(--spacing-md)',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                      transition: 'all var(--transition-normal)',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px var(--spacing-md)',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'all var(--transition-normal)',
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--text-secondary)',
                    }}>
                      Preço (MZN) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '10px var(--spacing-md)',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        color: 'var(--text)',
                        outline: 'none',
                        transition: 'all var(--transition-normal)',
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--text-secondary)',
                    }}>
                      Categoria *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px var(--spacing-md)',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        color: 'var(--text)',
                        outline: 'none',
                        transition: 'all var(--transition-normal)',
                      }}
                      required
                    >
                      <option value="">Selecione</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Imagem
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('imageInput').click()}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                      }}
                    >
                      <ImageIcon />
                      {formData.image ? 'Alterar' : 'Upload'}
                    </button>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {formData.image && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formData.image.name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Produto ativo (visível no cardápio)
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <AnimatedButton
                    variant="secondary"
                    onClick={handleCloseModal}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </AnimatedButton>
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {editingProduct ? 'Atualizar' : 'Criar'}
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;