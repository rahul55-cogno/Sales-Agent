import { Customer, Communication } from '../types/Customer';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    company: 'TechCorp Solutions',
    status: 'prospect',
    lastContact: '2024-01-15',
    notes: 'Interested in enterprise package. Follow up next week.',
    value: 25000,
    source: 'Website'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@innovate.io',
    phone: '+1-555-0456',
    company: 'Innovate Labs',
    status: 'customer',
    lastContact: '2024-01-10',
    notes: 'Active customer, potential for upsell.',
    value: 50000,
    source: 'Referral'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.r@startup.co',
    phone: '+1-555-0789',
    company: 'Startup Co',
    status: 'lead',
    lastContact: '2024-01-12',
    notes: 'Downloaded whitepaper, needs nurturing.',
    value: 15000,
    source: 'LinkedIn'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@enterprise.com',
    phone: '+1-555-0321',
    company: 'Enterprise Inc',
    status: 'prospect',
    lastContact: '2024-01-08',
    notes: 'Budget approved, waiting for final decision.',
    value: 75000,
    source: 'Cold Call'
  }
];

export const mockCommunications: Communication[] = [
  {
    id: '1',
    customerId: '1',
    type: 'email',
    subject: 'Follow-up on Enterprise Package',
    content: 'Thank you for your interest in our enterprise solution...',
    timestamp: '2024-01-15T10:30:00Z',
    direction: 'outbound'
  },
  {
    id: '2',
    customerId: '2',
    type: 'call',
    subject: 'Monthly Check-in',
    content: 'Discussed current usage and potential expansion opportunities.',
    timestamp: '2024-01-10T14:15:00Z',
    direction: 'outbound'
  },
  {
    id: '3',
    customerId: '3',
    type: 'note',
    subject: 'Whitepaper Download',
    content: 'Downloaded "ROI Guide" - potential lead for nurturing sequence.',
    timestamp: '2024-01-12T09:45:00Z',
    direction: 'inbound'
  }
];