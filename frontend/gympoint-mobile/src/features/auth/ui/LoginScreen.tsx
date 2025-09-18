import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { DI } from '../../../config/di';
import { useAuthStore } from '../state/auth.store';


export default function LoginScreen() {
const setUser = useAuthStore(s => s.setUser);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [err, setErr] = useState<string|null>(null);
const [loading, setLoading] = useState(false);


const onLogin = async () => {
setLoading(true); setErr(null);
try {
const { user } = await DI.loginUser.execute({ email, password });
setUser(user);
} catch (e: any) {
setErr(e?.response?.data?.message ?? 'Error de autenticación');
} finally { setLoading(false); }
};


return (
<View style={{ gap: 12, padding: 16 }}>
<Text style={{ fontSize: 24, fontWeight: '700' }}>Iniciar sesión</Text>
<TextInput placeholder="Email" value={email} onChangeText={setEmail}
autoCapitalize="none" keyboardType="email-address"
style={{ borderWidth:1, borderRadius:8, padding:10 }} />
<TextInput placeholder="Password" value={password} onChangeText={setPassword}
secureTextEntry style={{ borderWidth:1, borderRadius:8, padding:10 }} />
{err && <Text style={{ color: 'red' }}>{err}</Text>}
<Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={onLogin} disabled={loading}/>
</View>
);
}