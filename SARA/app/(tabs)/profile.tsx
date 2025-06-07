import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validateRequired, formatCPF } from '../../utils/validation';
import { Camera, CreditCard as Edit2, Save, X, LogOut, User } from 'lucide-react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!validateRequired(formData.address)) {
      newErrors.address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateUser({
        ...formData,
        profileImage,
      });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setProfileImage(user.profileImage || null);
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleImagePress = () => {
    Alert.alert(
      'Foto do perfil',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover foto', onPress: () => setProfileImage(null) },
        { 
          text: 'Trocar foto', 
          onPress: () => {
            // In a real app, this would open image picker
            setProfileImage('https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop');
          }
        }
      ]
    );
  };

  if (!user) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={isEditing ? handleImagePress : undefined}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <User size={48} color="#64748b" />
              </View>
            )}
            
            {isEditing && (
              <View style={styles.imageOverlay}>
                <Camera size={24} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.imageName}>{user.name}</Text>
          <Text style={styles.imageEmail}>{user.email}</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Informações Pessoais</Text>
            
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={20} color="#0066CC" />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Save size={16} color="#16A34A" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <Input
              label="Nome completo"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
              editable={isEditing}
              style={!isEditing && styles.readOnlyInput}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              editable={isEditing}
              style={!isEditing && styles.readOnlyInput}
            />

            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>CPF</Text>
              <Text style={styles.readOnlyValue}>{formatCPF(user.cpf || '')}</Text>
            </View>

            <Input
              label="Telefone"
              type="phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              error={errors.phone}
              editable={isEditing}
              style={!isEditing && styles.readOnlyInput}
            />

            <Input
              label="Endereço"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              error={errors.address}
              editable={isEditing}
              multiline
              style={!isEditing && styles.readOnlyInput}
            />

            {isEditing && (
              <View style={styles.saveSection}>
                <Button
                  title="Salvar alterações"
                  onPress={handleSave}
                  loading={isLoading}
                  style={styles.saveButtonFull}
                />
              </View>
            )}
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Informações da Conta</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Membro desde</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status da conta</Text>
            <Text style={[styles.infoValue, styles.activeStatus]}>Ativa</Text>
          </View>
        </View>

        {/* Emergency Contact Info */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Em caso de emergência</Text>
          <Text style={styles.emergencyText}>
            Seus contatos de emergência serão notificados através do sistema SARA. 
            Mantenha suas informações sempre atualizadas.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  imageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  imageEmail: {
    fontSize: 16,
    color: '#64748b',
  },
  formSection: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  readOnlyInput: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  readOnlyField: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#64748b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveSection: {
    marginTop: 24,
  },
  saveButtonFull: {
    width: '100%',
  },
  accountInfo: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  activeStatus: {
    color: '#16A34A',
  },
  emergencySection: {
    backgroundColor: '#eff6ff',
    marginHorizontal: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 18,
  },
});