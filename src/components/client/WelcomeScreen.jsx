// src/components/client/WelcomeScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import GlassCard from '../common/GlassCard';
import LoginModal from './LoginModal';
import {
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryIcon,
  ShoppingBag as ShoppingBagIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  LocalOffer as OfferIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  LocalPizza as PizzaIcon,
  Fastfood as BurgerIcon,
  Icecream as DessertIcon,
  LocalCafe as DrinkIcon,
  LunchDining as SaladIcon,
  DinnerDining as DinnerIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';


import heroBg from '../../assets/images/hero-bg.jpg';
import ctaBg from '../../assets/images/pizza-bg.jpg';

import pizzaIcon from '../../assets/images/pizza-icon.png';
import burgerIcon from '../../assets/images/burger-icon.png';
import drinkIcon from '../../assets/images/drink-icon.png';
import saladaIcon from '../../assets/images/salada-icon.png';
import sobremesaIcon from '../../assets/images/sobremesa-icon.png';
import frangoIcon from '../../assets/images/frango.png';

import { useStats } from '../../hooks/useStats';
import { TermsModal, PrivacyModal, HelpModal } from './FooterModals';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const featuresY = useTransform(scrollY, [200, 600], [50, 0]);
  const testimonialsY = useTransform(scrollY, [400, 800], [50, 0]);
  const statsData = useStats();


  const [heroImages, setHeroImages] = useState(() => {
    // Inicializa com 3 imagens diferentes
    const initialImages = [pizzaIcon, burgerIcon, drinkIcon];
    return initialImages;
  });

  // Depois, adicione os states no componente:
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Funções para abrir/fechar modais:
  const handleOpenTerms = (e) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const handleOpenPrivacy = (e) => {
    e.preventDefault();
    setShowPrivacy(true);
  };

  const handleOpenHelp = (e) => {
    e.preventDefault();
    setShowHelp(true);
  };

  useEffect(() => {
    // Lista completa de imagens disponíveis
    const allImages = [pizzaIcon, burgerIcon, drinkIcon, saladaIcon, sobremesaIcon];

    // Função para pegar 3 imagens diferentes aleatórias
    const getRandomImages = () => {
      const shuffled = [...allImages].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    };

    const interval = setInterval(() => {
      setHeroImages(prevImages => {
        // Pega 3 imagens diferentes aleatórias
        let newImages = getRandomImages();

        // Garante que não sejam iguais às atuais
        let attempts = 0;
        while (attempts < 10 && JSON.stringify(newImages) === JSON.stringify(prevImages)) {
          newImages = getRandomImages();
          attempts++;
        }

        return newImages;
      });
    }, 3000); // A cada 3 segundo

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);




  const features = [
    {
      icon: <PizzaIcon />,
      title: 'Pizzas Artesanais',
      description: 'Feitas com ingredientes frescos e massa preparada diariamente',
      color: '#E74C3C'
    },
    {
      icon: <BurgerIcon />,
      title: 'Hambúrgueres Gourmet',
      description: 'Carnes selecionadas com combinações exclusivas de sabores',
      color: '#F39C12'
    },
    {
      icon: <DessertIcon />,
      title: 'Sobremesas Especiais',
      description: 'Deliciosas sobremesas para finalizar sua refeição com chave de ouro',
      color: '#E91E63'
    },
    {
      icon: <DrinkIcon />,
      title: 'Bebidas Refrescantes',
      description: 'Sucos naturais, refrigerantes e bebidas exclusivas',
      color: '#2196F3'
    },
    {
      icon: <SaladIcon />,
      title: 'Saladas Saudáveis',
      description: 'Opções leves e nutritivas para uma alimentação equilibrada',
      color: '#4CAF50'
    },
    {
      icon: <DinnerIcon />,
      title: 'Massas e Macarrão',
      description: 'Receitas preparadas com todo carinho e tradição',
      color: '#9C27B0'
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      text: 'Excelente serviço! Comida sempre fresca e entrega pontual.',
      rating: 5,
      avatar: '👩'
    },
    {
      name: 'João Santos',
      text: 'Melhor delivery da cidade! Recomendo a todos.',
      rating: 5,
      avatar: '👨'
    },
    {
      name: 'Ana Pereira',
      text: 'Cardápio incrível e atendimento de primeira qualidade.',
      rating: 5,
      avatar: '👩‍🦰'
    },
  ];

  const stats = [
    {
      value: statsData.loading ? '...' : `${statsData.ordersDelivered}+`,
      label: 'Pedidos Entregues'
    },
    {
      value: statsData.loading ? '...' : `${statsData.availableProducts}+`,
      label: 'Pratos Disponíveis'
    },
    {
      value: statsData.loading ? '...' : statsData.averageRating.toFixed(1),
      label: 'Avaliação Média'
    },
  ];

  const menuCategories = [
    {
      name: 'Pizzas Artesanais',
      icon: pizzaIcon,
      description: 'Feitas com ingredientes frescos e massa preparada diariamente',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      color: '#E74C3C'
    },
    {
      name: 'Hambúrgueres Gourmet',
      icon: burgerIcon,
      description: 'Carnes selecionadas com combinações exclusivas de sabores',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
      color: '#F39C12'
    },
    {
      name: 'Frango Grelhado',
      icon: frangoIcon,
      description: 'Receitas preparadas com todo carinho e tradição',
      image: frangoIcon,
      color: '#9C27B0'
    },
    {
      name: 'Saladas Saudáveis',
      icon: saladaIcon,
      description: 'Opções leves e nutritivas para uma alimentação equilibrada',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      color: '#4CAF50'
    },
    {
      name: 'Sobremesas Especiais',
      icon: sobremesaIcon,
      description: 'Deliciosas sobremesas para finalizar sua refeição com chave de ouro',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      color: '#E91E63'
    },
    {
      name: 'Bebidas Refrescantes',
      icon: drinkIcon,
      description: 'Sucos naturais, refrigerantes e bebidas exclusivas',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
      color: '#2196F3'
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Preloader Style */}
      <style>{`
        .preloader-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--surface);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        .preloader-custom.loaded {
          opacity: 0;
          visibility: hidden;
        }
        .wrapper-triangle {
          position: relative;
          width: 304px;
          height: 250px;
        }
        .line-triangle {
          position: absolute;
          width: 250px;
          height: 54px;
          border: 1px solid transparent;
        }
        .line-triangle:nth-child(1) {
          left: 313px;
          bottom: -21px;
          transform: rotate(-120deg);
          transform-origin: 0 100%;
        }
        .line-triangle:nth-child(2) {
          left: 156px;
          top: -54px;
          transform: rotate(120deg);
          transform-origin: 0 100%;
        }
        .line-triangle:nth-child(3) {
          top: 217px;
          left: 0;
        }
        .triangle-item {
          position: absolute;
          bottom: 0;
          width: 0;
          height: 0;
          border: 31px solid transparent;
          border-bottom: 54px solid var(--secondary);
          animation: triPulse 1.5s linear infinite;
        }
        .triangle-item:nth-child(1) { left: 0px; animation-delay: 0s; }
        .triangle-item:nth-child(2) { left: 31px; animation-delay: 0.15s; }
        .triangle-item:nth-child(3) { left: 63px; animation-delay: 0.3s; }
        .triangle-item:nth-child(4) { left: 94px; animation-delay: 0.45s; }
        .triangle-item:nth-child(5) { left: 125px; animation-delay: 0.6s; }
        .triangle-item:nth-child(6) { left: 156px; animation-delay: 0.75s; }
        .triangle-item:nth-child(7) { left: 188px; animation-delay: 0.9s; }
        .triangle-item:nth-child(even) {
          transform: rotate(180deg);
          top: 0;
          border-bottom: 54px solid var(--primary);
        }
        @keyframes triPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delay-1 {
          animation: float 4s ease-in-out 0.5s infinite;
        }
        .animate-float-delay-2 {
          animation: float 4s ease-in-out 1s infinite;
        }
        .parallax-section {
          transition: transform 0.1s ease-out;
        }
        .hover-scale {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-divider {
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 4px;
          margin: 16px auto;
        }
        .category-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          z-index: 1;
          transition: all 0.4s ease;
        }
        .category-card:hover::before {
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 40%);
        }
        .category-card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover img {
          transform: scale(1.1);
        }
        .category-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          z-index: 2;
          color: white;
        }
        .category-card-content h4 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .category-card-content p {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        @media (max-width: 768px) {
          .category-card img {
            height: 180px;
          }
        }
      `}</style>

      {/* Preloader */}
      <div className="preloader-custom loaded" id="preloader">
        <div className="wrapper-triangle">
          <div className="pen">
            <div className="line-triangle">
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
            </div>
            <div className="line-triangle">
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
            </div>
            <div className="line-triangle">
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
              <div className="triangle-item"></div>
            </div>
          </div>
        </div>
      </div>



      {/* Hero Section com Parallax */}
      {/* Hero Section com Parallax */}
      <section ref={heroRef} style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Imagem de Fundo com Parallax */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            right: '-10%',
            bottom: '-20%',
            y: heroY,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1.1)',
            zIndex: 0,
          }}
        />

        {/* Overlay com gradiente para melhor legibilidade */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.55), rgba(44, 82, 212, 0.45))',
          zIndex: 1,
        }} />

        {/* Elementos decorativos com parallax */}
        <motion.div
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            y: heroY,
            zIndex: 1,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            y: heroY,
            zIndex: 1,
          }}
        />

        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          padding: '120px 24px 80px',
          textAlign: 'center',
          color: 'white',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Imagens em carrossel - substituindo os emojis */}
            {/* Imagens em carrossel - substituindo os emojis */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              marginBottom: '32px',
            }}>
              {heroImages.map((image, index) => (
                <motion.div
                  key={image + index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
                  }}
                >
                  <img
                    src={image}
                    alt={`Food ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '16px',
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}>
              Os melhores lanches
              <br />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>da cidade</span>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              opacity: 0.95,
              maxWidth: '500px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              Peça agora e receba no conforto da sua casa com qualidade e rapidez
            </p>
            <button
              onClick={() => navigate('/menu')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 48px',
                background: 'white',
                border: 'none',
                borderRadius: '50px',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              Ver Cardápio
              <ArrowIcon />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginTop: '60px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <p style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Menu Categories Section */}
      {/* Menu Categories Section */}
      <section style={{
        padding: '80px 0',
        background: 'var(--bg)',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: 'var(--text)',
            }}>
              Nosso Cardápio
            </h2>
            <div className="section-divider" />
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              maxWidth: '500px',
              margin: '16px auto 0',
            }}>
              Escolha entre as melhores opções gastronômicas
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {menuCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="category-card hover-scale"
                onClick={() => navigate('/menu')}
                style={{ cursor: 'pointer' }}
              >
                <img src={category.image} alt={category.name} loading="lazy" />
                <div className="category-card-content">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '4px',
                  }}>
                    <img
                      src={category.icon}
                      alt={category.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'contain',
                      }}
                    />
                    <h4 style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                    }}>
                      {category.name}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    opacity: 0.9,
                    marginLeft: '44px',
                  }}>
                    {category.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section com Parallax */}
      {/* Testimonials Section com Parallax */}
      <motion.section
        ref={testimonialsRef}
        style={{
          padding: '80px 0',
          background: 'var(--bg)',
          y: testimonialsY,
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: 'var(--text)',
            }}>
              O que nossos clientes dizem
            </h2>
            <div className="section-divider" />
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              maxWidth: '500px',
              margin: '16px auto 0',
            }}>
              A opinião de quem já experimentou
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="hover-scale"
              >
                <GlassCard style={{
                  padding: '32px 24px',
                  height: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  {/* Aspas duplas grandes e profissionais */}
                  <div style={{
                    fontSize: '80px',
                    lineHeight: 1,
                    color: `var(--primary)`,
                    opacity: 0.15,
                    position: 'absolute',
                    top: '16px',
                    left: '24px',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                  }}>
                    "
                  </div>

                  <div style={{
                    fontSize: '60px',
                    lineHeight: 1,
                    color: `var(--primary)`,
                    opacity: 0.15,
                    position: 'absolute',
                    bottom: '16px',
                    right: '24px',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    transform: 'rotate(180deg)',
                  }}>
                    "
                  </div>

                  <div style={{ padding: '20px 0' }}>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      marginBottom: '20px',
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      "{testimonial.text}"
                    </p>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <p style={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'var(--text)',
                      }}>
                        {testimonial.name}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} style={{
                            fontSize: 18,
                            color: i < testimonial.rating ? '#FFD700' : 'var(--border)',
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.section>



      {/* CTA Section com Imagem de Fundo */}
      <section ref={ctaRef} style={{
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Imagem de Fundo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${ctaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }} />

        {/* Overlay escuro para legibilidade */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.5), rgba(44, 82, 212, 0.25))',
          zIndex: 1,
        }} />

        {/* Elementos decorativos */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          zIndex: 1,
        }} />

        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white',
          width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div style={{ fontSize: 48, marginBottom: '16px' }}>🍽️</div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 700,
              marginBottom: '16px',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            }}>
              {isAuthenticated ? 'Bem-vindo de volta!' : 'Pronto para pedir?'}
            </h2>
            <p style={{
              opacity: 0.95,
              fontSize: '1.1rem',
              maxWidth: '500px',
              margin: '0 auto 32px',
              textShadow: '0 2px 10px rgba(0,0,0,0.15)',
            }}>
              {isAuthenticated
                ? 'Continue explorando nosso cardápio e faça seu pedido agora mesmo'
                : 'Entre com seu telefone e comece a pedir agora mesmo'}
            </p>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/menu')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 48px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
                }}
              >
                <ShoppingBagIcon />
                Ver Cardápio
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 48px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
                }}
              >
                <LoginIcon />
                Entrar Agora
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}

      {/* Footer */}
      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '48px 0 24px',
        marginTop: '40px',
      }}>
        <div className="container">
          {/* Grid Principal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            textAlign: 'left',
            maxWidth: '480px',
            margin: '0 auto',
            padding: '0 16px',
          }}>
            {/* Coluna 1 - Sobre */}
            <div>
              <h4 style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                marginBottom: '16px',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Delivery Food
                </span>
              </h4>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                marginBottom: '12px',
              }}>
                Os melhores lanches da cidade, entregues no conforto da sua casa com qualidade e rapidez.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                {/* Espaço reservado para selo de qualidade */}
              </div>
            </div>

            {/* Coluna 2 - Contato */}
            <div>
              <h4 style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: '16px',
                color: 'var(--text)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Contato
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="tel:+258841234567" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  padding: '4px 0',
                }}>
                  <PhoneIcon style={{ fontSize: 18, color: 'var(--primary)' }} />
                  <span>+258 84 123 4567</span>
                </a>
                <a href="mailto:info@deliveryfood.co.mz" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  padding: '4px 0',
                }}>
                  <EmailIcon style={{ fontSize: 18, color: 'var(--primary)' }} />
                  <span>info@deliveryfood.co.mz</span>
                </a>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  padding: '4px 0',
                }}>
                  <LocationIcon style={{ fontSize: 18, color: 'var(--primary)' }} />
                  <span>Maputo, Moçambique</span>
                </div>
              </div>
            </div>

            {/* Coluna 3 - Redes Sociais */}
            <div>
              <h4 style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: '16px',
                color: 'var(--text)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Redes Sociais
              </h4>
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <a
                  href="#"
                  aria-label="Facebook"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1877F2';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(24, 119, 242, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FacebookIcon style={{ fontSize: 20 }} />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1DA1F2';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(29, 161, 242, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <TwitterIcon style={{ fontSize: 20 }} />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(225, 48, 108, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <InstagramIcon style={{ fontSize: 20 }} />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FF0000';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <YouTubeIcon style={{ fontSize: 20 }} />
                </a>
              </div>
              {/* Horário de Funcionamento */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'var(--glass-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>🕐</span>
                  <span>Segunda a Domingo • 10h - 23h</span>
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            maxWidth: '480px',
            margin: '32px auto 0',
            padding: '0 16px',
          }}>
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
              marginBottom: '20px',
            }} />

            {/* Copyright com Links Funcionais */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
            }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                opacity: 0.7,
              }}>
                © {new Date().getFullYear()} <span style={{ fontWeight: 600, color: 'var(--text)' }}>Delivery Food</span> - Moçambique.
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                opacity: 0.5,
              }}>
                Todos os direitos reservados.
              </p>
              {/* Links úteis com funcionalidade */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '4px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <button
                  onClick={handleOpenTerms}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.3s ease',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Termos de Uso
                </button>
                <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>|</span>
                <button
                  onClick={handleOpenPrivacy}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.3s ease',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Privacidade
                </button>
                <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>|</span>
                <button
                  onClick={handleOpenHelp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.3s ease',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Ajuda
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Termos de Uso */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* Modal de Privacidade */}
      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      {/* Modal de Ajuda */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default WelcomeScreen;