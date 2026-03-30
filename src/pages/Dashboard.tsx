import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Users, Building, Phone, Mail, LogOut } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('customers').insert([
        {
          user_id: user?.id,
          name,
          company,
          email,
          phone,
          status
        }
      ]);
      
      if (error) throw error;
      
      setShowModal(false);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setStatus('Active');
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('添加客户失败');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return '活跃';
      case 'Inactive': return '未活跃';
      case 'Lead': return '潜在';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">CRM 控制台</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-6">
          <img 
            src="https://picsum.photos/seed/crm-banner/1200/300" 
            alt="CRM Banner" 
            className="w-full h-48 object-cover rounded-2xl shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="px-4 py-4 sm:px-0 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">您的客户</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            添加客户
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">正在加载客户...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无客户</h3>
            <p className="mt-1 text-sm text-gray-500">点击“添加客户”开始创建您的第一个客户。</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                to={`/customer/${customer.id}`}
                className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 block"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                      {customer.name}
                    </h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(customer.status)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 flex flex-col space-y-2">
                    {customer.company && (
                      <div className="flex items-center">
                        <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="truncate">{customer.company}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleAddCustomer} className="flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">添加新客户</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">关闭</span>
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名 *</label>
                  <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">公司</label>
                  <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">邮箱</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">电话</label>
                  <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">状态</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="Lead">潜在</option>
                    <option value="Active">活跃</option>
                    <option value="Inactive">未活跃</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  保存客户
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
