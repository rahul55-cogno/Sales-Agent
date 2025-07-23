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
from typing import Optional

load_dotenv()

email_user=os.getenv("EMAIL")
password=os.getenv("PASSWORD")

class State(TypedDict):
    messages:Annotated[list,add_messages]
    query:str
    raw_text:dict
    context_data:list
    email:str
    customer_name: Optional[str]
    previous_chats: Optional[list]
    route: Optional[str]

def fetch_emails(s:State):
    print('From fetch_emails ',s['customer_name'])
    return gmail_fetch_emails(s["email"],s['customer_name'])

def split_data_in_chunks(s:State):
    print("Data Chunk Splitting")
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
    previous_chats = s.get('previous_chats', [])
    context_str = "\n\n".join(previous_chats) if previous_chats else "No previous chats."
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are an assistant that extracts the customer name the user is asking about."
             " You can get clues from the current query and also the context of previous chats.\n"
             "If you cannot identify a customer name, reply with exactly 'None'."),
            ("user",
             "Current Query: {query}\nPrevious Chats:\n{context}\n"
             "Please extract only the customer name or respond 'None'.")
        ]
    )
    output_parser=StrOutputParser()
    chain=prompt|llm|output_parser
    response = chain.invoke({'query': query, 'context': context_str})
    customer_name = response.strip()
    if customer_name.lower() == 'none' or not customer_name:
        customer_name = None

    print("Getting Customers name ",customer_name)

    return {
        "customer_name": customer_name,
    }

def routing_node(s: State):
    new_state = dict(s)
    if s.get('customer_name'):
        new_state['route'] = 'process_emails'
    else:
        new_state['route'] = 'skip_emails'
        new_state['context_data'] = s.get('previous_chats', [])
    return new_state

def fetch_emails_wrapper(s: State):
    if s.get('route') != 'process_emails':
        return s  # skip: pass state unchanged
    return fetch_emails(s)

def split_data_in_chunks_wrapper(s: State):
    if s.get('route') != 'process_emails':
        return s
    return split_data_in_chunks(s)

def refinery_wrapper(s: State):
    return refine_results_with_llm(s)

def refine_results_with_llm(s:State):
    query=s['query']
    if s.get('customer_name'):
        data=s['context_data']
    else:
        data=s['previous_chats']
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
    print("Results refined from LLM")
    return {
        "messages":[response],
    }
### Agent Logic

os.environ['GROQ_API_KEY']=os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

from langchain_groq import ChatGroq

llm=ChatGroq(model="llama-3.3-70b-versatile")

graph = StateGraph(State)

graph.add_node("name_fetch", get_senders_name)
graph.add_node("routing", routing_node)
graph.add_node("fetch_emails_wrapper", fetch_emails_wrapper)
graph.add_node("chunk_splitter_wrapper", split_data_in_chunks_wrapper)
graph.add_node("refinery_wrapper", refinery_wrapper)


graph.set_entry_point("name_fetch")

graph.add_edge("name_fetch", "routing")
graph.add_edge("routing", "fetch_emails_wrapper")
graph.add_edge("fetch_emails_wrapper", "chunk_splitter_wrapper")
graph.add_edge("chunk_splitter_wrapper", "refinery_wrapper")
graph.add_edge("refinery_wrapper", END)

final_workflow=graph.compile()