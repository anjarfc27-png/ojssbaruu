'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, HelpCircle, Mail, Phone, MessageCircle, Search, Send, User, FileText, Clock, CheckCircle } from 'lucide-react';

import { withAuth } from '@/lib/auth-client'

function AuthorHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });

  const faqs = [
    {
      question: 'How do I submit a new manuscript?',
      answer: 'To submit a new manuscript, click on "New Submission" in your dashboard. Fill out the submission form, upload your manuscript files, and complete the metadata information. Make sure to follow the journal\'s submission guidelines.'
    },
    {
      question: 'What file formats are accepted for manuscript submission?',
      answer: 'We accept manuscripts in PDF, DOC, and DOCX formats. Figures should be submitted separately in high-resolution formats such as PNG, JPG, or TIFF. Please ensure all files are properly formatted according to our guidelines.'
    },
    {
      question: 'How long does the review process take?',
      answer: 'The typical review process takes 4-8 weeks from submission to initial decision. However, this timeline may vary depending on the complexity of the manuscript and reviewer availability. You can track the status of your submission in your dashboard.'
    },
    {
      question: 'Can I track the status of my submission?',
      answer: 'Yes, you can track your submission status by going to "My Submissions" in your dashboard. The system will show the current stage of your manuscript (Submission, Review, Copyediting, or Production) and any pending actions.'
    },
    {
      question: 'What happens after my manuscript is accepted?',
      answer: 'After acceptance, your manuscript will enter the copyediting and production stages. You\'ll receive proofs to review, and your article will be scheduled for publication. You\'ll be notified at each stage of the process.'
    }
  ];

  const handleSubmitTicket = () => {
    // Here you would typically send the support ticket to your backend
    console.log('Support ticket submitted:', supportTicket);
    alert('Support ticket submitted successfully!');
    setSupportTicket({ subject: '', category: '', message: '', priority: 'normal' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Submission Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Learn how to prepare and submit your manuscript according to our guidelines.
            </p>
            <Button variant="outline" size="sm">
              View Guidelines
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Review Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Understand the peer review process and what to expect at each stage.
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
              Editorial Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Read about our editorial policies and ethical standards.
            </p>
            <Button variant="outline" size="sm">
              Read Policies
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Support Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-orange-600" />
            Contact Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={supportTicket.category}
                  onChange={(e) => setSupportTicket({...supportTicket, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a category</option>
                  <option value="submission">Submission Issues</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="review">Review Process</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={supportTicket.priority}
                  onChange={(e) => setSupportTicket({...supportTicket, priority: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={8}
                value={supportTicket.message}
                onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                placeholder="Please provide detailed information about your issue..."
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmitTicket}>
              <Send className="h-4 w-4 mr-2" />
              Submit Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Send us an email for general inquiries and support.
            </p>
            <p className="text-sm font-medium">support@journal.org</p>
            <p className="text-xs text-gray-500 mt-1">Response time: 24-48 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Chat with our support team in real-time.
            </p>
            <Button variant="outline" size="sm">
              Start Chat
            </Button>
            <p className="text-xs text-gray-500 mt-1">Available: Mon-Fri, 9AM-5PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-purple-600" />
              Phone Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Call us for urgent technical issues.
            </p>
            <p className="text-sm font-medium">+1 (555) 123-4567</p>
            <p className="text-xs text-gray-500 mt-1">Available: Mon-Fri, 9AM-6PM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(AuthorHelp, 'author')
