import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:8080'; // ajuste se necessário

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==== AUTENTICAÇÃO (AuthController) ====

export const authAPI = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, senha: password });
    return response.data; // { token, usuario }
  },

  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data; // { token, usuario }
  }
};

// ==== USUÁRIO (UsuarioController) ====

export const userAPI = {
  async getProfile(userId: number) {
    const response = await api.get(`/usuarios/${userId}`);
    return response.data;
  },

  async updateProfile(userId: number, userData: any) {
    const response = await api.put(`/usuarios/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number) {
    await api.delete(`/usuarios/${userId}`);
    return true;
  }
};

// ==== SENSORES (SensorController + LeituraSensorController) ====

export const sensorsAPI = {
  async getSensors() {
    const response = await api.get('/sensores');
    return response.data;
  },

  async getSensorById(id: number) {
    const response = await api.get(`/sensores/${id}`);
    return response.data;
  },

  async updateSensor(id: number, sensorData: any) {
    const response = await api.put(`/sensores/${id}`, sensorData);
    return response.data;
  }
};

// ==== CHECK-IN (Mockado) ====

let mockCheckins: any[] = [
  {
    id: 1,
    userId: 1,
    status: 'safe',
    message: 'Estou em casa, tudo bem por aqui!',
    location: 'Vila Madalena, SP',
    createdAt: '2024-01-20T14:00:00Z'
  }
];

export const checkinAPI = {
  async getCheckins(userId: number) {
    return mockCheckins.filter(c => c.userId === userId);
  },

  async createCheckin(checkinData: any) {
    const newCheckin = {
      id: mockCheckins.length + 1,
      ...checkinData,
      createdAt: new Date().toISOString()
    };
    mockCheckins.push(newCheckin);
    return newCheckin;
  }
};

// ==== AMIGOS (Mockado) ====

let mockFriends: any[] = [
  {
    id: 1,
    userId: 1,
    friendId: 2,
    friendName: 'Maria Santos',
    friendEmail: 'maria@email.com',
    status: 'safe',
    lastCheckin: '2024-01-20T13:30:00Z'
  }
];

export const friendsAPI = {
  async getFriends(userId: number) {
    return mockFriends.filter(f => f.userId === userId);
  },

  async addFriend(userId: number, friendEmail: string) {
    const newFriend = {
      id: mockFriends.length + 1,
      userId,
      friendId: Date.now(),
      friendName: 'Mock Friend',
      friendEmail,
      status: 'unknown',
      lastCheckin: null
    };
    mockFriends.push(newFriend);
    return newFriend;
  }
};
