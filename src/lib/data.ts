import recruiterAvatar from "@/assets/avatars/recruiter.jpg";
import sarahAvatar from "@/assets/avatars/sarah.jpg";
import marcusAvatar from "@/assets/avatars/marcus.jpg";
import davidAvatar from "@/assets/avatars/david.jpg";
import priyaAvatar from "@/assets/avatars/priya.jpg";
import elenaAvatar from "@/assets/avatars/elena.jpg";
import jamesAvatar from "@/assets/avatars/james.jpg";

export const currentUser = {
  name: "Ava Mitchell",
  email: "ava.mitchell@hiresense.ai",
  role: "Senior Recruiter",
  avatar: recruiterAvatar,
};

export type CandidateStatus = "Shortlisted" | "In Review" | "On Hold";

export interface Candidate {
  rank: number;
  name: string;
  role: string;
  skills: string[];
  score: number;
  status: CandidateStatus;
  avatar: string;
  applied: string;
}

export const candidates: Candidate[] = [
  {
    rank: 1,
    name: "Sarah Chen",
    role: "Senior UI Engineer",
    skills: ["React", "TypeScript", "Design Systems"],
    score: 94,
    status: "Shortlisted",
    avatar: sarahAvatar,
    applied: "2 days ago",
  },
  {
    rank: 2,
    name: "Marcus Thorne",
    role: "Product Designer",
    skills: ["Figma", "Prototyping", "UX Research"],
    score: 88,
    status: "Shortlisted",
    avatar: marcusAvatar,
    applied: "3 days ago",
  },
  {
    rank: 3,
    name: "David Okafor",
    role: "Backend Engineer",
    skills: ["Node.js", "PostgreSQL", "AWS"],
    score: 82,
    status: "In Review",
    avatar: davidAvatar,
    applied: "4 days ago",
  },
  {
    rank: 4,
    name: "Priya Sharma",
    role: "Data Scientist",
    skills: ["Python", "ML", "SQL"],
    score: 79,
    status: "In Review",
    avatar: priyaAvatar,
    applied: "5 days ago",
  },
  {
    rank: 5,
    name: "Elena Rossi",
    role: "Frontend Lead",
    skills: ["Vue", "Leadership", "Accessibility"],
    score: 76,
    status: "On Hold",
    avatar: elenaAvatar,
    applied: "1 week ago",
  },
  {
    rank: 6,
    name: "James Walker",
    role: "DevOps Engineer",
    skills: ["Kubernetes", "Terraform", "CI/CD"],
    score: 68,
    status: "On Hold",
    avatar: jamesAvatar,
    applied: "1 week ago",
  },
];

export const topCandidates = candidates.slice(0, 3);

export type JobStatus = "Active" | "Paused" | "Draft";

export interface JobDescription {
  id: number;
  title: string;
  department: string;
  location: string;
  candidates: number;
  status: JobStatus;
  posted: string;
}

export const jobDescriptions: JobDescription[] = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    candidates: 48,
    status: "Active",
    posted: "Jul 28, 2026",
  },
  {
    id: 2,
    title: "Backend Engineer (Platform)",
    department: "Engineering",
    location: "New York, NY",
    candidates: 52,
    status: "Active",
    posted: "Jul 24, 2026",
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    candidates: 36,
    status: "Active",
    posted: "Jul 21, 2026",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Austin, TX",
    candidates: 31,
    status: "Active",
    posted: "Jul 18, 2026",
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Data",
    location: "San Francisco, CA",
    candidates: 24,
    status: "Paused",
    posted: "Jul 10, 2026",
  },
];

export const candidatesPerRole = [
  { role: "Backend", count: 52 },
  { role: "Frontend", count: 48 },
  { role: "Design", count: 36 },
  { role: "DevOps", count: 31 },
  { role: "Data", count: 24 },
];

export const scoreDistribution = [
  { band: "90–100", count: 12 },
  { band: "80–89", count: 34 },
  { band: "70–79", count: 58 },
  { band: "60–69", count: 31 },
  { band: "Below 60", count: 21 },
];

export const pipelineBreakdown = [
  { label: "Shortlisted", value: 156 },
  { label: "In Review", value: 402 },
  { label: "Not a fit", value: 726 },
];

export function scoreTone(score: number): "success" | "warning" | "muted" {
  if (score >= 85) return "success";
  if (score >= 70) return "warning";
  return "muted";
}
