import { useLoginMutation } from "../../../api/useApiQueries";
import { useAuth } from "../useAuth/useAuth";

export const useLoginHandler = () => {
    const { login } = useAuth();
    const loginMutation = useLoginMutation();

    const handleLogin = async (email: string, password: string, isPersistent: boolean = true) => {
            const response = await loginMutation.mutateAsync({ email, password, keepSignedIn: isPersistent });
            const { accessToken, user, availability } = response;
            login({ user, availability }, accessToken, undefined, isPersistent);
            return response;
    }
    return handleLogin;
}

