"use client";
import {useEffect,useRef,useState} from "react";
import {CalendarDays,BriefcaseBusiness,Heart,Orbit,UserRound,Hourglass,ArrowRight,LockKeyhole,Sparkles,X} from "lucide-react";
import {Header,Star} from "../components/brand";
import {signs, type Reading} from "../lib/oracle";

export default function Home(){
 const [today,setToday]=useState<string>();
 useEffect(()=>{setToday(new Date().toISOString().slice(0,10))},[]);
 const help=useRef<HTMLDialogElement>(null);
 const panel=useRef<HTMLElement>(null);
 const key=useRef("");
 const [result,setResult]=useState<{reading:Reading;name:string;sign:string}|null>(null);
 const [busy,setBusy]=useState(false), [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const form=event.currentTarget, data=Object.fromEntries(new FormData(form));
  for(const input of form.querySelectorAll("input")){if(!input.value.trim()){input.setCustomValidity("Please enter an answer.");input.reportValidity();return}}
  setBusy(true);setError("");key.current ||= crypto.randomUUID();
  try{
   const response=await fetch("/api/reading",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,entryKey:key.current})});
   if(!response.ok)throw Error(response.status===400?"Check all six answers and try again.":"Your reading could not be saved. Please try again.");
   setResult({reading:await response.json(),name:String(data.name).trim(),sign:String(data.sign)});
   requestAnimationFrame(()=>panel.current?.focus());
  }catch(e){setError(e instanceof Error? e.message:"Please try again.")}finally{setBusy(false)}
 }
 return <><Header onHelp={()=>help.current?.showModal()}/><main className="spread"><section className="intro"><div className="eyebrow"><span className="rule"/> THE PERSONAL ORACLE</div><h1>Written in<br/><em>the stars.</em></h1><p className="lede">Six little answers, a little starlight, and a glimpse of what your future might hold.</p><figure><img src="/moonrise.svg" alt="An illustrated crescent moon rising over lavender mountains and a winding lake."/><figcaption><span>FIG. 01</span><i>The Moonrise</i><span aria-hidden="true">✧</span></figcaption></figure></section>
 <section className="sheet" ref={panel} tabIndex={-1} aria-label={result?"Your reading":"Reading questionnaire"}>{result?<><div className="eyebrow"><Star size={16}/>{result.sign.toUpperCase()} READING</div><h2>{result.reading.title}</h2><p className="sheetIntro">A reading for {result.name}</p><div className="reading">{[["Your dream job",result.reading.career],["Love & connection",result.reading.connection],["Your next chapter",result.reading.invitation]].map(([heading,text])=><section key={heading}><h3>{heading}</h3><p>{text}</p></section>)}</div><button className="primary" onClick={()=>{setResult(null);key.current="";setError("")}}>Start a new reading <ArrowRight size={18}/></button></>:<>
 <div className="eyebrow"><Star size={15}/> YOUR READING</div><h2>Tell the stars about you.</h2><p className="sheetIntro">Every field is required to reveal your reading.</p>
 <form onSubmit={submit} onChange={()=>{key.current=""}} onInput={e=>{if(e.target instanceof HTMLInputElement)e.target.setCustomValidity("")}}><fieldset disabled={busy}><div className="fields">
 <label><span><UserRound/>Your name</span><input name="name" required maxLength={120} autoComplete="given-name" placeholder="Enter your name"/></label>
 <label><span><Hourglass/>Your age</span><input name="age" required type="number" min="0" max="125" step="1" placeholder="Enter your age"/></label>
 <label className="wide"><span><BriefcaseBusiness/>Your dream job</span><input name="job" required maxLength={120} placeholder="What would you love to do?"/></label>
 <label className="wide"><span><Heart/>Someone you like or love</span><input name="love" required maxLength={120} placeholder="Enter their name or nickname"/></label>
 <label><span><Orbit/>Zodiac sign</span><select name="sign" required defaultValue=""><option value="" disabled>Select your sign</option>{signs.map(s=><option key={s}>{s}</option>)}</select></label>
 <label><span><CalendarDays/>Date of birth</span><input name="dob" type="date" autoComplete="bday" required max={today}/></label>
 </div></fieldset><p className="privacy"><LockKeyhole size={14}/> Your answers are saved for the site admin to view.</p>{error && <p role="alert">{error}</p>}<button className="primary" disabled={busy}><Sparkles size={18}/>{busy?"Preparing your reading…":"Reveal my future"}<ArrowRight className="arrow" size={18}/></button></form></>}</section></main>
 <footer><span className="footerLine"/><Star size={14}/> <span>For entertainment and reflection</span><span className="footerLine"/></footer>
 <dialog ref={help} onClick={e=>{if(e.target===help.current)help.current.close()}}><div className="modal"><button className="close" aria-label="Close" onClick={()=>help.current?.close()}><X size={18}/></button><Star/><h2>How it works</h2><p>Fill in all six answers. Nicknames are welcome. Select “Reveal my future” to save your entry and see a playful reading about work, love, and your next chapter.</p><p>The site admin can view your submitted answers. Readings are for entertainment.</p></div></dialog></>
}
