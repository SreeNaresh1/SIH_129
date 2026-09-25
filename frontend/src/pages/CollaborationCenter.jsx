import { useEffect, useState } from "react";
import { api } from "../api";

export default function CollaborationCenter(){
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState("");
  const [error,setError]=useState("");
  const load=async()=>{try{setMessages((await api("/advanced/messages")).messages||[])}catch(e){setError(e.message)}};
  useEffect(()=>{load();const t=setInterval(load,5000);return()=>clearInterval(t)},[]);
  const send=async()=>{if(!text.trim())return;try{await api("/advanced/messages",{method:"POST",body:JSON.stringify({message:text})});setText("");load()}catch(e){setError(e.message)}};
  return <div style={{maxWidth:900,margin:"40px auto",padding:20}}>
    <h1>Project Communication</h1>
    <p>Persistent database-backed messaging. Realtime transport can be added without changing the message model.</p>
    {error&&<p>{error}</p>}
    <div style={{minHeight:350,border:"1px solid #e2e8f0",borderRadius:12,padding:15,overflowY:"auto"}}>
      {messages.map(m=><div key={m.id} style={{padding:10,marginBottom:8,background:"#f8fafc",borderRadius:8}}>
        <strong>User #{m.senderId}</strong><div>{m.message}</div><small>{new Date(m.createdAt).toLocaleString()}</small>
      </div>)}
      {!messages.length&&<p>No messages yet.</p>}
    </div>
    <div style={{display:"flex",gap:10,marginTop:12}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a project message…" style={{flex:1,padding:12}} />
      <button onClick={send}>Send</button>
    </div>
  </div>
}
