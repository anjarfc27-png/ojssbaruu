'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, HelpCircle, Mail, Phone, MessageCircle, Search, Send, User, FileText, Clock, Eye, Award } from 'lucide-react';

import { withAuth } from '@/lib/auth-client'

function ReviewerHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });

  const faqs = [
    {
      question: 'How do I access manuscripts for review?',
      answer: 'When you are assigned a manuscript for review, you will receive an email notification. Log into your reviewer dashboard and click on "Review Assignments" to see all pending reviews. Click on the manuscript title to access the full text and begin your review.'
    },
    {
      question: 'What is the typical review timeline?',
      answer: 'The standard review period is 4 weeks from the date of assignment. However, this may vary depending on the journal and manuscript complexity. You can see the due date for each assignment in your reviewer dashboard. If you need an extension, please contact the editor as soon as possible.'
    },
    {
      question: 'How do I submit my review recommendations?',
      answer: 'After reading the manuscript, click on "Start Review" or "Submit Review" button. You will be guided through a structured review form where you can provide your evaluation, comments to authors, confidential comments to editors, and your recommendation (Accept, Minor Revision, Major Revision, or Reject).'
    },
    {
      question: 'What criteria should I use for evaluation?',
      answer: 'Evaluate manuscripts based on: Originality and significance of the research, Methodological soundness, Clarity of presentation, Appropriate referencing, Relevance to the journal\'s scope, and Ethical considerations. Use the journal\'s specific review guidelines provided with each assignment.'
    },
    {
      question: 'Can I review if I have a conflict of interest?',
      answer: 'No, you should decline the review if you have any conflicts of interest, including: Recent collaboration with authors, Personal relationships, Financial interests, or Direct competition. It\'s important to maintain the integrity of the peer review process.'
    },
    {
      question: 'How do I update my expertise areas?',
      answer: 'Go to your reviewer profile and click "Edit Profile." You can update your research interests, expertise areas, and keywords. This helps editors match you with appropriate manuscripts for review. Keep your profile current to receive relevant review invitations.'
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
        <h1 className="text-2xl font-bold text-gray-900">Reviewer Help & Support</h1>
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
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Review Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Learn how to conduct thorough and constructive peer reviews.
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
              Review Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Understand review deadlines and how to request extensions.
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600" />
              Ethics & Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Review ethical guidelines and conflict of interest policies.
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
                  <option value="review_process">Review Process</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="manuscript_access">Manuscript Access</option>
                  <option value="deadline">Deadline Issues</option>
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
            <p className="text-sm font-medium">reviewersupport@journal.org</p>
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
            <p className="text-sm font-medium">+1 (555) 234-5678</p>
            <p className="text-xs text-gray-500 mt-1">Available: Mon-Fri, 9AM-6PM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ReviewerHelp, 'reviewer')
