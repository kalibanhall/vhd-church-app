/**
 * MarketplacePage - Acheter & vendre
 * Place de marché pour achats et ventes entre membres
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag,
  Search,
  Filter,
  Plus,
  MapPin,
  MessageCircle,
  Heart,
  Share2,
  Grid,
  List,
  X,
  Camera,
  Tag,
  Euro,
  ChevronRight,
  Phone,
  Mail,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Loader2,
  Smartphone,
  Shirt,
  Sofa,
  BookOpen,
  Dumbbell,
  Baby,
  Car,
  Wrench,
  Package
} from 'lucide-react';

interface Product {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  category: string;
  condition: string;
  images: string[];
  location: string;
  date: string;
  views: number;
  favorites: number;
  status: 'active' | 'sold' | 'reserved';
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    negotiable: true,
    category: '',
    condition: '',
    location: '',
    images: [] as File[],
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'electronics', label: 'Électronique', icon: Smartphone },
    { id: 'clothing', label: 'Vêtements', icon: Shirt },
    { id: 'furniture', label: 'Meubles', icon: Sofa },
    { id: 'books', label: 'Livres', icon: BookOpen },
    { id: 'sports', label: 'Sports', icon: Dumbbell },
    { id: 'kids', label: 'Enfants', icon: Baby },
    { id: 'vehicles', label: 'Véhicules', icon: Car },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'other', label: 'Autre', icon: Package },
  ];

  const conditions = [
    { id: 'new', label: 'Neuf' },
    { id: 'like_new', label: 'Comme neuf' },
    { id: 'good', label: 'Bon état' },
    { id: 'fair', label: 'État correct' },
    { id: 'for_parts', label: 'Pour pièces' },
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Marie Kasongo',
      title: 'Samsung Galaxy A54 - Excellent état',
      description: 'Samsung Galaxy A54 128Go, noir, acheté il y a 8 mois. Toujours avec coque et verre trempé. Batterie 92%.',
      price: 450000,
      negotiable: true,
      category: 'electronics',
      condition: 'like_new',
      images: ['/placeholder-product.jpg'],
      location: 'Kinshasa - Gombe',
      date: '2025-01-15',
      views: 78,
      favorites: 12,
      status: 'active',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jean-Pierre Mwamba',
      title: 'Canapé 3 places - Tissu africain',
      description: 'Canapé fait main avec tissu wax, très confortable, fabriqué à Kinshasa. Idéal pour salon.',
      price: 180000,
      negotiable: true,
      category: 'furniture',
      condition: 'good',
      images: ['/placeholder-product.jpg'],
      location: 'Kinshasa - Ngaliema',
      date: '2025-01-14',
      views: 45,
      favorites: 8,
      status: 'active',
    },
    {
      id: '3',
      userId: '3',
      userName: 'Sophie Lukusa',
      title: 'Lot de vêtements bébé 0-6 mois',
      description: 'Lot de 25 vêtements bébé fille, bodies, pyjamas, robes. Très bon état.',
      price: 35000,
      negotiable: false,
      category: 'kids',
      condition: 'good',
      images: ['/placeholder-product.jpg'],
      location: 'Lubumbashi - Centre',
      date: '2025-01-13',
      views: 52,
      favorites: 15,
      status: 'active',
    },
    {
      id: '4',
      userId: '4',
      userName: 'Pasteur Pierre Kalonda',
      title: 'Bible d\'étude Louis Segond',
      description: 'Bible d\'étude avec concordance, notes et cartes. Couverture cuir bordeaux.',
      price: 25000,
      negotiable: true,
      category: 'books',
      condition: 'like_new',
      images: ['/placeholder-product.jpg'],
      location: 'Matadi',
      date: '2025-01-12',
      views: 31,
      favorites: 6,
      status: 'active',
    },
    {
      id: '5',
      userId: '5',
      userName: 'Claire Mbombo',
      title: 'Moto TVS - Occasion',
      description: 'Moto TVS Star 2022, très bon état, 15000 km. Papiers en règle.',
      price: 850000,
      negotiable: true,
      category: 'vehicles',
      condition: 'good',
      images: ['/placeholder-product.jpg'],
      location: 'Goma',
      date: '2025-01-11',
      views: 89,
      favorites: 22,
      status: 'reserved',
    },
    {
      id: '6',
      userId: '6',
      userName: 'Frère Lucas Tshisekedi',
      title: 'Cours particuliers de guitare',
      description: 'Propose cours de guitare acoustique/électrique pour débutants et intermédiaires. 10000 FC/h pour les membres.',
      price: 10000,
      negotiable: false,
      category: 'services',
      condition: 'new',
      images: ['/placeholder-product.jpg'],
      location: 'Kinshasa / En ligne',
      date: '2025-01-10',
      views: 36,
      favorites: 9,
      status: 'active',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace-proxy?category=${selectedCategory}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || mockProducts);
      } else {
        setProducts(mockProducts);
      }
    } catch {
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('data', JSON.stringify(newProduct));
      newProduct.images.forEach((img, i) => formData.append(`image_${i}`, img));

      await fetch('/api/marketplace-proxy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const getConditionLabel = (conditionId: string) => {
    return conditions.find(c => c.id === conditionId)?.label || conditionId;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acheter & Vendre</h1>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Acheter & Vendre</h1>
        <p className="text-gray-600 mt-2">
          Marketplace de confiance entre membres de l'église
        </p>
      </div>

      {/* Trust Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-700">
          Tous les vendeurs sont des membres vérifiés de notre communauté
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-xl font-medium flex items-center gap-2 ${
            showFilters ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Vendre</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                placeholder="Min"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg"
              />
              <span className="text-gray-500">à</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                placeholder="Max"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg"
              />
              <span className="text-gray-500">FC</span>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500">{filteredProducts.length} articles</p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun article trouvé</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700"
          >
            Publier une annonce
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setShowDetailModal(true);
              }}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}`}>
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                </div>
                {product.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">Vendu</span>
                  </div>
                )}
                {product.status === 'reserved' && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                    Réservé
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Info */}
              <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <p className="font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  {product.price.toLocaleString()} FC
                  {product.negotiable && <span className="text-xs font-normal text-gray-500 ml-1">négociable</span>}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">{(() => { const CatIcon = getCategoryInfo(product.category).icon; return <CatIcon className="h-3 w-3" />; })()} {getCategoryInfo(product.category).label}</span>
                  <span>•</span>
                  <span>{getConditionLabel(product.condition)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vendre un article</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="grid grid-cols-4 gap-2">
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400">
                    <Camera className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Ajouter</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        setNewProduct({ ...newProduct, images: [...newProduct.images, ...Array.from(e.target.files)] });
                      }
                    }} />
                  </label>
                  {newProduct.images.map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center relative">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                      <button
                        onClick={() => setNewProduct({ ...newProduct, images: newProduct.images.filter((_, idx) => idx !== i) })}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'annonce *</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="Ex: iPhone 13 Pro - Très bon état"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Décrivez votre article en détail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Price */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix *</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    checked={newProduct.negotiable}
                    onChange={(e) => setNewProduct({ ...newProduct, negotiable: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600"
                  />
                  <span className="text-sm text-gray-700">Négociable</span>
                </label>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewProduct({ ...newProduct, category: cat.id })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        newProduct.category === cat.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-lg"><cat.icon className="h-5 w-5 mx-auto text-gray-600" /></span>
                      <p className="text-xs text-gray-700 mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">État *</label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(cond => (
                    <button
                      key={cond.id}
                      onClick={() => setNewProduct({ ...newProduct, condition: cond.id })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        newProduct.condition === cond.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                <input
                  type="text"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  placeholder="Ex: Gombe, Kinshasa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={!newProduct.title || !newProduct.price || !newProduct.category || !newProduct.condition}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                Publier l'annonce
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-300" />
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedProduct.id)}
                className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md"
              >
                <Heart className={`h-5 w-5 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h2>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {selectedProduct.price.toLocaleString()} FC
                    {selectedProduct.negotiable && <span className="text-sm font-normal text-gray-500 ml-2">Prix négociable</span>}
                  </p>
                </div>
                {selectedProduct.status === 'reserved' && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                    Réservé
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1">{(() => { const CatIcon = getCategoryInfo(selectedProduct.category).icon; return <CatIcon className="h-3 w-3" />; })()} {getCategoryInfo(selectedProduct.category).label}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{getConditionLabel(selectedProduct.condition)}</span>
              </div>

              <p className="text-gray-600">{selectedProduct.description}</p>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-500">{selectedProduct.userName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedProduct.userName}</p>
                  <p className="text-sm text-gray-500">Membre vérifié</p>
                </div>
                <Check className="h-5 w-5 text-green-500" />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedProduct.location}
                </span>
                <span>Publié le {new Date(selectedProduct.date).toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{selectedProduct.views} vues</span>
                <span>{selectedProduct.favorites} favoris</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Appeler
              </button>
              <button className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Envoyer un message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
