"""
Streamlit Production User Interface for CSJMU AI Campus Assistant.
Phase 2 Upgrade: Modern, responsive, accessible CSJMU-branded web application
with ChatGPT/Gemini aesthetics, quick action category buttons, streaming,
citations, feedback system, light/dark mode, conversation export, and admin dashboard.
"""

import sys
import uuid
import json
import time
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import streamlit as st
from app.rag.rag import RAGPipeline
from app.core.config import config
from app.utils.utils import check_ollama_health
from app.analytics.database import db_manager

# Page Configuration
st.set_page_config(
    page_title="CSJMU AI Campus Assistant — Official University Portal",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSJMU Brand Theme CSS Injection
st.markdown("""
<style>
    /* CSJMU Primary Palette & CSS Tokens */
    :root {
        --csjmu-navy: #002B49;
        --csjmu-gold: #D4AF37;
        --csjmu-blue: #005691;
        --csjmu-bg-dark: #0F172A;
        --csjmu-card-dark: #1E293B;
        --csjmu-border-dark: #334155;
    }

    /* Global Typography */
    html, body, [class*="css"] {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Main Container Padding */
    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 2rem;
        max-width: 1200px;
    }

    /* Hero Banner Styling */
    .hero-container {
        background: linear-gradient(135deg, #002B49 0%, #005691 100%);
        color: white;
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 43, 73, 0.2);
        border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }
    .hero-subtitle {
        font-size: 1rem;
        opacity: 0.9;
        max-width: 800px;
    }
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(34, 197, 94, 0.2);
        color: #4ADE80;
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid rgba(74, 222, 128, 0.3);
    }

    /* Quick Action Button Grid */
    .quick-action-header {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--csjmu-gold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.8rem;
    }

    /* Message Bubble Cards */
    .stChatMessage {
        border-radius: 12px;
        margin-bottom: 1rem;
    }
    
    /* Citation Expander Box */
    .citation-box {
        background: rgba(51, 65, 85, 0.4);
        border-left: 4px solid var(--csjmu-gold);
        padding: 0.8rem;
        border-radius: 6px;
        margin-top: 0.5rem;
        font-size: 0.85rem;
    }

    /* Footer Styling */
    .csjmu-footer {
        text-align: center;
        padding: 2rem 0 1rem 0;
        border-top: 1px solid var(--csjmu-border-dark);
        color: #94A3B8;
        font-size: 0.85rem;
        margin-top: 3rem;
    }
    .csjmu-footer a {
        color: var(--csjmu-gold);
        text-decoration: none;
    }

</style>
""", unsafe_allow_html=True)


# Initialize Pipeline in Session State
@st.cache_resource
def get_rag_pipeline():
    """Initializes and caches RAGPipeline instance across app reruns."""
    return RAGPipeline()


# Session State Initialization
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "👋 Namaste! Welcome to **Chhatrapati Shahu Ji Maharaj University (CSJMU) & UIET Kanpur** AI Assistant.\n\nHow can I help you today with admissions, courses, hostels, fee structure, placements, or faculty?",
            "sources": None
        }
    ]

if "pending_question" not in st.session_state:
    st.session_state.pending_question = None

if "theme_mode" not in st.session_state:
    st.session_state.theme_mode = "Dark"


# Sidebar Configuration
with st.sidebar:
    st.markdown("### 🎓 CSJMU Assistant")
    st.caption("Official AI Knowledge Portal")
    st.divider()

    # Session Management
    st.subheader("💬 Session Management")
    if st.button("➕ Start New Chat", use_container_width=True):
        st.session_state.session_id = str(uuid.uuid4())
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "👋 Namaste! Welcome to **CSJMU & UIET Kanpur** AI Assistant. Ask me anything!",
                "sources": None
            }
        ]
        st.toast("Started new chat session!", icon="✨")
        st.rerun()

    # Chat Export
    chat_export_json = json.dumps(st.session_state.messages, indent=2)
    st.download_button(
        label="📥 Export Chat History (JSON)",
        data=chat_export_json,
        file_name=f"csjmu_chat_{st.session_state.session_id[:8]}.json",
        mime="application/json",
        use_container_width=True
    )

    st.divider()

    # Health & Diagnostics Status
    health_info = check_ollama_health(config.OLLAMA_BASE_URL)
    if health_info.get("connected"):
        st.success(f"🟢 Ollama Server Online (`{config.OLLAMA_BASE_URL}`)")
    else:
        st.error(f"🔴 Ollama Offline (`{config.OLLAMA_BASE_URL}`)")
        st.caption("Ensure `ollama serve` is active.")

    st.divider()

    # Pipeline Retrieval Settings
    st.subheader("⚙️ Engine Parameters")
    top_k = st.slider("Context Passages (Top K)", min_value=1, max_value=20, value=config.DEFAULT_K)
    use_hybrid = st.toggle("Hybrid Search (Vector + BM25)", value=True)
    prompt_mode = st.radio("Prompt Strategy", ["Strict Assistant", "Flexible Context"], index=0)
    strict_prompt = prompt_mode == "Strict Assistant"

    st.divider()

    # Rebuild Database Action
    st.subheader("🛠️ Database Admin")
    if st.button("🔄 Rebuild Vector DB", use_container_width=True):
        with st.spinner("Rebuilding Chroma Vector Store & BM25 Index..."):
            try:
                pipeline = get_rag_pipeline()
                res = pipeline.rebuild_database()
                st.success(res["message"])
                st.toast("Vector DB & BM25 re-indexed successfully!", icon="✅")
            except Exception as e:
                st.error(f"Database rebuild failed: {e}")

    st.caption("CSJMU AI System v2.0 • Powered by LangChain + Chroma + Ollama (`llama3.2:3b`)")


# Main Interface Tabs
tab_chat, tab_analytics, tab_about = st.tabs(["💬 University Assistant", "📊 Admin Analytics", "ℹ️ About & Help"])

# ==========================================
# TAB 1: CHATBOT INTERFACE
# ==========================================
with tab_chat:
    # Hero Landing Header Banner
    st.markdown("""
    <div class="hero-container">
        <div class="hero-title">
            <span>🎓</span> CSJMU AI Campus Assistant
        </div>
        <div class="hero-subtitle">
            Official Intelligent Assistant for <strong>Chhatrapati Shahu Ji Maharaj University & UIET Kanpur</strong>.
            Get instant guidance on Admissions, Courses, Fee Structure, Hostels, Placements, and Campus Facilities.
        </div>
        <div style="margin-top: 1rem;">
            <span class="status-badge">🟢 System Online & Ready</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Quick Action Buttons Grid
    st.markdown('<div class="quick-action-header">⚡ Quick Action Topics</div>', unsafe_allow_html=True)
    
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        if st.button("📝 Admissions", use_container_width=True):
            st.session_state.pending_question = "What is the admission process and guidelines for CSJMU and UIET Kanpur?"
    with col2:
        if st.button("🏠 Hostels", use_container_width=True):
            st.session_state.pending_question = "What hostel facilities, names, rules, and curfew timings exist at CSJMU?"
    with col3:
        if st.button("💼 Placements", use_container_width=True):
            st.session_state.pending_question = "What is the placement record, highest package, and top recruiting companies at UIET Kanpur?"
    with col4:
        if st.button("💰 Fee Structure", use_container_width=True):
            st.session_state.pending_question = "What is the fee structure for B.Tech, MCA, and MBA programs at CSJMU?"
    with col5:
        if st.button("🏫 Departments", use_container_width=True):
            st.session_state.pending_question = "What engineering departments and schools exist in UIET & CSJMU?"

    col6, col7, col8, col9, col10 = st.columns(5)
    with col6:
        if st.button("📚 Eligibility", use_container_width=True):
            st.session_state.pending_question = "What is the eligibility criteria for B.Tech Computer Science and MCA?"
    with col7:
        if st.button("👨‍🏫 Faculty", use_container_width=True):
            st.session_state.pending_question = "Who is the Director of UIET Kanpur and HOD of Computer Science?"
    with col8:
        if st.button("🏊 Facilities", use_container_width=True):
            st.session_state.pending_question = "What sports, swimming pool, health center, and library facilities exist on campus?"
    with col9:
        if st.button("🎓 Scholarships", use_container_width=True):
            st.session_state.pending_question = "What scholarships and fee reimbursement schemes are available for CSJMU students?"
    with col10:
        if st.button("🤝 Alumni", use_container_width=True):
            st.session_state.pending_question = "Who are some distinguished alumni of CSJMU?"

    st.divider()

    # Display Existing Chat History
    for idx, message in enumerate(st.session_state.messages):
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

            # Source Citations Collapsible Card
            if message.get("sources"):
                with st.expander("📚 View Document Sources & Context Snippets"):
                    for s_idx, src in enumerate(message["sources"], 1):
                        st.markdown(
                            f"**Source {s_idx}:** `{src.get('source')}` | **Type:** `{src.get('doc_type')}`\n"
                            f"> *\"{src.get('content_snippet')}...\"*"
                        )

            # Inline Feedback Buttons (for Assistant messages)
            if message["role"] == "assistant" and idx > 0:
                f_col1, f_col2, f_space = st.columns([1, 1, 10])
                with f_col1:
                    if st.button("👍", key=f"up_{idx}"):
                        db_manager.log_feedback(
                            session_id=st.session_state.session_id,
                            question=st.session_state.messages[idx-1]["content"] if idx > 0 else "N/A",
                            answer=message["content"],
                            rating=1
                        )
                        st.toast("Thank you for your feedback! 👍", icon="✅")
                with f_col2:
                    if st.button("👎", key=f"down_{idx}"):
                        db_manager.log_feedback(
                            session_id=st.session_state.session_id,
                            question=st.session_state.messages[idx-1]["content"] if idx > 0 else "N/A",
                            answer=message["content"],
                            rating=-1
                        )
                        st.toast("Feedback recorded. We will improve! 👎", icon="ℹ️")

    # Handle Pending Quick Action Question
    query_to_process = None
    if st.session_state.pending_question:
        query_to_process = st.session_state.pending_question
        st.session_state.pending_question = None

    # Chat Input Box
    user_query = st.chat_input("Ask a question about CSJMU (e.g. 'What is the eligibility for B.Tech Computer Science?')...")
    if user_query:
        query_to_process = user_query

    # Process Query
    if query_to_process:
        # Display User Message
        st.session_state.messages.append({"role": "user", "content": query_to_process, "sources": None})
        with st.chat_message("user"):
            st.markdown(query_to_process)

        # Generate Assistant Response
        with st.chat_message("assistant"):
            response_placeholder = st.empty()
            full_response = ""
            sources = None

            try:
                pipeline = get_rag_pipeline()
                
                # Fetch query answer with sources
                res_dict = pipeline.ask(
                    question=query_to_process,
                    k=top_k,
                    strict_prompt=strict_prompt,
                    return_sources=True,
                    session_id=st.session_state.session_id,
                    use_hybrid=use_hybrid
                )
                
                full_response = res_dict.get("answer", "")
                sources = res_dict.get("sources", [])

                # Typing animation effect
                for i in range(0, len(full_response), 4):
                    response_placeholder.markdown(full_response[:i+4] + "▌")
                    time.sleep(0.01)

                response_placeholder.markdown(full_response)

                if sources:
                    with st.expander("📚 View Document Sources & Context Snippets"):
                        for s_idx, src in enumerate(sources, 1):
                            st.markdown(
                                f"**Source {s_idx}:** `{src.get('source')}` | **Type:** `{src.get('doc_type')}`\n"
                                f"> *\"{src.get('content_snippet')}...\"*"
                            )

            except Exception as e:
                full_response = f"⚠️ An error occurred while processing your query: {str(e)}"
                response_placeholder.error(full_response)

        # Save to Chat History
        st.session_state.messages.append({
            "role": "assistant",
            "content": full_response,
            "sources": sources
        })
        st.rerun()

# ==========================================
# TAB 2: ADMIN ANALYTICS
# ==========================================
with tab_analytics:
    st.header("📊 System Analytics & Performance Dashboard")
    st.caption("Live usage metrics, response latency, and user feedback summary.")

    analytics_data = db_manager.get_analytics_summary()

    a_col1, a_col2, a_col3, a_col4 = st.columns(4)
    with a_col1:
        st.metric("Total Queries Processed", analytics_data["total_queries"])
    with a_col2:
        st.metric("Avg Response Time", f"{analytics_data['avg_response_time_sec']}s")
    with a_col3:
        st.metric("Cache Hit Rate", analytics_data["cache_hits"])
    with a_col4:
        st.metric("User Satisfaction", f"{analytics_data['satisfaction_pct']}%")

    st.divider()

    b_col1, b_col2 = st.columns(2)
    with b_col1:
        st.subheader("👍 User Feedback Ratio")
        st.write(f"**Positive Feedback (👍):** {analytics_data['thumbs_up']}")
        st.write(f"**Negative Feedback (👎):** {analytics_data['thumbs_down']}")
    with b_col2:
        st.subheader("🟢 System Health Overview")
        st.write(f"**Collection:** `{config.COLLECTION_NAME}`")
        st.write(f"**Embedding Model:** `{config.EMBEDDING_MODEL}`")
        st.write(f"**LLM Model:** `{config.LLM_MODEL}`")

# ==========================================
# TAB 3: ABOUT & HELP
# ==========================================
with tab_about:
    st.header("ℹ️ About CSJMU AI Campus Assistant")
    st.markdown("""
    ### 🏛️ University Overview
    **Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur** (formerly Kanpur University) is a premier state university accredited with NAAC A++ grade.
    The **University Institute of Engineering & Technology (UIET)** offers world-class engineering, technology, and applied science programs.

    ---

    ### 🤖 Chatbot Capabilities
    - **Retrieval-Augmented Generation (RAG):** Powered by LangChain, Chroma DB, and local Ollama LLMs.
    - **Hybrid Search:** Combines dense vector similarity with sparse BM25 keyword matching for high-precision retrieval.
    - **Strict Institutional Knowledge:** Delivers accurate answers sourced directly from official CSJMU dataset records.

    ---

    ### 📞 Contact & Support
    - **Official Website:** [https://csjmu.ac.in](https://csjmu.ac.in)
    - **Admission Cell:** `admission@csjmu.ac.in`
    - **Hostel Helpdesk:** `hostel.helpdesk@csjmu.ac.in`
    - **Address:** CSJMU Campus, Kalyanpur, Kanpur, Uttar Pradesh - 208024
    """)

# Footer
st.markdown("""
<div class="csjmu-footer">
    © 2026 <strong>Chhatrapati Shahu Ji Maharaj University (CSJMU) & UIET Kanpur</strong>. All rights reserved.<br>
    Built with ❤️ using LangChain, Chroma DB, FastAPI, and Streamlit.
</div>
""", unsafe_allow_html=True)
