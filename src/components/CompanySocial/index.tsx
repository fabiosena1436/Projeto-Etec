import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { communityService } from '../../services/supabase/community.service';
import { Community } from '../../pages/Community';
export function CompanySocial({companyId}:{companyId:string}) {
 const {isAuthenticated,user}=useAuth(),navigate=useNavigate();
 const [state,setState]=useState<{followers:number;following:boolean}|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;communityService.company(companyId).then(s=>{if(active)setState(s);}).catch(()=>{});return()=>{active=false;};},[companyId,user?.id]);
 async function follow(){if(!isAuthenticated){navigate('/login',{state:{from:`/empresas/${companyId}`}});return;}setBusy(true);try{await communityService.action('follow',companyId,undefined,undefined,!state?.following);setState(await communityService.company(companyId));}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível seguir.');}finally{setBusy(false);}}
 return <section style={{margin:'24px 0'}} aria-label="Comunidade da empresa"><div style={{display:'flex',alignItems:'center',gap:15,flexWrap:'wrap',marginBottom:20}}><h2>Publicações e comunidade</h2>{state&&<><span>{state.followers} seguidores</span><button disabled={busy} aria-pressed={state.following} onClick={()=>void follow()} style={{padding:'10px 16px',background:'#edf5ff',color:'#155eb7',borderRadius:9,border:'1px solid #bfd4ed'}}>{state.following?'Seguindo':'Seguir empresa'}</button></>}</div><Community companyId={companyId} compact/></section>;
}
