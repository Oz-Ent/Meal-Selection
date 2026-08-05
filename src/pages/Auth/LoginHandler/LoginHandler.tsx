import type { AxiosError } from "axios";
import { useLoginMutation } from "../../../api/useApiQueries";
import { useAuth } from "../useAuth/useAuth";

export const useLoginHandler = () => {
    const { login } = useAuth();
    const loginMutation = useLoginMutation();

    const handleLogin = async (email: string, password: string, isPersistent: boolean = true) => {
        try {
            const response = await loginMutation.mutateAsync({ email, password });
            const { accessToken, refreshToken, user, availability } = response;
            login({user, availability }, accessToken, refreshToken, isPersistent);
            return response;
        }
        catch (error) {
            const axiosError = error as AxiosError<{errorCode?: string, errorMessage?: string}>;
            const responseData = axiosError.response?.data;
            const errorMessage = responseData?.errorMessage || "An error occurred during login.";
            const errorCode = responseData?.errorCode || "UNKNOWN_ERROR";
            if (errorCode === 'USER_INACTIVE') {
        throw new Error('UNAUTHORIZED');
      }

            throw new Error(`Error Code: ${errorCode}, Message: ${errorMessage}`);
        }
    }
    return handleLogin;
}

