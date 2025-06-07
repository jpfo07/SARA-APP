import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { sensorsAPI, checkinAPI } from '../../services/api';
import { TriangleAlert as AlertTriangle, Activity, MapPin, Clock } from 'lucide-react-native';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

export default function HomeScreen() {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sensorsData, checkinsData] = await Promise.all([
        sensorsAPI.getSensors(),
        user ? checkinAPI.getCheckins(user.id) : Promise.resolve([])
      ]);
      
      setSensors(sensorsData.slice(0, 3)); // Show only 3 most critical
      setRecentCheckins(checkinsData.slice(0, 2)); // Show 2 most recent
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const getSeverityColor = (status: string) => {
    switch (status) {
      case 'critical': return '#DC2626';
      case 'warning': return '#F59E0B';
      case 'normal': return '#16A34A';
      default: return '#64748b';
    }
  };

  const getSeverityText = (status: string) => {
    switch (status) {
      case 'critical': return 'CRÍTICO';
      case 'warning': return 'ALERTA';
      case 'normal': return 'NORMAL';
      default: return 'DESCONHECIDO';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando dados..." />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }}
          style={styles.logo}
        />
      </View>

      {/* Status Overview */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <AlertTriangle size={24} color="#0066CC" />
          <Text style={styles.statusTitle}>Status da Região</Text>
        </View>
        
        {sensors.length > 0 ? (
          <View style={styles.statusGrid}>
            {sensors.map((sensor) => (
              <View key={sensor.id} style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: getSeverityColor(sensor.status) }]} />
                <Text style={styles.statusLabel}>{getSeverityText(sensor.status)}</Text>
                <Text style={styles.statusLocation}>{sensor.location}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>Nenhum sensor ativo na região</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, styles.emergencyAction]}>
            <AlertTriangle size={32} color="#ffffff" />
            <Text style={styles.actionTitle}>Emergência</Text>
            <Text style={styles.actionSubtitle}>Solicitar ajuda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, styles.checkinAction]}>
            <Activity size={32} color="#ffffff" />
            <Text style={styles.actionTitle}>Check-in</Text>
            <Text style={styles.actionSubtitle}>Estou seguro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade Recente</Text>
        
        {recentCheckins.length > 0 ? (
          <View style={styles.activityList}>
            {recentCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Activity size={16} color="#0066CC" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    Check-in de segurança: {checkin.status === 'safe' ? 'Estou bem' : 'Preciso de ajuda'}
                  </Text>
                  <View style={styles.activityMeta}>
                    <MapPin size={12} color="#64748b" />
                    <Text style={styles.activityLocation}>{checkin.location}</Text>
                    <Clock size={12} color="#64748b" />
                    <Text style={styles.activityTime}>
                      {new Date(checkin.createdAt).toLocaleTimeString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noActivity}>
            <Text style={styles.noActivityText}>Nenhuma atividade recente</Text>
            <Button
              title="Fazer Check-in"
              variant="secondary"
              size="small"
              onPress={() => {/* Navigate to checkin */}}
            />
          </View>
        )}
      </View>

      {/* Emergency Info */}
      <View style={styles.emergencyInfo}>
        <View style={styles.emergencyHeader}>
          <AlertTriangle size={20} color="#DC2626" />
          <Text style={styles.emergencyTitle}>Em caso de emergência</Text>
        </View>
        <Text style={styles.emergencyText}>
          Defesa Civil: 199{'\n'}
          Bombeiros: 193{'\n'}
          SAMU: 192
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
    minWidth: 80,
  },
  statusLocation: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyAction: {
    backgroundColor: '#DC2626',
  },
  checkinAction: {
    backgroundColor: '#16A34A',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
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
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  activityLocation: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  noActivity: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  noActivityText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  emergencyInfo: {
    backgroundColor: '#fef2f2',
    margin: 24,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});