// Shared knowledge base for AI Assistant
export const knowledgeBaseFAQs = [
  // General FAQs
  { id: '1', question: 'What are your office hours?', answer: '8 AM - 5 PM Monday - Friday, Saturday 9 AM - 1 PM (By appointment only), Sunday Closed', role: 'general' },
  { id: '2', question: 'Where is your office located?', answer: 'Main Office: 123 Medical Plaza Drive, Suite 200, Anytown, ST 12345', role: 'general' },
  { id: '3', question: 'How can I contact the office?', answer: 'Main Line: (555) 123-4567, Fax: (555) 123-4568, Email: info@medicalpractice.com', role: 'general' },
  { id: '4', question: 'Is parking available?', answer: 'Free parking is available in the lot behind our building. Handicapped accessible parking is available near the main entrance.', role: 'general' },
  
  // Billing FAQs
  { id: '5', question: 'What insurance do you accept?', answer: 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, United Healthcare, Cigna, Medicare, and Medicaid.', role: 'billing' },
  { id: '6', question: 'How do I verify my insurance?', answer: 'Please call our billing department at (555) 123-4567 with your insurance card information, and we\'ll verify your coverage before your appointment.', role: 'billing' },
  { id: '7', question: 'What payment methods do you accept?', answer: 'We accept cash, credit cards (Visa, MasterCard, American Express, Discover), debit cards, HSA/FSA cards, and personal checks.', role: 'billing' },
  { id: '8', question: 'Do you offer payment plans?', answer: 'Yes, we offer flexible payment plans for balances over $500. Please speak with our billing team to set up a payment arrangement.', role: 'billing' },
  
  // Scheduling FAQs
  { id: '9', question: 'How do I schedule an appointment?', answer: 'You can schedule an appointment by calling our office at (555) 123-4567, using our patient portal, or sending a secure message through the app.', role: 'scheduling' },
  { id: '10', question: 'What is your cancellation policy?', answer: 'We require at least 24 hours notice for appointment cancellations. Late cancellations or no-shows may result in a $50 fee.', role: 'scheduling' },
  { id: '11', question: 'How early should I arrive?', answer: 'Please arrive 15 minutes before your scheduled appointment time to complete any necessary paperwork.', role: 'scheduling' },
  { id: '12', question: 'What should I bring to my appointment?', answer: 'Please bring: Photo ID, Insurance card(s), List of current medications, Any relevant medical records from other providers.', role: 'scheduling' },
  
  // Clinical FAQs
  { id: '13', question: 'How do I request a prescription refill?', answer: 'You can request prescription refills through the patient portal, by calling our office, or asking your pharmacy to contact us directly.', role: 'clinical' },
  { id: '14', question: 'What should I do if I have a medical emergency?', answer: 'For medical emergencies, please call 911 immediately. For urgent medical needs after hours, please call our answering service at (555) 123-4567.', role: 'clinical' },
];
