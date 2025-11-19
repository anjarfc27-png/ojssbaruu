'use client'

import { useState } from 'react';
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  University,
  Globe,
  Save,
  Send,
  Plus,
  Trash2,
  Eye
} from "lucide-react";

import { withAuth } from '@/lib/auth-client'

function NewSubmissionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    journal: '',
    section: '',
    language: 'en',
    authors: [
      {
        givenName: '',
        familyName: '',
        email: '',
        affiliation: '',
        country: '',
        orcid: '',
        isCorresponding: true
      }
    ],
    files: [] as File[]
  });

  const totalSteps = 5;

  const steps = [
    { id: 1, name: 'Start', description: 'Select journal and section' },
    { id: 2, name: 'Upload Submission', description: 'Upload your manuscript files' },
    { id: 3, name: 'Enter Metadata', description: 'Add authors and details' },
    { id: 4, name: 'Upload Supplementary Files', description: 'Additional files (optional)' },
    { id: 5, name: 'Confirmation', description: 'Review and submit' }
  ];

  const journals = [
    { id: '1', name: 'Journal of Computer Science', path: 'jcs' },
    { id: '2', name: 'Journal of Artificial Intelligence', path: 'jai' },
    { id: '3', name: 'Journal of Information Systems', path: 'jis' }
  ];

  const sections = [
    { id: 'articles', name: 'Articles' },
    { id: 'reviews', name: 'Review Articles' },
    { id: 'short-communications', name: 'Short Communications' },
    { id: 'case-studies', name: 'Case Studies' }
  ];

  const countries = [
    { code: 'ID', name: 'Indonesia' },
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthorChange = (index: number, field: string, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData(prev => ({ ...prev, authors: newAuthors }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, {
        givenName: '',
        familyName: '',
        email: '',
        affiliation: '',
        country: '',
        orcid: '',
        isCorresponding: false
      }]
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, authors: newAuthors }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, files: newFiles }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Step 1: Start</CardTitle>
              <CardDescription>
                Select the journal and section for your submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="journal">Journal *</Label>
                <Select value={formData.journal} onValueChange={(value) => handleInputChange('journal', value)}>
                  <SelectTrigger id="journal">
                    <SelectValue placeholder="Select a journal" />
                  </SelectTrigger>
                  <SelectContent>
                    {journals.map((journal) => (
                      <SelectItem key={journal.id} value={journal.id}>
                        {journal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Step 2: Upload Submission</CardTitle>
              <CardDescription>
                Upload your manuscript file(s). Accepted formats: PDF, DOC, DOCX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Step 3: Enter Metadata</CardTitle>
                <CardDescription>
                  Provide information about your submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter the title of your manuscript"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => handleInputChange('abstract', e.target.value)}
                    placeholder="Enter your abstract here..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Authors</CardTitle>
                    <CardDescription>
                      Add author information for your submission
                    </CardDescription>
                  </div>
                  <Button onClick={addAuthor} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Author
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.authors.map((author, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">
                        Author {index + 1}
                        {author.isCorresponding && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Corresponding
                          </Badge>
                        )}
                      </h4>
                      {formData.authors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAuthor(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Given Name *</Label>
                        <Input
                          value={author.givenName}
                          onChange={(e) => handleAuthorChange(index, 'givenName', e.target.value)}
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Family Name *</Label>
                        <Input
                          value={author.familyName}
                          onChange={(e) => handleAuthorChange(index, 'familyName', e.target.value)}
                          placeholder="Last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={author.email}
                          onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                          placeholder="author@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ORCID</Label>
                        <Input
                          value={author.orcid}
                          onChange={(e) => handleAuthorChange(index, 'orcid', e.target.value)}
                          placeholder="0000-0000-0000-0000"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Affiliation *</Label>
                        <Input
                          value={author.affiliation}
                          onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                          placeholder="University or institution"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select value={author.country} onValueChange={(value) => handleAuthorChange(index, 'country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Step 4: Upload Supplementary Files</CardTitle>
              <CardDescription>
                Upload any supplementary files (optional). This could include datasets, code, or additional materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Upload supplementary files here</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="supplementary-upload"
                />
                <Button 
                  onClick={() => document.getElementById('supplementary-upload')?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              <p className="text-sm text-gray-600">
                Supplementary files are optional and can include datasets, code, figures, or other materials that support your submission.
              </p>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Step 5: Confirmation</CardTitle>
                <CardDescription>
                  Please review your submission details before final submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Submission Checklist</h4>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        <li>• The submission has not been previously published</li>
                        <li>• The submission file is in Microsoft Word or PDF format</li>
                        <li>• All authors have been added with complete information</li>
                        <li>• The text adheres to the stylistic and bibliographic requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div><strong>Title:</strong> {formData.title || 'Not specified'}</div>
                      <div><strong>Journal:</strong> {journals.find(j => j.id === formData.journal)?.name || 'Not selected'}</div>
                      <div><strong>Section:</strong> {sections.find(s => s.id === formData.section)?.name || 'Not selected'}</div>
                      <div><strong>Language:</strong> {formData.language === 'en' ? 'English' : 'Indonesian'}</div>
                      <div><strong>Authors:</strong> {formData.authors.length} author(s)</div>
                      <div><strong>Files:</strong> {formData.files.length} file(s) uploaded</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="rounded border-gray-300" />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-[#006798] hover:underline">terms and conditions</a> and <a href="#" className="text-[#006798] hover:underline">privacy policy</a>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="New Submission"
        subtitle="Submit your manuscript for peer review"
        showBreadcrumbs={true}
      />

      {/* Progress Steps */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id ? 'bg-green-500 text-white' :
                    currentStep === step.id ? 'bg-[#006798] text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>
        
        <div className="space-x-3">
          {currentStep < totalSteps && (
            <Button
              onClick={nextStep}
              className="bg-[#006798] hover:bg-[#005687]"
            >
              {currentStep === 4 ? 'Review' : 'Next'}
            </Button>
          )}
          {currentStep === totalSteps && (
            <Button
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Manuscript
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default withAuth(NewSubmissionPage, 'author')
