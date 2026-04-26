# 📝 CP5 - App de Notas Pro

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Aplicativo mobile de notas desenvolvido em **React Native + Expo**, com suporte a múltiplos idiomas, geolocalização no mapa, notificações locais e persistência na nuvem com Firebase.

---

## 👥 Integrantes do Grupo

|
 Nome 
|
 RM 
|
|
------
|
----
|
|
 Matheus Barbosa Mariotto 
|
 RM560276 
|
|
 Felipe Anselmo 
|
 RM560661 
|
|
 João Vinícius 
|
 RM559369 
|

---

## 🎥 Vídeo Demonstrativo

> 📹 Veja o app em funcionamento (troca de idioma, criação de nota com pin no mapa, notificações e APK instalado):

🔗 **[Assista no YouTube](https://youtu.be/EPGVBwbBIRk)**

---

## 📦 Download do APK

> 📲 Baixe o APK pronto pra instalar no seu Android (não precisa de emulador):

🔗 **[Clique aqui para baixar o APK](https://expo.dev/accounts/matheus.mariotto/projects/NotasApp/builds/3c222d6d-a8b1-4827-922b-563379380b72)**

### Como instalar o APK no Android:

1. Baixe o arquivo `.apk` pelo link acima
2. No celular, abra o arquivo baixado
3. Caso solicite, permita a **instalação de fontes desconhecidas**
4. Aguarde a instalação e abra o app **NotasApp** 🎉

---

## 🚀 Funcionalidades

- 🔐 **Autenticação de usuários** — telas de login e cadastro com Firebase Auth
- 📝 **CRUD completo de notas** — criar, listar, editar e excluir
- 🌍 **Internacionalização (i18n)** — suporte a **Português (PT-BR)** e **Inglês (EN)** com troca de idioma em tempo real
- 🗺️ **Mapa e geolocalização** — captura automática da latitude/longitude ao salvar a nota e exibição com PIN no mapa
- 🔔 **Notificações locais** — notificação de **boas-vindas** ao logar e de **confirmação** ao criar uma nota
- ☁️ **Persistência na nuvem** — notas (incluindo coordenadas) salvas no **Firestore**
- 🎨 **Interface responsiva** — design adaptado a diferentes tamanhos de tela

---

## 🧩 Como as Funcionalidades Foram Implementadas

### 🌍 Internacionalização (i18n)
- Configurado com **i18next** + **react-i18next**
- Arquivos de tradução em `src/i18n/` (PT-BR e EN)
- Botão de troca de idioma no topo da Home alterna em tempo real
- Nenhuma string fixa no código — todo texto passa por `t('chave')`

### 🗺️ Mapas e Geolocalização
- **expo-location** solicita permissão e captura `latitude/longitude` no momento de salvar a nota
- Coordenadas armazenadas no documento da nota no **Firestore**
- **react-native-maps** exibe o mapa com um `Marker` (Pin) na posição salva
- Permissão tratada de forma amigável (alerta caso o usuário negue)

### 🔔 Notificações
- **expo-notifications** configurado com handler em foreground
- Permissão solicitada no `useEffect` da Home (compatível com Android 13+)
- `notificarBoasVindas()` dispara após login confirmado
- `notificarNotaCriada()` dispara ao criar uma nota com sucesso

### ☁️ Firebase
- **Firebase Auth** para login/cadastro
- **Firestore** para armazenar notas com lat/long persistidos

---

## 🛠️ Tecnologias Utilizadas

- **React Native** + **Expo SDK**
- **React Navigation** — navegação entre telas
- **Firebase** (Auth + Firestore)
- **i18next** + **react-i18next** — internacionalização
- **expo-location** — geolocalização
- **react-native-maps** — exibição do mapa
- **expo-notifications** — notificações locais
- **EAS Build** — geração do APK

---

## ⚙️ Como Executar o Projeto

### 📋 Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** instalado globalmente
- **Android Studio** (com emulador) ou aplicativo **Expo Go** no celular

### 📥 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/matheusmariotto1206/CP4---App-de-Notas.git
   cd CP4---App-de-Notas
Instale as dependências:


npm install
Inicie o projeto Expo:


npx expo start
Execute no dispositivo:

📱 Celular físico: escaneie o QR Code com o app Expo Go
💻 Emulador Android: pressione a no terminal
🍎 Emulador iOS: pressione i no terminal (apenas macOS)
📱 Como Usar o App
Cadastre-se ou faça login na tela inicial
Receba a notificação de boas-vindas 👋
Toque no botão "+" para criar uma nova nota
Preencha o título, descrição — a localização 📍 é capturada automaticamente
Receba a notificação de confirmação ao salvar ✅
Toque em uma nota para visualizar o mapa com o pin, editar ou excluir
Use o botão de idioma 🌍 no topo para alternar entre Português e Inglês
📂 Estrutura do Projeto
CP4---App-de-Notas/
├── assets/              # Imagens e ícones (incluindo bandeiras do i18n)
├── src/
│   ├── components/      # Componentes reutilizáveis (NoteCard, Modais)
│   ├── screens/         # Telas (Login, Register, Home)
│   ├── navigation/      # Configuração de navegação
│   ├── services/        # Serviços (notificações)
│   └── i18n/            # Configuração de internacionalização (PT/EN)
├── firebaseConfig.js    # Configuração do Firebase
├── App.js               # Componente raiz
├── app.json             # Configuração do Expo
└── eas.json             # Configuração do EAS Build
📄 Licença
Projeto acadêmico desenvolvido para o Checkpoint 5 da disciplina de Mobile Application Development — FIAP.


