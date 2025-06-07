import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { checkinAPI } from '../../services/api';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock, MapPin, MessageSquare } from 'lucide-react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CheckinScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadCheckinHistory();
  }, []);

  const loadCheckinHistory = async () => {
    if (!user) return;
    
    try {
      const checkins = await checkinAPI.getCheckins(user.id);
      setRecentCheckins(checkins.slice(0, 5)); // Show last 5 checkins
    } catch (error) {
      console.error('Error loading checkin history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCheckin = async (status: 'safe' | 'help_needed') => {
    if (!user) return;

    setIsLoading(true);
    try {
      const checkinData = {
        userId: user.id,
        status,
        message: message.trim() || undefined,
        location: user.address, // In a real app, you'd get current location
      };

      await checkinAPI.createCheckin(checkinData);
      
      Alert.alert(
        'Check-in realizado!',
        status === 'safe' 
          ? 'Seus contatos foram notificados que você está seguro.'
          : 'Seus contatos foram notificados que você precisa de ajuda. Em caso de emergência, ligue para os serviços de resgate.',
        [{ text: 'OK' }]
      );

      setMessage('');
      loadCheckinHistory(); // Refresh history
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao realizar check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'safe' ? '#16A34A' : '#DC2626';
  };

  const getStatusText = (status: string) => {
    return status === 'safe' ? 'Estou bem' : 'Preciso de ajuda';
  };

  const getStatusIcon = (status: string) => {
    return status === 'safe' ? CheckCircle : AlertTriangle;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Check-in de Segurança</Text>
        <Text style={styles.subtitle}>
          Informe sua condição atual para seus contatos de emergência
        </Text>
      </View>

      {/* Current Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Como você está?</Text>
        <Text style={styles.statusSubtitle}>
          Seus contatos de emergência receberão uma notificação com sua localização atual
        </Text>

        {/* Message Input */}
        <View style={styles.messageSection}>
          <Text style={styles.messageLabel}>Mensagem opcional</Text>
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder="Adicione detalhes sobre sua situação..."
            multiline
            style={styles.messageInput}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Estou bem"
            variant="success"
            onPress={() => handleCheckin('safe')}
            loading={isLoading}
            style={styles.actionButton}
          />
          
          <Button
            title="Preciso de ajuda"
            variant="danger"
            onPress={() => handleCheckin('help_needed')}
            loading={isLoading}
            style={styles.actionButton}
          />
        </View>

        {/* Emergency Info */}
        <View style={styles.emergencyInfo}>
          <AlertTriangle size={16} color="#DC2626" />
          <Text style={styles.emergencyText}>
            Em situação de emergência extrema, ligue imediatamente: 193 (Bombeiros), 192 (SAMU), 199 (Defesa Civil)
          </Text>
        </View>
      </View>

      {/* Check-in History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Histórico de Check-ins</Text>
        
        {loadingHistory ? (
          <LoadingSpinner text="Carregando histórico..." />
        ) : recentCheckins.length > 0 ? (
          <View style={styles.historyList}>
            {recentCheckins.map((checkin) => {
              const StatusIcon = getStatusIcon(checkin.status);
              return (
                <View key={checkin.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <StatusIcon size={20} color={getStatusColor(checkin.status)} />
                  </View>
                  
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>
                      {getStatusText(checkin.status)}
                    </Text>
                    
                    {checkin.message && (
                      <View style={styles.historyMessage}>
                        <MessageSquare size={14} color="#64748b" />
                        <Text style={styles.historyMessageText}>{checkin.message}</Text>
                      </View>
                    )}
                    
                    <View style={styles.historyMeta}>
                      <View style={styles.historyMetaItem}>
                        <MapPin size={12} color="#64748b" />
                        <Text style={styles.historyMetaText}>{checkin.location}</Text>
                      </View>
                      
                      <View style={styles.historyMetaItem}>
                        <Clock size={12} color="#64748b" />
                        <Text style={styles.historyMetaText}>
                          {new Date(checkin.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(checkin.createdAt).toLocaleTimeString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noHistory}>
            <CheckCircle size={48} color="#d1d5db" />
            <Text style={styles.noHistoryText}>Nenhum check-in realizado ainda</Text>
            <Text style={styles.noHistorySubtext}>
              Faça seu primeiro check-in para manter seus contatos informados
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
  },
  messageSection: {
    marginBottom: 24,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    gap: 8,
  },
  emergencyText: {
    flex: 1,
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  historySection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  historyMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  historyMeta: {
    gap: 4,
  },
  historyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 12,
    color: '#64748b',
  },
  noHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  noHistoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  noHistorySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 240,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    margin: 24,
  },
});