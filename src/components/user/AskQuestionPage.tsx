/**
 * AskQuestionPage - Poser une question
 * Page pour poser des questions aux pasteurs et responsables
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  MessageCircle,
  Clock,
  Check,
  CheckCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  Heart,
  Users,
  Briefcase,
  Shield,
  ThumbsUp,
  Eye,
  Reply
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  subject: string;
  content: string;
  isAnonymous: boolean;
  isPublic: boolean;
  status: 'pending' | 'answered' | 'closed';
  answer?: {
    content: string;
    answeredBy: string;
    answeredAt: string;
  };
  createdAt: string;
  views?: number;
  likes?: number;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  views: number;
  helpful: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com';

export default function AskQuestionPage() {
  const [activeTab, setActiveTab] = useState<'ask' | 'my-questions' | 'faq'>('ask');
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    subject: '',
    content: '',
    isAnonymous: false,
    isPublic: false,
  });

  const categories = [
    { id: 'bible', label: 'Questions bibliques', icon: BookOpen, color: 'text-[#cc9b00]', bgColor: 'bg-[#fff3cc]' },
    { id: 'faith', label: 'Questions de foi', icon: Heart, color: 'text-[#cc9b00]', bgColor: 'bg-[#fff3cc]' },
    { id: 'church', label: 'Vie d\'église', icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'practical', label: 'Questions pratiques', icon: Briefcase, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { id: 'spiritual', label: 'Vie spirituelle', icon: Shield, color: 'text-[#cc9b00]', bgColor: 'bg-[#fff3cc]' },
    { id: 'other', label: 'Autre', icon: HelpCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch my questions
      const questionsRes = await fetch('/api/questions-proxy', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setMyQuestions(data.questions || []);
      } else {
        console.warn('[Questions] Backend indisponible');
        setMyQuestions([]);
      }

      // Fetch FAQs
      const faqRes = await fetch('/api/questions-proxy?type=faq');
      if (faqRes.ok) {
        const data = await faqRes.json();
        setFaqs(data.faqs || []);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMyQuestions([]);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuestion.category || !newQuestion.subject || !newQuestion.content) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/questions-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
    
    setSubmitted(true);
    setNewQuestion({
      category: '',
      subject: '',
      content: '',
      isAnonymous: false,
      isPublic: false,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Répondu</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">En attente</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Fermé</span>;
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search);
  });

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Poser une question</h1>
        <p className="text-gray-600 mt-2">Nos pasteurs sont là pour vous répondre</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'ask', label: 'Poser', icon: Send },
          { id: 'my-questions', label: 'Mes questions', icon: MessageCircle },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#ffc200] text-[#cc9b00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ask Tab */}
      {activeTab === 'ask' && (
        <div>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Question envoyée !</h2>
              <p className="text-gray-600 mb-6">Un pasteur vous répondra dans les plus brefs délais.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-[#ffc200] text-white rounded-xl font-medium hover:bg-[#cc9b00]"
              >
                Poser une autre question
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewQuestion({ ...newQuestion, category: cat.id })}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          newQuestion.category === cat.id
                            ? 'border-[#ffc200] bg-[#fff3cc]'
                            : 'border-gray-200 hover:border-[#e6af00] bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${cat.bgColor}`}>
                          <Icon className={`h-4 w-4 ${cat.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  type="text"
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                  placeholder="Résumez votre question en quelques mots"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre question</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  placeholder="Développez votre question ici..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestion.isAnonymous}
                    onChange={(e) => setNewQuestion({ ...newQuestion, isAnonymous: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#cc9b00] focus:ring-[#ffc200]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Poser anonymement</p>
                    <p className="text-sm text-gray-500">Votre nom ne sera pas affiché</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestion.isPublic}
                    onChange={(e) => setNewQuestion({ ...newQuestion, isPublic: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#cc9b00] focus:ring-[#ffc200]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Rendre public</p>
                    <p className="text-sm text-gray-500">La réponse pourra aider d'autres personnes</p>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!newQuestion.category || !newQuestion.subject || !newQuestion.content}
                className="w-full py-3 bg-[#ffc200] text-white rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Envoyer ma question
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Questions Tab */}
      {activeTab === 'my-questions' && (
        <div className="space-y-4">
          {myQuestions.length > 0 ? (
            myQuestions.map(question => (
              <div key={question.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {categories.find(c => c.id === question.category)?.label}
                    </span>
                    {getStatusBadge(question.status)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(question.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{question.subject}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{question.content}</p>
                
                {question.answer && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Réponse de {question.answer.answeredBy}</span>
                    </div>
                    <p className="text-sm text-gray-700">{question.answer.content}</p>
                  </div>
                )}

                {question.views !== undefined && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {question.views} vues
                    </span>
                    {question.likes !== undefined && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {question.likes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Vous n'avez pas encore posé de question</p>
            </div>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-4 text-left flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{faq.question}</p>
                    <span className="text-xs text-gray-500 mt-1">
                      {categories.find(c => c.id === faq.category)?.label}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`} />
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 mb-3">{faq.answer}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {faq.views} vues
                        </span>
                      </div>
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        Utile ({faq.helpful})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
