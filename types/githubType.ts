export type StudentItem = {
  studentId: number;
  username: string;
  fullName?: string;
  faculty?: string;
  specialty?: string;
  gitHubBranchCreated: boolean;
  isCurrentUser: boolean;
};