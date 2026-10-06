import { supabase } from '../../lib/supabase';
export interface CommunityComment { id:string; body:string; name:string; created_at:string; own:boolean }
export interface CommunityPost {
  id:string; company_id:string|null; author_id:string; author_kind:'person'|'company'; company_name:string; logo_url:string|null; verified:boolean; sponsor:boolean;
  body:string; image_url:string|null; created_at:string; updated_at:string; can_edit:boolean;
  likes:number; liked:boolean; following:boolean; comment_count:number; comments:CommunityComment[];
}
export interface CommunityReport { id:string; reason:string; created_at:string; resolved:boolean; kind:'post'|'comment'; target:string; body:string; company_name:string; hidden:boolean; withdrawn:boolean }
type Action = 'publish'|'publish_person'|'edit'|'withdraw'|'follow'|'follow_person'|'like'|'comment'|'remove_comment'|'report'|'report_comment';
async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T> {
  if(!supabase) throw new Error('Comunidade indisponível.');
  const {data,error}=await (supabase as any).rpc(name,args);
  if(error) {
    if(error.code==='23514'||error.code==='23502') throw new Error('Confira o texto e a imagem: publicação até 2.000 caracteres, comentário até 500 e imagem com endereço HTTPS.');
    throw new Error(error.message);
  }
  return data as T;
}
export const communityService = {
  feed(companyId?:string,following=false,cursor?:CommunityPost) {
    return rpc<CommunityPost[]>('community_feed',{company_uuid:companyId||null,following_only:following,before_time:cursor?.created_at||null,before_uuid:cursor?.id||null});
  },
  company(id:string){return rpc<{followers:number;following:boolean}|null>('community_company',{company_uuid:id});},
  action(action:Action,id:string,content?:string,image?:string,desired=true){
    return rpc<string>('community_action',{action_name:action,target_uuid:id,content:content??null,picture:image??null,desired});
  },
  reports(){return rpc<CommunityReport[]>('admin_community_reports');},
  moderate(id:string,hide:boolean){return rpc<void>('admin_moderate_community',{report_uuid:id,hide_content:hide,resolve_report:true});},
};
