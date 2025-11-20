'use client'

import { withAuth } from '@/lib/auth-client'
import { redirect } from "next/navigation";

function ReviewerHomePage() {
  redirect("/reviewer/dashboard");
  return null;
}

export default withAuth(ReviewerHomePage, 'reviewer')
