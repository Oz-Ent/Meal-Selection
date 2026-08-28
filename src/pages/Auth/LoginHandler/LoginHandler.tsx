import { useLoginMutation } from "../../../api/useApiQueries";
import { useAuth } from "../useAuth/useAuth";

export const useLoginHandler = () => {
    const { login } = useAuth();
    const loginMutation = useLoginMutation();

    const handleLogin = async (email: string, password: string, isPersistent: boolean = true) => {
            const response = await loginMutation.mutateAsync({ email, password });
            const { accessToken, refreshToken, user, availability } = response;
            login({user, availability }, accessToken, refreshToken, isPersistent);
            return response;
    }
    return handleLogin;
}

