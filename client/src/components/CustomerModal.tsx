import React from 'react';
import { Customer, Communication } from '../types/Customer';
import { X, Mail, Phone, Building, Calendar, DollarSign } from 'lucide-react';

interface CustomerModalProps {
  customer: Customer;
  communications: Communication[];
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, communications, onClose }) => {
  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-gray-600 flex items-center mt-1">
                <Building size={16} className="mr-1" />
                {customer.company}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-600">{customer.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-600">{customer.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-600">Last contact: {new Date(customer.lastContact).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-600">Value: ${customer.value.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Source:</span>
                <span className="ml-2 text-sm text-gray-600">{customer.source}</span>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Communication History</h3>
            <div className="space-y-3">
              {communications.map(comm => (
                <div key={comm.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{comm.subject}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comm.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comm.content}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      comm.type === 'email' ? 'bg-blue-100 text-blue-800' :
                      comm.type === 'call' ? 'bg-green-100 text-green-800' :
                      comm.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comm.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      comm.direction === 'inbound' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {comm.direction}
                    </span>
                  </div>
                </div>
              ))}
              {communications.length === 0 && (
                <p className="text-sm text-gray-500 italic">No communications recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};