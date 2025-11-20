import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client"; // Add this import

// productchat.jsx - Handles product-specific chat between users
// Connects to product and conversation backend services
// Initializes or finds conversation based on product and user
// Loads and displays chat messages, supports sending new messages
// UI includes chat bubbles, timestamps, and navigation

const PRODUCTS_BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
// Fix CONVO_BASE to always use HTTPS in production
const rawConvoBase = import.meta.env.VITE_API_CONVO_URL || "http://127.0.0.1:3000";
const CONVO_BASE = rawConvoBase.startsWith('http') 
  ? rawConvoBase 
  : `https://${rawConvoBase}`;
const PRODUCTS_API = `${PRODUCTS_BASE}/api/products/`;
const CONVO_API = `${CONVO_BASE}/conversation`;

// Create separate axios instance for chat backend
const chatAxios = axios.create({
  baseURL: CONVO_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create separate axios instance for products backend  
const productsAxios = axios.create({
  baseURL: PRODUCTS_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token interceptor for both instances
[chatAxios, productsAxios].forEach(instance => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});

function decodeToken(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch {
    return null;
  }
}

export default function ProductChat() {
  const { id } = useParams(); // product id
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state?.product ?? null;
  const passedConvoId = location.state?.convoId ?? null;

  const [convoId, setConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null); // Add socket state
  const messagesRef = useRef(null);

  // small helper to normalize owner/buyer values to plain id string
  function normalizeId(val) {
    if (!val && val !== 0) return null;
    if (typeof val === "object") return val._id ?? val.id ?? null;
    return val;
  }

  // Initialize socket connection with better error handling
  useEffect(() => {
    const socketConnection = io(CONVO_BASE, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    });
    
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log('Socket connected:', socketConnection.id);
    });

    socketConnection.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socketConnection.close();
    };
  }, []);

  // Join room when convoId is available
  useEffect(() => {
    if (socket && convoId) {
      socket.emit("join_room", convoId);
      console.log("Joined room:", convoId);
    }
  }, [socket, convoId]);

  // Listen for real-time messages
  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (newMessage) => {
        console.log("New message received:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      });

      return () => socket.off("receive_message");
    }
  }, [socket]);

  useEffect(() => {
    let mounted = true;
    async function initConversation() {
      setLoading(true);

      // resolve buyer id from token
      const token = localStorage.getItem("access_token");
      const payload = token ? decodeToken(token) : null;
      const buyerRaw = payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
      const buyer = normalizeId(buyerRaw);

      // resolve seller from passedProduct or product fetch
      let seller = null;
      if (passedProduct) {
        const maybeOwner = passedProduct.owner ?? passedProduct.seller ?? passedProduct.user ?? passedProduct.owner_id ?? null;
        seller = normalizeId(maybeOwner);
      } else {
        try {
          const resp = await productsAxios.get(`/api/products/${id}/`);
          const product = resp.data;
          const maybeOwner = product.owner ?? product.seller ?? product.user ?? product.owner_id ?? null;
          seller = normalizeId(maybeOwner);
        } catch (err) {
          console.warn("Failed to fetch product to resolve seller:", err?.message ?? err);
        }
      }

      // 1) if convoId passed, load it and return
      if (passedConvoId) {
        try {
          const resp = await chatAxios.get(`/conversation/${passedConvoId}`);
          if (!mounted) return;
          const convo = resp.data;
          setConvoId(convo._id ?? convo.id);
          setMessages(convo.messages ?? []);
          setLoading(false);
          return;
        } catch (err) {
          console.warn("Failed to load convo by id, falling back:", err?.message ?? err);
        }
      }

      // 2) try to find existing conversation by product+buyer+seller
      try {
        const queryParts = [];
        // always include product id when available
        if (id !== undefined && id !== null) {
          queryParts.push(`product=${encodeURIComponent(String(id))}`);
        }

        // include buyer/seller only when present (allow 0)
        if (buyer != null) {
          queryParts.push(`buyer=${encodeURIComponent(String(buyer))}`);
        }
        if (seller != null) {
          queryParts.push(`seller=${encodeURIComponent(String(seller))}`);
        }

        const q = queryParts.length ? `?${queryParts.join("&")}` : "";
        console.debug("Looking up existing convo with query:", q);
        if (q) {
          const listResp = await chatAxios.get(`/conversation${q}`);
          console.debug("Convo lookup result:", listResp.data);
          if (mounted && Array.isArray(listResp.data) && listResp.data.length) {
            const convo = listResp.data[0];
            setConvoId(convo._id ?? convo.id);
            setMessages(convo.messages ?? []);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Lookup by query failed:", err?.message ?? err);
      }

      // 3) none found -> create (POST). backend upsert prevents duplicates/race.
      try {
        const res = await chatAxios.post('/conversation', { product: id, buyer, seller });
        if (!mounted) return;
        const convo = res.data;
        setConvoId(convo._id ?? convo.id);
        setMessages(convo.messages ?? []);
      } catch (err) {
        console.error("Failed to create/load conversation", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initConversation();
    return () => { mounted = false; };
  }, [id, passedProduct, passedConvoId]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Updated handleSend function to use only socket (backend handles DB storage)
  async function handleSend() {
    if (!text.trim() || !convoId || !socket) return;
    setSending(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const payload = token ? decodeToken(token) : null;
      const senderRaw = payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
      const sender = normalizeId(senderRaw);

      const messageData = {
        conversationId: convoId,
        message: {
          sender,
          text,
          timestamp: new Date()
        }
      };

      // Send only via socket - backend handles DB storage and broadcasting
      socket.emit("send_message", messageData);

      setText("");
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f6fa", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: 16, background: "#7a3540", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#7a3540",
            color: "#fff",
            border: "1px solid #fff",
            padding: "8px 12px",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 15,
            cursor: "pointer"
          }}
        >
          Back
        </button>
        <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: 0.5 }}>
          {passedProduct?.title ? passedProduct.title : "Product Chat"}
        </span>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
          <div
            ref={messagesRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              minHeight: 400,
              maxHeight: "60vh"
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((m, i) => {
                const token = localStorage.getItem("access_token");
                const payload = token ? decodeToken(token) : null;
                const currentUserRaw = payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
                const currentUser = normalizeId(currentUserRaw);
                const isMine = normalizeId(m.sender) === currentUser;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      marginBottom: 8
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "12px 16px",
                        borderRadius: 18,
                        background: isMine ? "#e9f5ff" : "#f1e6f7",
                        color: isMine ? "#222" : "#5a2d6e",
                        border: isMine ? "1px solid #b3e0ff" : "1px solid #e0d2f7",
                        boxShadow: isMine ? "0 2px 8px #b3e0ff22" : "0 2px 8px #e0d2f722",
                        fontSize: 15,
                        position: "relative"
                      }}
                    >
                      {m.text}
                      {m.timestamp && (
                        <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: "right" }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 24px",
              background: "#fff",
              borderTop: "1px solid #eee"
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type a message…"
              style={{
                width: 300,
                padding: "12px 16px",
                borderRadius: 16,
                border: "1px solid #ccc",
                fontSize: 17,
                marginRight: 12,
                background: "#f7f6fa"
              }}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              style={{
                padding: "12px 20px",
                borderRadius: 16,
                background: sending ? "#bfa2b8" : "#7a3540",
                color: "#fff",
                border: "none",
                cursor: sending ? "wait" : "pointer",
                fontSize: 22,
                fontWeight: 600,
                transition: "background 0.2s"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </main>

      <footer style={{ padding: 12, background: "#7a3540", color: "#fff", textAlign: "center", fontSize: 15, letterSpacing: 0.5 }}>
        © SwapEx
      </footer>
    </div>
  );
}