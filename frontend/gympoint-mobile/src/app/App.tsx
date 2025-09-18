import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '../presentation/navigation/RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { useAuthStore } from '../features/auth/state/auth.store';
import { DI } from '../config/di';


const qc = new QueryClient();


export default function App() {
const setUser = useAuthStore(s => s.setUser);


useEffect(() => {
(async () => {
const access = await SecureStore.getItemAsync('accessToken');
const refresh = await SecureStore.getItemAsync('refreshToken');
if (access && refresh) {
try { const user = await DI.getMe.execute(); setUser(user); }
catch { setUser(null); }
}
})();
}, []);


return (
<QueryClientProvider client={qc}>
<RootNavigator />
</QueryClientProvider>
);
}