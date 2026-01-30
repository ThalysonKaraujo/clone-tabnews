# Clone TabNews

Este projeto é um clone do site TabNews.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Testes:** [Jest](https://jestjs.io/)
- **Containerização:** [Docker](https://www.docker.com/)

## Começando

Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão `lts/hydrogen` ~ v18, especificada em `.nvmrc`)
- [Docker](https://www.docker.com/get-started)

### Instalação

1.  Clone o repositório:
    ```sh
    git clone https://github.com/seu-usuario/clone-tabnews.git
    ```
2.  Navegue até o diretório do projeto:
    ```sh
    cd clone-tabnews
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```

### Executando a Aplicação

1.  Inicie os serviços (PostgreSQL):
    ```sh
    npm run services:up
    ```
2.  Execute as migrações do banco de dados:
    ```sh
    npm run migrations:up
    ```
3.  Inicie o servidor de desenvolvimento:
    ```sh
    npm run dev
    ```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Executando os Testes

Para executar os testes, utilize o seguinte comando:

```sh
npm test
```

Este comando irá iniciar os serviços necessários, executar os testes e depois parar os serviços.
