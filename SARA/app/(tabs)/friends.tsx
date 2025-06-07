import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { friendsAPI } from '../../services/api';
import { Users, UserPlus, UserMinus, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock } from 'lucide-react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function FriendsScreen() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsData = await friendsAPI.getFriends(user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFriends();
  };

  const handleAddFriend = async () => {
    if (!user || !friendEmail.trim()) return;

    setIsAddingFriend(true);
    try {
      await friendsAPI.addFriend(user.id, friendEmail.trim());
      setFriendEmail('');
      setShowAddForm(false);
      loadFriends(); // Refresh the list
      Alert.alert('Sucesso', 'Amigo adicionado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao adicionar amigo');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = (friendId: number, friendName: string) => {
    Alert.alert(
      'Remover amigo',
      `Deseja remover ${friendName} da sua lista de contatos de emergência?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removeFriend(friendId)
        }
      ]
    );
  };

  const removeFriend = async (friendId: number) => {
    if (!user) return;

    try {
      await friendsAPI.removeFriend(user.id, friendId);
      loadFriends(); // Refresh the list
      Alert.alert('Sucesso', 'Amigo removido da lista');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao remover amigo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#16A34A';
      case 'help_needed': return '#DC2626';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Seguro';
      case 'help_needed': return 'Precisa de ajuda';
      default: return 'Status desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return CheckCircle;
      case 'help_needed': return AlertTriangle;
      default: return Clock;
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: Usuário não encontrado</Text>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner text="Carregando contatos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contatos de Emergência</Text>
        <Text style={styles.subtitle}>
          Gerencie sua rede de contatos para situações de emergência
        </Text>
      </View>

      {/* Add Friend Button */}
      <View style={styles.addSection}>
        {!showAddForm ? (
          <Button
            title="Adicionar Contato"
            variant="primary"
            onPress={() => setShowAddForm(true)}
            style={styles.addButton}
          />
        ) : (
          <View style={styles.addForm}>
            <Input
              label="Email do contato"
              type="email"
              value={friendEmail}
              onChangeText={setFriendEmail}
              placeholder="exemplo@email.com"
            />
            <View style={styles.addFormButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setShowAddForm(false);
                  setFriendEmail('');
                }}
                style={styles.addFormButton}
              />
              <Button
                title="Adicionar"
                onPress={handleAddFriend}
                loading={isAddingFriend}
                style={styles.addFormButton}
              />
            </View>
          </View>
        )}
      </View>

      {/* Friends List */}
      <ScrollView 
        style={styles.friendsList}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.friendsContent}
      >
        {friends.length > 0 ? (
          <View style={styles.friendsContainer}>
            {friends.map((friend) => {
              const StatusIcon = getStatusIcon(friend.status);
              return (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendInfo}>
                    <View style={styles.friendHeader}>
                      <Text style={styles.friendName}>{friend.friendName}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveFriend(friend.friendId, friend.friendName)}
                        style={styles.removeButton}
                      >
                        <UserMinus size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.friendEmail}>{friend.friendEmail}</Text>
                    
                    <View style={styles.friendStatus}>
                      <View style={styles.statusIndicator}>
                        <StatusIcon 
                          size={16} 
                          color={getStatusColor(friend.status)} 
                        />
                        <Text style={[
                          styles.statusText, 
                          { color: getStatusColor(friend.status) }
                        ]}>
                          {getStatusText(friend.status)}
                        </Text>
                      </View>
                      
                      {friend.lastCheckin && (
                        <View style={styles.lastCheckin}>
                          <Clock size={12} color="#64748b" />
                          <Text style={styles.lastCheckinText}>
                            Último check-in: {new Date(friend.lastCheckin).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noFriends}>
            <Users size={64} color="#d1d5db" />
            <Text style={styles.noFriendsTitle}>Nenhum contato de emergência</Text>
            <Text style={styles.noFriendsText}>
              Adicione contatos para que possam ser notificados sobre seu status de segurança
            </Text>
            <Button
              title="Adicionar primeiro contato"
              onPress={() => setShowAddForm(true)}
              style={styles.firstContactButton}
            />
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            • Seus contatos receberão notificações quando você fizer check-ins{'\n'}
            • Em situações de emergência, eles saberão sua localização{'\n'}
            • Você também verá o status de segurança dos seus contatos
          </Text>
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
  addSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  addButton: {
    width: '100%',
  },
  addForm: {
    gap: 16,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addFormButton: {
    flex: 1,
  },
  friendsList: {
    flex: 1,
  },
  friendsContent: {
    paddingBottom: 40,
  },
  friendsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  friendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  removeButton: {
    padding: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  friendStatus: {
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastCheckin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastCheckinText: {
    fontSize: 12,
    color: '#64748b',
  },
  noFriends: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noFriendsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  noFriendsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  firstContactButton: {
    paddingHorizontal: 32,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    margin: 24,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    margin: 24,
  },
});