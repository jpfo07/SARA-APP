import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WelcomeScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.title}>SARA</Text>
          <Text style={styles.subtitle}>Sistema Autônomo de Resposta a Alagamentos</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao SARA</Text>
          <Text style={styles.welcomeText}>
            Seu sistema de segurança para enchentes e alagamentos. 
            Monitore riscos, receba alertas e mantenha-se seguro.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem 
            icon="🌊" 
            text="Monitoramento em tempo real" 
          />
          <FeatureItem 
            icon="🚨" 
            text="Alertas de emergência" 
          />
          <FeatureItem 
            icon="👥" 
            text="Check-in de segurança" 
          />
          <FeatureItem 
            icon="🗺️" 
            text="Rotas de evacuação" 
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Entrar"
          onPress={() => router.push('/login')}
          style={styles.button}
        />
        <Button
          title="Criar Conta"
          onPress={() => router.push('/register')}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});