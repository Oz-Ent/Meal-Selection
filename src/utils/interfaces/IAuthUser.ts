export interface IAuthUser {
  user: {
    id: number;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
  };
  availability: {
    startDate: string;
    endDate: string;
  };
}
