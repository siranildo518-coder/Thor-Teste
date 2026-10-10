/* Thor-Teste C78: foto obrigatória, câmera frontal e confirmação do servidor. */
async function thorCapturarEnviarFoto(contaHash, usuario) {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Abra o Thor-Teste por HTTPS e permita o acesso à câmera.');
  return new Promise((resolve, reject) => {
    const box = document.createElement('dialog');
    box.style.cssText='position:fixed;inset:0;z-index:2147483647;margin:0;border:0;box-sizing:border-box;width:100vw;height:100dvh;max-width:none;max-height:none;background:#241438;overflow:auto;padding:18px;display:grid;place-items:center;color:#222';
    box.innerHTML='<section style="background:white;border-radius:16px;padding:18px;max-width:350px;width:100%;box-sizing:border-box"><h2 style="margin:0 0 8px">Foto do cadastro</h2><p>Mostre seu rosto inteiro, com boa iluminação.</p><video autoplay playsinline muted style="width:100%;max-height:300px;border-radius:12px;transform:scaleX(-1)"></video><img alt="Foto que será enviada" hidden style="width:100%;max-height:300px;object-fit:contain;border-radius:12px"><p role="status"></p><label style="display:block;margin:12px 0"><input type="checkbox"> Autorizo enviar minha foto ao painel do administrador.</label><div style="display:flex;flex-wrap:wrap;gap:8px"><button data-action="capture" disabled>Tirar foto</button><button data-action="retake" hidden>Tirar novamente</button><button data-action="send" hidden>Enviar foto</button><button data-action="cancel">Cancelar</button></div><small style="display:block;margin-top:12px">Thor-Teste C78</small></section>';
    box.querySelectorAll('button').forEach(b=>b.style.cssText='padding:12px;border-radius:9px;border:1px solid #ddd;background:#5b21b6;color:white');
    document.body.append(box);
    if(typeof box.showModal==='function')box.showModal();
    else box.setAttribute('open','');
    const video=box.querySelector('video'), image=box.querySelector('img'), status=box.querySelector('[role=status]'), consent=box.querySelector('input');
    const capture=box.querySelector('[data-action=capture]'), retake=box.querySelector('[data-action=retake]'), send=box.querySelector('[data-action=send]'), cancel=box.querySelector('[data-action=cancel]');
    let stream=null, photo='', closed=false, busy=false;
    const stop=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null};
    const finish=(err,data)=>{closed=true;stop();window.removeEventListener('pagehide',onExit);box.remove();err?reject(err):resolve(data)};
    const onExit=()=>{if(!closed)finish(new Error('Captura interrompida. Tente novamente.'))};
    window.addEventListener('pagehide',onExit);
    async function openCamera(){
      capture.disabled=true;status.textContent='Abrindo câmera…';
      try{const next=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'user'},width:{ideal:640},height:{ideal:640}}});if(closed){next.getTracks().forEach(t=>t.stop());return}stream=next;video.srcObject=stream;await video.play();capture.disabled=false;status.textContent='Enquadre o rosto e toque em Tirar foto.'}
      catch(e){status.textContent=e.name==='NotAllowedError'?'Permita a câmera nas configurações do navegador e tente novamente.':'Não foi possível abrir a câmera. Feche outros aplicativos que a utilizam.';retake.hidden=false;retake.textContent='Tentar câmera novamente'}
    }
    capture.onclick=()=>{
      if(!video.videoWidth||!video.videoHeight)return;
      const canvas=document.createElement('canvas'), scale=Math.min(1,480/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);
      canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      photo=canvas.toDataURL('image/jpeg',0.75);
      if(photo.length>180000){status.textContent='Foto muito grande. Tire novamente.';return}
      stop();image.src=photo;image.hidden=false;video.hidden=true;capture.hidden=true;retake.hidden=false;send.hidden=false;status.textContent='Confira a foto antes de enviar.';
    };
    retake.onclick=()=>{if(busy)return;photo='';image.removeAttribute('src');image.hidden=true;video.hidden=false;capture.hidden=false;send.hidden=true;retake.hidden=true;openCamera()};
    cancel.onclick=()=>{if(!busy)finish(new Error('A foto é obrigatória. O cadastro ainda não foi concluído.'))};
    send.onclick=async()=>{
      if(busy||!photo)return;
      if(!consent.checked){status.textContent='Confirme a autorização para enviar a foto.';return}
      busy=true;send.disabled=true;retake.disabled=true;cancel.disabled=true;status.textContent='Enviando foto…';
      try{
        const receipt=await thorSalvarFotoTeste(contaHash,usuario,photo);
        finish(null,receipt);
      }catch(e){status.textContent=e.message;busy=false;send.disabled=false;retake.disabled=false;cancel.disabled=false}
    };
    openCamera();
  });
}
async function thorFotoRequest(url,options){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const r=await fetch(url,{...options,signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'Falha no envio');return data}finally{clearTimeout(timer)}
}
let thorFotoAuth=null;
async function thorSalvarFotoTeste(contaHash,usuario,foto){
  try{
    if(!thorFotoAuth||Date.now()>=thorFotoAuth.expires){
      const a=await thorFotoRequest('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+firebaseConfig.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
      thorFotoAuth={uid:a.localId,token:a.idToken,expires:Date.now()+Number(a.expiresIn)*1000-60000};
    }
    const url='https://firestore.googleapis.com/v1/projects/'+firebaseConfig.projectId+'/databases/(default)/documents/fotos_cadastro_teste/'+thorFotoAuth.uid;
    const fields={contaHash:{stringValue:contaHash},usuario:{stringValue:usuario},foto:{stringValue:foto},consentimento:{booleanValue:true},enviadoEm:{timestampValue:new Date().toISOString()},ambiente:{stringValue:'Thor-Teste C78'}};
    const headers={'Content-Type':'application/json',Authorization:'Bearer '+thorFotoAuth.token};
    await thorFotoRequest(url,{method:'PATCH',headers,body:JSON.stringify({fields})});
    const saved=await thorFotoRequest(url,{headers,cache:'no-store'});
    if(saved.fields?.foto?.stringValue!==foto||saved.fields?.contaHash?.stringValue!==contaHash)throw new Error('Confirmação incompleta');
    return {foto,documento:thorFotoAuth.uid};
  }catch(e){
    if(/PERMISSION_DENIED|OPERATION_NOT_ALLOWED/.test(e.message))throw new Error('O envio de fotos ainda precisa ser habilitado no Firebase pelo administrador. O cadastro permanece bloqueado.');
    throw new Error('Não foi possível confirmar o envio online. Verifique a internet e toque em Enviar foto novamente.');
  }
}
