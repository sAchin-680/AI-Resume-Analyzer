import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resume } from "react-dom/server";
import { resumes } from "~/contants";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

  
export function meta({}: Route.MetaArgs) {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
          if(auth.isAuthenticated) navigate('/auth?next=/');
      }, [auth.isAuthenticated])

  return [
    { title: "AI-Resume" },
    { name: "description", content: "AI Powered Resume Tracking System" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
  

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications and Resume Ratings</h1>
        <h2>Review Your Submission and check AI-Powered Feedback.</h2>
      </div>
    

    {resume.length > 0 && (
    <div className="resumes-section">
      {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </div>
    )}
  </section>
  </main>;
}
