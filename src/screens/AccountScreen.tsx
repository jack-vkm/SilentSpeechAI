import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AccountScreen({ navigation }: any) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    Alert.alert('Account service unavailable', 'Sign in and registration are not connected to an authentication service yet. You can continue as a guest.');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.logo}><Text style={styles.logoText}>〰</Text></View>
        <Text style={styles.title}>{register ? 'Create an account' : 'Welcome back'}</Text>
        <Text style={styles.subtitle}>Sign in is optional. You can use SilentVoice as a guest.</Text>
        <View style={styles.toggle}>
          <TouchableOpacity style={[styles.toggleItem, !register && styles.toggleActive]} onPress={() => setRegister(false)}><Text style={[styles.toggleText, !register && styles.toggleTextActive]}>Login</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.toggleItem, register && styles.toggleActive]} onPress={() => setRegister(true)}><Text style={[styles.toggleText, register && styles.toggleTextActive]}>Sign up</Text></TouchableOpacity>
        </View>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" secureTextEntry style={styles.input} />
        {!register && <TouchableOpacity onPress={() => Alert.alert('Password reset unavailable', 'Connect an authentication provider to enable password recovery.')}><Text style={styles.forgot}>Forgot password?</Text></TouchableOpacity>}
        <TouchableOpacity accessibilityRole="button" onPress={submit} style={styles.primary}><Text style={styles.primaryText}>{register ? 'Create account' : 'Login'}</Text></TouchableOpacity>
        <View style={styles.separator}><View style={styles.rule} /><Text style={styles.or}>OR</Text><View style={styles.rule} /></View>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.replace('Home')} style={styles.guest}><Text style={styles.guestText}>Continue as guest</Text></TouchableOpacity>
        <Text style={styles.disclaimer}>Account features are not available until an authentication service is configured.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc', justifyContent: 'center' },
  content: { padding: 22, width: '100%', maxWidth: 480, alignSelf: 'center' },
  logo: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#6847ee', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 13 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { textAlign: 'center', color: '#292a3d', fontWeight: '800', fontSize: 24 },
  subtitle: { textAlign: 'center', color: '#828394', fontSize: 12, marginTop: 7, marginBottom: 22 },
  toggle: { flexDirection: 'row', backgroundColor: '#eeedf4', borderRadius: 12, padding: 4, marginBottom: 17 },
  toggleItem: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 9 },
  toggleActive: { backgroundColor: '#fff' },
  toggleText: { color: '#838394', fontWeight: '600' },
  toggleTextActive: { color: '#6847ee' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e4ed', padding: 14, borderRadius: 12, marginBottom: 11, color: '#292a3d' },
  forgot: { alignSelf: 'flex-end', color: '#6847ee', fontSize: 12, fontWeight: '600', marginBottom: 13 },
  primary: { backgroundColor: '#6847ee', borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 19 },
  rule: { flex: 1, height: 1, backgroundColor: '#e4e2ec' },
  or: { color: '#9291a1', fontSize: 10, fontWeight: '700' },
  guest: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#e5e3ec', borderWidth: 1, padding: 13, borderRadius: 12 },
  guestText: { color: '#45465a', fontWeight: '700' },
  disclaimer: { textAlign: 'center', color: '#9291a1', fontSize: 10, lineHeight: 15, marginTop: 14 },
});
