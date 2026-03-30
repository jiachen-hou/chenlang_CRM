import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, MessageSquare, PhoneCall, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
}

interface Journey {
  id: string;
  visit_date: string;
  type: string;
  notes: string;
  next_steps: string;
  created_at: string;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [visitDate, setVisitDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState('Meeting');
  const [notes, setNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch journeys
      const { data: journeysData, error: journeysError } = await supabase
        .from('journeys')
        .select('*')
        .eq('customer_id', id)
        .order('visit_date', { ascending: false });
        
      if (journeysError) throw journeysError;
      setJourneys(journeysData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('journeys').insert([
        {
          customer_id: id,
          user_id: user?.id,
          visit_date: visitDate,
          type,
          notes,
          next_steps: nextSteps
        }
      ]);
      
      if (error) throw error;
      
      setShowModal(false);
      setVisitDate(format(new Date(), 'yyyy-MM-dd'));
      setType('Meeting');
      setNotes('');
      setNextSteps('');
      fetchCustomerData();
    } catch (error) {
      console.error('Error adding journey:', error);
      alert('添加旅程记录失败');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('您确定要删除此客户吗？这也会删除所有相关的旅程记录。')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('删除客户失败');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Meeting': return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'Call': return <PhoneCall className="h-5 w-5 text-green-500" />;
      case 'Email': return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      default: return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return '活跃';
      case 'Inactive': return '未活跃';
      case 'Lead': return '潜在';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Meeting': return '会议';
      case 'Call': return '电话';
      case 'Email': return '邮件';
      case 'Other': return '其他';
      default: return type;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  if (!customer) return <div className="min-h-screen flex items-center justify-center">未找到客户</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                返回
              </Link>
              <span className="text-xl font-semibold text-gray-900 truncate">{customer.name}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleDeleteCustomer}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">客户详情</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">公司</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.company || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">电话</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">状态</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(customer.status)}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Journeys Timeline */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">客户旅程</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  记录拜访
                </button>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {journeys.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    暂无拜访记录。记录您的第一次拜访吧！
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {journeys.map((journey, journeyIdx) => (
                        <li key={journey.id}>
                          <div className="relative pb-8">
                            {journeyIdx !== journeys.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                  {getIconForType(journey.type)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{getTypeText(journey.type)}</span>
                                  </p>
                                  {journey.notes && (
                                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                      {journey.notes}
                                    </p>
                                  )}
                                  {journey.next_steps && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <span className="font-medium text-indigo-600 text-xs uppercase tracking-wider">下一步计划：</span>
                                      <p className="mt-1">{journey.next_steps}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={journey.visit_date}>{format(parseISO(journey.visit_date), 'yyyy年MM月dd日')}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Journey Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleAddJourney} className="flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">记录拜访 / 旅程</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">关闭</span>
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">日期 *</label>
                  <input type="date" id="visitDate" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">互动类型</label>
                  <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="Meeting">会议</option>
                    <option value="Call">电话</option>
                    <option value="Email">邮件</option>
                    <option value="Other">其他</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">备注</label>
                  <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="讨论了什么内容？"></textarea>
                </div>
                <div>
                  <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700">下一步计划</label>
                  <input type="text" id="nextSteps" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="待办事项..." />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
