import React from 'react';
import { Customer } from '../types/Customer';
import { Building, Mail, Phone, Calendar, DollarSign } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
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
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <Building size={14} className="mr-1" />
            {customer.company}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={14} className="mr-2" />
          {customer.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={14} className="mr-2" />
          {customer.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={14} className="mr-2" />
          Last contact: {new Date(customer.lastContact).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={14} className="mr-2" />
          Value: ${customer.value.toLocaleString()}
        </div>
      </div>
      
      {customer.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{customer.notes}</p>
        </div>
      )}
    </div>
  );
};