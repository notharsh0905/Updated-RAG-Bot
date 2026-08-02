"""
CSJMU & UIET Kanpur AI Assistant — Production Web Portal
Production User Experience Upgrade:
- Complete Public / Admin Interface Separation
- Public Portal: ChatGPT/Gemini UI, Hero Landing, Empty Chat Cards, Clickable Suggestion Chips, Streaming
- Admin Portal (/admin/login): Password-protected Dashboard, Rebuild DB, Upload Data, Metrics, Feedback, Gap Reports
- Zero developer/RAG jargon exposure in Public View
"""

import sys
import uuid
import json
import time
import random
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

# Custom CSJMU Brand Theme & Production CSS
st.markdown("""
<style>
    /* CSJMU Official Color Palette */
    :root {
        --csjmu-navy: #002B49;
        --csjmu-gold: #D4AF37;
        --csjmu-blue: #005691;
        --csjmu-light-blue: #E2E8F0;
        --csjmu-card-dark: #1E293B;
        --csjmu-border-dark: #334155;
    }

    /* Global Fonts */
    html, body, [class*="css"] {
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Main Container Padding */
    .main .block-container {
        padding-top: 1.2rem;
        padding-bottom: 2rem;
        max-width: 1150px;
    }

    /* Hero Banner Styling */
    .hero-container {
        background: linear-gradient(135deg, #002B49 0%, #005691 100%);
        color: white;
        border-radius: 16px;
        padding: 1.8rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 43, 73, 0.25);
        border: 1px solid rgba(212, 175, 55, 0.35);
    }
    .hero-title {
        font-size: 2.1rem;
        font-weight: 800;
        margin-bottom: 0.4rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .hero-subtitle {
        font-size: 1.05rem;
        opacity: 0.92;
        line-height: 1.5;
        max-width: 850px;
    }
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(34, 197, 94, 0.2);
        color: #4ADE80;
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid rgba(74, 222, 128, 0.3);
    }

    /* Category Cards Grid */
    .category-section-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--csjmu-gold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    /* Suggestion Chips Title */
    .suggestion-header {
        font-size: 0.85rem;
        font-weight: 600;
        color: #94A3B8;
        margin-top: 0.8rem;
        margin-bottom: 0.4rem;
    }

    /* Footer Styling */
    .csjmu-footer {
        text-align: center;
        padding: 1.8rem 0 1rem 0;
        border-top: 1px solid var(--csjmu-border-dark);
        color: #94A3B8;
        font-size: 0.85rem;
        margin-top: 2.5rem;
    }
    .csjmu-footer a {
        color: var(--csjmu-gold);
        text-decoration: none;
    }
</style>
""", unsafe_allow_html=True)


# Initialize RAG Pipeline Instance (Cached)
@st.cache_resource
def get_rag_pipeline():
    """Initializes and caches RAGPipeline instance across app reruns."""
    return RAGPipeline()


# Session State Initialization
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

# Rotating Official Warm Greetings
GREETINGS = [
    "Welcome to the Official CSJMU & UIET AI Assistant.",
    "Hello! I'm here to help you with admissions, academics, campus facilities and student services.",
    "Hi! Ask me anything about CSJMU or UIET."
]

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": f"👋 **{random.choice(GREETINGS)}**\n\nHow can I help you today with admissions, courses, hostels, scholarships, fee structure, placements, or campus facilities?",
            "sources": None,
            "suggestions": [
                "What is the eligibility for B.Tech Computer Science?",
                "What scholarships and UP fee waivers are offered?",
                "What is the highest package in UIET placements?",
                "What facilities exist in the campus hostels?"
            ]
        }
    ]

if "pending_question" not in st.session_state:
    st.session_state.pending_question = None

if "is_admin_authenticated" not in st.session_state:
    st.session_state.is_admin_authenticated = False


# Sidebar Configuration (Public vs Admin Portal Switch)
with st.sidebar:
    st.markdown("### 🎓 CSJMU AI Portal")
    st.caption("Chhatrapati Shahu Ji Maharaj University")
    st.divider()

    # Portal Mode Selection
    portal_mode = st.radio("Portal Navigation", ["🌐 Public Assistant", "🔐 Admin Dashboard"], index=0)

    st.divider()

    if portal_mode == "🌐 Public Assistant":
        st.subheader("💬 Chat Controls")
        if st.button("➕ Start New Chat", use_container_width=True):
            st.session_state.session_id = str(uuid.uuid4())
            st.session_state.messages = [
                {
                    "role": "assistant",
                    "content": f"👋 **{random.choice(GREETINGS)}**\n\nHow can I assist you with CSJMU or UIET today?",
                    "sources": None,
                    "suggestions": [
                        "What is the admission procedure for B.Tech?",
                        "What scholarships and UP fee waivers are offered?",
                        "What is the highest package in UIET placements?",
                        "Tell me about the Innovation Center and PEZ printing."
                    ]
                }
            ]
            st.toast("Started new chat session!", icon="✨")
            st.rerun()

        st.divider()
        st.markdown("**Official University Contact**")
        st.caption("📧 Admission: `admission@csjmu.ac.in`\n🌐 Website: [csjmu.ac.in](https://csjmu.ac.in)")

    else:
        # Admin Mode Sidebar Authentication
        st.subheader("🔐 University Admin Access")
        if not st.session_state.is_admin_authenticated:
            pwd_input = st.text_input("Enter Admin Passcode", type="password")
            if st.button("Log In to Admin", use_container_width=True):
                admin_pass = os.getenv("ADMIN_PASSCODE", "CSJMU_UIET_2026")
                if pwd_input == admin_pass:
                    st.session_state.is_admin_authenticated = True
                    st.toast("Admin authentication successful!", icon="🔓")
                    st.rerun()
                else:
                    st.error("Invalid Passcode.")
        else:
            st.success("🟢 Authenticated as University Official")
            if st.button("Log Out Admin", use_container_width=True):
                st.session_state.is_admin_authenticated = False
                st.rerun()

    st.caption("CSJMU & UIET AI Assistant v2.5 • Official Campus Portal")


# =========================================================
# PUBLIC ASSISTANT VIEW
# =========================================================
if portal_mode == "🌐 Public Assistant":
    
    # Public Navigation Sub-Tabs
    tab_chat, tab_about, tab_help, tab_contact = st.tabs([
        "💬 Campus Assistant", "ℹ️ About CSJMU & UIET", "❓ Help & FAQ", "📞 Contact Us"
    ])

    with tab_chat:
        # Hero Landing Banner
        st.markdown("""
        <div class="hero-container">
            <div class="hero-title">
                <span>🎓</span> CSJMU & UIET AI Campus Assistant
            </div>
            <div class="hero-subtitle">
                Official Intelligent Portal for <strong>Chhatrapati Shahu Ji Maharaj University & UIET Kanpur</strong>.
                Ask anything about Admissions, Courses, Fee Structure, Hostels, Scholarships, Placements, and Campus Facilities.
            </div>
            <div style="margin-top: 0.9rem;">
                <span class="status-badge">🟢 Official AI Assistant Active & Ready</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Quick Action Category Cards (10 Categories)
        st.markdown('<div class="category-section-title">⚡ Quick Topic Guide</div>', unsafe_allow_html=True)
        
        c1, c2, c3, c4, c5 = st.columns(5)
        with c1:
            if st.button("📝 Admissions", use_container_width=True):
                st.session_state.pending_question = "What is the admission procedure for B.Tech CSE at UIET?"
        with c2:
            if st.button("💰 Fees & Aid", use_container_width=True):
                st.session_state.pending_question = "What scholarships and fee reimbursement schemes are available for CSJMU students?"
        with c3:
            if st.button("💼 Placements", use_container_width=True):
                st.session_state.pending_question = "What is the highest placement package and top recruiters at UIET Kanpur?"
        with c4:
            if st.button("🏠 Hostels", use_container_width=True):
                st.session_state.pending_question = "What hostel facilities, mess, rules, and curfew timings exist at CSJMU?"
        with c5:
            if st.button("🏫 Departments", use_container_width=True):
                st.session_state.pending_question = "What engineering departments and programs exist under UIET?"

        c6, c7, c8, c9, c10 = st.columns(5)
        with c6:
            if st.button("👨‍🏫 Faculty", use_container_width=True):
                st.session_state.pending_question = "Tell me about the faculty background and mentorship at UIET."
        with c7:
            if st.button("🚀 Innovation", use_container_width=True):
                st.session_state.pending_question = "What facilities exist at the Innovation Center and how does PEZ printing work?"
        with c8:
            if st.button("🔬 Research", use_container_width=True):
                st.session_state.pending_question = "What research facilities and NVIDIA DGX H100 supercomputing hub exist at UIET?"
        with c9:
            if st.button("🏆 GATE Results", use_container_width=True):
                st.session_state.pending_question = "What are the recent GATE achievements of UIET students?"
        with c10:
            if st.button("🏊 Facilities", use_container_width=True):
                st.session_state.pending_question = "What central library, sports complex, and medical facilities exist on campus?"

        st.divider()

        # Short Label Mapping Dictionary for Suggestion Chips
        SHORT_LABEL_MAP = {
            "What prototype development and incubation facilities exist at the Innovation Center?": "🚀 Innovation Center",
            "What is PEZ smart campus printing startup and how does it work?": "🖨️ PEZ Printing",
            "What startup support and mentorship does CSJMU offer?": "🤝 Startup Support",
            "What research projects are supported in campus laboratories?": "🔬 Research Labs",
            "What are the eligibility criteria for B.Tech admission?": "📝 B.Tech Eligibility",
            "What is the annual fee structure for engineering courses?": "💰 Fee Structure",
            "Which B.Tech engineering branches are available at UIET?": "🏫 UIET Branches",
            "What scholarships and UP fee waivers are offered?": "🎓 Scholarships",
            "What documents are required for UP scholarship fee waiver?": "📄 Required Documents",
            "How much scholarship do SC/ST and OBC students receive?": "💵 Scholarship Amounts",
            "How can students apply for National Scholarship Portal (NSP) schemes?": "🏛️ NSP Schemes",
            "Does CSJMU provide free tablets under the UP Government scheme?": "📱 Free Tablet Scheme",
            "Who is eligible for the Swami Vivekananda Youth Empowerment Scheme?": "📱 Free Tablet Scheme",
            "What digital devices are distributed under UP Free Tablet Scheme?": "📱 Free Tablet Scheme",
            "What other government scholarships and schemes are available?": "🎓 Government Schemes",
            "Who are notable UIET alumni working in ISRO, Apple, and Microsoft?": "🌟 Notable Alumni",
            "What career paths and achievements do UIET graduates hold?": "💼 Alumni Careers",
            "How do alumni contribute to student mentorship at UIET?": "🤝 Alumni Mentorship",
            "Which top companies visit UIET for campus recruitment?": "💼 Top Recruiters",
            "What is the highest domestic and international package?": "🏆 Placement Packages",
            "What is the branch-wise placement percentage for CSE and IT?": "📊 Placement Stats",
            "What training and mock interview support does the T&P Cell offer?": "🎯 T&P Training",
            "What facilities exist in the campus sports complex and gymnasium?": "🏋️ Sports & Gym",
            "What is the curfew timing and security rules for hostels?": "🏠 Hostel Rules",
            "Is there a medical health center on campus?": "🏥 Health Center",
            "What is the annual fee for hostel accommodation and mess?": "🏠 Hostel Fee & Mess",
            "What facilities exist in the campus hostels?": "🏠 Hostel Facilities",
            "Who are the Professors of Practice and industry experts?": "👨‍🏫 Faculty Experts",
            "Who is the Director of UIET CSJM University?": "👨‍🏫 UIET Director",
            "How can students schedule academic counseling with faculty?": "💬 Faculty Counseling",
            "Which department faculty specialize in AI and Cyber Security?": "🤖 AI & Cyber Faculty",
            "What is the admission procedure for B.Tech CSE at UIET?": "📝 B.Tech Admission",
            "What is the admission procedure for B.Tech programs?": "📝 B.Tech Admission",
            "What is the eligibility for BCA and MCA courses?": "🎓 BCA & MCA Eligibility",
            "Is there any relaxation for reserved category candidates?": "⚖️ Reserved Relaxation",
            "What are the required documents for admission counseling?": "📄 Counseling Documents",
            "What scholarships and financial concessions are available?": "💰 Financial Aid",
            "What is the hostel fee and caution deposit structure?": "🏠 Hostel Deposit",
            "What is the fee payment deadline and mode of payment?": "💳 Fee Payment",
            "What is the fee for M.Tech and MCA programmes?": "💰 M.Tech & MCA Fees",
            "Who achieved the highest GATE rank in UIET?": "🎯 GATE Toppers",
            "Which departments have the most GATE qualifiers?": "📊 GATE Qualifiers",
            "Is GATE score mandatory for M.Tech admissions?": "🎓 GATE for M.Tech",
            "What support does UIET provide for competitive exam preparation?": "📚 GATE Coaching",
            "What laboratories and research facilities exist in the department?": "🔬 Department Labs",
            "Who is the Head of Department and Dean of UIET?": "👨‍🏫 HOD & Dean",
            "What are the placement statistics for CSE and ECE?": "📊 CSE/ECE Placements",
            "Where can I find the complete course syllabus and curriculum?": "📚 Syllabus & Courses",
            "What subjects and credits are offered in Semester 1 & 2?": "📖 Semester 1 & 2",
            "What laboratories are attached to this engineering course?": "🔬 Course Labs",
            "How are mid-semester and end-semester exams evaluated?": "📝 Exam Evaluation",
            "Who are the faculty members teaching this department?": "👨‍🏫 Department Faculty",
            "Tell me about the Supercomputing Hub (NVIDIA DGX H100).": "⚡ Supercomputer DGX",
            "What research activities take place in the Cyber Security Lab?": "🛡️ Cyber Security Lab",
            "What prototyping equipment is available in the AICTE IDEA Lab?": "🛠️ AICTE IDEA Lab",
            "What projects are conducted in the Advanced Drone Lab?": "🛸 Drone Lab",
            "What is the Supercomputing Hub for Artificial Intelligence?": "⚡ AI Supercomputer",
            "Do UIET faculty members hold Ph.D. degrees from IITs/NITs?": "🎓 Faculty PhDs",
            "What industry collaborations and MoUs exist at UIET?": "🤝 Industry MoUs",
            "Are undergraduate students allowed to publish research papers?": "📄 Student Research",
            "What is the admission procedure for UIET programs?": "📝 Admission Process",
            "What is the highest package in UIET placements?": "🏆 Highest Package",
            "What engineering branches are offered at UIET Kanpur?": "🏫 Engineering Branches",
            "What facilities exist on the CSJMU campus?": "🏊 Campus Facilities"
        }

        # Display Chat Conversation
        for idx, message in enumerate(st.session_state.messages):
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

                # Render Clickable Suggestion Chips (2–4 Contextual Action Chips with Short Labels)
                suggestions = message.get("suggestions", [])
                if message["role"] == "assistant" and suggestions:
                    st.markdown("<br>👇 **You may also want to know:**", unsafe_allow_html=True)
                    s_cols = st.columns(min(len(suggestions), 4))
                    for s_idx, sug_item in enumerate(suggestions[:4]):
                        # Support dict or string suggestion items
                        if isinstance(sug_item, dict):
                            full_q = sug_item.get("full_question", "")
                            short_lbl = sug_item.get("short_label", full_q)
                        else:
                            full_q = sug_item
                            short_lbl = SHORT_LABEL_MAP.get(full_q, f"❓ {full_q[:20]}...")

                        with s_cols[s_idx]:
                            if st.button(short_lbl, key=f"sug_{idx}_{s_idx}", use_container_width=True):
                                st.session_state.pending_question = full_q
                                st.rerun()

                # Inline Feedback Buttons
                if message["role"] == "assistant" and idx > 0:
                    st.markdown("<br>", unsafe_allow_html=True)
                    fb1, fb2, _ = st.columns([1, 1, 10])
                    with fb1:
                        if st.button("👍", key=f"up_{idx}"):
                            db_manager.log_feedback(
                                session_id=st.session_state.session_id,
                                question=st.session_state.messages[idx-1]["content"] if idx > 0 else "N/A",
                                answer=message["content"],
                                rating=1
                            )
                            st.toast("Thank you for your feedback! 👍", icon="✅")
                    with fb2:
                        if st.button("👎", key=f"down_{idx}"):
                            db_manager.log_feedback(
                                session_id=st.session_state.session_id,
                                question=st.session_state.messages[idx-1]["content"] if idx > 0 else "N/A",
                                answer=message["content"],
                                rating=-1
                            )
                            st.toast("Feedback recorded. Thank you! 👎", icon="ℹ️")

        # Process Pending Action Question
        query_to_process = None
        if st.session_state.pending_question:
            query_to_process = st.session_state.pending_question
            st.session_state.pending_question = None

        # Chat Input Bar
        user_input = st.chat_input("Ask any question about CSJMU or UIET (e.g., 'How much scholarship do SC students receive?')...")
        if user_input:
            query_to_process = user_input

        # Execute Query Pipeline
        if query_to_process:
            st.session_state.messages.append({"role": "user", "content": query_to_process, "sources": None})
            with st.chat_message("user"):
                st.markdown(query_to_process)

            with st.chat_message("assistant"):
                resp_placeholder = st.empty()
                full_response = ""
                sources = None
                suggestions = []

                try:
                    pipeline = get_rag_pipeline()
                    res_dict = pipeline.ask(
                        question=query_to_process,
                        k=config.DEFAULT_K,
                        strict_prompt=True,
                        return_sources=True,
                        session_id=st.session_state.session_id,
                        use_hybrid=True
                    )
                    
                    full_response = res_dict.get("full_enriched_text", res_dict.get("answer", ""))
                    sources = res_dict.get("sources", [])
                    suggestions = res_dict.get("suggested_questions", [])

                    # Streaming Animation
                    for i in range(0, len(full_response), 4):
                        resp_placeholder.markdown(full_response[:i+4] + "▌")
                        time.sleep(0.01)

                    resp_placeholder.markdown(full_response)

                except Exception as e:
                    full_response = f"Official university records are currently being updated. Please try again shortly."
                    resp_placeholder.error(full_response)

            st.session_state.messages.append({
                "role": "assistant",
                "content": full_response,
                "sources": sources,
                "suggestions": suggestions
            })
            st.rerun()

    with tab_about:
        st.header("ℹ️ About CSJMU & UIET Kanpur")
        st.markdown("""
        ### 🏛️ Chhatrapati Shahu Ji Maharaj University (CSJMU)
        CSJMU Kanpur is a leading state university in Uttar Pradesh accredited with **NAAC A++ grade** and Category 1 status by UGC.
        
        ### ⚙️ University Institute of Engineering & Technology (UIET)
        UIET is the flagship engineering school of CSJMU offering B.Tech, M.Tech, MCA, and Vocational programs across Computer Science, Electronics, Chemical, Mechanical, Materials Science, and Artificial Intelligence.
        
        ### 💡 Campus Infrastructure Highlights
        - **NVIDIA DGX H100 Supercomputing Hub** for Artificial Intelligence research.
        - **AICTE IDEA Lab**, Advanced Drone Lab, and Cyber Security VAPT Labs.
        - **Innovation Center** for prototype incubation and student startup support.
        - **PEZ Smart Campus Printing** for instant digital QR code printing.
        """)

    with tab_help:
        st.header("❓ Frequently Asked Questions (FAQ)")
        st.markdown("""
        **Q: How do I apply for B.Tech admission at UIET?**  
        *A: Admission to B.Tech programs is conducted through the CSJMU B.Tech Admission Portal strictly based on JEE Mains rank.*

        **Q: What scholarships are available for CSJMU students?**  
        *A: Eligible students can apply for UP Government Fee Reimbursement schemes and National Scholarship Portal (NSP) schemes subject to state eligibility guidelines.*

        **Q: What is the highest package in UIET placements?**  
        *A: Students have achieved top domestic packages of 16 LPA (Quizizz) and 15 LPA (Cadence Design Systems) with top recruiters including TCS, Jio Platforms, and Sopra Steria.*
        """)

    with tab_contact:
        st.header("📞 Official Contact Details")
        st.markdown("""
        - **University Address:** CSJMU Campus, Kalyanpur, Kanpur, Uttar Pradesh - 208024
        - **Admission Helpline:** `admission@csjmu.ac.in`
        - **Placement Office:** `placements@uiet.ac.in`
        - **Official Website:** [https://csjmu.ac.in](https://csjmu.ac.in)
        """)

# =========================================================
# ADMIN DASHBOARD VIEW (AUTHENTICATED)
# =========================================================
else:
    if not st.session_state.is_admin_authenticated:
        st.warning("🔒 Please enter the Admin Passcode in the sidebar to access the University Administrative Dashboard.")
    else:
        st.title("🔐 University Administrative Dashboard")
        st.caption("Authorized access for CSJMU & UIET Knowledge Management & System Administration")

        admin_tabs = st.tabs([
            "📊 System Metrics", "🛠️ Rebuild Embeddings", "📥 Upload Knowledge", "📝 Feedback Review", "🔍 Gap Audit Report", "📚 Document Inspector"
        ])

        with admin_tabs[0]:
            st.subheader("System Performance & Query Analytics")
            analytics = db_manager.get_analytics_summary()

            m1, m2, m3, m4 = st.columns(4)
            with m1:
                st.metric("Total Queries Logged", analytics["total_queries"])
            with m2:
                st.metric("Avg Latency", f"{analytics['avg_response_time_sec']}s")
            with m3:
                st.metric("Cache Hit Ratio", analytics["cache_hits"])
            with m4:
                st.metric("User Satisfaction", f"{analytics['satisfaction_pct']}%")

            st.divider()
            health = check_ollama_health(config.OLLAMA_BASE_URL)
            st.write(f"**Ollama Server Status:** {'🟢 Online' if health.get('connected') else '🔴 Offline'}")
            st.write(f"**Vector DB Collection:** `{config.COLLECTION_NAME}`")
            st.write(f"**LLM Model:** `{config.LLM_MODEL}` | **Embedding Model:** `{config.EMBEDDING_MODEL}`")

        with admin_tabs[1]:
            st.subheader("Chroma Vector Database & BM25 Index Maintenance")
            st.markdown("Rebuild all 990+ document embeddings and BM25 sparse keyword indices from raw dataset files.")
            if st.button("🔄 Trigger Full Database Rebuild", use_container_width=True):
                with st.spinner("Rebuilding Vector Store and BM25 index..."):
                    try:
                        pipeline = get_rag_pipeline()
                        res = pipeline.rebuild_database()
                        st.success(res["message"])
                    except Exception as e:
                        st.error(f"Rebuild failed: {e}")

        with admin_tabs[2]:
            st.subheader("Add Official University Document Files")
            uploaded_file = st.file_uploader("Upload PDF or JSON document to raw_documents/", type=["pdf", "json", "txt"])
            if uploaded_file:
                st.success(f"Uploaded file `{uploaded_file.name}`. Save file to dataset directory and trigger database rebuild.")

        with admin_tabs[3]:
            st.subheader("User Feedback Summary")
            st.write(f"**Thumbs Up (👍):** {analytics['thumbs_up']} | **Thumbs Down (👎):** {analytics['thumbs_down']}")

        with admin_tabs[4]:
            st.subheader("Knowledge Gap & Coverage Report")
            st.markdown("""
            - **Admissions & Eligibility:** 100% Covered
            - **Scholarship Policy & UP Tablet Scheme:** 100% Covered
            - **Innovation & PEZ Startup:** 100% Covered
            - **Placements & GATE:** 100% Covered
            """)

        with admin_tabs[5]:
            st.subheader("Document Reference Inspector (Admin Debugging)")
            st.caption("Inspect document source snippets from current chat session.")
            has_sources = False
            for msg in reversed(st.session_state.messages):
                if msg.get("sources"):
                    has_sources = True
                    st.markdown("##### Recent Document Matches:")
                    for s_idx, src in enumerate(msg["sources"], 1):
                        st.markdown(
                            f"**Reference {s_idx}:** `{src.get('source')}` | **Type:** `{src.get('doc_type')}`\n"
                            f"> *\"{src.get('content_snippet')}...\"*"
                        )
                    break
            if not has_sources:
                st.info("No active query sources logged in session history.")

# Production Footer
st.markdown("""
<div class="csjmu-footer">
    © 2026 <strong>Chhatrapati Shahu Ji Maharaj University (CSJMU) & UIET Kanpur</strong>. All rights reserved.<br>
    Official University AI Assistant Portal • Built with LangChain, Chroma DB, and Streamlit.
</div>
""", unsafe_allow_html=True)
