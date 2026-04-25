"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingBag, ArrowRight, Play, Loader2, Sparkles, Upload, X, MapPin, Mail, Plus, Minus, CheckCircle, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';

// === COMPOSANT DE SÉCURITÉ & GÉNÉRATION D'IMAGE ===
// Version corrigée : elle évite que le loader reste bloqué.
// Elle fonctionne mieux avec les images locales comme /hero.jpg et aussi avec les images externes.
const SafeImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      if (!cancelled) {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        setHasError(false);
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        setHasError(true);
      }
    };

    // Sécurité : si l'image met trop longtemps, on arrête le loader.
    timeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, [src]);

  const cleanClassName = className.replace(
    /scale-\d+|group-hover:[^\s]+/g,
    ""
  );

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-[#F4F1EA] text-[#A81B22] border border-[#A81B22]/20 ${cleanClassName}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-4 text-center">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-[#F4F1EA] z-10 ${cleanClassName}`}
        >
          <Loader2 className="animate-spin text-[#A81B22]" size={24} />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className={`${className} transition-opacity duration-700 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  );
};

// === LOGO VECTORIEL ZETA ===
const ZetaLogoIcon = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,0 C10,0 0,10 0,30 L0,70 C0,90 10,100 30,100 L70,100 C90,100 100,90 100,70 L100,30 C100,10 90,0 70,0 Z M30,12 L70,12 C82,12 88,15 88,30 L88,70 C88,82 82,88 70,88 L30,88 C18,88 12,82 12,70 L12,30 C12,18 18,12 30,12 Z" />
    <path d="M40,12 L60,12 L60,25 L75,25 L75,40 L88,40 L88,60 L75,60 L75,75 L60,75 L60,88 L40,88 L40,75 L25,75 L25,60 L12,60 L12,40 L25,40 L25,25 L40,25 Z M50,32 L68,50 L50,68 L32,50 Z" />
  </svg>
);

export default function ZetaWeb() {
  // === ÉTATS DE L'INTERFACE ===
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // === ÉTATS DU PANIER ===
  const [cartItems, setCartItems] = useState([]);
  
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  const handleCheckoutClick = () => {
    if(cartItems.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const confirmOrder = (e) => {
    e.preventDefault();
    setIsCheckoutModalOpen(false);
    setCartItems([]);
    showToast("Commande validée et paiement accepté avec succès !");
  };

  // === NAVIGATION FLOTTANTE ===
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // === ÉTATS DU CONSULTANT IA ===
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const pageRootRef = useRef(null);
  const heroFrameRef = useRef(null);

  // === EFFETS SIDE (SCROLL & ANIMATIONS) ===
  useEffect(() => {
    const updateHeroFrame = (scrollY) => {
      if (!heroFrameRef.current) return;

      const progress = Math.min(Math.max(scrollY / 260, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const viewportWidth = window.innerWidth;
      const framedGap = viewportWidth >= 1280 ? 180 : viewportWidth >= 768 ? 96 : 28;
      const framedWidth = Math.min(1600, viewportWidth - framedGap);
      const width = viewportWidth - ((viewportWidth - framedWidth) * eased);
      const startHeight = window.innerHeight * (viewportWidth >= 768 ? 0.97 : 0.84);
      const endHeight = window.innerHeight * (viewportWidth >= 768 ? 0.84 : 0.72);
      const height = startHeight - ((startHeight - endHeight) * eased);

      heroFrameRef.current.style.width = `${width}px`;
      heroFrameRef.current.style.height = `${height}px`;
      heroFrameRef.current.style.borderRadius = `${26 * eased}px`;
      heroFrameRef.current.style.setProperty('--hero-image-scale', `${1.12 - (0.12 * eased)}`);

      if (pageRootRef.current) {
        pageRootRef.current.style.setProperty('--hero-copy-y', `${48 * eased}px`);
        pageRootRef.current.style.setProperty('--hero-copy-opacity', `${1 - (0.24 * eased)}`);
        pageRootRef.current.style.setProperty('--hero-cta-y', `${26 * eased}px`);
        pageRootRef.current.style.setProperty('--nav-brand-scale', `${1.42 - (0.42 * eased)}`);
        pageRootRef.current.style.setProperty('--nav-brand-y', `${34 - (34 * eased)}px`);
        pageRootRef.current.style.setProperty('--nav-brand-opacity', `${0.92 + (0.08 * eased)}`);
        pageRootRef.current.style.setProperty('--nav-links-y', `${8 - (8 * eased)}px`);
        pageRootRef.current.style.setProperty('--nav-links-scale', `${1.04 - (0.04 * eased)}`);
        pageRootRef.current.style.setProperty('--nav-links-opacity', `${0.96 + (0.04 * eased)}`);
      }
    };

    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 50);
      // Vérifier si on est en bas de page (avec une marge de 50px)
        setIsAtBottom(Math.ceil(window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 50);
        updateHeroFrame(scrollY);
        frameId = 0;
      });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial check
    handleScroll();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // === LOGIQUE DE L'IA GEMINI ===
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setSelectedImage(base64String);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageMimeType('');
  };

  const generateRecommendation = async () => {
    if (!roomDescription.trim() && !selectedImage) return;
    setIsAiLoading(true);
    setAiError('');
    setAiRecommendation('');
    
    // Simulation API pour le consultant
    setTimeout(() => {
      setAiRecommendation("Basé sur l'atmosphère élégante de votre espace, je vous recommande vivement le Beni Ouarain Signature. Sa laine écrue naturelle et ses motifs minimalistes apporteront la chaleur authentique de l'Atlas sans surcharger votre pièce.");
      setIsAiLoading(false);
    }, 2000);
  };

  return (
    <div ref={pageRootRef} className="w-full bg-[#FCF2E6] text-[#111111] font-sans selection:bg-[#C9191E] selection:text-[#FCF2E6] overflow-x-hidden relative">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600;700&display=swap');
        
        .font-brand { font-family: 'El Messiri', sans-serif; font-weight: 700; }
        .font-sans { font-family: 'Montserrat', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        html, body { margin: 0; padding: 0; background-color: #FCF2E6 !important; scroll-behavior: smooth; }

        /* CLASSES D'ANIMATION AU SCROLL */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: opacity, transform;
        }
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }

        .hero-shell {
          width: 100vw;
          height: 97vh;
          margin-inline: auto;
          border-radius: 0;
          --hero-image-scale: 1.12;
          transition: width 180ms linear, height 180ms linear, border-radius 180ms linear;
          will-change: width, height, border-radius;
        }

        .hero-media {
          transform: scale(var(--hero-image-scale));
          transition: transform 180ms linear, opacity 700ms ease;
          will-change: transform;
        }

        .hero-copy {
          transform: translateY(var(--hero-copy-y, 0px));
          opacity: var(--hero-copy-opacity, 1);
          transition: transform 180ms linear, opacity 180ms linear;
          will-change: transform, opacity;
        }

        .hero-cta {
          transform: translateY(var(--hero-cta-y, 0px));
          opacity: var(--hero-copy-opacity, 1);
          transition: transform 180ms linear, opacity 180ms linear;
          will-change: transform, opacity;
        }

        .nav-brand {
          transform: translateY(var(--nav-brand-y, 34px)) scale(var(--nav-brand-scale, 1.42));
          opacity: var(--nav-brand-opacity, 0.92);
          transform-origin: center top;
          transition: transform 180ms linear, opacity 180ms linear;
          will-change: transform, opacity;
        }

        .nav-links-group {
          transform: translateY(var(--nav-links-y, 8px)) scale(var(--nav-links-scale, 1.04));
          opacity: var(--nav-links-opacity, 0.96);
          transition: transform 180ms linear, opacity 180ms linear;
          will-change: transform, opacity;
        }
      `}} />

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#111111] text-[#FCF2E6] px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
        <CheckCircle size={20} className="text-[#4ade80]" />
        <span className="text-xs uppercase tracking-widest font-bold">{toastMessage}</span>
      </div>

      {/* BOUTONS DE NAVIGATION FLOTTANTS (HAUT / BAS) */}
      <div className="fixed bottom-8 right-8 z-[80] flex flex-col gap-3">
        {!isAtBottom && (
          <button 
            onClick={scrollToBottom} 
            className="bg-[#111111] text-[#FCF2E6] p-3 rounded-full shadow-2xl hover:bg-[#C9191E] transition-all transform hover:scale-110"
            title="Aller en bas"
          >
            <ArrowDown size={20} strokeWidth={2.5} />
          </button>
        )}
        {isScrolled && (
          <button 
            onClick={scrollToTop} 
            className="bg-[#111111] text-[#FCF2E6] p-3 rounded-full shadow-2xl hover:bg-[#C9191E] transition-all transform hover:scale-110"
            title="Aller en haut"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* WRAPPER PRINCIPAL (Beige) */}
      <div className="bg-[#FCF2E6] w-full relative z-10">

        {/* 1. NAVIGATION */}
        <nav className={`fixed w-full z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-[#FCF2E6] py-4 border-b border-[#111111]/5 shadow-sm' : 'bg-transparent py-7'}`}>
          <div className={`mx-auto flex justify-between items-center transition-all duration-700 ease-in-out ${isScrolled ? 'max-w-[1400px] px-4 md:px-8' : 'max-w-none px-8 md:px-10'}`}>
            
            <div className={`nav-links-group hidden lg:flex flex-1 justify-start ${isScrolled ? 'space-x-6 xl:space-x-8' : 'space-x-8 xl:space-x-10'}`}>
              <a href="#apropos" className={`text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-[#111111] hover:text-[#C9191E]' : 'text-[#C9191E] hover:opacity-70'}`}>Notre Histoire</a>
              <a href="#galerie" className={`text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-[#111111] hover:text-[#C9191E]' : 'text-[#C9191E] hover:opacity-70'}`}>Galerie</a>
              <a href="#boutique" className={`text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-[#111111] hover:text-[#C9191E]' : 'text-[#C9191E] hover:opacity-70'}`}>Boutique</a>
              <a href="#consultant" className={`text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${isScrolled ? 'text-[#111111] hover:text-[#C9191E]' : 'text-[#C9191E] hover:opacity-70'}`}>
                Styliste IA <Sparkles size={12} className="text-[#C9191E]"/>
              </a>
            </div>

            <div className="nav-brand flex-shrink-0 cursor-pointer flex items-center justify-center gap-3 px-4" onClick={scrollToTop}>
              <ZetaLogoIcon className="h-8 w-8 md:h-10 md:w-10 text-[#C9191E]" />
              <span className="font-brand font-bold text-2xl md:text-4xl text-[#C9191E] leading-none pt-1">Zeta</span>
            </div>

            <div className={`nav-links-group flex flex-1 justify-end items-center ${isScrolled ? 'space-x-6 xl:space-x-8' : 'space-x-8 xl:space-x-10'}`}>
              <a href="#contact" className={`hidden md:block text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-[#111111] hover:text-[#C9191E]' : 'text-[#C9191E] hover:opacity-70'}`}>Contact</a>
              <button onClick={() => setIsSearchOpen(true)} className={`transition-all duration-300 ${isScrolled ? 'rounded-full p-2.5 text-[#111111] hover:text-[#C9191E] hover:bg-[#111111]/4' : 'text-[#C9191E] hover:opacity-70'}`}>
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button onClick={() => setIsCartOpen(true)} className={`relative transition-all duration-300 ${isScrolled ? 'rounded-full p-2.5 text-[#111111] hover:text-[#C9191E] hover:bg-[#111111]/4' : 'text-[#C9191E] hover:opacity-70'}`}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#C9191E] text-[#FCF2E6] text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">{cartCount}</span>
                )}
              </button>
              <button className={`lg:hidden transition-all duration-300 ${isScrolled ? 'rounded-full p-2.5 text-[#111111] hover:text-[#C9191E] hover:bg-[#111111]/4' : 'text-[#C9191E] hover:opacity-70'}`}>
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </nav>

        {/* 2. HERO SECTION */}
        <section className="pb-16 w-screen relative left-1/2 -translate-x-1/2 animate-on-scroll">
          <div ref={heroFrameRef} className="hero-shell relative overflow-hidden group border border-[#111111]/5 shadow-xl">
            {/* Image d'accueil générée dynamiquement */}
            <SafeImage 
              src="/hero.jpg"
              alt="Intérieur Boho Chic Zeta" 
              className="hero-media w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/50"></div>
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 flex flex-col md:flex-row md:items-end justify-between">
              <div className="hero-copy max-w-2xl text-[#FCF2E6] animate-on-scroll delay-100">
                <span className="text-xs uppercase tracking-[0.3em] font-semibold mb-6 block drop-shadow-md opacity-90">Nouvelle Collection · Automne 2026</span>
                <h2 className="font-brand text-5xl md:text-7xl mb-6 leading-[1.1] drop-shadow-2xl shadow-black">L'âme de l'Atlas,<br />l'élégance absolue.</h2>
              </div>
              
              <div className="hero-cta mt-8 md:mt-0 animate-on-scroll delay-200">
                 <a href="#boutique" className="group flex items-center justify-center w-36 h-36 rounded-full border border-[#FCF2E6]/30 bg-[#FCF2E6]/10 backdrop-blur-md hover:bg-[#C9191E] hover:border-[#C9191E] transition-all duration-500 ease-out cursor-pointer text-decoration-none">
                    <span className="text-[#FCF2E6] text-xs font-semibold uppercase tracking-widest text-center flex flex-col items-center">
                      Boutique
                      <ArrowRight size={18} className="mt-2 -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={1.5}/>
                    </span>
                 </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. À PROPOS */}
        <section id="apropos" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 md:order-1 relative h-[500px] md:h-[700px] rounded-lg overflow-hidden group shadow-2xl border border-[#111111]/5 animate-on-scroll">
              <SafeImage 
                src="https://image.pollinations.ai/prompt/Close%20up%20Moroccan%20artisan%20hands%20weaving%20wool%20rug?width=1200&height=800&nologo=true" 
                alt="Architecture et Artisanat Marocain" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#111111]/10"></div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-[#C9191E] text-xs uppercase tracking-[0.3em] font-bold mb-6 flex items-center gap-3 animate-on-scroll">
                <span className="w-8 h-px bg-[#C9191E]"></span> Notre Histoire
              </span>
              <h2 className="font-brand text-4xl md:text-6xl text-[#111111] mb-8 leading-[1.1] animate-on-scroll delay-100">
                L'âme de l'Atlas,<br />tissée à la main.
              </h2>
              <p className="text-[#111111]/70 font-light text-lg mb-6 leading-relaxed animate-on-scroll delay-200">
                ZETA est né d'une passion pour le savoir-faire ancestral marocain. Le nom de notre studio dérive directement d'<strong>"Azetta"</strong>, le mot Amazigh désignant le métier à tisser traditionnel.
              </p>
              <p className="text-[#111111]/70 font-light text-lg mb-10 leading-relaxed animate-on-scroll delay-300">
                Nous collaborons sans intermédiaire avec des coopératives de femmes dans les montagnes de l'Atlas. Notre mission est double : préserver un art millénaire et offrir à ces artisanes une rémunération équitable, tout en proposant des pièces d'exception pour l'architecture d'intérieur contemporaine.
              </p>
              <div className="grid grid-cols-2 gap-6 border-t border-[#111111]/10 pt-8 animate-on-scroll delay-400">
                <div>
                  <p className="font-brand text-4xl text-[#C9191E] mb-2">100%</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-bold">Laine Naturelle</p>
                </div>
                <div>
                  <p className="font-brand text-4xl text-[#C9191E] mb-2">Éthique</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-bold">Commerce Juste</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. GALERIE */}
        <section id="galerie" className="py-16 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 px-4">
            <div className="animate-on-scroll">
              <span className="text-[#C9191E] text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Direction Artistique</span>
              <h2 className="font-brand text-4xl md:text-5xl text-[#111111]">La <span className="text-[#C9191E]">Galerie</span></h2>
            </div>
            <p className="text-[#111111]/60 font-light text-sm max-w-md mt-6 md:mt-0 md:text-right animate-on-scroll delay-100">
              Une immersion visuelle à travers nos trois piliers photographiques : le geste authentique, l'élégance des espaces, et la matière brute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-[#e2e8f0] rounded-sm animate-on-scroll delay-100">
              <SafeImage src="https://image.pollinations.ai/prompt/Cinematic%20shot%20Berber%20woman%20weaving%20rug?width=800&height=1000&nologo=true" alt="Le Geste et la Décoration" className="w-full h-full object-cover aspect-[4/5] md:aspect-auto group-hover:scale-105 transition-transform duration-[1.5s] ease-out"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                <div>
                  <p className="text-[#FCF2E6] font-brand text-3xl mb-1">01. Le Geste</p>
                  <p className="text-[#FCF2E6]/80 text-xs uppercase tracking-widest font-semibold">Savoir-faire ancestral</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 relative group overflow-hidden bg-[#e2e8f0] rounded-sm animate-on-scroll delay-200">
              <SafeImage src="https://image.pollinations.ai/prompt/Modern%20living%20room%20with%20Moroccan%20rug?width=1200&height=800&nologo=true" alt="L'Espace Minimaliste" className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-[1.5s] ease-out"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                <div>
                  <p className="text-[#FCF2E6] font-brand text-3xl mb-1">02. L'Espace</p>
                  <p className="text-[#FCF2E6]/80 text-xs uppercase tracking-widest font-semibold">Minimalisme & Design</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-1 relative group overflow-hidden bg-[#e2e8f0] rounded-sm animate-on-scroll delay-300">
              <SafeImage src="https://image.pollinations.ai/prompt/Macro%20texture%20white%20wool%20rug?width=600&height=600&nologo=true" alt="Matière Laine Blanche" className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-[1.5s] ease-out"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <p className="text-[#FCF2E6] font-brand text-2xl mb-1">03. Matière</p>
              </div>
            </div>
            <div className="md:col-span-1 relative group overflow-hidden bg-[#e2e8f0] rounded-sm animate-on-scroll delay-400">
              <SafeImage src="https://image.pollinations.ai/prompt/Macro%20texture%20black%20wool%20rug?width=600&height=600&nologo=true" alt="Matière Carbone Foncée" className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-[1.5s] ease-out"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <p className="text-[#FCF2E6] font-brand text-2xl mb-1">04. Détail</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BOUTIQUE */}
        <section id="boutique" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto mt-12 border-t border-[#111111]/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 px-4 animate-on-scroll">
            <div>
              <span className="text-[#C9191E] text-xs uppercase tracking-[0.3em] font-bold mb-4 block">E-Boutique</span>
              <h2 className="font-brand text-5xl text-[#111111] m-0">Acquérir une <span className="text-[#C9191E]">Pièce</span></h2>
            </div>
            
            <div className="flex space-x-6 mt-8 md:mt-0 border-b border-[#111111]/20 pb-2">
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9191E] border-b-2 border-[#C9191E] pb-1">Tout voir</button>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]/50 hover:text-[#111111]">Beni Ouarain</button>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]/50 hover:text-[#111111]">Kilim</button>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]/50 hover:text-[#111111]">Zanafi</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
            
            {/* Produit 1 : Beni Ouarain */}
            <div className="group cursor-pointer animate-on-scroll delay-100" onClick={() => addToCart({ id: 1, name: 'Beni Ouarain Signature', price: 1250, image: 'https://image.pollinations.ai/prompt/White%20Moroccan%20Beni%20Ouarain%20rug%20flat%20lay?width=800&height=1200&nologo=true' })}>
              <div className="w-full aspect-[3/4] bg-[#e2e8f0] relative mb-6 overflow-hidden rounded-sm">
                <SafeImage src="https://image.pollinations.ai/prompt/White%20Moroccan%20Beni%20Ouarain%20rug%20flat%20lay?width=800&height=1200&nologo=true" alt="Tapis Beni Ouarain" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute top-4 left-4 bg-[#111111] text-[#FCF2E6] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 z-10">En Stock</div>
                
                <div className="absolute inset-0 bg-[#111111]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart({ id: 1, name: 'Beni Ouarain Signature', price: 1250, image: 'https://image.pollinations.ai/prompt/White%20Moroccan%20Beni%20Ouarain%20rug%20flat%20lay?width=800&height=1200&nologo=true' }); showToast("Ajouté au panier !"); }}
                    className="bg-[#FCF2E6] text-[#111111] px-6 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-[#C9191E] hover:text-[#FCF2E6] transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
              <div className="border-b border-[#111111]/10 pb-4 mb-4">
                <h4 className="font-brand text-2xl text-[#111111] mb-1 group-hover:text-[#C9191E] transition-colors">Beni Ouarain Signature</h4>
                <p className="text-[#111111]/50 text-xs font-bold uppercase tracking-[0.1em] m-0">100% Laine Écrue</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#111111]/80 font-light text-sm m-0">Format : 200 x 300 cm</p>
                <p className="font-bold text-lg text-[#C9191E] m-0">1 250 DH</p>
              </div>
            </div>

            {/* Produit 2 : Kilim Azilal */}
            <div className="group cursor-pointer animate-on-scroll delay-200" onClick={() => addToCart({ id: 2, name: 'Kilim Azilal Ocre', price: 890, image: 'https://image.pollinations.ai/prompt/Colorful%20Moroccan%20Kilim%20rug%20flat%20lay?width=800&height=1200&nologo=true' })}>
              <div className="w-full aspect-[3/4] bg-[#e2e8f0] relative mb-6 overflow-hidden rounded-sm">
                <SafeImage src="https://image.pollinations.ai/prompt/Colorful%20Moroccan%20Kilim%20rug%20flat%20lay?width=800&height=1200&nologo=true" alt="Tapis Kilim Azilal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute top-4 left-4 bg-[#FCF2E6] text-[#111111] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-[#111111]/10 z-10">Pièce Unique</div>
                
                <div className="absolute inset-0 bg-[#111111]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart({ id: 2, name: 'Kilim Azilal Ocre', price: 890, image: 'https://image.pollinations.ai/prompt/Colorful%20Moroccan%20Kilim%20rug%20flat%20lay?width=800&height=1200&nologo=true' }); showToast("Ajouté au panier !"); }}
                    className="bg-[#FCF2E6] text-[#111111] px-6 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-[#C9191E] hover:text-[#FCF2E6] transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
              <div className="border-b border-[#111111]/10 pb-4 mb-4">
                <h4 className="font-brand text-2xl text-[#111111] mb-1 group-hover:text-[#C9191E] transition-colors">Kilim Azilal Ocre</h4>
                <p className="text-[#111111]/50 text-xs font-bold uppercase tracking-[0.1em] m-0">Tissage Ras & Motifs</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#111111]/80 font-light text-sm m-0">Format : 150 x 250 cm</p>
                <p className="font-bold text-lg text-[#C9191E] m-0">890 DH</p>
              </div>
            </div>

            {/* Produit 3 : Zanafi Noir */}
            <div className="group cursor-pointer animate-on-scroll delay-300" onClick={() => addToCart({ id: 3, name: 'Zanafi Noir Carbone', price: 1100, image: 'https://image.pollinations.ai/prompt/Black%20and%20white%20Moroccan%20Zanafi%20rug%20flat%20lay?width=800&height=1200&nologo=true' })}>
              <div className="w-full aspect-[3/4] bg-[#e2e8f0] relative mb-6 overflow-hidden rounded-sm">
                <SafeImage src="https://image.pollinations.ai/prompt/Black%20and%20white%20Moroccan%20Zanafi%20rug%20flat%20lay?width=800&height=1200&nologo=true" alt="Tapis Zanafi Noir" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute top-4 left-4 bg-[#111111] text-[#FCF2E6] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 z-10">Sur Commande</div>
                
                <div className="absolute inset-0 bg-[#111111]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart({ id: 3, name: 'Zanafi Noir Carbone', price: 1100, image: 'https://image.pollinations.ai/prompt/Black%20and%20white%20Moroccan%20Zanafi%20rug%20flat%20lay?width=800&height=1200&nologo=true' }); showToast("Ajouté au panier !"); }}
                    className="bg-[#FCF2E6] text-[#111111] px-6 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-[#C9191E] hover:text-[#FCF2E6] transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    Commander sur-mesure
                  </button>
                </div>
              </div>
              <div className="border-b border-[#111111]/10 pb-4 mb-4">
                <h4 className="font-brand text-2xl text-[#111111] mb-1 group-hover:text-[#C9191E] transition-colors">Zanafi Noir Carbone</h4>
                <p className="text-[#111111]/50 text-xs font-bold uppercase tracking-[0.1em] m-0">Laine Contrastée</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#111111]/80 font-light text-sm m-0">Format : 170 x 240 cm</p>
                <p className="font-bold text-lg text-[#C9191E] m-0">1 100 DH</p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. GEMINI AI VISION */}
        <section id="consultant" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-t border-[#111111]/10">
          <div className="bg-[#111111] text-[#FCF2E6] p-10 md:p-16 rounded-lg relative overflow-hidden shadow-2xl animate-on-scroll">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9191E] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles size={24} className="text-[#C9191E]" />
                <span className="text-[#C9191E] text-xs uppercase tracking-[0.3em] font-bold block">Styliste Privé ZETA</span>
              </div>
              <h2 className="font-brand text-4xl md:text-5xl mb-6">Trouvez la pièce parfaite.</h2>
              <p className="text-[#FCF2E6]/70 font-light text-lg mb-10 leading-relaxed">
                Décrivez l'atmosphère de votre pièce ou <strong>téléchargez une photo</strong> de votre salon. Notre consultant IA analysera visuellement votre espace pour vous recommander la pièce maîtresse idéale.
              </p>
              
              <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                <div className="relative">
                  <textarea 
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    placeholder="Décrivez votre salon ou téléchargez une photo pour une analyse visuelle experte..."
                    className="w-full bg-[#FCF2E6]/10 border border-[#FCF2E6]/20 rounded-lg p-4 text-[#FCF2E6] placeholder-[#FCF2E6]/40 focus:outline-none focus:border-[#C9191E] transition-colors resize-none h-32 text-sm font-light"
                  />
                  
                  {/* Bouton Upload Image */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <label className="cursor-pointer bg-[#FCF2E6]/20 hover:bg-[#FCF2E6]/40 text-[#FCF2E6] p-2 rounded-full transition-colors flex items-center justify-center" title="Télécharger une photo de votre pièce">
                      <Upload size={18} />
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>
                  </div>
                </div>

                {/* Aperçu de l'image sélectionnée */}
                {selectedImage && (
                  <div className="flex justify-center mt-2 mb-4">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-[#C9191E] shadow-lg animate-in zoom-in duration-300">
                      <img 
                        src={`data:${imageMimeType};base64,${selectedImage}`} 
                        alt="Aperçu de la pièce" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={removeImage} 
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1.5 rounded-full text-white transition-colors"
                        title="Retirer la photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={generateRecommendation}
                  disabled={isAiLoading || (!roomDescription.trim() && !selectedImage)}
                  className="bg-[#C9191E] text-[#FCF2E6] px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#a01317] transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isAiLoading ? <><Loader2 size={16} className="animate-spin" /> Analyse Visuelle en cours...</> : <>Conseiller mon espace <Sparkles size={14} /></>}
                </button>
              </div>
              
              {aiRecommendation && (
                <div className="mt-10 p-8 bg-[#FCF2E6]/5 border border-[#FCF2E6]/10 rounded-sm text-left animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                  <div className="absolute -top-3 left-8 bg-[#111111] px-2 text-[#C9191E] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                    <Sparkles size={12} /> Recommandation Sur-Mesure
                  </div>
                  <p className="text-[#FCF2E6]/90 font-light text-base leading-relaxed italic mt-2">"{aiRecommendation}"</p>
                </div>
              )}

              {aiError && (
                <div className="mt-8 text-[#C9191E] text-sm bg-[#C9191E]/10 p-4 rounded-sm border border-[#C9191E]/20">
                  {aiError}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* 7. STUDIO VIDEO */}
        <section id="studio" className="py-32 bg-[#111111] text-[#FCF2E6] px-4 md:px-8 border-t border-[#FCF2E6]/5">
          <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 md:pl-8 animate-on-scroll">
              <span className="text-[#C85A17] text-xs uppercase tracking-[0.3em] font-bold mb-6 block">Film d'Animation Promotionnel</span>
              <h3 className="font-brand text-4xl md:text-5xl mb-8 leading-tight">L'histoire de ZETA en mouvement.</h3>
              <p className="text-[#FCF2E6]/70 font-light text-lg mb-10 leading-relaxed">
                La transparence n'est pas une option, c'est notre éthique. Découvrez le voyage de la <em>Zarbia</em>, depuis l'environnement ancien jusqu'à la modernité. Un périple immersif où le tapis traverse les époques et trouve sa place au cœur des grandes métropoles.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-[#FCF2E6]/20 pt-8">
                <div>
                  <span className="block font-brand text-3xl text-[#C9191E] mb-2">Motion</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#FCF2E6]/50 font-semibold">Immersion<br/>Visuelle 3D</span>
                </div>
                <div>
                  <span className="block font-brand text-3xl text-[#C9191E] mb-2">Héritage</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#FCF2E6]/50 font-semibold">L'Histoire<br/>Amazigh Animée</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 animate-on-scroll delay-200">
              <div className="relative w-full aspect-video bg-[#222] rounded-sm overflow-hidden group cursor-pointer shadow-2xl border border-[#333]">
                <SafeImage src="https://image.pollinations.ai/prompt/Abstract%203D%20motion%20design%20Moroccan%20patterns?width=1200&height=675&nologo=true" alt="Animation 3D et Motion Design" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#FCF2E6]/10 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FCF2E6]/30 group-hover:scale-110 group-hover:bg-[#C9191E]/90 transition-all duration-500">
                    <Play fill="#FCF2E6" size={30} className="ml-2 text-[#FCF2E6]" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.2em] font-bold text-[#FCF2E6]/80">Regarder le film promotionnel (01:15)</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CONTACT */}
        <section id="contact" className="py-32 px-4 md:px-8 bg-[#FCF2E6] border-t border-[#111111]/10">
          <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <span className="text-[#C9191E] text-xs uppercase tracking-[0.3em] font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-[#C9191E]"></span> Contact
              </span>
              <h2 className="font-brand text-4xl md:text-6xl text-[#111111] mb-8 leading-[1.1]">
                Parlons de votre projet.
              </h2>
              <p className="text-[#111111]/70 font-light text-lg mb-12 leading-relaxed">
                Que ce soit pour une commande de tapis sur-mesure, une collaboration B2B pour vos projets d'architecture, ou une simple question sur nos pièces, le studio est à votre écoute.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#111111]/5 rounded-full flex items-center justify-center text-[#C9191E] shrink-0">
                    <MapPin size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[#111111]/50 mb-1">Le Studio</p>
                    <p className="text-[#111111] font-medium text-lg">Quartier Guéliz, Marrakech<br/><span className="text-sm font-light text-[#111111]/70">(Uniquement sur rendez-vous)</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#111111]/5 rounded-full flex items-center justify-center text-[#C9191E] shrink-0">
                    <Mail size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[#111111]/50 mb-1">Email Direct</p>
                    <p className="text-[#111111] font-medium text-lg">contact@zetastudio.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#ffffff] p-8 md:p-12 rounded-xl shadow-2xl border border-[#111111]/5 animate-on-scroll delay-200">
              <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); showToast("Message envoyé avec succès !"); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Nom complet</label>
                    <input type="text" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="Emma Dubois" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Adresse Email</label>
                    <input type="email" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="emma@exemple.com" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Sujet de la demande</label>
                  <select className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium text-[#111111]/80 cursor-pointer">
                    <option>Commande Sur-Mesure</option>
                    <option>Partenariat B2B / Architecte d'intérieur</option>
                    <option>Question sur une pièce de la galerie</option>
                    <option>Presse & Relations Publiques</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Votre Message</label>
                  <textarea rows="4" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm resize-none font-medium" placeholder="Parlez-nous de votre intérieur..."></textarea>
                </div>
                <button type="submit" className="bg-[#111111] text-[#FCF2E6] py-5 mt-2 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#C9191E] transition-colors w-full rounded-sm flex items-center justify-center text-center">
                  Envoyer la demande
                </button>
              </form>
            </div>
          </div>
        </section>

      {/* FIN DU WRAPPER BEIGE */}
      </div>

      {/* 9. FOOTER (Placé en bas sur le fond noir) */}
      <footer className="bg-[#111111] text-[#FCF2E6] pt-20 pb-10 w-full relative z-10 border-t border-[#333]">
        <div className="max-w-[1400px] mx-auto px-8 grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <ZetaLogoIcon className="h-12 w-12 text-[#FCF2E6]" />
              <span className="font-brand font-bold text-5xl text-[#FCF2E6] leading-none pt-2">Zeta</span>
            </div>
            <p className="text-[#FCF2E6]/60 font-light max-w-sm text-sm leading-relaxed">
              Une galerie d'art digitale dédiée au tissage marocain premium. Conçu avec éthique, inspiré par l'Atlas.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#FCF2E6]/50">Le Studio</h4>
            <ul className="space-y-3 font-medium text-sm text-[#FCF2E6]/80 list-none p-0">
              <li><a href="#apropos" className="hover:text-[#C9191E] transition-colors">Notre Histoire</a></li>
              <li><a href="#galerie" className="hover:text-[#C9191E] transition-colors">La Galerie</a></li>
              <li><a href="#boutique" className="hover:text-[#C9191E] transition-colors">La Boutique</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#FCF2E6]/50">Services</h4>
            <ul className="space-y-3 font-medium text-sm text-[#FCF2E6]/80 list-none p-0">
              <li><a href="#consultant" className="hover:text-[#C9191E] transition-colors flex items-center gap-1">Styliste IA <Sparkles size={10} className="text-[#C9191E]" /></a></li>
              <li><a href="#studio" className="hover:text-[#C9191E] transition-colors">L'Animation 3D</a></li>
              <li><a href="#contact" className="hover:text-[#C9191E] transition-colors">Contact & Sur-mesure</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-8 pt-8 border-t border-[#FCF2E6]/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#FCF2E6]/40 uppercase tracking-widest font-bold">
          <p>© 2026 Zeta Studio. Tous droits réservés.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#FCF2E6] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#FCF2E6] transition-colors">Pinterest</a>
            <a href="#" className="hover:text-[#FCF2E6] transition-colors">Mentions Légales</a>
          </div>
        </div>
      </footer>

      {/* === MODAL RECHERCHE === */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#111111]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-8 right-8 md:top-12 md:right-12 text-[#FCF2E6] hover:text-[#C9191E] transition-colors">
            <X size={36} strokeWidth={1.5} />
          </button>
          <div className="w-full max-w-3xl relative">
            <Search size={36} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FCF2E6]/50" />
            <input 
              type="text" 
              autoFocus
              placeholder="Rechercher une pièce, un style..." 
              className="w-full bg-transparent border-b-2 border-[#FCF2E6]/20 text-[#FCF2E6] text-3xl md:text-5xl font-brand py-6 pl-16 focus:outline-none focus:border-[#C9191E] transition-colors"
            />
          </div>
          <p className="text-[#FCF2E6]/50 mt-8 text-sm uppercase tracking-widest font-semibold">Suggestions : Beni Ouarain, Zanafi, Sur-mesure</p>
        </div>
      )}

      {/* === SIDEBAR PANIER === */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#FCF2E6] z-[100] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-8 border-b border-[#111111]/10">
          <h2 className="font-brand text-4xl text-[#111111] m-0">Votre Panier <span className="text-[#C9191E]">({cartCount})</span></h2>
          <button onClick={() => setIsCartOpen(false)} className="text-[#111111] hover:text-[#C9191E] transition-colors p-2">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 hide-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#111111]/50">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4 text-[#111111]/30" />
              <p className="font-medium text-lg">Votre panier est vide.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-8 border border-[#111111] text-[#111111] px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-[#FCF2E6] transition-colors">Découvrir la collection</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 bg-[#ffffff] p-4 rounded-sm border border-[#111111]/5 shadow-sm relative group">
                <div className="w-24 h-24 bg-[#e2e8f0] rounded-sm overflow-hidden shrink-0 relative">
                  {/* Utilisation de l'image sécurisée pour le panier aussi ! */}
                  <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h4 className="font-brand text-lg text-[#111111] leading-tight pr-6 m-0">{item.name}</h4>
                    <p className="text-[#111111]/50 text-[10px] uppercase tracking-widest font-bold mt-1 m-0">{item.price} DH</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#111111]/20 rounded-sm">
                      <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-[#111111]/60 hover:text-[#111111]"><Minus size={14} /></button>
                      <span className="px-2 text-xs font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-[#111111]/60 hover:text-[#111111]"><Plus size={14} /></button>
                    </div>
                    <p className="font-bold text-[#C9191E] m-0 text-lg">{item.price * item.quantity} DH</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-[#111111]/30 hover:text-[#C9191E] opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-8 border-t border-[#111111]/10 bg-[#ffffff]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm uppercase tracking-widest font-bold text-[#111111]/60">Total</span>
              <span className="font-brand text-4xl text-[#111111]">{cartTotal} DH</span>
            </div>
            <button onClick={handleCheckoutClick} className="w-full bg-[#111111] text-[#FCF2E6] py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#C9191E] transition-colors rounded-sm">
              Valider la commande
            </button>
          </div>
        )}
      </div>

      {/* === MODAL PAIEMENT / CHECKOUT === */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[110] bg-[#111111]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#FCF2E6] w-full max-w-lg p-8 md:p-12 rounded-sm shadow-2xl relative">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-[#111111]/50 hover:text-[#C9191E] transition-colors">
              <X size={24} strokeWidth={1.5} />
            </button>
            
            <h2 className="font-brand text-4xl text-[#111111] mb-2">Finaliser l'achat</h2>
            <p className="text-[#111111]/60 font-light text-sm mb-8">Veuillez saisir vos coordonnées de livraison et de paiement.</p>
            
            <form onSubmit={confirmOrder} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Nom complet</label>
                <input type="text" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="Emma Dubois" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Adresse de livraison</label>
                <input type="text" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="123 Avenue Guéliz, Marrakech" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Numéro de carte</label>
                    <input type="text" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="**** **** **** ****" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/60">Expiration</label>
                    <input type="text" required className="border-b border-[#111111]/20 pb-3 bg-transparent focus:outline-none focus:border-[#C9191E] transition-colors text-sm font-medium" placeholder="MM/AA" />
                  </div>
              </div>
              
              <div className="mt-4 pt-6 border-t border-[#111111]/10 flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-bold text-[#111111]/60">Total à payer</span>
                <span className="font-brand text-3xl text-[#C9191E]">{cartTotal} DH</span>
              </div>
              
              <button type="submit" className="bg-[#111111] text-[#FCF2E6] py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#C9191E] transition-colors rounded-sm w-full flex items-center justify-center text-center">
                Payer {cartTotal} DH
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY SOMBRE POUR FERMER LE PANIER */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm z-[90] transition-opacity"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}

    </div>
  );
}
