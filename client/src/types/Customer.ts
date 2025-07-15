export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  lastContact: string;
  notes: string;
  value: number;
  source: string;
}

export interface Communication {
  id: string;
  customerId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  data?: any;
}