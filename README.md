# Mesa (Backend)

## Resumo da Aplicação

Este projeto é uma aplicação de backend desenvolvida em Node.js para gerenciar filas de espera de restaurantes em tempo real. A API permite que usuários entrem e saiam de filas, enquanto o restaurante pode chamar o próximo cliente. Todas as atualizações de estado da fila são transmitidas para os clientes conectados via WebSockets.

## Tecnologias Utilizadas

A pilha de tecnologias principal utilizada para construir e testar este projeto inclui:

* **Ambiente de Execução:**
    * **Node.js**: Plataforma de execução para JavaScript no servidor.
    * **TypeScript**: Superset do JavaScript que adiciona tipagem estática para um código mais robusto e manutenível.
    * **ts-node-dev**: Ferramenta para desenvolvimento em TypeScript que reinicia o servidor automaticamente a cada alteração de código.

* **API e Servidor:**
    * **Express**: Framework para a construção de APIs web.
    * **Socket.IO**: Biblioteca para comunicação bidirecional e em tempo real, utilizada para notificar os clientes sobre atualizações na fila.
    * **CORS**: Middleware para habilitar o Cross-Origin Resource Sharing.

* **Documentação e Testes:**
    * **Swagger (via `swagger-ui-express`)**: Gera uma interface de usuário interativa para documentar e testar os endpoints da API.
    * **Jest**: Framework de testes em JavaScript para garantir a qualidade e o funcionamento correto das lógicas de negócio.

## Instruções para Rodar o Projeto Localmente

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/carloscnM/fiap-ativ-mesa-back.git
    cd fiap-ativ-mesa-back
    ```

2.  **Instale as Dependências:**
    Certifique-se de ter o Node.js e o npm (ou Yarn) instalados. Em seguida, instale as dependências do projeto.
    ```bash
    npm install
    ```

3.  **Execute o Projeto:**
    Para iniciar o servidor em modo de desenvolvimento, use o seguinte comando:
    ```bash
    npm run dev
    ```
    O servidor será iniciado na porta 3000 por padrão.

## Documentação e Teste da API com Swagger

Este projeto utiliza o Swagger para fornecer uma documentação interativa e atualizada de todos os endpoints disponíveis. Em vez de configurar o Postman manualmente, você pode usar a interface do Swagger para explorar e testar a API.

**Como Acessar:**

1.  Com o servidor rodando (`npm run dev`), abra o seu navegador de internet.
2.  Navegue para o seguinte endereço:
    ```
    http://localhost:3000/api-docs
    ```
3.  Você verá uma página com todos os métodos da API listados (GET, POST, etc.).
4.  O método principal para ser utilizado é o **queue/next**, que irá simular a chamada do restaurante pela próxima senha. Os demais métodos são utilizados internamente pelo front