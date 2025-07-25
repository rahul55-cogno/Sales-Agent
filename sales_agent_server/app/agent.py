from typing import Annotated,TypedDict
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph,END
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.messages import AIMessage
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from email_fetching import gmail_fetch_emails
from langchain_community.vectorstores.utils import filter_complex_metadata
from typing import Optional, Literal

load_dotenv()

email_user=os.getenv("EMAIL")
password=os.getenv("PASSWORD")

class State(TypedDict):
    messages:Annotated[list,add_messages]
    query:str
    raw_text:dict
    context_data:list
    email:str
    customer_name: str | None
    next_agent: str
    previous_chats: Optional[list]
    final_summary:str

def create_supervisor_chain():
    """Creates the supervisor decision chain"""
    supervisor_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a sales supervisor managing a team of sales agents:

1. fetch_emails -> Fetch emails from gmail of a specific customer **(only if customer_name is given)**
2. context_setter -> It get's the context from the email and sets it in the state> **(only if raw_text is present)**
3. refinery -> It refines results by taking context_data or previous chats (if customer_name not present)

**THE WORKFLOW I WANT**
If customer_name is not present ,then  call refinery
If customer_name is present.
if customer_name and raw_text is present call context_setter
if customer_name and raw_text and context_setter is present call refinery

Context and raw_text will be boolean values in the state to indicate if they are present or not.

**Current State**
- has_customer_name -> {customer_name}
- has_raw_text -> {raw_text}
- has_context_data -> {context_data}
- has_final_summary -> {final_summary}

Respond with ONLY the agent name9 (fetch_emails/context_setter/refinery) or if final_summary is given by llm then say 'DONE'.
"""),
        ("human", "Give me the appropriate agent name.")
    ])
    
    return supervisor_prompt | llm | StrOutputParser()

def supervisor_agent(state: State):
    try:
        context_data = state.get('context_data', [])
        raw_text = state.get('raw_text', [])
        final_summary = state.get('final_summary', [])

        # Fallback to LLM decision
        chain = create_supervisor_chain()
        decision = chain.invoke({
            'customer_name': state.get('customer_name',""),
            'context_data': len(context_data) > 0,
            'final_summary': final_summary,
            'raw_text': len(raw_text)>0
        })
        decision_text = decision.strip().lower()
        print(decision_text)

        mapping = {
            "fetch_emails": "fetch_emails",
            "context_setter": "context_setter",
            "refinery": "refinery",
            "done": "end"
        }
        next_agent = mapping.get(decision_text, "end")

        return {"messages": [AIMessage(content=f"Supervisor decided: {next_agent}")], "next_agent": next_agent}
    except Exception as e:
        print('An exception occurred ',e)


# Agent -> fetch_emails
def fetch_emails(s:State):
    print('From fetch_emails ',s['customer_name'])
    return gmail_fetch_emails(s["email"],s['customer_name'])

# Agent -> context_setter
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
            "next_agent":"supervisor"
        }
    except Exception as e:
        print("Error",e)

# senders_data
def get_senders_name(s:State):
    try:
        query=s['query']
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system",
                "You are an assistant that extracts the customer name the user is asking about."
                " You can get clues from the current query and also the context of previous chats.\n"
                "If you cannot identify a customer name, reply with exactly 'None'."),
                ("user",
                "Current Query: {query}"
                "Please extract only the customer name or respond 'None'.")
            ]
        )
        output_parser=StrOutputParser()
        chain=prompt|llm|output_parser
        response = chain.invoke({'query': query})
        customer_name = response.strip()
        if customer_name.lower() == 'none' or not customer_name:
            customer_name = None

        print("Getting Customers name ",customer_name)

        return {
            "customer_name": customer_name,
            "next_agent":"supervisor"
        }
    except Exception as e:
      print('An exception occurred ',e)

# refinery
def refine_results_with_llm(s:State):
    try:
        query=s['query']
        if s.get('customer_name'):
            data=s['context_data']
        else:
            data=s['previous_chats']
        prompt = ChatPromptTemplate.from_messages(
        [
            ("system", 
            "You are a helpful assistant. Using only the information provided in the following emails:\n\n{data}\n\ncreate a summary in exactly two clear and comprehensive paragraphs. Your summary should cover all the important points, decisions, and discussions present in the emails, merging the content into a logical, human-readable overview without referencing email names, dates, or any external information. Do not use bullet points, lists, or any formatting that requires external support. Focus on clarity and depth, keeping the total length between 200 and 300 words. Separate the two paragraphs with \n in between. If data is empty and not contain any relevant information then reply in one para that you don't know about what user is asking for."),
            ("user", "Question: {question}")
        ]
    )
        output_parser=StrOutputParser()
        chain=prompt|llm|output_parser
        response=chain.invoke({'question':query,'data': data})
        print(response)
        return {
            "final_summary":str(response),
            "next_agent":END
        }
    except Exception as e:
      print('An exception occurred ',e)

def router(state:State)->Literal["supervisor", "fetch_emails", "context_setter", "refinery", "__end__"]:
    next_agent=state.get('next_agent',"supervisor")
    if next_agent == "end":
        return END
    return next_agent

### Agent Logic
os.environ['GROQ_API_KEY']=os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

from langchain_groq import ChatGroq

llm=ChatGroq(model="llama-3.3-70b-versatile")

graph = StateGraph(State)

graph.add_node("name_fetch", get_senders_name)
graph.add_node("supervisor", supervisor_agent)
graph.add_node("fetch_emails", fetch_emails)
graph.add_node("context_setter", split_data_in_chunks)
graph.add_node("refinery", refine_results_with_llm)


graph.set_entry_point("name_fetch")
graph.add_conditional_edges("name_fetch", router, {"supervisor": "supervisor", END: END})

for node in ["supervisor", "fetch_emails", "context_setter", "refinery"]:
    graph.add_conditional_edges(
        node,
        router,
        {
            "supervisor": "supervisor",
            "fetch_emails": "fetch_emails",
            "context_setter": "context_setter",
            "refinery": "refinery",
            END: END
        }
    )

final_workflow=graph.compile()