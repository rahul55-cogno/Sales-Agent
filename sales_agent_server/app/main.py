import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from lib.last_10_emails import main
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
load_dotenv()

os.environ['GROQ_API_KEY']=os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

def split_data_in_chunks(emai_dict,query):
    threshold=70
    docs = [
        Document(page_content=f"From: {d['from_address']}\nSubject: {d['subject']}\nDate: {d['date']}\nContent: {d['content']}", metadata=d)
        for d in emai_dict
    ]
    embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")


    text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
    documents=text_splitter.split_documents(docs)

    db=Chroma.from_documents(documents,embedding_model)
    query_vector = embedding_model.embed_query(query)
    result = db.similarity_search_by_vector_with_relevance_scores(query_vector,k=10)

    arr=[]
    for doc,score in result:
        if score*100 >= threshold:
            arr.append(doc.page_content)
    return "\n\n---\n\n".join(arr)

llm = ChatGroq(model="llama-3.1-8b-instant")

def refine_results_with_llm(data,query):
    prompt = ChatPromptTemplate.from_messages(
    [
        ("system", f"You are a helpful assistant. Answer the user's question strictly using only the following email context:\n\n{data}.If you don't know the answer say I can't found your answer in the email context."),
        ("user","Question:{question}")
    ]
)
    output_parser=StrOutputParser()
    chain=prompt|llm|output_parser
    return chain.invoke({'question':query})


if __name__=="__main__":
    docs=main(sender_mail="rahul24012006@gmail.com")
    context=split_data_in_chunks(emai_dict=docs,query='Whats my name')
    llm_output=refine_results_with_llm(context,query='Whats my name')
    print(llm_output)
