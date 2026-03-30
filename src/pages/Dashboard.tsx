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
      alert('Failed to add customer');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">CRM Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Your Customers</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Customer
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new customer.</p>
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
                      {customer.status}
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
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCustomer}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add New Customer
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                      <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                      <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                      <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="Lead">Lead</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save Customer
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
