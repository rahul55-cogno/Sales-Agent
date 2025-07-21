from typing import Annotated,TypedDict
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph,END
import os
from email.header import decode_header
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver
from email_fetching import gmail_fetch_emails
from langchain_community.vectorstores.utils import filter_complex_metadata


load_dotenv()

email_user=os.getenv("EMAIL")
password=os.getenv("PASSWORD")

class State(TypedDict):
    messages:Annotated[list,add_messages]
    query:str
    raw_text:dict
    context_data:list
    email:str
    customer_name:str

def fetch_emails(s:State):
    return gmail_fetch_emails(s["email"],s['customer_name'])

def split_data_in_chunks(s:State):
    try:
        query=s['query']
        emai_dict=s['raw_text']
        threshold=5
        docs = [
            Document(page_content=f"""
From: {d['from_address']}
Subject: {d['subject']}
Date: {d['date']}
Content: {d['content']}
Attachments: {' || '.join(d['attachments']) if isinstance(d['attachments'], list) else str(d['attachments'])}
""".strip())
            for d in emai_dict if d['content'].strip()
        ]
        embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

        text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
        documents=text_splitter.split_documents(docs)

        db=Chroma.from_documents(filter_complex_metadata(documents),embedding_model)
        query_vector = embedding_model.embed_query(query)
        result = db.similarity_search_by_vector_with_relevance_scores(query_vector,k=10)

        arr=[]
        for doc,score in result:
            if score*100 >= threshold:
                arr.append(doc.page_content)
        return {
            "context_data":["\n\n---\n\n".join(arr)],
        }
    except Exception as e:
      print(e)

def get_senders_name(s:State):
    query=s['query']
    prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "I am giving you users query you have to extract name of the user for which user is querying about. Just return the name or None."),
        ("user","Question:{question}")
    ]
)
    output_parser=StrOutputParser()
    chain=prompt|llm|output_parser
    response=chain.invoke({'question':query})
    return {
        "customer_name":[response],
    }

def refine_results_with_llm(s:State):
    query=s['query']
    data=s['context_data']
    prompt = ChatPromptTemplate.from_messages(
    [
        ("system", 
        "You are a helpful assistant. Using only the information provided in the following emails:\n\n{data}\n\ncreate a summary in exactly two clear and comprehensive paragraphs. Your summary should cover all the important points, decisions, and discussions present in the emails, merging the content into a logical, human-readable overview without referencing email names, dates, or any external information. Do not use bullet points, lists, or any formatting that requires external support. Focus on clarity and depth, keeping the total length between 200 and 300 words. Separate the two paragraphs with \n in between"),
        ("user", "Question: {question}")
    ]
)
    output_parser=StrOutputParser()
    chain=prompt|llm|output_parser
    response=chain.invoke({'question':query,'data': data})
    # print(response)
    return {
        "messages":[response],
    }
### Agent Logic

os.environ['GROQ_API_KEY']=os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

from langchain_groq import ChatGroq

llm=ChatGroq(model="llama-3.3-70b-versatile")

graph = StateGraph(State)

graph.add_node("fetch_emails",fetch_emails)
graph.add_node("chunk_splitter",split_data_in_chunks)
graph.add_node("refinery",refine_results_with_llm)
graph.add_node("name_fetch",get_senders_name)

graph.set_entry_point("name_fetch")
graph.add_edge("name_fetch","fetch_emails")
graph.add_edge("fetch_emails","chunk_splitter")
graph.add_edge("chunk_splitter","refinery")
graph.add_edge("refinery", END)

memory=MemorySaver()
final_workflow=graph.compile(checkpointer=memory)

if __name__=="__main__":
    query="Summarize last some emails"
    config={"configurable":{"thread_id":"1"}}
    events=final_workflow.stream(
        {"query":query,"email":"workingforrahul@gmail.com"},
        config,
        stream_mode="values"
    )
    for event in events:
        if event['messages'] and len(event['messages']):
            print(event['messages'][-1].content)