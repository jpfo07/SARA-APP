# 🌊 SARA - Sistema Autônomo de Resposta a Alagamentos

Aplicativo mobile desenvolvido em React Native com o objetivo de **auxiliar a população em casos de enchentes**, fornecendo alertas em tempo real, monitoramento de sensores de risco e funcionalidades sociais como localização de amigos e check-in de segurança.

Este projeto faz parte da disciplina de **Mobile Application Development** e foi desenvolvido como parte da solução da **Global Solution**.

---

## 👤 Integrantes

- João Paulo Francisco de Oliveira RM557410
-Marcelo Antonio Scoleso Junior RM557481

---

## 🚀 Tecnologias Utilizadas

- React Native (Expo)
- TypeScript
- Axios
- React Navigation
- Context API
- Backend em Java (Spring Boot)
- Expo Go

---

## 📱 Funcionalidades do App

- Tela de login e cadastro com validações
- Monitoramento de sensores (chuva, nível da água, temperatura)
- Recebimento de notificações de alerta
- Tela de check-in para informar que está seguro
- Navegação entre múltiplas telas com React Navigation
- Integração completa com API Java para CRUD de dados

---

## ⚙️ Como rodar o app

### ✅ Pré-requisitos

- Node.js e npm instalados
- Expo CLI instalado globalmente:
  ```bash
  npm install -g expo-cli


▶️ Passo a passo para executar o app
Clone este repositório:

bash
Copiar
Editar
git clone https://github.com/jpfo07/SARA-APP.git
cd SARA-APP
Instale as dependências:

bash
Copiar
Editar
npm install
Inicie o projeto com Expo:

bash
Copiar
Editar
npx expo start
Escaneie o QR code com o aplicativo Expo Go no seu celular.

⚠️ IMPORTANTE: API Java deve estar rodando!

LINK:https://github.com/MarceloScoleso/projeto-sara-api-java.git

Para que o app funcione corretamente, certifique-se de que a API backend desenvolvida em Java/Spring Boot esteja ativa localmente (por padrão na porta http://localhost:8080).
Se for usar em um dispositivo físico, substitua o localhost pelo IP da sua máquina no arquivo src/services/api.ts:

ts
Copiar
Editar
const api = axios.create({
  baseURL: 'http://SEU_IP:8080'
});
