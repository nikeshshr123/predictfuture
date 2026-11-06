"use client";
import {useEffect,useState} from "react";
import {Header} from "../../components/brand";
type Entry={id:number;name:string;age:number;job:string;love:string;sign:string;dob:string;created:number};
export default function Admin(){
 const [rows,setRows]=useState<Entry[]|null>(null),[more,setMore]=useState(false),[busy,setBusy]=useState(true),[error,setError]=useState("");
 async function read(before?:number){
  const r=await fetch("/api/admin"+(before?"?before="+before:""),{cache:"no-store"});
  if(r.status===401){setRows(null);return}
  if(!r.ok)throw Error("Could not load entries. Try again.");
  const data=await r.json() as {entries:Entry[];more:boolean};setRows(old=>before?[...(old||[]),...data.entries]:data.entries);setMore(data.more);
 }
 useEffect(()=>{read().catch(e=>setError(e.message)).finally(()=>setBusy(false))},[]);
 async function act(fn:()=>Promise<void>){setBusy(true);setError("");try{await fn()}catch(e){setError(e instanceof Error?e.message:"Please try again.")}finally{setBusy(false)}}
 function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));void act(async()=>{
  const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(!r.ok)throw Error((await r.json() as {error:string}).error);await read()
 })}
 return <><Header/><main className={"admin sheet "+(rows?"records":"")}><div className="eyebrow">STARLING ORACLE</div><h1>{rows?"Submitted entries":"Admin sign in"}</h1>{error&&<p role="alert">{error}</p>}
 {rows?<><button className="secondary" disabled={busy} onClick={()=>act(async()=>{const r=await fetch("/api/admin",{method:"DELETE"});if(!r.ok)throw Error("Sign out failed.");setRows(null)})}>Sign out</button>{!rows.length?<p>Submitted readings will appear here.</p>:<div className="tablewrap"><table><thead><tr>{["Name","Age","Dream job","Someone they like or love","Zodiac","Date of birth","Submitted"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(e=><tr key={e.id}>{[e.name,e.age,e.job,e.love,e.sign,e.dob,new Date(e.created).toLocaleString()].map((x,i)=><td key={i}>{x}</td>)}</tr>)}</tbody></table></div>}{more&&<button className="secondary" disabled={busy} onClick={()=>act(()=>read(rows[rows.length-1].id))}>Load older entries</button>}</>:<form onSubmit={login}><label>Username<input name="username" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><button className="primary" disabled={busy}>Sign in</button></form>}</main></>
}

