# 🔄 REFATORAÇÃO: SEPARAÇÃO DA ÁREA ADMIN EM APP INDEPENDENTE (MONOREPO)

Este repositório contém o código-fonte para o site de e-commerce de arte da Melissa Pelussi, estruturado como um monorepo gerenciado pelo Turbo.

## 🚀 Estrutura

O monorepo é dividido em duas aplicações principais e um pacote compartilhado:

-   `apps/cliente`: A aplicação voltada para o público, onde os clientes podem navegar e comprar as obras de arte.
-   `apps/controle`: O painel administrativo, de acesso restrito, para gerenciamento de produtos, pedidos e usuários.
-   `shared`: Um pacote que contém código compartilhado entre as duas aplicações, como componentes de UI, configurações do Firebase, tipos TypeScript e traduções.

## 🛠️ Tecnologias Utilizadas

-   **Monorepo:** Turborepo
-   **Frontend:** React, Vite, TypeScript
-   **Estilização:** Tailwind CSS
-   **Backend & DB:** Firebase (Authentication, Firestore)
-   **Storage:** Supabase Storage
-   **Roteamento:** React Router

## 🏃‍♀️ Rodando Localmente

**Pré-requisitos:**
-   Node.js (v18 ou superior)
-   npm (v7 ou superior) ou pnpm

1.  **Instale as dependências** a partir da raiz do projeto:
    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione suas chaves do Firebase, Supabase e Gemini.

3.  **Inicie as aplicações em modo de desenvolvimento:**

    -   Para rodar ambas as aplicações simultaneamente:
        ```bash
        npm run dev
        ```
    -   Para rodar apenas o app do cliente (`http://localhost:3000`):
        ```bash
        npm run dev:cliente
        ```
    -   Para rodar apenas o painel admin (`http://localhost:3001`):
        ```bash
        npm run dev:controle
        ```

## 🏗️ Build para Produção

-   Para construir ambas as aplicações:
    ```bash
    npm run build
    ```
-   Para construir apenas o app do cliente:
    ```bash
    npm run build:cliente
    ```
-   Para construir apenas o painel admin:
    ```bash
    npm run build:controle
    ```

Os arquivos de build serão gerados dentro da pasta `dist/` de cada aplicação.
