import { Customer, Communication, ChatMessage } from '../types/Customer';
import { mockCustomers, mockCommunications } from '../data/mockData';

export class SalesBot {
  private customers: Customer[] = [...mockCustomers];
  private communications: Communication[] = [...mockCommunications];

  async processQuery(query: string): Promise<ChatMessage> {
    const lowerQuery = query.toLowerCase();
    
    // Customer search queries
    if (lowerQuery.includes('find customer') || lowerQuery.includes('search customer')) {
      return this.searchCustomers(query);
    }
    
    // Customer info queries
    if (lowerQuery.includes('customer info') || lowerQuery.includes('tell me about')) {
      return this.getCustomerInfo(query);
    }
    
    // Communication queries
    if (lowerQuery.includes('communications') || lowerQuery.includes('contact history')) {
      return this.getCommunicationHistory(query);
    }
    
    // Update customer
    if (lowerQuery.includes('update customer') || lowerQuery.includes('add note')) {
      return this.updateCustomer(query);
    }
    
    // Add communication
    if (lowerQuery.includes('add communication') || lowerQuery.includes('log communication')) {
      return this.addCommunication(query);
    }
    
    // Sales stats
    if (lowerQuery.includes('sales stats') || lowerQuery.includes('statistics') || lowerQuery.includes('overview')) {
      return this.getSalesStats();
    }
    
    // List customers
    if (lowerQuery.includes('list customers') || lowerQuery.includes('show customers')) {
      return this.listCustomers(query);
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `I can help you with:
• Find customers: "Find customer [name/company]"
• Get customer info: "Tell me about [customer name]"
• View communications: "Show communications for [customer]"
• Update customer: "Update customer [name] with note: [note]"
• Add communication: "Add communication for [customer]: [details]"
• Sales overview: "Show sales stats"
• List customers: "List all customers"

What would you like to do?`,
      timestamp: new Date().toISOString()
    };
  }

  private searchCustomers(query: string): ChatMessage {
    const searchTerm = query.toLowerCase();
    const results = this.customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.company.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'No customers found matching your search criteria.',
        timestamp: new Date().toISOString()
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Found ${results.length} customer(s):`,
      timestamp: new Date().toISOString(),
      data: results
    };
  }

  private getCustomerInfo(query: string): ChatMessage {
    const customer = this.extractCustomerFromQuery(query);
    
    if (!customer) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Customer not found. Please check the name and try again.',
        timestamp: new Date().toISOString()
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Here's the information for ${customer.name}:`,
      timestamp: new Date().toISOString(),
      data: customer
    };
  }

  private getCommunicationHistory(query: string): ChatMessage {
    const customer = this.extractCustomerFromQuery(query);
    
    if (!customer) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Customer not found. Please specify a valid customer name.',
        timestamp: new Date().toISOString()
      };
    }

    const communications = this.communications.filter(comm => comm.customerId === customer.id);
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Communication history for ${customer.name} (${communications.length} records):`,
      timestamp: new Date().toISOString(),
      data: communications
    };
  }

  private updateCustomer(query: string): ChatMessage {
    const customer = this.extractCustomerFromQuery(query);
    
    if (!customer) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Customer not found. Please specify a valid customer name.',
        timestamp: new Date().toISOString()
      };
    }

    // Extract note from query (simplified)
    const noteMatch = query.match(/note[:\s]+(.+)/i);
    if (noteMatch) {
      customer.notes = noteMatch[1];
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `Updated notes for ${customer.name}. New note: "${customer.notes}"`,
        timestamp: new Date().toISOString(),
        data: customer
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Please specify what you want to update. Example: "Update customer John with note: Follow up next week"',
      timestamp: new Date().toISOString()
    };
  }

  private addCommunication(query: string): ChatMessage {
    const customer = this.extractCustomerFromQuery(query);
    
    if (!customer) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Customer not found. Please specify a valid customer name.',
        timestamp: new Date().toISOString()
      };
    }

    const newCommunication: Communication = {
      id: Date.now().toString(),
      customerId: customer.id,
      type: 'note',
      subject: 'Added via Sales Bot',
      content: query,
      timestamp: new Date().toISOString(),
      direction: 'outbound'
    };

    this.communications.push(newCommunication);

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Added communication for ${customer.name}`,
      timestamp: new Date().toISOString(),
      data: newCommunication
    };
  }

  private getSalesStats(): ChatMessage {
    const stats = {
      totalCustomers: this.customers.length,
      leads: this.customers.filter(c => c.status === 'lead').length,
      prospects: this.customers.filter(c => c.status === 'prospect').length,
      customers: this.customers.filter(c => c.status === 'customer').length,
      churned: this.customers.filter(c => c.status === 'churned').length,
      totalValue: this.customers.reduce((sum, c) => sum + c.value, 0),
      avgValue: this.customers.reduce((sum, c) => sum + c.value, 0) / this.customers.length,
      totalCommunications: this.communications.length
    };

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Here are your current sales statistics:',
      timestamp: new Date().toISOString(),
      data: stats
    };
  }

  private listCustomers(query: string): ChatMessage {
    const statusMatch = query.match(/status[:\s]+(\w+)/i);
    let filteredCustomers = this.customers;

    if (statusMatch) {
      const status = statusMatch[1].toLowerCase();
      filteredCustomers = this.customers.filter(c => c.status === status);
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `${filteredCustomers.length} customer(s) found:`,
      timestamp: new Date().toISOString(),
      data: filteredCustomers
    };
  }

  private extractCustomerFromQuery(query: string): Customer | null {
    const lowerQuery = query.toLowerCase();
    
    // Try to find customer by name or company
    for (const customer of this.customers) {
      if (lowerQuery.includes(customer.name.toLowerCase()) || 
          lowerQuery.includes(customer.company.toLowerCase())) {
        return customer;
      }
    }
    
    return null;
  }

  getCustomers(): Customer[] {
    return this.customers;
  }
}