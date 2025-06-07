import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { 
  validateEmail, 
  validatePassword, 
  validateCPF, 
  validateRequired 
} from '../utils/validation';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!validateRequired(formData.address)) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#64748b" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para receber alertas de enchente em sua região
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome completo"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="CPF"
            type="cpf"
            value={formData.cpf}
            onChangeText={(text) => setFormData({ ...formData, cpf: text })}
            error={errors.cpf}
          />

          <Input
            label="Telefone"
            type="phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            error={errors.phone}
            autoComplete="tel"
          />

          <Input
            label="Endereço"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            error={errors.address}
            autoComplete="street-address"
          />

          <Input
            label="Senha"
            type="password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            error={errors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar senha"
            type="password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  registerButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
  },
  footerLink: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
});