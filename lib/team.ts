export type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  github: string;
};

export type Contributor = {
  name: string;
  focus: string;
};

export const coreTeam: TeamMember[] = [
  {
    name: "Parth Nagar",
    role: "Founder & Product Engineer",
    image: "/icons/icon-192.png",
    linkedin: "https://www.linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Riya Sharma",
    role: "AI Systems Engineer",
    image: "/icons/icon-192.png",
    linkedin: "https://www.linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Arjun Mehta",
    role: "Blockchain Infrastructure Engineer",
    image: "/icons/icon-192.png",
    linkedin: "https://www.linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Neha Verma",
    role: "Platform Architect",
    image: "/icons/icon-192.png",
    linkedin: "https://www.linkedin.com",
    github: "https://github.com",
  },
];

export const communityContributors: Contributor[] = [
  {
    name: "Open Source Contributors",
    focus: "Supporting developer tooling and community-first platform modules.",
  },
  {
    name: "Hackathon Builders",
    focus: "Rapidly prototyping AI and web3 ideas with production-minded architecture.",
  },
  {
    name: "Community Mentors",
    focus: "Helping new engineers grow through collaboration, reviews, and technical sessions.",
  },
  {
    name: "Ecosystem Collaborators",
    focus: "Partnering across startups and teams to build scalable digital infrastructure.",
  },
];
