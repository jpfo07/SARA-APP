import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { sensorsAPI } from '../../services/api';
import { Activity, MapPin, Clock, Droplets, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      const data = await sensorsAPI.getSensors();
      setSensors(data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadSensors();
  };

  const getFilteredSensors = () => {
    if (selectedFilter === 'all') return sensors;
    return sensors.filter(sensor => sensor.status === selectedFilter);
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

  const getWaterLevelPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando sensores..." />;
  }

  const filteredSensors = getFilteredSensors();
  const criticalCount = sensors.filter(s => s.status === 'critical').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const normalCount = sensors.filter(s => s.status === 'normal').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sensores</Text>
        <Text style={styles.subtitle}>Monitoramento em tempo real</Text>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{sensors.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#DC2626' }]}>{criticalCount}</Text>
          <Text style={styles.statLabel}>Críticos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{warningCount}</Text>
          <Text style={styles.statLabel}>Alertas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#16A34A' }]}>{normalCount}</Text>
          <Text style={styles.statLabel}>Normais</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'critical', label: 'Críticos' },
            { key: 'warning', label: 'Alertas' },
            { key: 'normal', label: 'Normais' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sensors List */}
      <ScrollView 
        style={styles.sensorsList}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.sensorsContent}
      >
        {filteredSensors.map((sensor) => (
          <TouchableOpacity key={sensor.id} style={styles.sensorCard}>
            <View style={styles.sensorHeader}>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <View style={styles.sensorLocation}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.sensorLocationText}>{sensor.location}</Text>
                </View>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(sensor.status) }]}>
                <Text style={styles.statusText}>{getSeverityText(sensor.status)}</Text>
              </View>
            </View>

            <View style={styles.sensorMetrics}>
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Droplets size={16} color="#0066CC" />
                  <Text style={styles.metricLabel}>Nível da Água</Text>
                </View>
                <Text style={styles.metricValue}>{sensor.waterLevel.toFixed(1)}m</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${getWaterLevelPercentage(sensor.waterLevel, sensor.maxLevel)}%`,
                        backgroundColor: getSeverityColor(sensor.status)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {getWaterLevelPercentage(sensor.waterLevel, sensor.maxLevel).toFixed(0)}% do limite
                </Text>
              </View>
            </View>

            <View style={styles.sensorFooter}>
              <View style={styles.lastUpdate}>
                <Clock size={12} color="#64748b" />
                <Text style={styles.lastUpdateText}>
                  Atualizado às {new Date(sensor.lastUpdate).toLocaleTimeString('pt-BR')}
                </Text>
              </View>
              
              {sensor.status === 'critical' && (
                <TouchableOpacity style={styles.alertButton}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <Text style={styles.alertButtonText}>Ver alerta</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredSensors.length === 0 && (
          <View style={styles.noSensors}>
            <Activity size={48} color="#d1d5db" />
            <Text style={styles.noSensorsText}>
              {selectedFilter === 'all' 
                ? 'Nenhum sensor encontrado' 
                : `Nenhum sensor com status "${selectedFilter}"`
              }
            </Text>
          </View>
        )}
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
    paddingBottom: 20,
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
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filters: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  sensorsList: {
    flex: 1,
  },
  sensorsContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sensorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sensorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sensorLocationText: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sensorMetrics: {
    marginBottom: 16,
  },
  metricItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
  sensorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#64748b',
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  noSensors: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noSensorsText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
});