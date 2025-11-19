'use client'

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  MessageSquare,
  Upload,
  Calendar
} from "lucide-react";
import { withAuth } from '@/lib/auth-client'

const mockStats = {
  totalSubmissions: 8,
  inReview: 3,
  accepted: 2,
  rejected: 1,
  published: 2,
  drafts: 2
};

const mockMySubmissions = [
  {
    id: "1",
    title: "Pemanfaatan Machine Learning untuk Prediksi Cuaca di Daerah Tropis",
    journal: "Journal of Computer Science",
    stage: "review",
    status: "in-review",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    daysInStage: 15,
    hasUnreadComments: true
  },
  {
    id: "2",
    title: "Analisis Sentimen Terhadap Kebijakan Pemerintah Menggunakan Deep Learning",
    journal: "Journal of Artificial Intelligence",
    stage: "copyediting",
    status: "accepted",
    submittedDate: "2024-01-10",
    lastUpdated: "2024-01-18",
    daysInStage: 8,
    hasUnreadComments: false
  },
  {
    id: "3",
    title: "Perancangan Sistem Informasi Manajemen Perpustakaan Berbasis Web",
    journal: "Journal of Information Systems",
    stage: "production",
    status: "published",
    submittedDate: "2023-12-05",
    lastUpdated: "2024-01-22",
    daysInStage: 0,
    hasUnreadComments: false
  }
];

const mockDrafts = [
  {
    id: "draft1",
    title: "Implementasi Blockchain untuk Keamanan Data Kesehatan",
    journal: "Journal of Cybersecurity",
    createdDate: "2024-01-20",
    lastModified: "2024-01-22",
    sectionsCompleted: 4,
    totalSections: 7
  },
  {
    id: "draft2",
    title: "Optimasi Algoritma Genetika untuk Permasalahan Routing",
    journal: "Journal of Computer Science",
    createdDate: "2024-01-18",
    lastModified: "2024-01-19",
    sectionsCompleted: 2,
    totalSections: 6
  }
];

const mockRecentActivity = [
  {
    id: "1",
    type: "review_comment",
    title: "New review comment received",
    description: "Dr. Smith has provided feedback on your submission",
    date: "2024-01-22T10:30:00Z",
    submissionId: "1"
  },
  {
    id: "2",
    type: "status_change",
    title: "Submission status updated",
    description: "Your submission has moved to copyediting stage",
    date: "2024-01-18T14:20:00Z",
    submissionId: "2"
  },
  {
    id: "3",
    type: "submission_accepted",
    title: "Submission accepted",
    description: "Your paper has been accepted for publication",
    date: "2024-01-15T09:15:00Z",
    submissionId: "3"
  }
];

function AuthorDashboardPage() {
  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'submission':
        return 'secondary';
      case 'review':
        return 'warning';
      case 'copyediting':
        return 'info';
      case 'production':
        return 'success';
      case 'published':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'secondary';
      case 'in-review':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'published':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'status_change':
        return <AlertCircle className="h-4 w-4" />;
      case 'submission_accepted':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Author Dashboard"
        subtitle="Submit and track your manuscripts"
        showBreadcrumbs={false}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Total Submissions
              <FileText className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockStats.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              In Review
              <Clock className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mockStats.inReview}</div>
            <p className="text-xs text-gray-500 mt-1">Currently under review</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Published
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.published}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully published</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Drafts
              <Edit className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStats.drafts}</div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  My Submissions
                </CardTitle>
                <CardDescription>
                  Track your manuscript submissions
                </CardDescription>
              </div>
              <Button className="bg-[#006798] hover:bg-[#005687]">
                <Plus className="h-4 w-4 mr-2" />
                New Submission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMySubmissions.map((submission) => (
                <div key={submission.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {submission.title}
                    </h4>
                    {submission.hasUnreadComments && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{submission.journal}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStageBadgeVariant(submission.stage)} className="text-xs">
                        {submission.stage}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(submission.status)} className="text-xs">
                        {submission.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {submission.daysInStage} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Submitted: {formatDate(submission.submittedDate)}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Comments
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Draft Submissions
                </CardTitle>
                <CardDescription>
                  Continue working on your drafts
                </CardDescription>
              </div>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDrafts.map((draft) => (
                <div key={draft.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {draft.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{draft.journal}</p>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{draft.sectionsCompleted}/{draft.totalSections} sections</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#006798] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(draft.sectionsCompleted / draft.totalSections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Modified: {formatDate(draft.lastModified)}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Upload className="h-3 w-3 mr-1" />
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates on your submissions
              </CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default withAuth(AuthorDashboardPage, 'author')