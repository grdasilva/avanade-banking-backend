# Avanade Bank

Projeto realizado para conclusão do treinamento da Gama Academy, com o propósito de simular um Internet Banking  

## Para começar

Para começar, precisará clonar o repositório da API, então precisará baixar o Git : 

```
https://git-scm.com/downloads
```

E então rodar o comando no Git Bash :

``` 
git clone https://github.com/grdasilva/avanade-banking-backend.git
```

### Pré-Requisitos

Para rodar a API, além do Git, precisará do Node instalado e do MongoDB Community Server para rodar o server localmente, seguem links para instalação dos dois respectivamente :

```
https://nodejs.org/en/download/
```

```
https://www.mongodb.com/download-center/community
```

### Instalando

Após ter clonado o repositório e instalado todas as dependências, vamos rodar o projeto 

Para rodar o projeto recomendamos usar o VSCODE e o POSTMAN caso não queira usar o front-end da nossa aplicação, mas os passos também podem ser feitos por um terminal CMD, o primeiro passo é entrar na pasta do projeto clonado e rode este comando no terminal para restaurar as dependências internas do projeto 

```
npm install
```

## Rodar projeto

Após instalar todas as dependências, rode este comando no terminal para subir o server 

```
npm run prod
```

Se tudo estiver devidamente configurado, terá esse resultado no terminal 

![Terminal](https://ibb.co/ZSVpV3T)

E ai podemos começar a testar as requisições, utilizando o POSTMAN, caso não esteja rodando nosso front-end, a seguir possui um link com a documentação da API, para realizar os comandos de forma correta

```
https://documenter.getpostman.com/view/7504609/SVSHrpDU?version=latest
```

## Desenvolvido com

* [Node](https://github.com/nodejs/node) - Usado para desenvolver a API
* [Npm](https://github.com/npm/cli) - Usado para gerenciar os pacotes
* [Express](https://github.com/expressjs/express) - O Express é uma estrutura de aplicativos da Web Node.js mínima e flexível que fornece um conjunto robusto de recursos para aplicativos da Web e móveis.
* [MongoDB](https://github.com/mongodb/mongo) - Usado para construir e rodar o banco
* [JWT](https://github.com/jwt) - Usado para construir a segurança do projeto

## Autores

* **Guilherme Rodrigues** - *Initial work* - [grdasilva](https://github.com/grdasilva)
* **Genilson Moraes** - *Initial work* - [geprojetos](https://github.com/geprojetos)

Veja a lista de [contributors](https://github.com/grdasilva/avanade-banking-backend/contributors) que participaram do projeto

## Licença

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

