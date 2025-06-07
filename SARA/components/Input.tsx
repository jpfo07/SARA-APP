import { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInputProps 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'cpf' | 'phone';
  onChangeText: (text: string) => void;
}

export default function Input({
  label,
  error,
  type = 'text',
  value = '',
  onChangeText,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleTextChange = (text: string) => {
    let formattedText = text;
    
    if (type === 'cpf') {
      formattedText = formatCPF(text);
    } else if (type === 'phone') {
      formattedText = formatPhone(text);
    }
    
    onChangeText(formattedText);
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'cpf':
      case 'phone':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'email':
        return 'seu@email.com';
      case 'cpf':
        return '000.000.000-00';
      case 'phone':
        return '(11) 99999-9999';
      case 'password':
        return '••••••••';
      default:
        return props.placeholder;
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          keyboardType={getKeyboardType()}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoCorrect={type !== 'email' && type !== 'password'}
          secureTextEntry={type === 'password' && !isPasswordVisible}
          placeholder={getPlaceholder()}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        
        {type === 'password' && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#64748b" />
            ) : (
              <Eye size={20} color="#64748b" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 12,
  },
  errorBorder: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
});