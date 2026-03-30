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
      alert('Failed to add journey record');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also delete all associated journey records.')) {
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
      alert('Failed to delete customer');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!customer) return <div className="min-h-screen flex items-center justify-center">Customer not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
              <span className="text-xl font-semibold text-gray-900 truncate">{customer.name}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleDeleteCustomer}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Details</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.company || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Journey</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Log Visit
                </button>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {journeys.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No visit records yet. Log your first visit!
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
                                    <span className="font-medium text-gray-900">{journey.type}</span>
                                  </p>
                                  {journey.notes && (
                                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                      {journey.notes}
                                    </p>
                                  )}
                                  {journey.next_steps && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <span className="font-medium text-indigo-600 text-xs uppercase tracking-wider">Next Steps:</span>
                                      <p className="mt-1">{journey.next_steps}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={journey.visit_date}>{format(parseISO(journey.visit_date), 'MMM d, yyyy')}</time>
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
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddJourney}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Log Visit / Journey
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">Date *</label>
                      <input type="date" id="visitDate" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">Interaction Type</label>
                      <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="Meeting">Meeting</option>
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="What was discussed?"></textarea>
                    </div>
                    <div>
                      <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700">Next Steps</label>
                      <input type="text" id="nextSteps" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="Action items..." />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save Record
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
