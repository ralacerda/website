export interface PullRequest {
  repo: string;
  title: string;
  url: string;
  created_at: string;
  state: "merged" | "draft" | "open" | "closed";
  number: number;
  type: "User" | "Organization";
}
