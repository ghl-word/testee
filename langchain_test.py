from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

import os

load_dotenv()
#Carrega automaticamente as variáveis do arquivo .env


api_key = os.getenv("GOOGLE_API_KEY")
#Obtém a chave da API Gemini armazenada no .env

llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    google_api_key=api_key,
    temperature=0.7
)
#Aqui foi inserido o framework LangChain
#Antes a chamada da IA era direta pela API do Gemini
#Agora o LangChain faz o gerenciamento da comunicação

prompt = ChatPromptTemplate.from_template(
    """
    Você é um assistente inteligente do sistema MedAgenda.

    Responda a seguinte pergunta:
    {pergunta}
    """
)
#Criação de um prompt dinâmico utilizando LangChain
#O campo {pergunta} será substituído automaticamente
#pela pergunta digitada pelo usuário

chain = prompt | llm
#Criação da chain do LangChain
#Faz o encadeamento entre:
#Prompt → Modelo Gemini
#Isso facilita organização e escalabilidade do sistema

pergunta_usuario = input("Digite sua pergunta: ")
#Captura pergunta digitada pelo usuário

resposta = chain.invoke({
    "pergunta": pergunta_usuario
})
#Executa a chain do LangChain
#Envia a pergunta para o modelo Gemini
#Recebe a resposta da IA

print("\nResposta da IA:\n")
print(resposta.content)
#Exibe no terminal apenas o conteúdo da resposta
#retornado pela IA