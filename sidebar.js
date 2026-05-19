let _0x99f=!0; // Auth removed — always ready

function switchAppMode(mode){const modeInput=document.getElementById('current-app-mode');if(modeInput)modeInput.value=mode;const humanZone=document.getElementById('workspace-human');const mascotZone=document.getElementById('workspace-mascot');const btnHuman=document.getElementById('btn-mode-human');const btnMascot=document.getElementById('btn-mode-mascot');if(mode==='human'){if(humanZone)humanZone.style.display='block';if(mascotZone)mascotZone.style.display='none';if(btnHuman)btnHuman.classList.add('active');if(btnMascot)btnMascot.classList.remove('active');}else{if(humanZone)humanZone.style.display='none';if(mascotZone)mascotZone.style.display='block';if(btnHuman)btnHuman.classList.remove('active');if(btnMascot)btnMascot.classList.add('active');}
if(typeof modelUpdateUI==='function'){modelUpdateUI()}}

function setupMascotEvents(){console.log("🧸 Setup Mascot Events (Starting)...");function setupCustomToggle(btnClass,wrapperId,inputId,hiddenInputId){const buttons=document.querySelectorAll(btnClass);const wrapper=wrapperId?document.getElementById(wrapperId):null;const input=inputId?document.getElementById(inputId):null;const hiddenInput=document.getElementById(hiddenInputId);if(wrapperId&&!wrapper){console.warn(`⚠️ ไม่พบ Wrapper: ${wrapperId}`)}
if(inputId&&!input){console.warn(`⚠️ ไม่พบ Input: ${inputId}`)}
buttons.forEach(btn=>{const newBtn=btn.cloneNode(!0);btn.parentNode.replaceChild(newBtn,btn);newBtn.addEventListener('click',()=>{console.log(`🖱️ Clicked: ${btnClass} -> Value: ${newBtn.dataset.value}`);document.querySelectorAll(btnClass).forEach(b=>b.classList.remove('active'));newBtn.classList.add('active');const value=newBtn.dataset.value;if(hiddenInput){hiddenInput.value=value;hiddenInput.dispatchEvent(new Event('change',{bubbles:!0}))}
if(wrapper&&input){if(value==='custom'){wrapper.style.display='block';wrapper.classList.remove('hidden');setTimeout(()=>input.focus(),100)}else{wrapper.style.display='none';wrapper.classList.add('hidden');input.value=""}}})})}
setupCustomToggle('.mascot-card','mascot-custom-wrapper','mascot-custom-input',null);setupCustomToggle('.mascot-bg','mascot-custom-bg-wrapper','mascot-custom-bg-input','mascot-bg-select');setupCustomToggle('.mascot-outfit','mascot-custom-outfit-wrapper','mascot-custom-outfit-input','mascot-outfit-select');setupCustomToggle('.mascot-expression',null,null,'mascot-expression-select')}
function switchCharTab(tabName){const tabs=document.querySelectorAll('.char-tab-btn');const groups=document.querySelectorAll('.char-group');tabs.forEach(btn=>{const target=btn.dataset.target||btn.getAttribute('data-target');if(target===tabName)btn.classList.add('active');else btn.classList.remove('active')});groups.forEach(group=>group.style.display='none');const targetGroup=document.getElementById(`char-group-${tabName}`);if(targetGroup)targetGroup.style.display='block';const customInput=document.getElementById('banana-custom-character-input');if(customInput){const wrapper=customInput.closest('.input-group');if(tabName==='auto'||tabName==='custom'){if(wrapper)wrapper.style.display='block';else customInput.style.display='block';setTimeout(()=>customInput.focus(),100)}else{if(wrapper)wrapper.style.display='none';else customInput.style.display='none'}}}
function selectCharacter(element,value){const hiddenInput=document.getElementById('banana-character-select');if(hiddenInput)hiddenInput.value=value;document.querySelectorAll('#tab-content-banana .char-card').forEach(card=>card.classList.remove('active'));element.classList.add('active');const isJobGroup=element.closest('#char-group-job')!==null;const isSeniorGroup=element.closest('#char-group-senior')!==null;const outfitContent=document.getElementById('config-content-outfit');const outfitWrapper=outfitContent?outfitContent.closest('.input-group'):null;if(outfitWrapper){if(isJobGroup||isSeniorGroup){outfitWrapper.classList.add('disabled-section');const outfitAutoBtn=document.querySelector('#config-content-outfit .config-option[data-value="auto"]');if(outfitAutoBtn)outfitAutoBtn.click();}else{outfitWrapper.classList.remove('disabled-section')}}
if(typeof modelUploadedImages!=='undefined'&&modelUploadedImages.length>0&&value!=='auto'){try{modelUploadedImages=[];if(typeof modelUpdateUI==='function')modelUpdateUI();}catch(e){}}}
function toggleConfig(id){const content=document.getElementById(`config-content-${id}`);const header=document.getElementById(`header-${id}`);if(!content)return;document.querySelectorAll('.config-content').forEach(el=>{if(el!==content&&el.classList.contains('show')){el.classList.remove('show');const otherId=el.id.replace('config-content-','');const otherHeader=document.getElementById(`header-${otherId}`);if(otherHeader)otherHeader.classList.remove('open');}});content.classList.toggle('show');if(header)header.classList.toggle('open');}
function selectConfigOption(element){const type=element.dataset.type;const value=element.dataset.value;const label=element.dataset.label;let input=document.getElementById(`banana-${type}-select`);if(!input&&type==='vstyle'){input=document.getElementById('video-style-select')}
if(input)input.value=value;const display=document.getElementById(`display-${type}`);if(display){let cleanLabel=label;if(label.includes(' '))cleanLabel=label.split(' ').slice(1).join(' ');display.innerHTML=label}
const container=document.getElementById(`config-content-${type}`);if(container){container.querySelectorAll('.config-option').forEach(opt=>opt.classList.remove('active'))}
element.classList.add('active');if(type!=='vstyle'){toggleConfig(type)}
if(type==='style'){const outfitWrapper=document.getElementById('config-content-outfit')?.closest('.input-group');const bgWrapper=document.getElementById('config-content-bg')?.closest('.input-group');const charWrapper=document.getElementById('banana-character-select')?.closest('.input-group');const bgRandomSwitch=document.getElementById('banana-random-bg-switch');const outfitRandomSwitch=document.getElementById('banana-random-outfit-switch');const noHumanStyles=['showcase','decor','texture','unboxing','hands','shoes'];const noOutfitStyles=['fashion'];const fixedBgStyles=['mirror'];if(value==='miniature'){if(bgWrapper)bgWrapper.classList.add('disabled-section');if(outfitWrapper)outfitWrapper.classList.add('disabled-section');if(charWrapper)charWrapper.classList.add('disabled-section');if(bgRandomSwitch){bgRandomSwitch.checked=!1;bgRandomSwitch.disabled=!0}
if(outfitRandomSwitch){outfitRandomSwitch.checked=!1;outfitRandomSwitch.disabled=!0}
const bgAutoBtn=document.querySelector('#config-content-bg .config-option[data-value="auto"]');const outfitAutoBtn=document.querySelector('#config-content-outfit .config-option[data-value="auto"]');const charAutoBtn=document.querySelector('.char-tab-btn[data-target="auto"]');if(bgAutoBtn)bgAutoBtn.click();if(outfitAutoBtn)outfitAutoBtn.click();if(charAutoBtn)charAutoBtn.click();const charCustomInput=document.getElementById('banana-custom-character-input');if(charCustomInput)charCustomInput.value=''}else if(noHumanStyles.includes(value)){if(bgWrapper)bgWrapper.classList.remove('disabled-section');if(bgRandomSwitch)bgRandomSwitch.disabled=!1;if(outfitWrapper)outfitWrapper.classList.add('disabled-section');if(charWrapper)charWrapper.classList.add('disabled-section');if(outfitRandomSwitch){outfitRandomSwitch.checked=!1;outfitRandomSwitch.disabled=!0}
const outfitAutoBtn=document.querySelector('#config-content-outfit .config-option[data-value="auto"]');const charAutoBtn=document.querySelector('.char-tab-btn[data-target="auto"]');if(outfitAutoBtn)outfitAutoBtn.click();if(charAutoBtn)charAutoBtn.click();const charCustomInput=document.getElementById('banana-custom-character-input');if(charCustomInput)charCustomInput.value=''}else{if(charWrapper)charWrapper.classList.remove('disabled-section');if(bgWrapper){if(fixedBgStyles.includes(value)){bgWrapper.classList.add('disabled-section');if(bgRandomSwitch){bgRandomSwitch.checked=!1;bgRandomSwitch.disabled=!0}
const bedroomBtn=document.querySelector('#config-content-bg .config-option[data-value="bedroom"]');if(bedroomBtn)bedroomBtn.click();}else{bgWrapper.classList.remove('disabled-section');if(bgRandomSwitch)bgRandomSwitch.disabled=!1}}
if(outfitWrapper){if(noOutfitStyles.includes(value)){outfitWrapper.classList.add('disabled-section');if(outfitRandomSwitch){outfitRandomSwitch.checked=!1;outfitRandomSwitch.disabled=!0}
const outfitAutoBtn=document.querySelector('#config-content-outfit .config-option[data-value="auto"]');if(outfitAutoBtn)outfitAutoBtn.click();}else{outfitWrapper.classList.remove('disabled-section');if(outfitRandomSwitch)outfitRandomSwitch.disabled=!1}}}}
if(type==='vstyle'){if(typeof checkVideoVoiceState==='function')checkVideoVoiceState();}}
function switchConfigTab(element){const type=element.dataset.type;const groupName=element.dataset.group;const container=document.getElementById(`config-content-${type}`);if(!container)return;container.querySelectorAll('.config-tab-btn').forEach(btn=>btn.classList.remove('active'));element.classList.add('active');let groups=[];if(type==='style'){groups=['human','closeup','fantasy','product']}else if(type==='bg'){groups=['indoor','urban','outdoor','custom']}else if(type==='outfit'){groups=['daily','work','local','custom']}else if(type==='vstyle'){groups=['promo','review','demo','fun','voiceover','broll']}
groups.forEach(g=>{const groupId=`${type}-group-${g}`;const el=document.getElementById(groupId);if(el){if(g===groupName){el.style.display=(g==='auto'||g==='custom')?'block':'grid';const options=el.querySelectorAll('.config-option');if(options.length>0){if(options.length===1||g==='auto'){setTimeout(()=>{options[0].click()},50)}}}else{el.style.display='none'}}});if(groupName==='custom'){const inputId=`banana-custom-${type}-input`;const input=document.getElementById(inputId);if(input){setTimeout(()=>input.focus(),100)}}}
function selectSegment(element){const type=element.dataset.type;const value=element.dataset.value;const isVideoTab=element.closest('#tab-content-video')!==null;let mainInputId,customInputId;if(isVideoTab){mainInputId=(type==='rounds')?'video-round-count':'video-download-count-auto';customInputId='video-custom-round-input'}else{mainInputId=(type==='rounds')?'banana-round-count':'banana-download-count';customInputId='banana-custom-round-input'}
if(value==='custom'){const customInput=document.getElementById(customInputId);if(customInput){customInput.classList.remove('hidden');customInput.style.display='block';customInput.focus()}
const parent=element.parentElement;parent.querySelectorAll('.segment-opt').forEach(b=>b.classList.remove('active'));element.classList.add('active');const mainInput=document.getElementById(mainInputId);if(mainInput)mainInput.value='custom';return}
const customInput=document.getElementById(customInputId);if(customInput){customInput.classList.add('hidden');customInput.style.display='none'}
const mainInput=document.getElementById(mainInputId);if(mainInput){mainInput.value=value;const parent=element.parentElement;parent.querySelectorAll('.segment-opt').forEach(b=>b.classList.remove('active'));element.classList.add('active');if(isVideoTab&&typeof videoUpdateRoundInfo==='function')videoUpdateRoundInfo();if(!isVideoTab&&typeof bananaUpdateRoundInfo==='function')bananaUpdateRoundInfo();}}
function setupAllVisualUI(){console.log("🛠️ Setting up Visual UI...");function addSafeClick(selector,callback){const elements=document.querySelectorAll(selector);elements.forEach(el=>{const newEl=el.cloneNode(!0);el.parentNode.replaceChild(newEl,el);newEl.addEventListener('click',(e)=>callback(newEl,e))})}
addSafeClick('.char-tab-btn:not(.config-tab-btn)',(btn)=>switchCharTab(btn.dataset.target||btn.getAttribute('data-target')));addSafeClick('.char-card:not(.mascot-card):not(.mascot-bg):not(.mascot-outfit):not(.mascot-expression):not(.story-style-card):not(.story-img-style-card):not(.story-aspect-card):not(.story-structure-card):not(.story-music-card)',(card)=>selectCharacter(card,card.dataset.value));addSafeClick('.config-header',(header)=>toggleConfig(header.dataset.target));addSafeClick('.config-option',(opt)=>selectConfigOption(opt));addSafeClick('.config-tab-btn',(btn)=>switchConfigTab(btn));addSafeClick('.segment-opt',(seg)=>selectSegment(seg))}
document.addEventListener('DOMContentLoaded',()=>{const btnHuman=document.getElementById('btn-mode-human');const btnMascot=document.getElementById('btn-mode-mascot');if(btnHuman){btnHuman.addEventListener('click',(e)=>{e.preventDefault();switchAppMode('human')})}
if(btnMascot){btnMascot.addEventListener('click',(e)=>{e.preventDefault();switchAppMode('mascot')})}
setupMascotEvents();setupAllVisualUI();if(typeof setupSettingsModal==='function')setupSettingsModal();const overlay=document.getElementById('login-overlay');if(overlay)overlay.style.display='none';if(document.getElementById('banana-upload-zone')){bananaSetupUploadZone();bananaSetupEventListeners();bananaUpdateImageCount()}
if(document.getElementById('model-upload-zone')){modelSetupUploadZone()}
  // Mascot smart mode toggle
  document.querySelectorAll('#workspace-mascot .smart-mode-card').forEach(card=>{
    card.addEventListener('click',()=>{
      document.querySelectorAll('#workspace-mascot .smart-mode-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      document.getElementById('mascot-smart-mode').value=card.dataset.value;
      console.log('🧸 Mascot Smart Mode:', card.dataset.value);
    });
  });
if(document.getElementById('video-upload-zone')){videoSetupUploadZone();videoSetupEventListeners();videoUpdateImageCount();if(typeof checkVideoVoiceState==='function')checkVideoVoiceState();}
const tabButtons=document.querySelectorAll('.segment-btn');const tabContents=document.querySelectorAll('.tab-pane');tabButtons.forEach(btn=>{btn.addEventListener('click',()=>{tabButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');tabContents.forEach(content=>{content.classList.remove('active');if(content.id===`tab-content-${btn.dataset.tab}`){content.classList.add('active')}})})});console.log("System Ready: V4.0.9 (Duplicate Fixed)")});async function smartClick(tabId,selector,textMatch=null){return await chrome.scripting.executeScript({target:{tabId:tabId},func:(sel,txt)=>{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const heavyClick=(el)=>{if(!el)return!1;['mousedown','click','mouseup'].forEach(evt=>{el.dispatchEvent(new MouseEvent(evt,{bubbles:!0,cancelable:!0,view:window}))});return!0};let target=null;if(txt){const allBtns=Array.from(document.querySelectorAll('button, div[role="button"], [role="menuitem"]'));target=allBtns.find(b=>(b.textContent||"").includes(txt))}else{target=document.querySelector(sel)}
if(target){target.scrollIntoView({behavior:'instant',block:'center'});return heavyClick(target)}
return!1},args:[selector,textMatch]})}
function showToast(message,type='success'){const existingToast=document.querySelector('.toast');if(existingToast)existingToast.remove();const toast=document.createElement('div');toast.className=`toast ${type}`;toast.textContent=message;document.body.appendChild(toast);setTimeout(()=>toast.classList.add('show'),10);setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300)},3000)}
function getGeminiApiKey(){return localStorage.getItem('gemini_api_key')||''}
function getStoryAIModel(){return localStorage.getItem('story_ai_model')||'gemini-2.5-pro'}


function openSettingsModal(){const savedApiKey=localStorage.getItem('gemini_api_key')||'';geminiApiKeyInput.value=savedApiKey;const savedAspectRatio=localStorage.getItem('veo3_aspect_ratio')||'9:16';veo3AspectRatioSelect.value=savedAspectRatio;settingsModal.classList.add('show')}
function closeSettingsModal(){settingsModal.classList.remove('show')}
function saveSettings(){const apiKey=geminiApiKeyInput.value.trim();const aspectRatio=veo3AspectRatioSelect.value;localStorage.setItem('gemini_api_key',apiKey);localStorage.setItem('veo3_aspect_ratio',aspectRatio);closeSettingsModal();showToast('Settings saved!','success')}
function getAntiBotSeed(){const adjs=['vivid','clear','sharp','detailed','crisp','clean','fine'];const randAdj=adjs[Math.floor(Math.random()*adjs.length)];const randHash=Math.random().toString(36).substring(2,6);return ` (Render: ${randAdj}-${randHash})`}
const videoUploadZone=document.getElementById('video-upload-zone');const videoFileInput=document.getElementById('video-file-input');const videoImageCount=document.getElementById('video-image-count');const videoClearImagesBtn=document.getElementById('video-clear-images');const videoStatusText=document.getElementById('video-status-text');const videoBtnAutomation=document.getElementById('video-btn-automation');const videoDownloadCountAuto=document.getElementById('video-download-count-auto');const videoBtnStop=document.getElementById('video-btn-stop');const videoPromptStatus=document.getElementById('video-prompt-status');const videoRoundCountSelect=document.getElementById('video-round-count');const videoCustomRoundInput=document.getElementById('video-custom-round-input');const videoRoundInfo=document.getElementById('video-round-info');const videoProductNameInput=document.getElementById('video-product-name');const videoBtnGeneratePrompt=document.getElementById('video-btn-generate-prompt');const videoPromptResultContainer=document.getElementById('video-prompt-result-container');const videoPromptResult=document.getElementById('video-prompt-result');const videoBtnCopyPrompt=document.getElementById('video-btn-copy-prompt');const videoLogContainer=document.getElementById('video-log-container');const videoLogClearBtn=document.getElementById('video-log-clear');const videoVoiceStyleSelect=document.getElementById('video-voice-style-select');const videoRandomVoiceCheckbox=document.getElementById('video-random-voice-checkbox');let videoUploadedImages=[];let videoCurrentImageIndex=0;let videoIsAutomationRunning=!1;let videoShouldStopAutomation=!1;let videoStatusTimeoutId=null;let videoLogs=[];function videoSetupUploadZone(){videoUploadZone.addEventListener('click',()=>{videoFileInput.click()});videoFileInput.addEventListener('change',(e)=>{videoHandleFiles(e.target.files)});videoUploadZone.addEventListener('dragover',(e)=>{e.preventDefault();videoUploadZone.classList.add('dragover')});videoUploadZone.addEventListener('dragleave',(e)=>{e.preventDefault();videoUploadZone.classList.remove('dragover')});videoUploadZone.addEventListener('drop',(e)=>{e.preventDefault();videoUploadZone.classList.remove('dragover');videoHandleFiles(e.dataTransfer.files)})}
const videoPreviewContainer=document.getElementById('video-preview-container');function videoHandleFiles(files){const imageFiles=Array.from(files).filter(file=>file.type.startsWith('image/'));imageFiles.forEach(file=>{const reader=new FileReader();reader.onload=(e)=>{const imageData={id:Date.now()+Math.random(),name:file.name,size:file.size,type:file.type,dataUrl:e.target.result};videoUploadedImages.push(imageData);videoUpdateImageCount()};reader.readAsDataURL(file)});videoFileInput.value=''}
function videoClearAllImages(){videoUploadedImages=[];videoUpdateImageCount();videoUpdateStatus('All images cleared')}
function videoRemoveOneImage(index){videoUploadedImages.splice(index,1);videoUpdateImageCount()}
function videoUpdateImageCount(){videoImageCount.textContent=videoUploadedImages.length;if(videoUploadedImages.length>0){if(videoClearImagesBtn)videoClearImagesBtn.style.display='flex'}else{if(videoClearImagesBtn)videoClearImagesBtn.style.display='none'}
videoUpdateRoundInfo();if(videoPreviewContainer){videoPreviewContainer.innerHTML='';videoUploadedImages.forEach((img,index)=>{const item=document.createElement('div');item.className='preview-item';const imgEl=document.createElement('img');imgEl.src=img.dataUrl;imgEl.title=img.name;const delBtn=document.createElement('button');delBtn.className='preview-remove-btn';delBtn.innerHTML='✕';delBtn.onclick=()=>videoRemoveOneImage(index);item.appendChild(imgEl);item.appendChild(delBtn);videoPreviewContainer.appendChild(item)})}}
function videoUpdateRoundInfo(){const select=document.getElementById('video-round-count');const customInput=document.getElementById('video-custom-round-input');const roundInfo=document.getElementById('video-round-info');if(!select)return;const imageTotal=videoUploadedImages.length;const selectValue=select.value;if(selectValue==='custom'){if(customInput)customInput.style.display='block'}else{if(customInput)customInput.style.display='none'}
if(roundInfo){roundInfo.style.display='block';const roundsPerImage=videoGetRoundsPerImage();const totalRounds=imageTotal*roundsPerImage;if(imageTotal===0){roundInfo.textContent=`ตั้งค่า: ${roundsPerImage} รอบต่อภาพ`}else{roundInfo.textContent=`คิวรวม: ${imageTotal} ภาพ × ${roundsPerImage} รอบ = รันทั้งหมด ${totalRounds} คลิป`}}}
function videoGetRoundsPerImage(){const select=document.getElementById('video-round-count');const customInput=document.getElementById('video-custom-round-input');if(!select)return 1;if(select.value==='custom'||(customInput&&customInput.style.display==='block')){if(customInput){const val=parseInt(customInput.value);return(!isNaN(val)&&val>0)?val:1}}
const rounds=parseInt(select.value);return(!isNaN(rounds)&&rounds>0)?rounds:1}
function videoAddLog(message,type='info'){const timestamp=new Date().toLocaleTimeString('th-TH');const logEntry={time:timestamp,message:message,type:type};videoLogs.push(logEntry);if(videoLogs.length>500){videoLogs=videoLogs.slice(-500)}
videoUpdateLogDisplay();const consoleMethod=type==='error'?'error':type==='warning'?'warn':'log';console[consoleMethod](`[${timestamp}] ${message}`)}
function videoUpdateLogDisplay(){if(!videoLogContainer)return;if(videoLogs.length===0){videoLogContainer.innerHTML='<div class="log-empty">ยังไม่มี log</div>';return}
const logHTML=videoLogs.map(log=>{let typeClass='log-entry-info';if(log.type==='error')typeClass='log-entry-error';else if(log.type==='success')typeClass='log-entry-success';else if(log.type==='warning')typeClass='log-entry-warning';else if(log.type==='step')typeClass='log-entry-step';return `<div class="log-entry ${typeClass}">
      <span class="log-entry-time">[${log.time}]</span>
      <span class="log-entry-message">${log.message}</span>
    </div>`}).join('');videoLogContainer.innerHTML=logHTML;videoLogContainer.scrollTop=videoLogContainer.scrollHeight}
function videoClearLogs(){videoLogs=[];videoUpdateLogDisplay()}
function videoUpdateStatus(message,persistent=!1){if(videoStatusTimeoutId){clearTimeout(videoStatusTimeoutId);videoStatusTimeoutId=null}
videoStatusText.textContent=message;videoAddLog(message,persistent?'step':'info');if(!videoIsAutomationRunning&&!persistent){videoStatusTimeoutId=setTimeout(()=>{videoStatusText.textContent='Ready to use'},3000)}}
function videoSetupEventListeners(){if(videoClearImagesBtn)videoClearImagesBtn.addEventListener('click',videoClearAllImages);if(videoBtnAutomation)videoBtnAutomation.addEventListener('click',videoRunAutomation);if(videoBtnStop)videoBtnStop.addEventListener('click',videoStopAutomation);const randomVStyleSwitch=document.getElementById('video-random-style-switch');const vStyleContainer=document.getElementById('config-content-vstyle');if(randomVStyleSwitch&&vStyleContainer){randomVStyleSwitch.addEventListener('change',(e)=>{if(e.target.checked){vStyleContainer.style.opacity="0.5";vStyleContainer.style.pointerEvents="none";videoAddLog("🎲 โหมดวิดีโอ: สุ่มสไตล์เปิดใช้งาน","info")}else{vStyleContainer.style.opacity="1";vStyleContainer.style.pointerEvents="auto";videoAddLog("🖱️ โหมดวิดีโอ: เลือกสไตล์เอง","info")}})}
const allVoiceBtns=document.querySelectorAll('.voice-btn');if(allVoiceBtns.length>0){allVoiceBtns.forEach(btn=>{btn.addEventListener('click',(e)=>{const clickedBtn=e.target.closest('.voice-btn');if(!clickedBtn)return;const type=clickedBtn.getAttribute('data-type');const value=clickedBtn.getAttribute('data-value');const siblings=document.querySelectorAll(`.voice-btn[data-type="${type}"]`);siblings.forEach(b=>b.classList.remove('active'));clickedBtn.classList.add('active');if(type==='gender'){const genderInput=document.getElementById('video-voice-gender-select');if(genderInput)genderInput.value=value;if(value==='male'||value==='teen_boy'||value==='boy'||value.includes('male')){clickedBtn.style.borderColor='#60a5fa'}else{clickedBtn.style.borderColor='#f472b6'}
siblings.forEach(b=>{if(!b.classList.contains('active'))b.style.borderColor='#3f3f46'})}else if(type==='dialect'){const dialectInput=document.getElementById('video-voice-select');if(dialectInput)dialectInput.value=value}})})}
const customScriptInput=document.getElementById('video-custom-script');if(customScriptInput){customScriptInput.addEventListener('input',()=>{const hasText=customScriptInput.value.trim()!=="";const brollBtn=document.querySelector('.char-tab-btn[data-type="vstyle"][data-group="broll"]');if(brollBtn){if(hasText){brollBtn.classList.add('disabled-section');brollBtn.style.pointerEvents='none';if(brollBtn.classList.contains('active')){const promoBtn=document.querySelector('.char-tab-btn[data-type="vstyle"][data-group="promo"]');if(promoBtn){promoBtn.click();showToast('⚠️ มีบทพูด: เปลี่ยนเป็นโหมดคนพูดให้อัตโนมัติ','warning')}}}else{brollBtn.classList.remove('disabled-section');brollBtn.style.pointerEvents='auto'}}})}}
async function videoHandleTestFill(){const generatedPrompt=videoPromptResult.textContent;if(!generatedPrompt||generatedPrompt.includes('กำลังวิเคราะห์')||generatedPrompt.startsWith('Error:')){showToast('กรุณาสร้าง Prompt ก่อน','error');return}
const parsedPrompt=parseYAMLToPlainText(generatedPrompt,!0);videoUpdateStatus('Filling prompt...');try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(textToFill)=>{const targetElement=document.getElementById('PINHOLE_TEXT_AREA_ELEMENT_ID');if(targetElement){targetElement.focus();if(targetElement.tagName==='INPUT'||targetElement.tagName==='TEXTAREA'){targetElement.value=textToFill;targetElement.dispatchEvent(new Event('input',{bubbles:!0}));targetElement.dispatchEvent(new Event('change',{bubbles:!0}))}else if(targetElement.isContentEditable){targetElement.textContent=textToFill;targetElement.dispatchEvent(new Event('input',{bubbles:!0}))}else{targetElement.textContent=textToFill}
return{success:!0,message:'Prompt filled successfully!'}}else{return{success:!1,message:'Element #PINHOLE_TEXT_AREA_ELEMENT_ID not found'}}},args:[parsedPrompt]});if(result&&result[0]){const{success,message}=result[0].result;videoUpdateStatus(message);showToast(message,success?'success':'error')}}catch(error){videoUpdateStatus(`Error: ${error.message}`);showToast('Failed to fill text','error')}}
async function videoHandleTestUpload(){if(videoUploadedImages.length===0){videoUpdateStatus('No images to upload');showToast('Please add images first','error');return}
videoUpdateStatus('Uploading images...');try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const imagesData=videoUploadedImages.map(img=>({name:img.name,type:img.type,dataUrl:img.dataUrl}));const actionDelay=getActionDelay();const confirmDelay=getActionDelay();const afterConfirmDelay=getAfterConfirmDelay();const aspectRatio=getVeo3AspectRatio();const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(images,delays,aspectRatio)=>{function getRandomDelay(min,max){return Math.floor(Math.random()*(max-min+1))+min}
return new Promise((resolve)=>{const uploadBtnSelector='#__next > div.sc-c7ee1759-1.crzReP > div > div > div.sc-b0c0bd7-1.kvzLFA > div > div.sc-897c0dbb-0.eHacXb > div.sc-77366d4e-0.eaiEre > div > div > div.sc-408537d4-0.eBSqXt > div:nth-child(1) > div > div:nth-child(1) > button';const uploadBtn=document.querySelector(uploadBtnSelector);if(!uploadBtn){resolve({success:!1,message:'Upload button not found'});return}
uploadBtn.click();const fileInputDelay=getRandomDelay(delays.actionMin,delays.actionMax);setTimeout(()=>{const fileInputs=document.querySelectorAll('input[type="file"]');let targetInput=null;for(const input of fileInputs){if(input.accept&&input.accept.includes('image')){targetInput=input;break}}
if(!targetInput&&fileInputs.length>0){targetInput=fileInputs[fileInputs.length-1]}
if(targetInput){const dataTransfer=new DataTransfer();images.forEach((img)=>{const byteString=atob(img.dataUrl.split(',')[1]);const mimeType=img.type;const ab=new ArrayBuffer(byteString.length);const ia=new Uint8Array(ab);for(let i=0;i<byteString.length;i++){ia[i]=byteString.charCodeAt(i)}
const blob=new Blob([ab],{type:mimeType});const file=new File([blob],img.name,{type:mimeType});dataTransfer.items.add(file)});targetInput.files=dataTransfer.files;targetInput.dispatchEvent(new Event('change',{bubbles:!0}));targetInput.dispatchEvent(new Event('input',{bubbles:!0}));const orientationClickDelay=getRandomDelay(delays.actionMin,delays.actionMax);setTimeout(()=>{const isPortrait=aspectRatio==='9:16';const targetOrientation=isPortrait?'Portrait':'Landscape';const targetCropIcon=isPortrait?'crop_9_16':'crop_16_9';let orientationBtn=null;const allButtons=document.querySelectorAll('button');for(const btn of allButtons){const text=btn.textContent||'';const hasLandscape=text.includes('Landscape');const hasCropIcon=btn.querySelector('i[class*="crop_16_9"]')||text.includes('crop_16_9');if(hasLandscape&&hasCropIcon&&btn.getAttribute('role')!=='combobox'){orientationBtn=btn;break}}
if(!orientationBtn){const cropAndSaveBtn=Array.from(allButtons).find(btn=>btn.textContent.includes('Crop and Save'));if(cropAndSaveBtn){const parent=cropAndSaveBtn.parentElement;if(parent){const siblingBtns=parent.querySelectorAll('button');for(const btn of siblingBtns){if((btn.textContent.includes('Landscape')||btn.textContent.includes('Portrait'))&&btn!==cropAndSaveBtn){orientationBtn=btn;break}}}}}
if(orientationBtn){orientationBtn.click();console.log('Orientation dropdown opened')}else{console.log('Orientation button not found')}
const selectOrientationDelay=getRandomDelay(delays.actionMin,delays.actionMax);setTimeout(()=>{let targetOption=null;const allElements=document.querySelectorAll('div, button, span, li, a');for(const el of allElements){const text=el.textContent||'';if(text.trim()===targetOrientation||(text.includes(targetOrientation)&&!text.includes(isPortrait?'Landscape':'Portrait')&&text.length<20)){const rect=el.getBoundingClientRect();if(rect.width>0&&rect.height>0){targetOption=el;break}}}
if(!targetOption){const cropIcons=document.querySelectorAll('i');for(const icon of cropIcons){if(icon.textContent&&icon.textContent.includes(targetCropIcon)){targetOption=icon.closest('button')||icon.closest('div[role]')||icon.parentElement;if(targetOption)break}}}
if(targetOption){targetOption.click();console.log(targetOrientation+' selected')}else{console.log(targetOrientation+' option not found in dropdown')}
const confirmClickDelay=getRandomDelay(delays.actionMin,delays.actionMax);setTimeout(()=>{const confirmSelectors=['#radix-\\:r1k\\: > div.sc-19de2353-4.boKhUT > div > button.sc-c177465c-1.gdArnN.sc-19de2353-7.jcyPCc','#radix-\\:r1d\\: > div.sc-5983bb27-4.hUNtLL > div > button.sc-c177465c-1.gdArnN.sc-5983bb27-7.csgOts','button.sc-19de2353-7.jcyPCc','button.sc-5983bb27-7.csgOts'];let confirmBtn=null;for(const sel of confirmSelectors){try{confirmBtn=document.querySelector(sel);if(confirmBtn)break}catch(e){}}
if(!confirmBtn){const allButtons=document.querySelectorAll('button');const textCandidates=['Crop and Save','บันทึก','ต่อไป','เสร็จ','Save','Confirm'];for(const btn of allButtons){const text=(btn.textContent||'').trim();if(!text)continue;if(textCandidates.some(t=>text.includes(t))){const rect=btn.getBoundingClientRect();if(rect.width>0&&rect.height>0){confirmBtn=btn;break}}}}
if(!confirmBtn){const candidateBtns=document.querySelectorAll('button');for(const btn of candidateBtns){const rect=btn.getBoundingClientRect();if(rect.width>80&&rect.height>24&&rect.left>=0&&rect.top>=0){confirmBtn=btn;break}}}
if(confirmBtn){confirmBtn.click();const afterConfirmWait=getRandomDelay(delays.afterConfirmMin,delays.afterConfirmMax);setTimeout(()=>{resolve({success:!0,message:`Uploaded ${images.length} image(s) and confirmed!`})},afterConfirmWait)}else{resolve({success:!0,message:`Uploaded ${images.length} image(s)! (Crop and Save button not found)`})}},confirmClickDelay)},selectPortraitDelay)},orientationClickDelay)}else{resolve({success:!1,message:'File input not found'})}},fileInputDelay)})},args:[imagesData,CONFIG.delays,aspectRatio]});if(result&&result[0]&&result[0].result){const{success,message}=result[0].result;videoUpdateStatus(message);showToast(message,success?'success':'error')}}catch(error){videoUpdateStatus(`Error: ${error.message}`);showToast('Failed to upload images','error')}}
async function videoHandleTestCreate(){videoUpdateStatus('Clicking create button...');try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const maxRetries=3;const retryDelay=5000;const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(maxRetries,retryDelay)=>{return new Promise((resolve)=>{const createBtnSelector='#__next > div.sc-c7ee1759-1.crzReP > div > div > div.sc-b0c0bd7-1.kvzLFA > div > div.sc-897c0dbb-0.eHacXb > div.sc-77366d4e-0.eaiEre > div > div > div.sc-408537d4-0.eBSqXt > div.sc-408537d4-1.eiHkev > button';let attempts=0;function tryClickCreate(){attempts++;const createBtn=document.querySelector(createBtnSelector);if(createBtn&&!createBtn.disabled){createBtn.click();resolve({success:!0,message:`Create button clicked! (attempt ${attempts})`})}else if(attempts<maxRetries){console.log(`Create button not ready, retrying in 5s... (attempt ${attempts}/${maxRetries})`);setTimeout(tryClickCreate,retryDelay)}else{resolve({success:!1,message:`Create button not clickable after ${maxRetries} attempts`})}}
tryClickCreate()})},args:[maxRetries,retryDelay]});if(result&&result[0]&&result[0].result){const{success,message}=result[0].result;videoUpdateStatus(message);showToast(message,success?'success':'error')}}catch(error){videoUpdateStatus(`Error: ${error.message}`);showToast('Failed to click create button','error')}}
function showToast(message,type='success'){const existingToast=document.querySelector('.toast');if(existingToast){existingToast.remove()}
const toast=document.createElement('div');toast.className=`toast ${type}`;toast.textContent=message;document.body.appendChild(toast);setTimeout(()=>toast.classList.add('show'),10);setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300)},3000)}
async function videoHandleTestDownload(){videoUpdateStatus('Finding video...');try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(delays)=>{function getRandomDelay(min,max){return Math.floor(Math.random()*(max-min+1))+min}
return new Promise((resolve)=>{let videoCard=null;const videos=document.querySelectorAll('video');if(videos.length>0){videoCard=videos[0].closest('div[class*="sc-"]');if(!videoCard){videoCard=videos[0].parentElement.parentElement.parentElement}}
if(!videoCard){resolve({success:!1,message:'Video not found'});return}
videoCard.dispatchEvent(new MouseEvent('mouseenter',{bubbles:!0}));videoCard.dispatchEvent(new MouseEvent('mouseover',{bubbles:!0}));setTimeout(()=>{const allButtons=document.querySelectorAll('button');let downloadBtn=null;for(const btn of allButtons){const icon=btn.querySelector('i');if(icon&&icon.textContent&&icon.textContent.trim()==='download'){const rect=btn.getBoundingClientRect();if(rect.width>0&&rect.height>0){downloadBtn=btn;break}}}
if(!downloadBtn){resolve({success:!1,message:'Download button not found'});return}
downloadBtn.click();const menuDelay=getRandomDelay(delays.actionMin,delays.actionMax);setTimeout(()=>{let option720p=null;const menuItems=document.querySelectorAll('[role="menuitem"]');for(const item of menuItems){const text=item.textContent||'';if(text.includes('720p')){option720p=item;break}}
if(option720p){option720p.click();resolve({success:!0,message:'Download 720p started!'})}else{resolve({success:!0,message:'Download clicked! (720p not found)'})}},menuDelay)},500)})},args:[CONFIG.delays]});if(result&&result[0]&&result[0].result){const{success,message}=result[0].result;videoUpdateStatus(message);showToast(message,success?'success':'error')}}catch(error){videoUpdateStatus(`Error: ${error.message}`);showToast('Failed to click download','error')}}
async function videoHandleTestDownloadMulti(){const maxDownloads=parseInt(videoDownloadCountAuto?.value||'1');videoUpdateStatus(`กำลังเตรียมดูดไฟล์ ${maxDownloads} คลิป...`);try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const downloadResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:async(maxDl)=>{const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));window.scrollTo(0,0);await sleep(1000);const allVideos=Array.from(document.querySelectorAll('video'));const validVideos=allVideos.filter(vid=>{const rect=vid.getBoundingClientRect();return rect.width>150});if(validVideos.length===0){return{success:!1,message:'ไม่พบวิดีโอหลักบนหน้าจอ'}}
const toDownload=Math.min(maxDl,validVideos.length);let downloadedCount=0;for(let i=0;i<toDownload;i++){const targetVideo=validVideos[i];targetVideo.scrollIntoView({behavior:'smooth',block:'center'});await sleep(800);let vidSrc=targetVideo.getAttribute('src')||targetVideo.currentSrc||targetVideo.src;if(!vidSrc){const sourceTag=targetVideo.querySelector('source');if(sourceTag)vidSrc=sourceTag.getAttribute('src')||sourceTag.src}
if(vidSrc){try{const absoluteUrl=new URL(vidSrc,window.location.origin).href;const response=await fetch(absoluteUrl);if(!response.ok)throw new Error(`HTTP Error: ${response.status}`);const blob=await response.blob();const blobUrl=window.URL.createObjectURL(blob);const a=document.createElement('a');a.style.display='none';a.href=blobUrl;a.download=`Banana_Video_${Date.now()}_${i+1}.mp4`;document.body.appendChild(a);a.click();await sleep(500);document.body.removeChild(a);window.URL.revokeObjectURL(blobUrl);downloadedCount++;await sleep(1500)}catch(fetchErr){console.log(`ดูดวิดีโอที่ ${i+1} ล้มเหลว:`,fetchErr)}}else{console.log(`ข้ามวิดีโอที่ ${i+1}: หาลิงก์ (src) ไม่เจอ`)}}
return{success:downloadedCount>0,downloaded:downloadedCount,total:toDownload,message:downloadedCount>0?`ดาวน์โหลดเสร็จ ${downloadedCount}/${toDownload} คลิป!`:'ดึงไฟล์ไม่สำเร็จ'}},args:[maxDownloads]});const res=downloadResult[0]?.result;if(res&&res.success){videoUpdateStatus(res.message);showToast(res.message,'success')}else{videoUpdateStatus(`Error: ${res?.message || 'ไม่สามารถดึงวิดีโอได้'}`);showToast('Failed to download videos','error')}}catch(error){videoUpdateStatus(`Error: ${error.message}`);showToast('Failed to execute script','error')}}
function setupSettingsModal(){const btnSettings=document.getElementById('btn-settings');const closeSettingsBtn=document.getElementById('close-settings');const cancelSettingsBtn=document.getElementById('btn-cancel-settings');const saveSettingsBtn=document.getElementById('btn-save-settings');const settingsModal=document.getElementById('settings-modal');if(!btnSettings||!settingsModal)return;btnSettings.addEventListener('click',openSettingsModal);closeSettingsBtn.addEventListener('click',closeSettingsModal);cancelSettingsBtn.addEventListener('click',closeSettingsModal);saveSettingsBtn.addEventListener('click',saveSettings);settingsModal.addEventListener('click',(e)=>{if(e.target===settingsModal){closeSettingsModal()}})}
function openSettingsModal(){const settingsModal=document.getElementById('settings-modal');const veo3AspectRatioSelect=document.getElementById('veo3-aspect-ratio');const savedAspectRatio=localStorage.getItem('veo3_aspect_ratio')||'9:16';if(veo3AspectRatioSelect)veo3AspectRatioSelect.value=savedAspectRatio;if(settingsModal)settingsModal.classList.add('show');}
function closeSettingsModal(){const settingsModal=document.getElementById('settings-modal');if(settingsModal)settingsModal.classList.remove('show');}
function saveSettings(){const veo3AspectRatioSelect=document.getElementById('veo3-aspect-ratio');if(veo3AspectRatioSelect){const aspectRatio=veo3AspectRatioSelect.value;localStorage.setItem('veo3_aspect_ratio',aspectRatio)}const geminiInput=document.getElementById('settings-gemini-api-key');if(geminiInput){localStorage.setItem('gemini_api_key',geminiInput.value.trim())}const modelSelect=document.getElementById('settings-ai-model');if(modelSelect){localStorage.setItem('story_ai_model',modelSelect.value)}closeSettingsModal();showToast('บันทึกการตั้งค่าสำเร็จ!','success')}
function getGeminiApiKey(){return localStorage.getItem('gemini_api_key')||''}
function getStoryAIModel(){return localStorage.getItem('story_ai_model')||'gemini-2.5-pro'}
function getVeo3AspectRatio(){return localStorage.getItem('veo3_aspect_ratio')||'9:16'}
function parseYAMLToPlainText(yamlText,isVideo=!0){if(!yamlText||typeof yamlText!=='string'){return yamlText}
const lines=yamlText.split('\n');const values=[];let currentField=null;let currentValue=[];const videoFields=['dialogue','emotion','voice_type','action','character','setting','camera'];const imageFields=['emotion','action','character','setting','camera','style'];const fieldsToExtract=isVideo?videoFields:imageFields;function finishCurrentField(){if(currentField&&currentValue.length>0){const value=currentValue.join(' ').trim();const cleanValue=value.replace(/^["']|["']$/g,'');if(cleanValue){values.push(cleanValue)}
currentValue=[];currentField=null}}
for(const line of lines){const trimmedLine=line.trim();if(!trimmedLine||trimmedLine.startsWith('#')){if(currentField){continue}
continue}
let foundField=!1;for(const field of fieldsToExtract){const fieldRegex=new RegExp(`^${field}\\s*:\\s*(.*)$`,'i');const match=trimmedLine.match(fieldRegex);if(match){finishCurrentField();currentField=field;const valuePart=match[1].trim();if(valuePart){currentValue.push(valuePart)}
foundField=!0;break}}
if(!foundField&&currentField){if(trimmedLine.match(/^\s+/)||!trimmedLine.includes(':')){currentValue.push(trimmedLine)}else{finishCurrentField()}}}
finishCurrentField();if(values.length===0){return yamlText}
return values.join(' ')}
function videoHandleCopyPrompt(){const text=videoPromptResult.textContent;if(!text||text.includes('กำลังวิเคราะห์')){showToast('ไม่มี Prompt ให้คัดลอก','error');return}
navigator.clipboard.writeText(text).then(()=>{showToast('คัดลอก Prompt แล้ว!','success');videoBtnCopyPrompt.textContent='✅';setTimeout(()=>{videoBtnCopyPrompt.textContent='📋'},2000)}).catch(()=>{showToast('ไม่สามารถคัดลอกได้','error')})}
function videoSleep(ms){return new Promise((resolve,reject)=>{if(videoShouldStopAutomation){return reject(new Error('STOPPED'))}
const checkInterval=100;let elapsed=0;const intervalId=setInterval(()=>{if(videoShouldStopAutomation){clearInterval(intervalId);reject(new Error('STOPPED'))}else if(elapsed>=ms){clearInterval(intervalId);resolve()}
elapsed+=checkInterval},checkInterval)})}
function videoStopAutomation(){if(videoIsAutomationRunning){videoShouldStopAutomation=!0;videoUpdateStatus('กำลังหยุด...');showToast('กำลังหยุด Automation...','error')}}
async function videoRunAutomation(){if(!_0x99f){return}
const isCorrect=await checkCorrectWebsite();if(!isCorrect)return;if(videoIsAutomationRunning){showToast('กำลังรันอยู่แล้ว กรุณารอสักครู่','error');return}
const productName=videoProductNameInput.value.trim();if(videoUploadedImages.length===0){showToast('กรุณาอัพโหลดภาพตั้งต้นก่อน','error');return}
videoIsAutomationRunning=!0;videoShouldStopAutomation=!1;videoBtnAutomation.disabled=!0;await toggleWebPageLock(!0);videoBtnAutomation.innerHTML='<span class="loading"></span> <span>กำลังรัน Video...</span>';if(videoBtnStop)videoBtnStop.style.display='flex';if(videoPromptStatus)videoPromptStatus.style.display='none';const totalImages=videoUploadedImages.length;const roundsPerImage=videoGetRoundsPerImage();const totalRounds=totalImages*roundsPerImage;let completedRounds=0;let totalDownloaded=0;try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});videoUpdateStatus(`⚙️ Step 1/4: กำลังตั้งค่าโหมด Video...`);const setupVideoMode=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(ratio)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));function heavyClick(el){if(!el)return!1;el.scrollIntoView({behavior:'instant',block:'center'});el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mousedown',{bubbles:!0}));el.click();el.dispatchEvent(new MouseEvent('mouseup',{bubbles:!0}));el.dispatchEvent(new PointerEvent('pointerup',{bubbles:!0}));return!0}
function findSafeSettingsButton(iconNames,textKeywords=[],blacklist=[]){const allBtns=Array.from(document.querySelectorAll('button, [role="tab"]'));return allBtns.find(btn=>{const rect=btn.getBoundingClientRect();if(rect.left<200)return!1;if(btn.closest('nav, aside'))return!1;const icon=btn.querySelector('i');const iconText=icon?icon.textContent.trim().toLowerCase():"";const btnText=(btn.textContent||"").trim().toLowerCase();const isBad=blacklist.some(word=>btnText.includes(word.toLowerCase()));if(isBad)return!1;const matchIcon=iconNames.some(name=>iconText===name.toLowerCase());const matchText=textKeywords.some(keyword=>btnText.includes(keyword.toLowerCase()));return(matchIcon||matchText)&&btn.offsetParent!==null})}
let settingsBtn=null;const allBtns=Array.from(document.querySelectorAll('button'));const submitBtn=[...allBtns].reverse().find(b=>(b.querySelector('i')?.textContent||"").trim()==='arrow_forward');if(submitBtn&&submitBtn.previousElementSibling){settingsBtn=submitBtn.previousElementSibling}
if(!settingsBtn){settingsBtn=findSafeSettingsButton(['tune','settings'],['ตั้งค่า'])}
if(!settingsBtn)return resolve({success:!1,msg:'❌ หาปุ่มเมนูตั้งค่าไม่เจอ'});heavyClick(settingsBtn);await sleep(800);let videoTab=null;for(let check=0;check<20;check++){await sleep(500);videoTab=findSafeSettingsButton(['videocam','play_circle'],['วิดีโอ','video'],['ดูวิดีโอ','เครื่องมือสร้างฉาก','scene']);if(videoTab)break}
if(videoTab){heavyClick(videoTab);await sleep(1000)}else{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));return resolve({success:!1,msg:'❌ หาแท็บ Video ไม่เจอ (เว็บโหลดช้า)'})}
let framesTab=null;for(let check=0;check<5;check++){await sleep(300);framesTab=findSafeSettingsButton(['crop_free'],['เฟรม','frames']);if(framesTab)break}
if(framesTab){heavyClick(framesTab);await sleep(1000)}
const targetIcon=(ratio==='9:16')?'crop_9_16':'crop_16_9';const targetText=(ratio==='9:16')?'9:16':'16:9';let ratioTab=null;for(let check=0;check<10;check++){await sleep(300);ratioTab=findSafeSettingsButton([targetIcon],[targetText]);if(ratioTab)break}
if(ratioTab){heavyClick(ratioTab);await sleep(1000)}
document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));await sleep(800);resolve({success:!0,msg:`✅ ตั้งค่า Video + Frames + ${ratio} สำเร็จ`})}catch(err){resolve({success:!1,msg:'Error: '+err.message})}})},args:[getVeo3AspectRatio()]});if(!setupVideoMode[0]?.result?.success){videoAddLog(`${setupVideoMode[0]?.result?.msg}`,'warning');throw new Error("ตั้งค่าโหมดวิดีโอไม่สำเร็จ")}else{videoAddLog(`${setupVideoMode[0]?.result?.msg}`,'success')}
await videoSleep(1000);for(let imgIndex=0;imgIndex<totalImages;imgIndex++){const currentImage=videoUploadedImages[imgIndex];for(let round=0;round<roundsPerImage;round++){const currentRound=imgIndex*roundsPerImage+round+1;const roundLabel=`[รอบ ${currentRound}/${totalRounds}]`;try{if(videoShouldStopAutomation)throw new Error('STOPPED');videoUpdateStatus(`${roundLabel} กำลังเตรียม Prompt...`);const styleSelect=document.getElementById('video-style-select');const textProtection=" [CRITICAL TEXT RULE: Any Thai text, typography, or product labels in the image MUST remain 100% FROZEN, STATIC, and UNCHANGED throughout the entire video. DO NOT morph, distort, translate, animate, or hallucinate new text.]";const strictFidelity=" [Maintain 100% exact fidelity to the source image. DO NOT alter the product's shape or background elements. Only animate the character.]"+textProtection;const tiktokSafetyRules=" (Rules: NO floating text, NO subtitles. Focus on natural mouth movements and minimal, realistic head gestures)."+strictFidelity;const videoTemplates={'talk_ugc':"Cinematic smartphone selfie-style video. An authentic, unscripted UGC review of [product]. The character looks directly into the lens like a real everyday customer sharing a genuine 'after-use' experience. The character is speaking in Thai with a highly natural, word-of-mouth tone. "+tiktokSafetyRules,'talk_excited':"Bright aesthetic lighting. The character is enthusiastically presenting [product] to the viewer. High energy, friendly influencer vibe, sharing a great deal. The character is speaking in Thai with a lively, natural tone. "+tiktokSafetyRules,'talk_cheerful':"The character is lighthearted and smiling naturally while talking about [product]. A relaxed, feel-good vibe (no fake loud laughing). The character is speaking in Thai with a joyful, friendly banter tone. "+tiktokSafetyRules,'talk_sassy':"The character speaks with a self-assured, slightly playful charm about [product]. Confident but approachable. The character is speaking in Thai with a sassy, confident, but highly natural tone. "+tiktokSafetyRules,'talk_sincere':"The character recommends [product] with a warm, heart-to-heart expression. Like advising a close family member. The character is speaking in Thai with a soft, sincere, but normal conversational speed tone. No dramatic pauses. "+tiktokSafetyRules,'rant_expert':"Professional portrait framing. The character acts as a friendly expert explaining the benefits of [product]. Calm and trustworthy body language. The character is speaking in Thai with an authoritative yet highly helpful tone. "+tiktokSafetyRules,'hook_secret':"The character leans in slightly with an intimate, conversational vibe, holding [product]. They have a 'real talk' expression, sharing a valuable secret. The character is speaking in Thai with a quick, engaging, and mysterious tone. Speak continuously. "+tiktokSafetyRules,'hook_comparison':"The character is analyzing [product] logically, making a conversational comparison. Slight head tilt. The character is speaking in Thai with an analytical, 'let me explain' tone. "+tiktokSafetyRules,'rant':"The character is delivering a passionate 'tough love' rant. Acting like a caring best friend scolding the viewer for neglecting their own well-being, before forcefully recommending [product] as the ultimate solution. The character is speaking in Thai with a fast, urgent, scolding, yet deeply caring tone. "+tiktokSafetyRules,'hook_mistake':"The character gives a caring but strict warning, slightly shaking their head in disbelief at a common mistake the viewer is making. It feels like a mother scolding out of love before offering [product] to help. The character is speaking in Thai with a concerned, slightly strict, but highly helpful warning tone. "+tiktokSafetyRules,'rant_skeptical':"The character gives a serious, concerned wake-up call. They show slight frustration about a bad habit the viewer is doing, then their expression turns highly supportive as they introduce [product] to fix it. The character is speaking in Thai with an honest, tough-love realization tone. "+tiktokSafetyRules,'rant_partner':"The character acts like a caring but frustrated partner, playfully scolding the viewer for not taking care of themselves, then handing them [product] as the perfect solution. The character is speaking in Thai with a passionate, slightly annoyed but deeply loving tone. "+tiktokSafetyRules,'closing_urgency':"The character expresses a natural sense of urgency about [product]. Fast-paced, dynamic energy, subtly gesturing downwards. The character is speaking in Thai with a fast-paced, FOMO-driven tone. "+tiktokSafetyRules,'closing_sincere':"The character gives a warm, reassuring sign-off with [product] in hand. A gentle smile indicating 'trust me on this one'. The character is speaking in Thai with a comforting, caring, but fluent and continuous tone. "+tiktokSafetyRules,'closing_challenge':"The character holds [product] confidently, giving a friendly, playful nod. They project a bold vibe, daring the viewer to try it. The character is speaking in Thai with a bold, confident, and challenging tone. "+tiktokSafetyRules,'closing_cta':"The character delivers a direct but friendly Call-To-Action about [product], subtly pointing or looking down to indicate the shopping basket. The character is speaking in Thai with a clear, inviting CTA tone. "+tiktokSafetyRules,'broll_hero':"Professional commercial Hero Shot. The [product] stands perfectly still. Very subtle light reflection movement on the surface to show realism. NO rotation. Keep original image 100%. "+tiktokSafetyRules,'broll_pan':"Slow and smooth cinematic camera pan over [product]. Keep the product and background exactly as the original image. "+tiktokSafetyRules,'broll_zoom':"Camera slowly zooms in on [product] texture. Highlighting micro-details without changing them. "+tiktokSafetyRules,'broll_cinematic':"Cinematic lighting setup showcasing [product]. Elegant, slow-motion feel with a premium aesthetic. Keep original image completely unmodified. "+tiktokSafetyRules,'miniature_vdo':`Cinematic miniature world animation. The giant [product] remains static. Tiny characters are moving in a stepped stop-motion style. Tilt-shift macro zoom. ${tiktokSafetyRules}`,'voice_promo':"Fast cuts commercial style. Energetic camera movement showing [product]. Keep original image details. Voice Tone: High-energy, fast-paced commercial narrator. "+tiktokSafetyRules,'voice_soft':"Gentle camera movement showing [product]. Soft vibe. Keep original colors. Voice Tone: Soothing and calm narrator, but speaking at a normal, continuous commercial pace. NOT slow ASMR. "+tiktokSafetyRules,'voice_docu':"Cinematic product documentary style. Elegant pans detailing the premium quality of [product]. Voice Tone: Professional and sophisticated product narrator explaining features continuously at a standard commercial speed. NOT slow. "+tiktokSafetyRules,'voice_rant':"Dramatic and urgent commercial style. High contrast lighting showing [product]. Voice Tone: Strict, deeply concerned, and urgent warning narrator. "+tiktokSafetyRules,'voice_miniature':"Cinematic miniature world animation. The giant [product] remains static. Tiny characters moving in stop-motion. Script Style: A highly engaging TikTok-style narrative. Start with a cinematic hook, explain REAL benefits, end with CTA. Voice Tone: Magical, premium documentary narrator. "+tiktokSafetyRules,'cartoon':"Magical and highly expressive commercial style. Playful camera angles showing [product] with a vibrant, animated vibe. Voice Tone: Classic Disney-style cartoon narrator, theatrical, highly expressive, magical, and bouncy. "+tiktokSafetyRules,'voice_news':"Professional news broadcast style. Camera framing [product] as the subject of a breaking news or exclusive feature story. Clean, objective, and high-quality presentation. Voice Tone: Authoritative, clear, and professional news anchor narrator reporting breaking news and formally presenting the key details about [product]. "+tiktokSafetyRules,'voice_movie':"Epic Hollywood movie trailer style. Dramatic lighting showcasing [product]. Voice Tone: Deep, resonant movie trailer narrator speaking continuously and powerfully without long dramatic pauses. "+tiktokSafetyRules};const randomVStyleSwitch=document.getElementById('video-random-style-switch');const customScriptInput=document.getElementById('video-custom-script');const customScriptValue=customScriptInput?customScriptInput.value.trim():"";const isRandomVStyle=randomVStyleSwitch?randomVStyleSwitch.checked:!1;let selectedId="talk_ugc";const noVoiceModes=['broll_hero','broll_pan','broll_zoom','broll_cinematic','miniature_vdo'];const voiceoverModes=['voice_promo','voice_soft','voice_docu','voice_rant','voice_miniature','cartoon','voice_news','voice_movie'];if(isRandomVStyle){let keys=Object.keys(videoTemplates);if(customScriptValue!==""){keys=keys.filter(k=>!noVoiceModes.includes(k))}
selectedId=keys[Math.floor(Math.random()*keys.length)]}else{selectedId=styleSelect?styleSelect.value:'talk_ugc'}
let finalPrompt=videoTemplates[selectedId]||videoTemplates.talk_ugc;finalPrompt=finalPrompt.replace(/\[product\]/g,productName||'the product');const voiceOptions=['central','isan','northern'];let videoVoiceInput=document.getElementById('video-voice-select');let selectedVoice=(videoVoiceInput&&videoVoiceInput.value!=='auto')?videoVoiceInput.value:voiceOptions[Math.floor(Math.random()*3)];const genderInput=document.getElementById('video-voice-gender-select');let selectedGender=(genderInput&&genderInput.value!=='auto')?genderInput.value:'';if(!voiceoverModes.includes(selectedId)){selectedGender=''}
const genderMap={'female':'adult female','male':'adult male','teen_girl':'teenage girl','teen_boy':'teenage boy','girl':'young girl','boy':'young boy','grandma':'elderly female','grandpa':'elderly male'};let genderTerm=genderMap[selectedGender]||'';let speakerRef="The character is";let thaiHeader="[CRITICAL LANGUAGE OVERRIDE: 100% THAI AUDIO ONLY. NO ENGLISH.] ";let thaiFooter=" [STRICT ENFORCEMENT: The character MUST speak exclusively in fluent Thai language. Absolutely NO English words, NO foreign languages, NO English accents. Must speak with a natural, continuous conversational pace. NO unnaturally slow talking, NO awkward pauses.]";let dialectPhrase="";if(selectedVoice==='isan'){dialectPhrase=`${thaiHeader}[DIALECT: Isan Thai] ${speakerRef} speaking in Isan Thai dialect. [CRITICAL RULE: This is a product review, NOT food. DO NOT use food words like "Saep". Use words like "Dee E-lee" or "Ngam" instead]${thaiFooter}`}else if(selectedVoice==='northern'){dialectPhrase=`${thaiHeader}[DIALECT: Northern Thai] ${speakerRef} speaking in Northern Thai dialect with a modern conversational pace. Strictly speaking ONLY, NO singing, NO traditional music${thaiFooter}`}else{dialectPhrase=`${thaiHeader}[DIALECT: Standard Thai] ${speakerRef} speaking in standard Thai${thaiFooter}`}
if(noVoiceModes.includes(selectedId)){finalPrompt=finalPrompt.replace(/The character is speaking in Thai/gi,'');finalPrompt=finalPrompt.replace(/speaking in thai/gi,'');videoAddLog(`🔇 B-Roll: ปิดเสียง`,'info')}else if(voiceoverModes.includes(selectedId)){let genderLabel=genderTerm?`${genderTerm} `:"";let voPhrase=dialectPhrase.replace(/The character is/gi,'The narrator voiceover is');finalPrompt+=` (Audio Note: A professional ${genderLabel}narrator voiceover. ${voPhrase}).`;videoAddLog(`🎙️ Voiceover: ${genderTerm || 'ไม่ระบุเพศ'} (${selectedVoice})`,'info')}else{finalPrompt+=` ${dialectPhrase}`}
if(customScriptValue&&!noVoiceModes.includes(selectedId)){if(voiceoverModes.includes(selectedId)){finalPrompt+=` The narrator voiceover is saying exactly in Thai language: "${customScriptValue}".`}else{finalPrompt+=` The character is talking to the camera, saying exactly in Thai language: "${customScriptValue}".`}
videoAddLog(`🗣️ ใช้บทพูดที่ระบุ: "${customScriptValue}"`,'info')}
finalPrompt+=` Product label and text must be 100% FROZEN. ${getAntiBotSeed()} Negative Prompt: "foreign language, english language, english audio, other languages, text morphing, changing text, distorted letters, gibberish, alien language, moving text, floating letters, bad text, slow talking, slow speaking, long pauses, awkward silence, short speech, whispering"`;videoUpdateStatus(`${roundLabel} Step 2/4: กำลังอัพโหลดและเพิ่มลงพรอมต์...`);const singleImageData=[{name:currentImage.name,type:currentImage.type,dataUrl:currentImage.dataUrl}];const uploadResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(images)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));async function triggerClick(el){if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});await sleep(300);el.dispatchEvent(new MouseEvent('mouseover',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:!0}));el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mousedown',{bubbles:!0}));await sleep(100);el.dispatchEvent(new PointerEvent('pointerup',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mouseup',{bubbles:!0}));el.click()}
async function actionClick(el){if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});await sleep(300);el.dispatchEvent(new MouseEvent('mouseover',{bubbles:!0}));el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mousedown',{bubbles:!0}));await sleep(100);el.dispatchEvent(new PointerEvent('pointerup',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mouseup',{bubbles:!0}));el.click()}
const getFeedImgs=()=>Array.from(document.querySelectorAll('img')).filter(img=>{const rect=img.getBoundingClientRect();const isHeader=img.closest('header, nav, [role="banner"]');return rect.width>40&&rect.height>40&&!isHeader});const initialImagesSrc=getFeedImgs().map(img=>img.src);const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(!editor)return resolve({success:!1,msg:'❌ ไม่พบช่องแชทเพื่อวางรูป'});editor.focus();editor.click();await sleep(500);const dataTransfer=new DataTransfer();images.forEach((img)=>{const byteString=atob(img.dataUrl.split(',')[1]);const ab=new ArrayBuffer(byteString.length);const ia=new Uint8Array(ab);for(let i=0;i<byteString.length;i++)ia[i]=byteString.charCodeAt(i);const file=new File([new Blob([ab],{type:img.type})],img.name,{type:img.type});dataTransfer.items.add(file)});const pasteEvent=new ClipboardEvent('paste',{clipboardData:dataTransfer,bubbles:!0,cancelable:!0});editor.dispatchEvent(pasteEvent);await sleep(4000);let confirmBtn=null;const confirmTexts=['Save','Confirm','Crop and Save','บันทึก','ยืนยัน','เสร็จสิ้น','ต่อไป'];for(let check=0;check<20;check++){const currentButtons=document.querySelectorAll('button');confirmBtn=Array.from(currentButtons).find(btn=>confirmTexts.some(t=>(btn.textContent||'').includes(t))&&btn.offsetParent!==null);if(confirmBtn)break;await sleep(500)}
if(confirmBtn){confirmBtn.click();await sleep(4000)}
let isSuccess=!1;for(let w=0;w<40;w++){await sleep(1500);const currentImgs=getFeedImgs();let newImg=currentImgs.find(img=>!initialImagesSrc.includes(img.src));if(!newImg){const uploadLabels=Array.from(document.querySelectorAll('span, div, p')).filter(el=>el.innerText&&(el.innerText.includes('รูปภาพที่อัปโหลด')||el.innerText.includes('Uploaded')));if(uploadLabels.length>0){let container=uploadLabels[0].closest('div[class*="card"], div:has(img)')||uploadLabels[0].parentElement.parentElement;if(container)newImg=container.querySelector('img');}}
if(newImg){newImg.scrollIntoView({behavior:'smooth',block:'center'});await sleep(1000);newImg.dispatchEvent(new MouseEvent('mouseover',{bubbles:!0}));newImg.dispatchEvent(new MouseEvent('mouseenter',{bubbles:!0}));await sleep(1000);let dotBtn=null;let container=newImg.parentElement;for(let i=0;i<15;i++){if(!container||container===document.body)break;const btns=Array.from(container.querySelectorAll('button'));dotBtn=btns.find(b=>{const icon=b.querySelector('i, svg');const text=(b.innerText||'').toLowerCase();const ariaLabel=(b.getAttribute('aria-label')||'').toLowerCase();const isMenu=b.getAttribute('aria-haspopup')==='menu';return isMenu||ariaLabel.includes('more')||ariaLabel.includes('ตัวเลือก')||(icon&&(text.includes('more')||text.includes('vert')||text.includes('horiz')))});if(dotBtn)break;container=container.parentElement}
if(!dotBtn){const allBtns=Array.from(document.querySelectorAll('button'));const validDotBtns=allBtns.filter(b=>{const isMenu=b.getAttribute('aria-haspopup')==='menu';const icon=b.querySelector('i, svg');const text=(b.innerText||'').toLowerCase();const rect=b.getBoundingClientRect();return(isMenu||(icon&&text.includes('more')))&&rect.width>0});if(validDotBtns.length>0){const imgRect=newImg.getBoundingClientRect();validDotBtns.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-imgRect.top)-Math.abs(b.getBoundingClientRect().top-imgRect.top));dotBtn=validDotBtns[0]}}
if(dotBtn){await triggerClick(dotBtn);await sleep(1500);const menuItems=Array.from(document.querySelectorAll('[role="menuitem"], button')).reverse();const addPromptBtn=menuItems.find(m=>{const rect=m.getBoundingClientRect();if(rect.width===0||rect.height===0)return!1;const text=(m.textContent||"").replace(/\s+/g,'');return text.includes('เพิ่มไปยังพรอมต์')||text.includes('addtoprompt')||text.includes('เพิ่มลงในพรอมต์')});if(addPromptBtn){await actionClick(addPromptBtn);await sleep(800);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));isSuccess=!0;break}else{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}))}}else{newImg.dispatchEvent(new MouseEvent('contextmenu',{bubbles:!0,cancelable:!0,view:window,button:2}));await sleep(1500)}}}
if(isSuccess){return resolve({success:!0,msg:'✅ กด [เพิ่มไปยังพรอมต์] สำเร็จแล้ว!'})}else{return resolve({success:!1,msg:'❌ หมดเวลารอ หรือกดเมนูไม่ติด'})}}catch(e){resolve({success:!1,msg:'Error: '+e.message})}})},args:[singleImageData]});if(!uploadResult[0]?.result?.success){videoAddLog(`⚠️ ${uploadResult[0]?.result?.msg} -> ข้ามรอบนี้`,'warning');throw new Error("นำรูปเข้ากล่องเริ่มไม่สำเร็จ")}else{videoAddLog(`${uploadResult[0]?.result?.msg}`,'success')}
await videoSleep(3000);videoUpdateStatus(`${roundLabel} Step 3/4: กำลังป้อนคำสั่งสร้างวิดีโอ...`);await chrome.scripting.executeScript({target:{tabId:tab.id},func:async(text)=>{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(editor){editor.blur();await sleep(100);editor.focus();editor.click();await sleep(300);editor.dispatchEvent(new KeyboardEvent('keydown',{key:'a',ctrlKey:!0,bubbles:!0}));document.execCommand('selectAll',!1,null);await sleep(100);editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',keyCode:8,bubbles:!0}));document.execCommand('delete',!1,null);await sleep(300);editor.dispatchEvent(new InputEvent('beforeinput',{inputType:'insertText',data:text,bubbles:!0,cancelable:!0}));const dt=new DataTransfer();dt.setData('text/plain',text);dt.setData('text/html',`<p>${text}</p>`);const pasteEvent=new ClipboardEvent('paste',{clipboardData:dt,bubbles:!0,cancelable:!0,composed:!0});editor.dispatchEvent(pasteEvent);await sleep(500);if(!editor.textContent.includes(text.substring(0,10))){document.execCommand('insertText',!1,text)}
editor.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:text,bubbles:!0,composed:!0}));editor.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',keyCode:32,bubbles:!0}));document.execCommand('insertText',!1,' ');editor.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:' ',bubbles:!0}));editor.dispatchEvent(new KeyboardEvent('keyup',{key:' ',code:'Space',keyCode:32,bubbles:!0}));editor.blur();await sleep(150);editor.focus()}},args:[finalPrompt]});await videoSleep(4500);videoUpdateStatus(`${roundLabel} Step 4/4: กำลังกดสร้างวิดีโอ...`);const createResult=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:(timeoutMs)=>{return new Promise((resolve)=>{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));async function trySubmit(){let attempts=0;const maxAttempts=Math.floor(timeoutMs/1000);while(attempts<maxAttempts){attempts++;const allBtns=Array.from(document.querySelectorAll('button'));let targetBtn=null;for(let i=allBtns.length-1;i>=0;i--){const btn=allBtns[i];const html=(btn.innerHTML||"").toLowerCase();const text=(btn.textContent||"").toLowerCase().trim();const style=window.getComputedStyle(btn);if(btn.disabled||style.pointerEvents==='none'||style.opacity==='0'||btn.getAttribute('aria-disabled')==='true')continue;if(text.includes('nano')||text.includes('pro')||text.includes('อัปเกรด'))continue;if(html.includes('add_circle')||html.includes('add '))continue;if(html.includes('arrow_forward')||html.includes('send')||text==='สร้าง'||text==='create'){targetBtn=btn;break}}
if(targetBtn){targetBtn.scrollIntoView({behavior:'smooth',block:'center'});await sleep(500);let success=!1;try{const reactKey=Object.keys(targetBtn).find(k=>k.startsWith('__reactProps'));if(reactKey&&targetBtn[reactKey].onClick){targetBtn[reactKey].onClick({preventDefault:()=>{},stopPropagation:()=>{},nativeEvent:{isTrusted:!0},type:'click'});success=!0}else{const icon=targetBtn.querySelector('i');if(icon){const iconKey=Object.keys(icon).find(k=>k.startsWith('__reactProps'));if(iconKey&&icon[iconKey].onClick){icon[iconKey].onClick({preventDefault:()=>{},stopPropagation:()=>{},nativeEvent:{isTrusted:!0},type:'click'});success=!0}}}}catch(e){}
const rect=targetBtn.getBoundingClientRect();const x=rect.left+(rect.width/2);const y=rect.top+(rect.height/2);const mouseOpts={bubbles:!0,cancelable:!0,view:window,clientX:x,clientY:y};targetBtn.dispatchEvent(new PointerEvent('pointerdown',mouseOpts));targetBtn.dispatchEvent(new MouseEvent('mousedown',mouseOpts));targetBtn.dispatchEvent(new PointerEvent('pointerup',mouseOpts));targetBtn.dispatchEvent(new MouseEvent('mouseup',mouseOpts));targetBtn.click();targetBtn.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,bubbles:!0}));const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(editor){editor.focus();editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:!0}))}
return resolve({success:!0,msg:'กดปุ่มส่งคำสั่งสำเร็จ!'})}
await sleep(1000)}
resolve({success:!1,msg:'หาปุ่มส่งคำสั่งไม่เจอ หรือปุ่มยังโหลดไม่เสร็จ'})}
trySubmit()})},args:[30000]});if(!createResult[0]?.result?.success)throw new Error(createResult[0]?.result?.msg);videoAddLog(`🖱️ ${roundLabel} ส่งคำสั่งสร้างวิดีโอเรียบร้อย`,'success');await videoSleep(3000);const checkboxEl=document.getElementById('video-download-count-auto');const isDownloadEnabled=checkboxEl?checkboxEl.checked:!0;if(!isDownloadEnabled){const turboWait=Math.floor(Math.random()*15000)+45000;videoUpdateStatus(`🚀 ${roundLabel} Turbo Mode: พักรอ ${Math.floor(turboWait/1000)} วิ ป้องกันเว็บค้าง...`);await videoSleep(turboWait);videoAddLog(`⏭️ ส่งคิวใหม่ (วิดีโอเดิมน่าจะเสร็จไปแล้ว 80%)`,'info')}else{videoUpdateStatus(`⏳ ${roundLabel} รอ AI เรนเดอร์วิดีโอ (อาจใช้เวลา 1-3 นาที)...`);const getOldVids=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{return Array.from(document.querySelectorAll('video')).map(v=>{return v.getAttribute('src')||v.currentSrc||v.src||''}).filter(src=>src!=='')}});const oldVideoSrcs=getOldVids[0]?.result||[];let isFinished=!1;for(let w=0;w<240;w++){if(videoShouldStopAutomation)throw new Error('STOPPED');const checkProgress=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(oldSrcs)=>{const currentVids=Array.from(document.querySelectorAll('video'));let newCount=0;for(const v of currentVids){const src=v.getAttribute('src')||v.currentSrc||v.src||'';if(src&&!oldSrcs.includes(src))newCount++}
const hasProgressBar=document.querySelector('[role="progressbar"]')!==null;const hasLoadingText=Array.from(document.querySelectorAll('button, span, div')).some(el=>{const txt=(el.textContent||'').trim();return txt.includes('กำลังสร้าง')||txt.includes('Generating')||/^(\d+%)|(\d+\s*%)$/.test(txt)});const hasLoadingClass=document.querySelector('[class*="loading"], [class*="progress"]')!==null;const isLoading=hasProgressBar||hasLoadingText||hasLoadingClass;return{newVids:newCount,loading:isLoading}},args:[oldVideoSrcs]});const status=checkProgress[0]?.result;if(status&&status.newVids>0&&!status.loading){videoUpdateStatus(`✅ เจอวิดีโอใหม่ ${status.newVids} คลิป! รอระบบประมวลผลให้สมบูรณ์อีก 8 วินาที...`);await videoSleep(8000);isFinished=!0;break}
if(w%10===0)videoUpdateStatus(`⏳ กำลังเรนเดอร์... (${w}s)`);await videoSleep(1000)}
if(isFinished){videoUpdateStatus(`✅ สร้างวิดีโอเสร็จสิ้น!`);videoAddLog(`${roundLabel} เรนเดอร์วิดีโอสำเร็จ`,'success');videoUpdateStatus(`📥 กำลังเตรียมดูดไฟล์วิดีโอที่เพิ่งสร้างเสร็จ...`);const downloadResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(oldSrcs)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));window.scrollTo({top:0,behavior:'smooth'});await sleep(1500);const allVideos=Array.from(document.querySelectorAll('video'));const feedVideos=allVideos.filter(vid=>!vid.closest('header, nav, [role="textbox"]'));const newVideos=feedVideos.filter(vid=>{const src=vid.getAttribute('src')||vid.currentSrc||vid.src||'';return src&&!oldSrcs.includes(src)});if(newVideos.length===0){return resolve({success:!1,msg:'ไม่พบวิดีโอใหม่ (อาจจะเรนเดอร์ล้มเหลว)'})}
newVideos.sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);const targetVideos=newVideos.slice(0,4);let downloadedCount=0;for(let i=0;i<targetVideos.length;i++){const targetVideo=targetVideos[i];let vidSrc=targetVideo.getAttribute('src')||targetVideo.currentSrc||targetVideo.src;if(vidSrc){const absoluteUrl=new URL(vidSrc,window.location.origin).href;const response=await fetch(absoluteUrl);if(!response.ok)continue;const blob=await response.blob();const blobUrl=window.URL.createObjectURL(blob);const a=document.createElement('a');a.style.display='none';a.href=blobUrl;a.download=`Banana_Video_Auto_${Date.now()}_${i+1}.mp4`;document.body.appendChild(a);a.click();await sleep(500);document.body.removeChild(a);window.URL.revokeObjectURL(blobUrl);downloadedCount++;await sleep(1500)}}
if(downloadedCount>0){resolve({success:!0,msg:`ดูดไฟล์วิดีโอใหม่สำเร็จ ${downloadedCount} คลิป!`})}else{resolve({success:!1,msg:`หาลิงก์ของวิดีโอใหม่ไม่เจอ (อาจจะโหลดไม่ขึ้น)`})}}catch(err){resolve({success:!1,msg:'Error: '+err.message})}})},args:[oldVideoSrcs]});if(downloadResult[0]?.result?.success){videoAddLog(`📥 ${downloadResult[0].result.msg}`,'success')}else{videoAddLog(`⚠️ โหลดอัตโนมัติไม่สำเร็จ: ${downloadResult[0]?.result?.msg}`,'warning')}}else{videoUpdateStatus(`⚠️ หมดเวลารอวิดีโอ (วิดีโออาจจะยังเรนเดอร์ไม่เสร็จ)`)}}
completedRounds++;if(currentRound<totalRounds){const cooldownTime=Math.floor(Math.random()*3000)+7000;videoUpdateStatus(`⏳ พักระบบ ${cooldownTime/1000} วินาทีก่อนเริ่มคลิปถัดไป...`);await videoSleep(cooldownTime)}}catch(roundError){const errMsg=roundError.message||"";if(errMsg==='STOPPED'){videoShouldStopAutomation=!0;videoIsAutomationRunning=!1;throw new Error('STOPPED')}
videoUpdateStatus(`⚠️ พบปัญหา: ${errMsg} -> ข้ามไปรอบถัดไป`);await videoSleep(2000)}}}
videoUpdateStatus(`🎉 ทำงานเสร็จสิ้นทั้งหมด!`);showToast('Mission Complete!','success')}catch(error){if(error.message!=='STOPPED')videoAddLog(`❌ Error: ${error.message}`,'error');}finally{videoIsAutomationRunning=!1;videoShouldStopAutomation=!1;videoBtnAutomation.disabled=!1;videoBtnAutomation.innerHTML='<span>START VIDEO</span>';videoBtnStop.style.display='none';try{await toggleWebPageLock(!1)}catch(e){}}}
function getVeo3AspectRatio(){return localStorage.getItem('veo3_aspect_ratio')||'9:16'}
const bananaUploadZone=document.getElementById('banana-upload-zone');const bananaFileInput=document.getElementById('banana-file-input');const bananaImageCount=document.getElementById('banana-image-count');const bananaClearImagesBtn=document.getElementById('banana-clear-images');const bananaStatusText=document.getElementById('banana-status-text');const bananaBtnAutomation=document.getElementById('banana-btn-automation');const bananaToVideoCheckbox=document.getElementById('banana-to-video-checkbox');const bananaDownloadCount=document.getElementById('banana-download-count');const bananaBtnStop=document.getElementById('banana-btn-stop');const bananaPromptStatus=document.getElementById('banana-prompt-status');const bananaRoundCountSelect=document.getElementById('banana-round-count');const bananaCustomRoundInput=document.getElementById('banana-custom-round-input');const bananaRoundInfo=document.getElementById('banana-round-info');const bananaProductNameInput=document.getElementById('banana-product-name');const bananaStyleSelect=document.getElementById('banana-style-select');const bananaRandomStyleCheckbox=document.getElementById('banana-random-style-checkbox');const bananaBtnGeneratePrompt=document.getElementById('banana-btn-generate-prompt');const bananaPromptResultContainer=document.getElementById('banana-prompt-result-container');const bananaPromptResult=document.getElementById('banana-prompt-result');const bananaBtnCopyPrompt=document.getElementById('banana-btn-copy-prompt');const bananaLogContainer=document.getElementById('banana-log-container');const bananaLogClearBtn=document.getElementById('banana-log-clear');const bananaBgSelect=document.getElementById('banana-bg-select');const bananaRandomBgCheckbox=document.getElementById('banana-random-bg-checkbox');let bananaUploadedImages=[];let bananaCurrentImageIndex=0;let modelUploadedImages=[];let bananaIsAutomationRunning=!1;let bananaShouldStopAutomation=!1;let bananaStatusTimeoutId=null;let bananaLogs=[];function bananaSetupUploadZone(){bananaUploadZone.addEventListener('click',()=>{bananaFileInput.click()});bananaFileInput.addEventListener('change',(e)=>{bananaHandleFiles(e.target.files)});bananaUploadZone.addEventListener('dragover',(e)=>{e.preventDefault();bananaUploadZone.classList.add('dragover')});bananaUploadZone.addEventListener('dragleave',(e)=>{e.preventDefault();bananaUploadZone.classList.remove('dragover')});bananaUploadZone.addEventListener('drop',(e)=>{e.preventDefault();bananaUploadZone.classList.remove('dragover');bananaHandleFiles(e.dataTransfer.files)})}
const bananaPreviewContainer=document.getElementById('banana-preview-container');function bananaUpdateImageCount(){bananaImageCount.textContent=bananaUploadedImages.length;if(bananaUploadedImages.length>0){bananaClearImagesBtn.style.display='flex'}else{bananaClearImagesBtn.style.display='none'}
bananaUpdateRoundInfo();renderBananaPreviews()}
function renderBananaPreviews(){if(!bananaPreviewContainer)return;bananaPreviewContainer.innerHTML='';bananaUploadedImages.forEach((img,index)=>{const item=document.createElement('div');item.className='preview-item';const imgEl=document.createElement('img');imgEl.src=img.dataUrl;imgEl.title=img.name;const delBtn=document.createElement('button');delBtn.className='preview-remove-btn';delBtn.innerHTML='✕';delBtn.onclick=()=>bananaRemoveOneImage(index);item.appendChild(imgEl);item.appendChild(delBtn);bananaPreviewContainer.appendChild(item)})}
function bananaRemoveOneImage(index){bananaUploadedImages.splice(index,1);bananaUpdateImageCount()}
function bananaHandleFiles(files){const imageFiles=Array.from(files).filter(file=>file.type.startsWith('image/'));imageFiles.forEach(file=>{const reader=new FileReader();reader.onload=(e)=>{const imageData={id:Date.now()+Math.random(),name:file.name,size:file.size,type:file.type,dataUrl:e.target.result};bananaUploadedImages.push(imageData);bananaUpdateImageCount()};reader.readAsDataURL(file)});bananaFileInput.value=''}
function bananaClearAllImages(){bananaUploadedImages=[];bananaUpdateImageCount();bananaUpdateStatus('All images cleared')}
const modelUploadZone=document.getElementById('model-upload-zone');const modelFileInput=document.getElementById('model-file-input');const modelImageCount=document.getElementById('model-image-count');const modelCounterDiv=document.getElementById('model-image-counter');const modelClearBtn=document.getElementById('model-clear-images');function modelSetupUploadZone(){if(!modelUploadZone)return;modelUploadZone.addEventListener('click',()=>modelFileInput.click());modelFileInput.addEventListener('change',(e)=>{modelHandleFiles(e.target.files)});modelUploadZone.addEventListener('dragover',(e)=>{e.preventDefault();modelUploadZone.style.borderColor='#e65100';modelUploadZone.style.backgroundColor='#fff3e0'});modelUploadZone.addEventListener('dragleave',(e)=>{e.preventDefault();modelUploadZone.style.borderColor='#ff9800';modelUploadZone.style.backgroundColor=''});modelUploadZone.addEventListener('drop',(e)=>{e.preventDefault();modelUploadZone.style.borderColor='#ff9800';modelUploadZone.style.backgroundColor='';modelHandleFiles(e.dataTransfer.files)});if(modelClearBtn){modelClearBtn.addEventListener('click',()=>{modelUploadedImages=[];modelUpdateUI()})}}
function modelHandleFiles(files){const imageFiles=Array.from(files).filter(file=>file.type.startsWith('image/'));if(imageFiles.length>0){const file=imageFiles[0];const reader=new FileReader();reader.onload=(e)=>{modelUploadedImages=[{name:file.name,type:file.type,dataUrl:e.target.result}];modelUpdateUI()};reader.readAsDataURL(file)}
modelFileInput.value=''}
const modelPreviewContainer=document.getElementById('model-preview-container');function modelUpdateUI(){const container=document.getElementById('model-preview-container');const countBadge=document.getElementById('model-image-count');const uploadText=document.querySelector('#model-upload-zone .upload-text');const clearBtn=document.getElementById('model-clear-images');if(!container)return;container.innerHTML='';if(modelUploadedImages.length>0){if(countBadge){countBadge.textContent='1';countBadge.style.display='inline-block'}
if(uploadText)uploadText.textContent="เปลี่ยนรูปนางแบบ";if(clearBtn)clearBtn.classList.remove('hidden');const item=document.createElement('div');item.className='preview-item';const img=document.createElement('img');img.src=modelUploadedImages[0].dataUrl;const delBtn=document.createElement('button');delBtn.className='preview-remove-btn';delBtn.innerHTML='✕';delBtn.onclick=()=>{modelUploadedImages=[];modelUpdateUI()};item.appendChild(img);item.appendChild(delBtn);container.appendChild(item)}else{if(countBadge)countBadge.style.display='none';if(uploadText)uploadText.textContent="เพิ่มรูปนางแบบ (Ref)";if(clearBtn)clearBtn.classList.add('hidden');}
const hasImage=modelUploadedImages.length>0;const currentMode=document.getElementById('current-app-mode')?.value||'human';const charUIBox=document.querySelector('.char-tab-container');if(charUIBox){if(hasImage&&currentMode==='human'){charUIBox.classList.add('disabled-section')}else{charUIBox.classList.remove('disabled-section')}}
const mascotGrid=document.getElementById('mascot-grid');const mascotCustomInput=document.getElementById('mascot-custom-input');if(mascotGrid){if(hasImage&&currentMode==='mascot'){mascotGrid.classList.add('disabled-section');if(mascotCustomInput)mascotCustomInput.disabled=!0;bananaAddLog('📸 Mascot Mode: ตรวจพบรูปภาพ Ref - ปิดการเลือกตัวละครชั่วคราว','info')}else{mascotGrid.classList.remove('disabled-section');if(mascotCustomInput)mascotCustomInput.disabled=!1}}}
function bananaUpdateRoundInfo(){const select=document.getElementById('banana-round-count');const customInput=document.getElementById('banana-custom-round-input');const roundInfo=document.getElementById('banana-round-info');if(!select)return;const imageTotal=bananaUploadedImages.length;const selectValue=select.value;if(selectValue==='custom'){if(customInput)customInput.style.display='block'}else{if(customInput)customInput.style.display='none'}
if(roundInfo){roundInfo.style.display='block';const roundsPerImage=bananaGetRoundsPerImage();const totalRounds=imageTotal*roundsPerImage;if(imageTotal===0){roundInfo.textContent=`ตั้งค่า: ${roundsPerImage} รอบต่อภาพ`}else{roundInfo.textContent=`คิวรวม: ${imageTotal} ภาพ × ${roundsPerImage} รอบ = รันทั้งหมด ${totalRounds} รูป`}}}
function bananaGetRoundsPerImage(){const select=document.getElementById('banana-round-count');const customInput=document.getElementById('banana-custom-round-input');if(!select)return 1;if(select.value==='custom'||(customInput&&customInput.style.display==='block')){if(customInput){const val=parseInt(customInput.value);return(!isNaN(val)&&val>0)?val:1}}
const rounds=parseInt(select.value);return(!isNaN(rounds)&&rounds>0)?rounds:1}
function bananaAddLog(message,type='info'){const timestamp=new Date().toLocaleTimeString('th-TH');const logEntry={time:timestamp,message:message,type:type};bananaLogs.push(logEntry);if(bananaLogs.length>500){bananaLogs=bananaLogs.slice(-500)}
bananaUpdateLogDisplay();const consoleMethod=type==='error'?'error':type==='warning'?'warn':'log';console[consoleMethod](`[${timestamp}] ${message}`)}
function bananaUpdateLogDisplay(){if(!bananaLogContainer)return;if(bananaLogs.length===0){bananaLogContainer.innerHTML='<div class="log-empty">ยังไม่มี log</div>';return}
const logHTML=bananaLogs.map(log=>{let typeClass='log-entry-info';if(log.type==='error')typeClass='log-entry-error';else if(log.type==='success')typeClass='log-entry-success';else if(log.type==='warning')typeClass='log-entry-warning';else if(log.type==='step')typeClass='log-entry-step';return `<div class="log-entry ${typeClass}">
      <span class="log-entry-time">[${log.time}]</span>
      <span class="log-entry-message">${log.message}</span>
    </div>`}).join('');bananaLogContainer.innerHTML=logHTML;bananaLogContainer.scrollTop=bananaLogContainer.scrollHeight}
function bananaClearLogs(){bananaLogs=[];bananaUpdateLogDisplay()}
function bananaUpdateStatus(message){if(bananaStatusTimeoutId){clearTimeout(bananaStatusTimeoutId);bananaStatusTimeoutId=null}
bananaStatusText.textContent=message;bananaAddLog(message,'info');if(!bananaIsAutomationRunning){bananaStatusTimeoutId=setTimeout(()=>{bananaStatusText.textContent='Ready to use'},3000)}}
function bananaHandleCopyPrompt(){const text=bananaPromptResult.textContent;if(!text||text.includes('กำลังวิเคราะห์')){showToast('ไม่มี Prompt ให้คัดลอก','error');return}
navigator.clipboard.writeText(text).then(()=>{showToast('คัดลอก Prompt แล้ว!','success');bananaBtnCopyPrompt.textContent='✅';setTimeout(()=>{bananaBtnCopyPrompt.textContent='📋'},2000)}).catch(()=>{showToast('ไม่สามารถคัดลอกได้','error')})}
function bananaSleep(ms){return new Promise((resolve,reject)=>{if(bananaShouldStopAutomation){return reject(new Error('STOPPED'))}
const checkInterval=100;let elapsed=0;const intervalId=setInterval(()=>{if(bananaShouldStopAutomation){clearInterval(intervalId);reject(new Error('STOPPED'))}else if(elapsed>=ms){clearInterval(intervalId);resolve()}
elapsed+=checkInterval},checkInterval)})}
function bananaStopAutomation(){if(bananaIsAutomationRunning){bananaShouldStopAutomation=!0;bananaUpdateStatus('กำลังหยุด...');showToast('กำลังหยุด Automation...','error')}}
async function bananaGetGeneratedImages(){try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:async()=>{window.scrollTo(0,document.body.scrollHeight);await new Promise(r=>setTimeout(r,1000));const images=[];const allImgs=document.querySelectorAll('img');for(const img of allImgs){const rect=img.getBoundingClientRect();if(rect.width>=200&&rect.height>=200){const src=img.src||img.getAttribute('src')||img.getAttribute('data-src');if(src&&!src.includes('icon')&&!src.includes('avatar')&&!src.includes('logo')&&!src.includes('profile')){images.push({src:src,width:rect.width,height:rect.height})}}}
const uniqueImages=[];const seenSrcs=new Set();for(const img of images){if(!seenSrcs.has(img.src)){seenSrcs.add(img.src);uniqueImages.push(img)}}
return uniqueImages}});return result[0]?.result||[]}catch(error){console.error('Error getting generated images:',error);return[]}}
async function bananaConvertImageToDataUrl(imageUrl){try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(url)=>{return new Promise((resolve)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=function(){const canvas=document.createElement('canvas');canvas.width=this.width;canvas.height=this.height;const ctx=canvas.getContext('2d');ctx.drawImage(this,0,0);try{const dataUrl=canvas.toDataURL('image/png');resolve(dataUrl)}catch(e){resolve(null)}};img.onerror=()=>resolve(null);img.src=url})},args:[imageUrl]});return result[0]?.result||null}catch(error){console.error('Error converting image:',error);return null}}
async function getAllPageImages(){try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:async()=>{window.scrollTo(0,document.body.scrollHeight);await new Promise(r=>setTimeout(r,1000));window.scrollTo(0,0);await new Promise(r=>setTimeout(r,500));return Array.from(document.querySelectorAll('img')).filter(img=>{const rect=img.getBoundingClientRect();if(rect.width<=150||rect.height<=150||!img.complete||img.naturalWidth===0)return!1;const isInsidePromptBox=img.closest('[role="textbox"], [data-slate-editor="true"], [aria-haspopup="dialog"], header, nav');if(isInsidePromptBox)return!1;let isUploaded=!1;let card=img;for(let i=0;i<10;i++){if(!card||card===document.body)break;const text=(card.innerText||"").toLowerCase();if(text.includes('รูปภาพที่อัปโหลด')||text.includes('uploaded image')||text.includes('original image')){isUploaded=!0;break}
card=card.parentElement}
return!isUploaded}).map(img=>img.src)}});return new Set(result[0]?.result||[])}catch(e){console.error("Snapshot Error:",e);return new Set()}}
async function bananaToVideoAutomation(){if(bananaIsAutomationRunning||videoIsAutomationRunning){showToast('กำลังรันอยู่แล้ว กรุณารอสักครู่','error');return}
const productName=bananaProductNameInput.value.trim();if(bananaUploadedImages.length===0){showToast('กรุณาอัพโหลดภาพสินค้าก่อน','error');return}
videoProductNameInput.value=productName;const bananaRoundValue=bananaRoundCountSelect.value;videoRoundCountSelect.value=bananaRoundValue;if(bananaRoundValue==='custom'){videoCustomRoundInput.value=bananaCustomRoundInput.value;videoCustomRoundInput.style.display='block'}else{videoCustomRoundInput.style.display='none'}
if(videoDownloadCountAuto&&bananaDownloadCount){videoDownloadCountAuto.value=bananaDownloadCount.value}
videoUpdateRoundInfo();try{bananaUpdateStatus('📸 Snapshot: กำลังจดจำรูปภาพเดิม...');const previousImagesSet=await getAllPageImages();bananaAddLog(`ℹ️ ภาพเดิมในจอมี ${previousImagesSet.size} ภาพ`,'info');bananaUpdateStatus('🎬 [1/2] กำลังสร้างภาพ...');await bananaHandleAutomation(!0);if(bananaShouldStopAutomation)throw new Error('STOPPED');bananaUpdateStatus('⏳ รอภาพใหม่ Render (10s)...');await new Promise(resolve=>setTimeout(resolve,10000));bananaUpdateStatus('🔍 กำลังรอรูปภาพใหม่ Render ให้สมบูรณ์...');for(let retry=0;retry<5;retry++){if(bananaShouldStopAutomation)throw new Error('STOPPED');await new Promise(resolve=>setTimeout(resolve,4000));const currentImagesSet=await getAllPageImages();const currentImagesArray=Array.from(currentImagesSet);newImageUrls=currentImagesArray.filter(url=>!previousImagesSet.has(url));if(newImageUrls.length>0){await new Promise(resolve=>setTimeout(resolve,3000));const reCheckSet=await getAllPageImages();const reCheckArray=Array.from(reCheckSet).filter(url=>!previousImagesSet.has(url));if(reCheckArray.length>=newImageUrls.length){newImageUrls=reCheckArray;break}}
bananaUpdateStatus(`⏳ รอรูปภาพใหม่ Render ให้ครบ... (${retry + 1}/5)`)}
if(newImageUrls.length===0){bananaAddLog('⚠️ ไม่พบรูปภาพใหม่ในรอบนี้ (รูปอาจสร้างไม่สำเร็จหรือ Error) - กำลังข้ามไปเช็คขั้นตอนถัดไป','warning')}else{newImageUrls.reverse();bananaAddLog(`✨ ยืนยันพบภาพใหม่ที่สร้างสำเร็จ ${newImageUrls.length} ภาพ`,'success')}
if(newImageUrls.length>0){bananaUpdateStatus(`🎬 [2/2] กำลังแปลงข้อมูลภาพใหม่...`);videoUploadedImages=[];for(let i=0;i<newImageUrls.length;i++){if(bananaShouldStopAutomation)throw new Error('STOPPED');const url=newImageUrls[i];let dataUrl=url;bananaUpdateStatus(`🎬 [2/2] กำลังแปลงภาพ ${i + 1}/${newImageUrls.length}...`);if(!url.startsWith('data:')){dataUrl=await bananaConvertImageToDataUrl(url)}
if(dataUrl){videoUploadedImages.push({id:Date.now()+Math.random()+i,name:`gen_img_${i + 1}.png`,type:'image/png',dataUrl:dataUrl})}}
videoUpdateImageCount();bananaUpdateStatus(`🎬 [2/2] ส่งต่อภาพ ${videoUploadedImages.length} ภาพ ไปยัง Video Mode`);const videoTab=document.querySelector('[data-tab="video"]');if(videoTab){videoTab.click();await new Promise(resolve=>setTimeout(resolve,1000))}}else{bananaAddLog('⏭️ ไม่มีรูปใหม่ให้ส่งต่อ - ข้ามขั้นตอนการทำ Video','info')}
const vRandomCheckbox=document.getElementById('video-random-style-switch');if(vRandomCheckbox){vRandomCheckbox.checked=!1;vRandomCheckbox.dispatchEvent(new Event('change',{bubbles:!0}));bananaAddLog('✅ ปิดโหมดสุ่ม Video Style อัตโนมัติ เพื่อใช้สไตล์ที่กำหนด','info')}
const ugcOption=document.querySelector('.config-option[data-type="vstyle"][data-value="16"]');if(ugcOption){ugcOption.click();bananaAddLog('🤳 บังคับใช้สไตล์: รีวิวบ้านๆ (UGC)','success')}
await videoRunAutomation();bananaUpdateStatus('🎬 เสร็จสิ้น! สร้างภาพและวิดีโอเสร็จแล้ว');showToast('สร้างภาพและวิดีโอเสร็จแล้ว!','success')}catch(error){if(error.message==='STOPPED'){bananaUpdateStatus('หยุดการทำงานแล้ว');showToast('หยุดตามคำสั่งผู้ใช้','warning')}else{bananaUpdateStatus(`❌ Error: ${error.message}`);showToast('เกิดข้อผิดพลาด: '+error.message,'error')}}finally{bananaIsAutomationRunning=!1;bananaShouldStopAutomation=!1;await toggleWebPageLock(!1);if(bananaBtnAutomation){bananaBtnAutomation.disabled=!1;bananaBtnAutomation.innerHTML='<span>START GENERATE</span>'}
if(bananaBtnStop){bananaBtnStop.style.display='none'}}}
function toggleLock(element, lock) {
  if (!element) return;
  var group = element.closest ? element.closest('.input-group') : null;
  if (group) {
    if (lock) group.classList.add('disabled-section');
    else group.classList.remove('disabled-section');
  }
  if (element.disabled !== undefined) element.disabled = lock;
}

function bananaSetupEventListeners(){const mascotSmartMode=document.getElementById('mascot-smart-mode');const mascotBgInput=document.getElementById('mascot-bg-select');const mascotOutfitInput=document.getElementById('mascot-outfit-select');const mascotCustomBg=document.getElementById('mascot-custom-bg-input');const mascotCustomOutfit=document.getElementById('mascot-custom-outfit-input');const mascotTextCheck=document.getElementById('mascot-text-overlay-checkbox');const mascotTextBox=document.getElementById('mascot-text-box');// Mascot smart mode toggle
if(mascotSmartMode){const mascotSmartCards=document.querySelectorAll('#workspace-mascot .smart-mode-card');mascotSmartCards.forEach(card=>{card.addEventListener('click',()=>{mascotSmartCards.forEach(c=>c.classList.remove('active'));card.classList.add('active');document.getElementById('mascot-smart-mode').value=card.dataset.value;if(card.dataset.value==='ai'){if(mascotBgInput)toggleLock(mascotBgInput,!0);if(mascotOutfitInput)toggleLock(mascotOutfitInput,!0);if(mascotCustomBg)mascotCustomBg.disabled=!0;if(mascotCustomOutfit)mascotCustomOutfit.disabled=!0}else{if(mascotBgInput)toggleLock(mascotBgInput,!1);if(mascotOutfitInput)toggleLock(mascotOutfitInput,!1);if(mascotCustomBg)mascotCustomBg.disabled=!1;if(mascotCustomOutfit)mascotCustomOutfit.disabled=!1}})});}
const manualContainer=document.getElementById('manual-config-container');const textCheckbox=document.getElementById('banana-text-overlay-checkbox');const textOverlayBox=textCheckbox?textCheckbox.closest('.special-box'):null;
// Smart mode toggle for human
const smartModeCards=document.querySelectorAll('#workspace-human .smart-mode-card');
smartModeCards.forEach(card=>{
  card.addEventListener('click',()=>{
    smartModeCards.forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    document.getElementById('banana-smart-mode').value=card.dataset.value;
    if(manualContainer){
      if(card.dataset.value==='ai')manualContainer.classList.add('disabled-section');
      else manualContainer.classList.remove('disabled-section');
    }
    if(textOverlayBox)textOverlayBox.classList.remove('disabled-section');
  });
});
if(bananaClearImagesBtn)bananaClearImagesBtn.addEventListener('click',bananaClearAllImages);if(bananaBtnAutomation){bananaBtnAutomation.addEventListener('click',async()=>{await bananaHandleAutomation(!1)})}
if(bananaBtnStop)bananaBtnStop.addEventListener('click',bananaStopAutomation);if(bananaRoundCountSelect)bananaRoundCountSelect.addEventListener('change',bananaUpdateRoundInfo);if(bananaCustomRoundInput)bananaCustomRoundInput.addEventListener('input',bananaUpdateRoundInfo);if(bananaLogClearBtn){bananaLogClearBtn.addEventListener('click',bananaClearLogs)}
const randomStyleSwitch=document.getElementById('banana-random-style-switch');const styleSelectContainer=document.getElementById('config-content-style');if(randomStyleSwitch&&styleSelectContainer){randomStyleSwitch.addEventListener('change',(e)=>{if(e.target.checked){styleSelectContainer.classList.add('disabled-section')}else{styleSelectContainer.classList.remove('disabled-section')}});setTimeout(()=>{randomStyleSwitch.dispatchEvent(new Event('change'))},100)}
const randomBgSwitch=document.getElementById('banana-random-bg-switch');const bgSelectContainer=document.getElementById('config-content-bg');if(randomBgSwitch&&bgSelectContainer){randomBgSwitch.addEventListener('change',(e)=>{if(e.target.checked){bgSelectContainer.classList.add('disabled-section')}else{bgSelectContainer.classList.remove('disabled-section')}});setTimeout(()=>{randomBgSwitch.dispatchEvent(new Event('change'))},100)}
const randomOutfitSwitch=document.getElementById('banana-random-outfit-switch');const outfitSelectContainer=document.getElementById('config-content-outfit');if(randomOutfitSwitch&&outfitSelectContainer){randomOutfitSwitch.addEventListener('change',(e)=>{if(e.target.checked){outfitSelectContainer.classList.add('disabled-section')}else{outfitSelectContainer.classList.remove('disabled-section')}});setTimeout(()=>{randomOutfitSwitch.dispatchEvent(new Event('change'))},100)}}
async function bananaHandleAutomation(isContinuous=!1){if(!_0x99f){return}
const isCorrect=await checkCorrectWebsite();if(!isCorrect)return;const productName=bananaProductNameInput.value.trim();if(bananaUploadedImages.length===0){showToast('กรุณาอัพโหลดภาพสินค้าก่อน','error');return}
const roundsPerImage=bananaGetRoundsPerImage();const totalImages=bananaUploadedImages.length;const totalRounds=totalImages*roundsPerImage;const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});bananaIsAutomationRunning=!0;bananaShouldStopAutomation=!1;bananaBtnAutomation.disabled=!0;await toggleWebPageLock(!0);bananaBtnAutomation.innerHTML='<span class="loading"></span> <span>กำลังทำงาน...</span>';if(bananaBtnStop)bananaBtnStop.style.display='flex';let completedRounds=0;let totalDownloaded=0;bananaClearLogs();bananaAddLog('🚀 เริ่มสร้างภาพอัตโนมัติ','step');bananaUpdateStatus('⚙️ ขั้นตอนที่ 1: กำลังตั้งค่าระบบ...');try{const setupInitial=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(ratio)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));function forceClick(el){if(!el)return;el.scrollIntoView({behavior:'instant',block:'center'});el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:!0}));el.dispatchEvent(new MouseEvent('mousedown',{bubbles:!0}));el.click();el.dispatchEvent(new MouseEvent('mouseup',{bubbles:!0}));el.dispatchEvent(new PointerEvent('pointerup',{bubbles:!0}))}
function findTabByIcon(iconName){const tabs=Array.from(document.querySelectorAll('button[role="tab"]'));return tabs.find(tab=>{const icon=tab.querySelector('i.google-symbols');return icon&&icon.textContent.trim()===iconName})}
let settingsBtn=null;const allBtns=Array.from(document.querySelectorAll('button'));const submitBtn=[...allBtns].reverse().find(b=>(b.querySelector('i')?.textContent||"").trim()==='arrow_forward');if(submitBtn&&submitBtn.previousElementSibling&&submitBtn.previousElementSibling.tagName==='BUTTON'){settingsBtn=submitBtn.previousElementSibling}
if(!settingsBtn){settingsBtn=allBtns.find(b=>{const isMenu=b.getAttribute('aria-haspopup')==='menu';const txt=(b.textContent||"").toLowerCase();return isMenu&&(txt.includes('x1')||txt.includes('x2')||txt.includes('x3')||txt.includes('x4'))})}
if(!settingsBtn)return resolve({success:!1,msg:'หาปุ่มตั้งค่า (ข้างปุ่มส่งคำสั่ง) ไม่เจอ'});forceClick(settingsBtn);let imageTab=null;for(let i=0;i<20;i++){await sleep(500);imageTab=findTabByIcon('image');if(imageTab)break}
if(!imageTab){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));return resolve({success:!1,msg:'หาแท็บ Image ไม่เจอ (เว็บโหลดช้า)'})}
forceClick(imageTab);await sleep(1000);const targetIcon=(ratio==='9:16')?'crop_9_16':'crop_16_9';let ratioBtn=null;for(let i=0;i<20;i++){await sleep(500);ratioBtn=findTabByIcon(targetIcon);if(ratioBtn)break}
if(!ratioBtn){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));return resolve({success:!1,msg:`หาปุ่มสัดส่วน ${ratio} ไม่เจอ`})}
forceClick(ratioBtn);await sleep(1000);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:!0}));await sleep(800);resolve({success:!0,msg:'ตั้งค่าสำเร็จ'})}catch(err){resolve({success:!1,msg:'Error ภายในหน้าเว็บ: '+err.message})}})},args:[getVeo3AspectRatio()]});if(!setupInitial[0]?.result?.success)throw new Error(setupInitial[0]?.result?.msg);bananaAddLog('✅ ขั้นตอนที่ 1: ตั้งค่า Image Mode สำเร็จ','success');await bananaSleep(1500)}catch(setupError){bananaAddLog(`❌ ขั้นตอนที่ 1 ล้มเหลว: ${setupError.message}`,'error');bananaUpdateStatus('⚠️ ยกเลิกการทำงาน: ตั้งค่าโหมดภาพไม่สำเร็จ');bananaIsAutomationRunning=!1;bananaBtnAutomation.disabled=!1;bananaBtnAutomation.innerHTML='<span>START GENERATE</span>';if(bananaBtnStop)bananaBtnStop.style.display='none';try{await toggleWebPageLock(!1)}catch(e){}
return}
try{for(let imgIndex=0;imgIndex<totalImages;imgIndex++){const currentImage=bananaUploadedImages[imgIndex];for(let round=0;round<roundsPerImage;round++){const currentRound=imgIndex*roundsPerImage+round+1;const roundLabel=`[รอบ ${currentRound}/${totalRounds}]`;if(bananaShouldStopAutomation)throw new Error('STOPPED');bananaUpdateStatus(`🤖 ${roundLabel} [1/5] กำลังสร้าง Prompt...`);const policyPrompt="(Policy: Do NOT show specific pricing numbers. Do NOT make medical claims. No text overlay unless specified.)";let imgSafety=(modelUploadedImages&&modelUploadedImages.length>0)?" (IMPORTANT: High fidelity to reference image. Keep exact face, hair color, and identity. Do NOT change facial features.)":" (Ethnicity: Thai/Asian appearance. Authentic look.)";const coreNegative="borders, frame, watermark, bad anatomy, deformed, blurry, ugly, sketch, specific pricing";const textCheckbox=document.getElementById('banana-text-overlay-checkbox');const useTextOverlay=textCheckbox?textCheckbox.checked:!0;const customTextInput=document.getElementById('banana-custom-text-input');const customTextValue=customTextInput?customTextInput.value.trim():"";let manualTextPrompt=useTextOverlay?(customTextValue!==""?`high-impact professional Thai text overlay that says exactly "${customTextValue}" in an extreme advertising typography style.`:`high-impact, professional Thai text overlay. The text MUST be a short, catchy Thai advertising slogan specifically promoting and selling [product]. Do NOT write about the character's profession, lifestyle, or location. High-quality typography that dominates the visual composition.`):"Clean image, NO text overlay, NO typography, clear background.";let manualNegativeAddon=useTextOverlay?"":", text, watermark, signature, username, typography, letters, words, logo";let generatedPrompt="";let currentAppMode=document.getElementById('current-app-mode')?document.getElementById('current-app-mode').value:'human';const smartMode=document.getElementById('banana-smart-mode')?.value||'preset';const isSmartAutoChecked=smartMode==='ai';const isPresetAuto=smartMode==='preset';if(currentAppMode==='human'){let charKey=document.getElementById('banana-character-select')?.value||'auto';let charCustom=document.getElementById('banana-custom-character-input')?.value||"";const charDict={'office_lady':'smart professional Thai working woman','net_idol':'beautiful trendy Thai net idol','hiso_girl':'elegant wealthy high-society Thai woman','sport_girl':'active fit Thai woman in sportswear','real_size':'confident plus-size chubby Thai woman','mom':'warm and kind Thai mother','hijab':'beautiful Thai muslim woman wearing a hijab','villager_girl':'authentic Thai rural country woman','thai_guy':'cool modern Thai teenager guy','smart_man':'handsome professional Thai businessman','oppa':'handsome stylish Korean-looking Thai man','muscle_man':'muscular fit Thai fitness man','street_boy':'cool trendy Thai streetwear boy','dad':'warm and reliable Thai father','villager_boy':'authentic Thai rural country man','student_female':'cute Thai university student girl','student_male':'neat Thai university student boy','seller_woman':'active and friendly Thai female merchant seller','seller_man':'active and friendly Thai male merchant seller','doctor_female':'professional Thai female doctor','doctor_male':'professional Thai male doctor','nurse_female':'caring Thai female nurse','nurse_male':'professional Thai male nurse','chef_female':'professional Thai female chef','chef_male':'professional Thai male chef','rider_male':'Thai food delivery rider','farmer_female':'hardworking Thai female farmer','grandma':'kind and gentle old Thai grandma','active_grandma':'energetic and stylish old Thai grandma','grandpa':'kind and wise old Thai grandpa','chinese_boss':'wealthy Thai-Chinese senior boss (Jao Sua)','human_paa':'typical middle-aged Thai auntie with a loud and strong personality','human_lung':'typical middle-aged Thai uncle wearing sunglasses'};let baseChar="professional Thai model";if(modelUploadedImages&&modelUploadedImages.length>0){baseChar="the exact person from the reference image"}else if(charKey==='auto'||charKey==='custom'){if(charCustom!=="")baseChar=charCustom}else{baseChar=charDict[charKey]||charKey.replace(/_/g,' ')}
if(isPresetAuto){const attireVariations=["dressed in attire that perfectly matches the product theme.","wearing a stylish outfit that blends naturally with the scene.","dressed in high-quality clothing suitable for this item.","wearing modern fashion that complements the presentation.","dressed in an elegant outfit designed for commercials."];const smartAttire=attireVariations[Math.floor(Math.random()*attireVariations.length)];const actionLogic=`(Action Instructions): - If [product] is clothing: MUST BE WEARING it. - If handheld: MUST BE HOLDING it.`;const fidelityRules=`(STRICT FIDELITY): [product] must be 100% IDENTICAL to source.`;const smartNegative=coreNegative+", price tag, numbers, watermark";const smartVariations=[`High-end cinematic portrait. ${baseChar} holding [product]. ${smartAttire}. Shot on a professional DSLR with 85mm f/1.2 prime lens, extreme shallow depth of field, creamy bokeh. ${actionLogic} ${fidelityRules} ${manualTextPrompt} 8k photorealistic.`,`Professional macro photography. Razor-sharp focus on [product] textures and droplets. ${baseChar} is interacting with the item in the background. ${smartAttire}. Captured using a 100mm macro lens on a high-end DSLR. ${manualTextPrompt} Commercial advertising quality.`,`High-energy viral social media influencer style. ${baseChar} is presenting [product] with a vibrant aesthetic. ${smartAttire}. Soft professional studio lighting, vibrant trendy colors, clean bright atmosphere. Shot on a professional DSLR camera. (Strict Rule: Clean frame, NO app interface, NO TikTok UI, NO icons, NO overlays). ${manualTextPrompt}`,`Modern e-commerce promotional banner. ${baseChar} posing with [product]. ${smartAttire}. Trendy minimalist studio background. Professional commercial DSLR photography, high-end shopping online aesthetic. ${manualTextPrompt} Sharp details, 8k resolution.`,`A high-end studio commercial shot of ${baseChar}. ${smartAttire}. ${actionLogic} ${fidelityRules} ${manualTextPrompt} Cinematic professional studio lighting, premium advertising aesthetic, shot on a high-resolution professional camera.`,`Refreshing outdoor lifestyle photography featuring ${baseChar} with [product]. ${smartAttire}. ${actionLogic} ${fidelityRules}. Naturally related setting. Shot on a professional DSLR with natural soft sunlight, photorealistic 8k. ${manualTextPrompt}`,`Sharp promotional image showcasing ${baseChar}. ${smartAttire}. ${actionLogic} ${fidelityRules}. Minimalist composition, professional DSLR color grading, edge-to-edge full frame. ${manualTextPrompt}`,`Candid and authentic everyday moment of ${baseChar}. ${smartAttire}. ${actionLogic} ${fidelityRules}. Unposed posture, natural home lighting. Captured with a professional high-end camera lens for a realistic yet premium atmosphere. ${manualTextPrompt}`,`Engagement-focused UGC review. ${baseChar} is presenting [product] to the camera. ${smartAttire}. ${actionLogic} ${fidelityRules}. Authentic social media vibe, shot with a high-quality smartphone rear camera for a relatable feeling. ${manualTextPrompt}`];const rIndex=Math.floor(Math.random()*smartVariations.length);generatedPrompt=smartVariations[rIndex]+` ${imgSafety} ${policyPrompt} ${getAntiBotSeed()} Negative Prompt: "${smartNegative}${manualNegativeAddon}"`;const styleNames=["🎬 Cinematic","🔍 Macro","✨ Influencer","🛒 E-commerce","💎 Premium Studio","🌳 Outdoor","📸 Showcase","🤳 Candid","📱 UGC"];bananaAddLog(`🚀 Smart Auto: สุ่มใช้สไตล์ "${styleNames[rIndex]}"`,'info')}else{let outfitKey=document.getElementById('banana-outfit-select')?.value||'casual';let outfitCustom=document.getElementById('banana-custom-outfit-input')?.value||"";let isRandomOutfit=document.getElementById('banana-random-outfit-switch')?.checked;let bgKey=document.getElementById('banana-bg-select')?.value||'living_room';let bgCustom=document.getElementById('banana-custom-bg-input')?.value||"";let isRandomBg=document.getElementById('banana-random-bg-switch')?.checked;const outfitDict={'casual':'casual t-shirt and denim jeans','polo':'smart casual polo shirt','hoodie':'trendy hoodie and casual pants','korean':'stylish Korean minimalist fashion','street':'cool streetwear outfit','oldmoney':'elegant old money aesthetic fashion, quiet luxury','sport':'active sportswear','vacation':'relaxing summer vacation beachwear','shirt':'neat crisp button-up shirt','suit':'professional business suit','morhom':'traditional Thai indigo morhom shirt','isan':'casual outfit with Thai Isan Pa Khao Ma (loincloth) pattern','northern':'traditional Thai Northern Lanna style clothing','southern':'traditional Thai Southern Batik or Patek style clothing','thai_dress':'trendy modern Thai fusion fashion, wearing an elegant traditional Thai Sabai (pleated shawl) draped top paired with casual denim jeans','hill_tribe':'traditional Thai hill tribe colorful clothing'};const bgDict={'living_room':'modern cozy living room','bedroom':'modern aesthetic bedroom with soft lighting','kitchen':'clean modern minimalist kitchen interior','studio':'clean professional photography studio with soft lighting','classroom':'bright modern school classroom','bathroom':'clean minimalist bathroom interior','dining_room':'elegant dining room with a decorated table','closet':'luxury walk-in closet','luxury_hotel':'premium luxury hotel room interior','meeting_room':'professional corporate meeting room','cafe':'cozy minimal aesthetic cafe','office':'modern corporate office workspace','gym':'modern fitness gym equipment background','supermarket':'supermarket aisle with organized shelves','street':'vibrant trendy city street','subway':'modern subway train station interior','restaurant':'beautiful fine dining restaurant interior','airport':'modern airport terminal lounge','in_car':'inside a modern car interior','on_bike':'sitting on a stylish motorcycle outdoors','garden':'beautiful blooming outdoor garden','beach':'sunny tropical beautiful beach','mountain':'scenic lush green mountain landscape','waterfall':'beautiful natural jungle waterfall','rice_field':'lush green terraced rice field','thai_house':'traditional Thai wooden house exterior','market':'bustling local fresh market','night_market':'vibrant neon-lit night market','win_moto':'local Thai motorcycle taxi stand','convenience_store':'bright convenience store storefront'};let finalOutfit="";if(!isRandomOutfit&&outfitCustom.trim()!==""){finalOutfit=`[CRITICAL OUTFIT RULE: The character MUST be wearing EXACTLY this outfit/uniform: "${outfitCustom.trim()}". Absolutely NO standard t-shirts, NO casual jeans, NO default clothing. Follow the user's outfit instruction strictly.]`;bananaAddLog(`👗 บังคับชุด: "${outfitCustom.trim()}"`,'info')}else if(isRandomOutfit){const outKeys=Object.keys(outfitDict);finalOutfit=`wearing ${outfitDict[outKeys[Math.floor(Math.random() * outKeys.length)]]}`}else{finalOutfit=`wearing ${outfitDict[outfitKey] || outfitKey.replace(/_/g, ' ')}`}
if(isSmartAutoChecked){
const geminiKey=getGeminiApiKey();
if(!geminiKey){
  bananaAddLog('⚠️ Smart AI: ไม่มี API Key ใช้ preset แทน','warning');
}else{
  try{
    bananaUpdateStatus('🧠 Smart AI: กำลังให้ AI คิดชุด/ฉาก/สไตล์...');
    const aiPrompt='You are a creative director for product photography. Generate a detailed image generation prompt based on these parameters: Product: '+productName+' Character: '+charKey+' Style: '+styleKey+' Background: '+bgKey+'. Return a SINGLE paragraph in English that includes: character description, outfit, background/setting, lighting style, camera angle, and mood. Make it cinematic and professional. Do NOT include any text, logos, or watermarks.';
    const apiResp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+getStoryAIModel()+':generateContent?key='+geminiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:aiPrompt}]}],generationConfig:{temperature:0.9,maxOutputTokens:512}})});
    const apiData=await apiResp.json();
    if(apiData.candidates&&apiData.candidates[0]){
      generatedPrompt=apiData.candidates[0].content.parts[0].text;
      bananaAddLog('\xf0\x9f\xa7\xa0 Smart AI: AI สร้าง prompt สำเร็จ','success');
    }else{
      bananaAddLog('⚠️ Smart AI: AI response ผิดปกติ ใช้ preset แทน','warning');
    }
  }catch(err){
    bananaAddLog('⚠️ Smart AI: Error - '+err.message,'warning');
  }
}
}
let finalCharWithOutfit=baseChar;if(finalOutfit!=="")finalCharWithOutfit+=` ${finalOutfit}`;let finalBg="clean aesthetic background";if(!isRandomBg&&bgCustom.trim()!==""){finalBg=`[CRITICAL SETTING RULE: The scene MUST be strictly set in a "${bgCustom.trim()}". Follow this background instruction exactly.]`;bananaAddLog(`🏞️ บังคับฉาก: "${bgCustom.trim()}"`,'info')}else if(isRandomBg){const bgKeys=Object.keys(bgDict);finalBg=bgDict[bgKeys[Math.floor(Math.random()*bgKeys.length)]]}else{finalBg=bgDict[bgKey]||bgKey.replace(/_/g,' ')}
let styleKey=document.getElementById('banana-style-select')?.value||'model';let isRandomStyle=document.getElementById('banana-random-style-switch')?.checked;const styleKeys=['model','influencer','studio','fashion','usage','texture','beauty','review','live','fancy'];if(isRandomStyle)styleKey=styleKeys[Math.floor(Math.random()*styleKeys.length)];const funnyExpressions=["Playful, sweet, and engaging with a cheerful bright smile","Extremely excited, eyes wide open in amazement, mouth slightly open in a cute gasp","Overjoyed and enthusiastic, huge beaming smile, looking highly energetic","Cheeky and cute, winking one eye playfully with a sweet smile","Innocent and adorable puppy-eyes look, gentle and heartwarming smile"];const randFunnyExp=funnyExpressions[Math.floor(Math.random()*funnyExpressions.length)];if(styleKey==='mirror'){const mirrorRooms=['modern aesthetic bedroom with soft lighting','luxury walk-in closet with stylish clothes rack','clean minimalist bathroom with elegant tiles','cozy aesthetic living room with indoor plants','trendy cafe restroom with warm ambient light','stylish fashion boutique fitting room'];finalBg=mirrorRooms[Math.floor(Math.random()*mirrorRooms.length)]}
const influencerPoses=["standing casually in the room","sitting comfortably behind a cozy table","sitting relaxed at a nice desk","standing and leaning naturally against a counter","sitting casually on a stylish chair"];const randInfluencerPose=influencerPoses[Math.floor(Math.random()*influencerPoses.length)];const styleTemplates={'model':`Professional lifestyle photography. ${finalCharWithOutfit} interacting with [product]. Clean aesthetic setting. Soft lighting. Clean look. High quality, 8k resolution, photorealistic.`,'influencer':`Authentic UGC (User-Generated Content) social media photography. Medium portrait shot of ${finalCharWithOutfit} ${randInfluencerPose}, naturally holding and presenting the [product] to the viewer. (CRITICAL RULE: The character is NOT holding the camera. NO selfie arms. BOTH hands must be visible and interacting naturally with the product). The character is looking directly at the lens with a friendly, approachable, and highly authentic smile. TikTok/YouTube lifestyle aesthetic. Unscripted, everyday casual setting, soft natural window lighting. Engaging and relatable vibe. (NOT heavy studio quality, NOT over-produced).`,'fashion':`High-end fashion lookbook photography. ${finalCharWithOutfit} is stylishly modeling and wearing the [product] as the main centerpiece of their outfit. Full body or medium-full shot clearly showcasing the fit, fabric, and design of the [product]. The model is posing confidently with a strong, professional fashion editorial presence. Stylish, modern, and trendy aesthetic. Professional lighting, photorealistic, 8k resolution, fashion magazine grade.`,'beauty':`Beauty influencer photography. Close-up shot of ${finalCharWithOutfit} applying [product] to the skin. Showing texture and glow. Soft ring light. (Action: Swatching or applying). High quality, 8k resolution.`,'studio':`Epic campaign advertising photography. ${finalCharWithOutfit} standing confidently and presenting the [product] within a spectacular and grand setting. The scene MUST BE transformed from a simple background into an spectacular and impactful promotional environment. Ensure the entire composition is grand and awe-inspiring, flawlessly integrating the character and product into an extravagant campaign poster. Dramatic epic lighting, stylized visual effects like glowing text, particle effects, or light flares that make the whole image look magnificent. A masterful and powerful composition that feels like a premium, master-piece advertising poster. The final image should look grand, powerful, and spectacular. Professional grade photography.`,'usage':`Authentic documentary lifestyle photography. ${finalCharWithOutfit} is genuinely interacting with and actively using the [product] in a real-world, everyday situation. The character is naturally focused on the activity and is NOT looking directly at the camera (candid, unposed moment). Soft natural lighting, highly relatable and realistic storytelling atmosphere. High-end commercial grade.`,'review':`Professional YouTuber and Blogger review photography. ${finalCharWithOutfit} is holding and presenting the [product] nicely to the camera. Shot on a high-end mirrorless camera with an 85mm portrait lens, creating a beautiful creamy bokeh (extreme blurred background) that makes the character and product pop out. The character has a welcoming, professional, and friendly smile. Soft aesthetic studio lighting (like a professional ring light or softbox). High quality, razor-sharp focus on the face and the product, 8k resolution.`,'live':`Live commerce broadcast style. ${finalCharWithOutfit} acting as a charismatic host holding [product]. Energetic atmosphere. High quality, 8k resolution.`,'texture':`Extreme close-up macro shot of [product]. Focusing on the texture, material, or droplets. Highlighting the quality. Background is blurred. Aesthetic, sensory, high definition texture. (Note: Focus on product only, face is NOT visible). High quality, 8k resolution.`,'unboxing':`First-person point of view (POV) shot. Looking down at a pair of hands holding or unboxing [product] on a messy but aesthetic desk. Natural indoor lighting, candid style. (Note: POV shot, only hands visible, face is NOT visible). High quality, 8k.`,'shoes':`Low angle street fashion photography. Close-up shot of feet wearing [product] (shoes). Focus sharply on the shoes/feet. Background blurred. (Note: Focus on feet, face is NOT visible). High quality, 8k.`,'hands':`Professional action lifestyle photography. Close-up on hands holding or operating [product] (tool/equipment). Active posture, demonstrating usage. (Note: Focus on action/hands, face is NOT visible). High quality, 8k.`,'decor':`Interior design lifestyle photography. Wide shot showcasing [product] (furniture/large home item) placed naturally and beautifully in a room. The product is the main focus of the composition. (CRITICAL RULE: NO humans, NO people, NO hands, just the product and the interior setting). High quality, 8k, photorealistic commercial grade.`,'showcase':`Professional commercial product photography of [product]. The product is placed prominently in the center of the scene. Composition focuses solely on the product. (Rule: NO humans, NO people, NO hands, just the product). High quality, 8k resolution, photorealistic, advertising grade.`,'fancy':`High-end advertising photography. ${finalCharWithOutfit} is holding the [product]. Bright and refreshing atmosphere. Elements of the product or related ingredients are elegantly fluttering in the air around the subject. The product packaging is glossy with premium reflective highlights. Warm and fresh tone, professional commercial grade, 8k resolution.`,'cgi':`Surreal CGI advertising photography. A massive, skyscraper-sized [product] is placed as a gigantic monument perfectly integrated into the environment. The product looks incredibly huge. ${finalCharWithOutfit} is standing extremely small nearby, looking up at the giant product in amazement. Cinematic lighting, 3D render style, epic scale, hyper-realistic shadows.`,'funny':`Create an advertisement image in an extremely realistic caricature style of ${finalCharWithOutfit} holding [product]. CRITICAL PROPORTIONS: The character has highly exaggerated proportions—a VERY LARGE HEAD attached to a TINY, SHORT body with SMALL LIMBS. The character must look like a cute miniature person standing full-body. The face MUST remain 100% realistic photography (NO cartoons, NO 3D renders allowed) but with a soft kawaii beauty filter. Expression: ${randFunnyExp}. High quality 8k, bright commercial lighting.`,'miniature':`Tilt-shift macro photography of a miniature world. Tiny people interacting around the giant [product].`};let baseStyle=styleTemplates[styleKey]||styleTemplates.model;generatedPrompt=`${baseStyle} Location: ${finalBg}. ${manualTextPrompt} ${imgSafety} (Composition: Edge-to-edge). Negative Prompt: "${coreNegative}${manualNegativeAddon}"`}}else{bananaAddLog('🧸 โหมด: มาสคอต (Mascot)','step');const activeMascotCard=document.querySelector('#mascot-grid .mascot-card.active')||document.querySelector('.mascot-card.active');let mascotType=activeMascotCard?activeMascotCard.dataset.value:'liver';if(mascotType==='custom'){const customInput=document.getElementById('mascot-custom-input');mascotType=(customInput&&customInput.value.trim()!=='')?customInput.value.trim():'character'}
const mascotSmartMode=document.getElementById('mascot-smart-mode')?.value||'preset';const isMascotSmart=mascotSmartMode==='ai';const mascotCustomText=customTextValue||"";let subject="";if(modelUploadedImages.length>0){const chibiVariations=["A premium 3D designer blind-box art toy (Pop Mart style). The character has an oversized head and a small stylish body. The facial identity is a perfect 3D translation of the young adult/teen in the reference image—keeping their mature charm but in a cute designer toy proportion. Big beautiful eyes, flawless texture. CLOTHING: Fully dressed in a stylish, premium outfit matching the '[product]'.","A high-end 3D Super-Deformed Chibi character. It features a larger head and smaller body, but strictly maintains the young adult identity from the reference photo. Do NOT make them look like a baby. Elegant 3D Pixar-style rendering with friendly, expressive eyes and a highly professional commercial look. CLOTHING: Dressed in a high-quality outfit that visually represents the '[product]'.","A premium collectible 3D vinyl figure toy. The character has an exaggerated head-to-body ratio for cuteness, but the face clearly belongs to the stylish young adult in the reference image. Clean, smooth 3D rendering with a trendy aesthetic. CLOTHING: Wearing a customized, professional attire inspired by the '[product]'.","A charming 3D animated character with designer toy proportions (large head, small body). The face is a highly detailed, mature but stylized 3D adaptation of the reference image. NO baby face. Big beautiful eyes, friendly and welcoming vibe. CLOTHING: Fully dressed in a creative and premium costume matching the '[product]' theme."];subject=chibiVariations[Math.floor(Math.random()*chibiVariations.length)];bananaAddLog('✨ Mascot: สุ่มรูปแบบคำสั่งแปลงรูป Ref เป็นจิบิหัวโต','success')}else{const productMascotVariations=["A creative 3D living character where the [product] itself comes alive. Add cute tiny cartoon arms, legs, and an expressive face DIRECTLY onto the original [product].","A magical 3D Pixar-style transformation of the [product]. It becomes a living mascot with adorable tiny limbs and a lively face attached directly to its original body.","An adorable 3D animated version of the [product]. The product magically grows cute cartoonish arms, legs, and a highly expressive face right on its surface.","A cinematic 3D character design where the [product] is the mascot. Featuring tiny cute limbs and a vibrant face seamlessly blended onto the unmodified original product.","A premium 3D toy-like mascot made entirely out of the [product]. It features adorable tiny hands, feet, and an animated facial expression attached directly to the exact original product shape."];const randomProductPrompt=productMascotVariations[Math.floor(Math.random()*productMascotVariations.length)];const strictProductRule=" CRITICAL RULE: The original shape, label, text, and texture of the [product] MUST remain 100% exactly as the source image. Do NOT deform, morph, or redesign the product body. Just attach the face and limbs to the existing shape. (DO NOT generate any other human or animal holding it)";const mascotPrefixes=["an extremely cute Disney-Pixar style 3D","an adorable 3D Pixar animated","a charming, highly detailed Pixar-style 3D","a premium 3D Pixar-like","a delightful and friendly 3D Pixar"];const randPrefix=mascotPrefixes[Math.floor(Math.random()*mascotPrefixes.length)];const cutePixarSuffix="with big adorable cartoon eyes, extremely friendly, and completely non-scary";const mascotTraits={'liver':`Liver character (glossy red stylized material), ${cutePixarSuffix}`,'kidney':`Kidney character (smooth glossy bean-shaped material), ${cutePixarSuffix}`,'heart':`Heart character (stylized red 3D material), ${cutePixarSuffix}`,'stomach':`Stomach character (smooth pink stylized material), ${cutePixarSuffix}`,'intestine':`Intestine character (glossy pink material), ${cutePixarSuffix}`,'lemon':`Lemon character (vibrant yellow glossy material, realistic water droplets), ${cutePixarSuffix}`,'strawberry':`Strawberry character (vibrant red with seeds), ${cutePixarSuffix}`,'carrot':`Carrot character (vibrant orange texture), ${cutePixarSuffix}`,'broccoli':`Broccoli character (detailed green floret crown), ${cutePixarSuffix}`,'lettuce':`Lettuce character (layered green leaves), ${cutePixarSuffix}`,'cat':`bipedal Cat character standing upright on two legs like a human (soft fur texture), ${cutePixarSuffix}`,'dog':`bipedal Dog character standing upright on two legs like a human (smooth fur), ${cutePixarSuffix}`,'bear':`bipedal Teddy Bear character standing upright on two legs like a human (soft fluffy fur), ${cutePixarSuffix}`};if(mascotType==='product_mascot'){subject=`Create ${randomProductPrompt}${strictProductRule}`}else if(mascotType==='custom'||mascotType==='custom_mascot'){subject=`Create ${randPrefix} character of [${mascotType}], ${cutePixarSuffix}`}else{let trait=mascotTraits[mascotType]||`${mascotType} character, ${cutePixarSuffix}`;subject=`Create ${randPrefix} ${trait}`}
bananaAddLog(`🧸 Mascot: ใช้สไตล์ 3D พรีเมียมแบบสุ่มคำสั่งหลบบอท -> ${mascotType}`,'info')}
const expressionVal=document.getElementById('mascot-expression-select')?.value||'serious';const expressionMap={'serious':"Expression: A cute determined and focused look. Big eyes showing dedication, like a serious but adorable little helper.",'strict':"Expression: Adorably strict, playfully pouting, or giving a cute warning look. Frowning slightly with furrowed brows, but still looking incredibly charming and huggable.",'smiling':"Expression: Bright, joyful, and warm genuine smile. Cheerful big eyes, highly approachable, sweet, and welcoming."};let dynamicAction="";if(mascotType==='product_mascot'){const productActions=["The character is striking a confident and energetic pose to the camera in a premium commercial style.","The living product is moving playfully, showing off its cute tiny limbs in a highly engaging advertisement.","The mascot poses dynamically, leaning forward slightly with a lively and charming attitude perfect for viral marketing.","The living character is expressing immense enthusiasm, gesturing with its tiny hands in a lively, eye-catching composition."];dynamicAction=productActions[Math.floor(Math.random()*productActions.length)]}else{const normalActions=["The mascot is interacting with the [product] in a unique, creative, and professional pose. AI: Design a dynamic posture that best showcases the [product].","The character is holding and presenting the [product] enthusiastically to the camera, creating an eye-catching advertisement.","The mascot is playfully posing alongside the [product], highlighting its features in a lively, high-end marketing shot.","The character shows off the [product] with a proud and energetic stance, perfectly framed for a top-tier product commercial."];dynamicAction=normalActions[Math.floor(Math.random()*normalActions.length)]}
const styleVariations=["Style: High-quality 3D Animation (Pixar level), Smooth glossy texture, Sharp details, Cinematic Dramatic Lighting, Deep shadows.","Aesthetic: Premium 3D cartoon render, Disney-Pixar style, ultra-detailed materials, vibrant global illumination, crisp focus.","Visuals: Masterpiece 3D illustration, cute stylized proportions, physically based rendering (PBR), studio rim lighting, 8k resolution.","Art Direction: High-end 3D mascot design, glossy and flawless surfaces, cinematic color grading, soft ray-traced shadows, commercial quality."];const randomStylePrompt=styleVariations[Math.floor(Math.random()*styleVariations.length)];const moodPrompt=expressionMap[expressionVal]+" NOT scared, NOT creepy, NOT blurry.";let finalPromptParts=[];finalPromptParts.push(subject+".");finalPromptParts.push(randomStylePrompt);finalPromptParts.push(moodPrompt);finalPromptParts.push(dynamicAction);if(isMascotSmart){if(modelUploadedImages.length===0){finalPromptParts.push("(Character is NOT wearing clothes, to show its shape clearly).")}
const smartMascotBGs=["Background: A creative 3D environment perfectly matching the theme, ingredients, and vibe of the [product], rendered with dramatic cinematic lighting.","Background: A premium 3D commercial studio setup. The background colors and lighting are specifically designed to complement and highlight the [product].","Background: A high-end 3D product showcase stage, gently decorated with beautiful floating elements closely related to the [product].","Background: A stylized, eye-catching 3D environment representing the ideal real-world use case for the [product], blending perfectly with the Pixar aesthetic."];const randomBG=smartMascotBGs[Math.floor(Math.random()*smartMascotBGs.length)];finalPromptParts.push(randomBG);bananaAddLog(`✨ Smart Mascot: สุ่มฉากหลังให้เข้ากับธีมสินค้าอัตโนมัติ`,'info')}else{const bgVal=document.getElementById('mascot-bg-select')?.value||'inside_body';const outfitVal=document.getElementById('mascot-outfit-select')?.value||'none';const customBg=document.getElementById('mascot-custom-bg-input')?.value.trim();const customOutfit=document.getElementById('mascot-custom-outfit-input')?.value.trim();let userOutfit="";if(outfitVal==='custom'&&customOutfit!==""){userOutfit=`[CRITICAL OUTFIT RULE: MUST be wearing EXACTLY "${customOutfit}". No default clothing]`}else{userOutfit={'none':"",'suit':"wearing a suit",'hero':"wearing a cape",'doctor':"wearing a doctor coat",'sport':"wearing sportswear",'student':"wearing student uniform"}[outfitVal]||""}
if(userOutfit)finalPromptParts.push(`Outfit: ${userOutfit}.`);let userBg="";if(bgVal==='custom'&&customBg!==""){userBg=`[CRITICAL SETTING RULE: The background MUST be strictly "${customBg}"]`}else{userBg={'inside_body':"Cinematic view inside human body, dramatic lighting",'3d_world':"Dramatic miniature 3D city at twilight",'pastel_studio':"Modern studio with dramatic spotlight and long shadows",'fruit_land':"Lush fruit forest with dramatic sun rays",'nature_blur':"Atmospheric nature park at dusk, cinematic bokeh",'microscope':"Dramatic scientific lab, microscopic view with focused lighting"}[bgVal]||"clean background"}
finalPromptParts.push(`Background: ${userBg}.`)}
if(useTextOverlay){if(mascotCustomText!==""){finalPromptParts.push(`high-impact professional Thai text overlay that says exactly "${mascotCustomText}" in an extreme advertising typography style.`)}else{finalPromptParts.push("high-impact, professional Thai text overlay in an extreme advertising style. High-quality typography that dominates the visual composition.")}}else{finalPromptParts.push("Clean image, no text overlay.")}
finalPromptParts.push(getAntiBotSeed());generatedPrompt=finalPromptParts.join(' ');generatedPrompt+=` Negative Prompt: "tall character, long legs, long arms, realistic human proportions, realistic body ratio, adult body, slender body, skinny neck, suggestive pose, inappropriate clothing, revealing attire, swimsuit, underwear, messy visuals, blurry, low quality, 2D, sketch, poorly drawn face, ${coreNegative}"`}
generatedPrompt=generatedPrompt.replace(/\[product\]/g,productName||'product');await bananaSleep(500);bananaUpdateStatus(`🤖 ${roundLabel} [2/5] จำลองการวางรูป (Paste)...`);const singleImageData=[{name:currentImage.name,type:currentImage.type,dataUrl:currentImage.dataUrl}];const uploadResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(images)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(!editor)return resolve({success:!1,msg:'❌ ไม่พบช่องพิมพ์ข้อความ'});const inputContainer=editor.closest('div[class*="hvKLod"]')||editor.parentElement.parentElement;const getThumbCount=()=>inputContainer?inputContainer.querySelectorAll('img').length:0;const initialThumbs=getThumbCount();editor.scrollIntoView({behavior:'instant',block:'center'});editor.focus();editor.click();await sleep(800);const dataTransfer=new DataTransfer();images.forEach((img)=>{const byteString=atob(img.dataUrl.split(',')[1]);const ab=new ArrayBuffer(byteString.length);const ia=new Uint8Array(ab);for(let i=0;i<byteString.length;i++)ia[i]=byteString.charCodeAt(i);const file=new File([new Blob([ab],{type:img.type})],img.name,{type:img.type});dataTransfer.items.add(file)});const pasteEvent=new ClipboardEvent('paste',{clipboardData:dataTransfer,bubbles:!0,cancelable:!0});editor.dispatchEvent(pasteEvent);await sleep(1500);let confirmBtn=null;const confirmTexts=['Save','Confirm','Crop and Save','บันทึก','ยืนยัน','เสร็จสิ้น','ต่อไป'];for(let check=0;check<15;check++){await sleep(500);const currentButtons=document.querySelectorAll('button');confirmBtn=Array.from(currentButtons).find(btn=>confirmTexts.some(t=>(btn.textContent||'').includes(t))&&btn.offsetParent!==null);if(confirmBtn)break}
if(confirmBtn){confirmBtn.click();await sleep(1500)}
let isUploading=!1;for(let w=0;w<120;w++){await sleep(500);if(getThumbCount()>initialThumbs){await sleep(1500);return resolve({success:!0,msg:'✅ รูปโหลด 100% เข้าช่อง Prompt สำเร็จ'})}
const allTexts=inputContainer?inputContainer.innerText:"";if(allTexts.includes('%')){isUploading=!0}}
if(isUploading){resolve({success:!1,msg:'❌ หมดเวลารออัปโหลด (เน็ตอาจจะช้าเกินไป)'})}else{resolve({success:!1,msg:'❌ วางรูปแล้วแต่เว็บไม่ตอบสนอง'})}}catch(e){resolve({success:!1,msg:'Error: '+e.message})}})},args:[singleImageData]});if(!uploadResult[0]?.result?.success){bananaAddLog(`⚠️ ${uploadResult[0]?.result?.msg} -> ข้ามไปรูปถัดไป`,'warning');throw new Error("อัปโหลดรูปไม่สำเร็จ")}else{bananaAddLog(`${uploadResult[0]?.result?.msg}`,'success')}
await bananaSleep(2000);if(modelUploadedImages&&modelUploadedImages.length>0){bananaUpdateStatus(`🤖 ${roundLabel} [2.5/5] กำลังแนบรูปนางแบบ...`);const modelData=[{name:modelUploadedImages[0].name,type:modelUploadedImages[0].type,dataUrl:modelUploadedImages[0].dataUrl}];const uploadModelResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(images)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(!editor)return resolve({success:!1,msg:'❌ ไม่พบช่องพิมพ์ข้อความ'});const inputContainer=editor.closest('div[class*="hvKLod"]')||editor.parentElement.parentElement;const getThumbCount=()=>inputContainer?inputContainer.querySelectorAll('img').length:0;const initialThumbs=getThumbCount();editor.scrollIntoView({behavior:'instant',block:'center'});editor.focus();editor.click();await sleep(800);const dataTransfer=new DataTransfer();images.forEach((img)=>{const byteString=atob(img.dataUrl.split(',')[1]);const ab=new ArrayBuffer(byteString.length);const ia=new Uint8Array(ab);for(let i=0;i<byteString.length;i++)ia[i]=byteString.charCodeAt(i);const file=new File([new Blob([ab],{type:img.type})],img.name,{type:img.type});dataTransfer.items.add(file)});const pasteEvent=new ClipboardEvent('paste',{clipboardData:dataTransfer,bubbles:!0,cancelable:!0});editor.dispatchEvent(pasteEvent);await sleep(4000);let confirmBtn=null;const confirmTexts=['Save','Confirm','Crop and Save','บันทึก','ยืนยัน','เสร็จสิ้น','ต่อไป'];for(let check=0;check<20;check++){await sleep(500);const currentButtons=document.querySelectorAll('button');confirmBtn=Array.from(currentButtons).find(btn=>confirmTexts.some(t=>(btn.textContent||'').includes(t))&&btn.offsetParent!==null);if(confirmBtn)break}
if(confirmBtn){confirmBtn.click();await sleep(4000)}
let isUploading=!1;for(let w=0;w<120;w++){await sleep(500);if(getThumbCount()>initialThumbs){await sleep(1500);return resolve({success:!0,msg:'✅ โหลดรูปนางแบบ 100% สำเร็จ'})}}
resolve({success:!1,msg:'❌ หมดเวลารออัปโหลดรูปนางแบบ'})}catch(e){resolve({success:!1,msg:'Error: '+e.message})}})},args:[modelData]});if(!uploadModelResult[0]?.result?.success){bananaAddLog(`⚠️ ${uploadModelResult[0]?.result?.msg} -> (ข้ามไปสร้างรูปเลยโดยไม่มีนางแบบ)`,'warning')}else{bananaAddLog(`${uploadModelResult[0]?.result?.msg}`,'success')}
await bananaSleep(2000)}
bananaUpdateStatus(`🤖 ${roundLabel} [3/5] กำลังป้อนข้อความ Prompt...`);await chrome.scripting.executeScript({target:{tabId:tab.id},func:async(text)=>{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(editor){editor.blur();await sleep(100);editor.focus();editor.click();await sleep(300);editor.dispatchEvent(new KeyboardEvent('keydown',{key:'a',ctrlKey:!0,bubbles:!0}));document.execCommand('selectAll',!1,null);await sleep(100);editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',keyCode:8,bubbles:!0}));document.execCommand('delete',!1,null);await sleep(300);editor.dispatchEvent(new InputEvent('beforeinput',{inputType:'insertText',data:text,bubbles:!0,cancelable:!0}));const dt=new DataTransfer();dt.setData('text/plain',text);dt.setData('text/html',`<p>${text}</p>`);const pasteEvent=new ClipboardEvent('paste',{clipboardData:dt,bubbles:!0,cancelable:!0,composed:!0});editor.dispatchEvent(pasteEvent);await sleep(4000);if(!editor.textContent.includes(text.substring(0,10))){document.execCommand('insertText',!1,text)}
editor.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:text,bubbles:!0,composed:!0}));editor.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',keyCode:32,bubbles:!0}));document.execCommand('insertText',!1,' ');editor.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:' ',bubbles:!0}));editor.dispatchEvent(new KeyboardEvent('keyup',{key:' ',code:'Space',keyCode:32,bubbles:!0}));editor.blur();await sleep(150);editor.focus()}},args:[generatedPrompt]});await bananaSleep(4000);bananaUpdateStatus(`🤖 ${roundLabel} [4/5] รอเว็บประมวลผลรูปภาพสักครู่...`);await bananaSleep(5000);bananaUpdateStatus(`🤖 ${roundLabel} [4/5] กำลังส่งคำสั่งสร้าง...`);const createResult=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:(timeoutMs)=>{return new Promise((resolve)=>{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));async function trySubmit(){let attempts=0;const maxAttempts=Math.floor(timeoutMs/1000);while(attempts<maxAttempts){attempts++;const allBtns=Array.from(document.querySelectorAll('button'));let targetBtn=null;for(let i=allBtns.length-1;i>=0;i--){const btn=allBtns[i];const html=(btn.innerHTML||"").toLowerCase();const text=(btn.textContent||"").toLowerCase().trim();const style=window.getComputedStyle(btn);if(btn.disabled||style.pointerEvents==='none'||style.opacity==='0')continue;if(text.includes('nano')||text.includes('pro')||text.includes('อัปเกรด'))continue;if(html.includes('add_circle')||html.includes('add '))continue;if(html.includes('arrow_forward')||html.includes('send')||text==='สร้าง'||text==='create'){targetBtn=btn;break}}
if(targetBtn){targetBtn.scrollIntoView({behavior:'instant',block:'center'});await sleep(500);let success=!1;try{const reactKey=Object.keys(targetBtn).find(k=>k.startsWith('__reactProps'));if(reactKey&&targetBtn[reactKey].onClick){targetBtn[reactKey].onClick({preventDefault:()=>{},stopPropagation:()=>{},nativeEvent:{isTrusted:!0},type:'click'});success=!0}else{const icon=targetBtn.querySelector('i');if(icon){const iconKey=Object.keys(icon).find(k=>k.startsWith('__reactProps'));if(iconKey&&icon[iconKey].onClick){icon[iconKey].onClick({preventDefault:()=>{},stopPropagation:()=>{},nativeEvent:{isTrusted:!0},type:'click'});success=!0}}}}catch(e){console.error("React Hack Error:",e)}
const editor=document.querySelector('[data-slate-editor="true"]')||document.querySelector('[role="textbox"]');if(editor){editor.focus();editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:!0,cancelable:!0}));editor.dispatchEvent(new KeyboardEvent('keypress',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:!0,cancelable:!0}));editor.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:!0,cancelable:!0}))}
if(!success)targetBtn.click();return resolve({success:!0,message:'กดปุ่มส่งคำสั่งสำเร็จ!'})}
await sleep(1000)}
resolve({success:!1,message:'หาปุ่มส่งคำสั่งไม่เจอ หรือระบบไม่ตอบสนอง'})}
trySubmit()})},args:[30000]});if(!createResult[0]?.result?.success){bananaAddLog(`⚠️ กดปุ่มสร้างไม่สำเร็จ: ${createResult[0]?.result?.message}`,'warning');throw new Error(`[Step 4/5] ส่งคำสั่งล้มเหลว: ${createResult[0]?.result?.message}`)}else{bananaAddLog(`🖱️ ${roundLabel} ส่งคำสั่งสร้างภาพสำเร็จ!`,'success')}
const autoDlBox1=document.getElementById('banana-auto-download-checkbox');const autoDlBox2=document.getElementById('banana-download-checkbox');const autoDlBox3=document.getElementById('video-download-count-auto');const isDownloadEnabled=(autoDlBox1&&autoDlBox1.checked)||(autoDlBox2&&autoDlBox2.checked)||(autoDlBox3&&autoDlBox3.checked)||!1;if(!isDownloadEnabled){const turboWait=Math.floor(Math.random()*5000)+10000;bananaUpdateStatus(`🚀 Turbo Mode: ส่งคำสั่งแล้ว พักรอ ${Math.floor(turboWait/1000)} วิ...`);await bananaSleep(turboWait);bananaAddLog(`⏭️ Turbo Mode: ข้ามไปเริ่มภาพถัดไปเพื่อความรวดเร็ว`,'info')}else{bananaUpdateStatus(`⏳ ${roundLabel} [5/5] รอ AI สร้างภาพ...`);const getOldImgs=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>Array.from(document.querySelectorAll('img')).map(img=>img.src)});const oldImgSrcs=getOldImgs[0]?.result||[];let isFinished=!1;let idleCount=0;for(let w=0;w<45;w++){if(bananaShouldStopAutomation)throw new Error('STOPPED');await bananaSleep(2000);const checkState=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(oldSrcs)=>{const currentImgs=Array.from(document.querySelectorAll('img'));const hasNewImg=currentImgs.some(img=>{const rect=img.getBoundingClientRect();return!oldSrcs.includes(img.src)&&rect.width>150&&!img.closest('header, nav, [role="textbox"]')});const progressEl=Array.from(document.querySelectorAll('div, span')).find(el=>{const txt=el.textContent.trim();return/^(\d+%)|(\d+\s*%)$/.test(txt)});const hasProgressBar=document.querySelector('[role="progressbar"]')!==null;const hasGeneratingBtn=Array.from(document.querySelectorAll('button')).some(b=>(b.textContent||'').includes('กำลังสร้าง'));const isWorking=progressEl!==undefined||hasProgressBar||hasGeneratingBtn;return{hasNew:hasNewImg,working:isWorking}},args:[oldImgSrcs]});const state=checkState[0]?.result;if(state?.hasNew&&!state?.working){bananaUpdateStatus(`✅ เจอภาพใหม่แล้ว! รอระบบประมวลผลให้สมบูรณ์อีก 6 วินาที...`);await bananaSleep(6000);isFinished=!0;break}
if(!state?.working&&!state?.hasNew){idleCount++;if(idleCount>=8){bananaUpdateStatus(`⚠️ ระบบนิ่งนานเกิน 16 วินาที ตัดจบการรอ!`);bananaAddLog(`⚠️ คาดว่า AI เรนเดอร์ล้มเหลว ข้ามไปรอบถัดไป`,'warning');isFinished=!1;break}}else{idleCount=0}}
if(!isFinished){bananaAddLog(`⚠️ ข้ามการดาวน์โหลด เนื่องจากภาพสร้างไม่สำเร็จ`,'warning')}else{bananaUpdateStatus(`📥 ${roundLabel} กำลังดูดไฟล์ภาพจากหลังบ้าน...`);const downloadResult=await chrome.scripting.executeScript({target:{tabId:tab.id},func:(oldSrcs)=>{return new Promise(async(resolve)=>{try{const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));window.scrollTo(0,0);await sleep(1000);const allImgs=Array.from(document.querySelectorAll('img'));const newImgs=allImgs.filter(img=>{const rect=img.getBoundingClientRect();const altText=(img.getAttribute('alt')||'').toLowerCase();const isGenerated=altText.includes('สร้างขึ้น')||altText.includes('generated')||altText.includes('created')||altText!=='';const isNew=!oldSrcs.includes(img.src);const isLarge=rect.width>150;const notInChat=!img.closest('header, nav, [role="textbox"]');let isUploaded=!1;let card=img;for(let i=0;i<8;i++){if(!card||card===document.body)break;if((card.innerText||'').includes('อัปโหลด')||(card.innerText||'').includes('uploaded'))isUploaded=!0;card=card.parentElement}
return isGenerated&&isNew&&isLarge&&notInChat&&!isUploaded});if(newImgs.length===0)return resolve({success:!1,msg:'หารูปใหม่บนหน้าจอไม่เจอ'});let downloadedCount=0;for(let i=0;i<newImgs.length;i++){const targetImg=newImgs[i];const imgSrc=targetImg.src;if(!imgSrc)continue;targetImg.scrollIntoView({behavior:'smooth',block:'center'});await sleep(800);try{const response=await fetch(imgSrc);const blob=await response.blob();const blobUrl=window.URL.createObjectURL(blob);const a=document.createElement('a');a.style.display='none';a.href=blobUrl;a.download=`Banana_Gen_${Date.now()}_${i+1}.jpg`;document.body.appendChild(a);a.click();await sleep(500);document.body.removeChild(a);window.URL.revokeObjectURL(blobUrl);downloadedCount++;await sleep(1000)}catch(fetchErr){console.log("ดูดภาพล้มเหลว:",fetchErr)}}
if(downloadedCount>0){resolve({success:!0,msg:`ดูดไฟล์ 1K สำเร็จ ${downloadedCount}/${newImgs.length} รูป!`})}else{resolve({success:!1,msg:'พยายามดูดไฟล์แล้วแต่ล้มเหลว'})}}catch(err){resolve({success:!1,msg:'Error: '+err.message})}})},args:[oldImgSrcs]});if(downloadResult[0]?.result?.success){bananaAddLog(`📥 ${downloadResult[0].result.msg}`,'success')}else{bananaAddLog(`⚠️ โหลดอัตโนมัติไม่สำเร็จ: ${downloadResult[0]?.result?.msg}`,'warning')}}}
completedRounds++;bananaAddLog(`🏁 จบรอบที่ ${currentRound}`,'info');if(currentRound<totalRounds){const cooldownTime=Math.floor(Math.random()*3000)+5000;bananaUpdateStatus(`⏳ พักระบบ ${cooldownTime/1000} วินาทีก่อนเริ่มรอบถัดไป (กันโดนบล็อก)...`);await bananaSleep(cooldownTime)}}}
if(!isContinuous){bananaUpdateStatus(`🎉 เสร็จสิ้น!`);showToast('Mission Complete!','success')}else{bananaUpdateStatus(`✅ สร้างภาพเสร็จสิ้น กำลังส่งไม้ต่อให้ Video...`)}}catch(error){if(error.message==='STOPPED'){bananaUpdateStatus('🛑 หยุดการทำงานแล้ว')}else{bananaUpdateStatus(`❌ Error: ${error.message}`);bananaAddLog(`❌ Error: ${error.message}`,'error')}}finally{if(!isContinuous){bananaIsAutomationRunning=!1;bananaShouldStopAutomation=!1;if(bananaBtnAutomation){bananaBtnAutomation.disabled=!1;bananaBtnAutomation.innerHTML='<span>START GENERATE</span>'}
if(bananaBtnStop)bananaBtnStop.style.display='none';try{await toggleWebPageLock(!1)}catch(e){}}}}
async function toggleWebPageLock(shouldLock){try{const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});if(!tab||!tab.url||!tab.url.startsWith('http'))return;await chrome.scripting.executeScript({target:{tabId:tab.id},func:(locked)=>{const lockId='promptplay-lock-overlay';const existingLock=document.getElementById(lockId);if(locked){if(!existingLock){const overlay=document.createElement('div');overlay.id=lockId;overlay.style.cssText=`
                            position: fixed;
                            top: 0; left: 0; width: 100vw; height: 100vh;
                            background: rgba(0, 0, 0, 0.5); 
                            backdrop-filter: blur(2px);      
                            z-index: 2147483647;             
                            cursor: not-allowed;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #fff;
                            font-family: sans-serif;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        `;overlay.innerHTML=`
                            <div style="background: #18181b; padding: 30px 50px; border-radius: 16px; border: 1px solid #6366f1; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                                <div style="font-size: 40px; margin-bottom: 15px;">🔒</div>
                                <h2 style="margin: 0 0 10px 0; color: #fff; font-size: 20px;">SYSTEM WORKING</h2>
                                <p style="margin: 0; color: #aaa; font-size: 14px;">กรุณาอย่าคลิกใดๆ บนหน้าจอขณะนี้</p>
                            </div>
                        `;const blockEvent=(e)=>{e.preventDefault();e.stopPropagation()};['click','mousedown','mouseup','keydown','wheel'].forEach(evt=>{overlay.addEventListener(evt,blockEvent,!0)});document.body.appendChild(overlay);setTimeout(()=>overlay.style.opacity='1',10)}}else{if(existingLock){existingLock.style.opacity='0';setTimeout(()=>existingLock.remove(),300)}}},args:[shouldLock]})}catch(e){console.error("Lock error prevented:",e)}}
async function checkCorrectWebsite(){const[tab]=await chrome.tabs.query({active:!0,currentWindow:!0});const currentUrl=(tab&&tab.url)?tab.url.toLowerCase():"";const isLabs=currentUrl.includes("labs.google");const isFlow=currentUrl.includes("flow");if(isLabs&&isFlow){return!0}
showToast('⚠️ ผิดหน้า! กรุณากดเข้าโปรเจกต์ Google Labs ก่อนเริ่มทำงาน','error');const btns=document.querySelectorAll('.btn-primary');btns.forEach(btn=>{btn.classList.add('shake');setTimeout(()=>btn.classList.remove('shake'),500)});return!1}
document.addEventListener('DOMContentLoaded',()=>{const videoCustomInput=document.getElementById('video-custom-round-input');if(videoCustomInput){videoCustomInput.addEventListener('input',function(){if(typeof videoUpdateRoundInfo==='function')videoUpdateRoundInfo();})}
const bananaCustomInput=document.getElementById('banana-custom-round-input');if(bananaCustomInput){bananaCustomInput.addEventListener('input',function(){if(typeof bananaUpdateRoundInfo==='function')bananaUpdateRoundInfo();})}});document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{console.log("🔄 Setting Defaults (Fantasy Tab & Fancy)...");const checkToTrue=['video-random-voice-checkbox','banana-random-bg-switch','banana-random-outfit-switch'];checkToTrue.forEach(id=>{const box=document.getElementById(id);if(box)box.checked=!0});const imgRandomStyleBox=document.getElementById('banana-random-style-switch');if(imgRandomStyleBox){imgRandomStyleBox.checked=!1;imgRandomStyleBox.dispatchEvent(new Event('change',{bubbles:!0}))}
const vRandomStyleBox=document.getElementById('video-random-style-switch');if(vRandomStyleBox){vRandomStyleBox.checked=!1;vRandomStyleBox.dispatchEvent(new Event('change',{bubbles:!0}))}
const vDownloadCheckbox=document.getElementById('video-download-count-auto');if(vDownloadCheckbox){vDownloadCheckbox.checked=!1}
function forceClick(selector){const el=document.querySelector(selector);if(el)el.click();}
forceClick('.mascot-card[data-value="liver"]');forceClick('.char-tab-btn[data-target="auto"]');forceClick('.config-tab-btn[data-type="style"][data-group="fantasy"]');forceClick('.config-option[data-type="style"][data-value="fancy"]');forceClick('.config-option[data-type="vstyle"][data-value="talk_ugc"]');forceClick('.voice-btn[data-type="dialect"][data-value="central"]');if(typeof checkVideoVoiceState==='function')checkVideoVoiceState();},500)});function checkVideoVoiceState(){const styleInput=document.getElementById('video-style-select');const randomSwitch=document.getElementById('video-random-style-switch');const voiceContainer=document.getElementById('video-voice-container');const genderWrapper=document.getElementById('video-voice-gender-wrapper');if(!styleInput||!voiceContainer)return;const selectedStyle=styleInput.value;const isRandom=randomSwitch?randomSwitch.checked:!1;const noVoiceModes=['broll_hero','broll_pan','broll_zoom','broll_sunlight','miniature_vdo'];const voiceoverModes=['voice_promo','voice_soft','voice_docu','cartoon','voice_rant','voice_miniature','voice_news','voice_movie'];if(!isRandom&&noVoiceModes.includes(selectedStyle)){voiceContainer.classList.add('disabled-section')}else{voiceContainer.classList.remove('disabled-section')}
if(genderWrapper){if(!isRandom&&voiceoverModes.includes(selectedStyle)){genderWrapper.style.display='block';genderWrapper.classList.add('fade-in')}else{genderWrapper.style.display='none'}}}
document.addEventListener('DOMContentLoaded',()=>{const textToggle=document.getElementById('banana-text-overlay-checkbox');const textWrapper=document.getElementById('banana-custom-text-wrapper');if(textToggle&&textWrapper){textToggle.addEventListener('change',(e)=>{if(e.target.checked){textWrapper.style.display='block'}else{textWrapper.style.display='none'}});textWrapper.style.display=textToggle.checked?'block':'none'}})
// =============================================
// STORYTELLING TAB MODULE (v4.5+)
// =============================================

// --- State ---
let storyScenes = [];
let storyIsRunning = false;
let storyShouldStop = false;
let storyGeneratedScript = '';
let storyLogs = [];

// --- Voice Map (same dialects as video tab) ---
const storyVoiceDialects = {
  'central': 'Standard Thai, natural conversational pace',
  'isan': 'Isan Thai dialect, warm rural tone',
  'northern': 'Northern Thai (Lanna) dialect, gentle tone',
  'southern': 'Southern Thai dialect, distinctive accent'
};
const storyVoiceGenders = {
  'female': 'adult female',
  'male': 'adult male',
  'teen_girl': 'teenage girl',
  'teen_boy': 'teenage boy'
};

// --- Story Style Descriptions ---
const storyStyleDescriptions = {
  'mystery': 'Mystery/suspense storytelling with gradual revelation and twist ending',
  'horror': 'Horror/spooky storytelling with building tension and eerie atmosphere',
  'documentary': 'Documentary-style factual narration, educational and informative',
  'comedy': 'Comedic storytelling with humor, wit, and funny observations',
  'inspiration': 'Inspirational/motivational storytelling with emotional depth',
  'facts': 'Mind-blowing facts and trivia presented in an engaging way',
  'folklore': 'Thai folklore, legends, and traditional beliefs',
  'custom': 'User-defined style'
};

// --- Image Style Descriptions ---
const storyImgStyleDescriptions = {
  'cinematic': 'Cinematic, dramatic lighting, movie still quality, 4K',
  'illustration': 'Digital illustration, artistic, detailed painting style',
  'realistic': 'Photorealistic, natural lighting, documentary photography',
  'anime': 'Anime style, vibrant colors, Japanese animation aesthetic',
  'watercolor': 'Watercolor painting style, soft edges, artistic',
  'dark_art': 'Dark art, moody, gothic, shadowy, atmospheric',
  'custom': 'user-defined style'
};

// --- Script Structure Descriptions ---
const storyStructureDescriptions = {
  'hook-twist-cta': 'Short-form: Hook (grab attention) → Build interest → Twist/surprise → CTA (call to action). Fast-paced, engaging, ideal for TikTok/Reels/Shorts.',
  'three-act': 'Classic 3-Act: Act 1 Setup (introduce world/character) → Act 2 Confrontation (conflict, rising action) → Act 3 Resolution (climax, conclusion). Cinematic storytelling.',
  'heroes-journey': "Hero's Journey: Ordinary world -> Call to adventure -> Trials -> Transformation -> Return with wisdom. Epic, emotional arc.",
  'problem-solution': 'Problem-Solution: Present relatable problem → Amplify pain points → Introduce solution → Show benefits → CTA. Sales-friendly format.',
  'storytelling': 'Linear narrative: Continuous storytelling without rigid act breaks. Natural flow, conversational, good for documentaries and personal stories.',
  'custom': 'User-defined structure'
};

// --- Music Style Descriptions ---
const storyMusicDescriptions = {
  'none': 'No background music, voice only',
  'cinematic': 'Cinematic orchestral score, epic, movie soundtrack style',
  'ambient': 'Ambient lo-fi, chill, atmospheric background music',
  'dramatic': 'Dramatic tension music, suspenseful, building intensity',
  'upbeat': 'Upbeat, energetic, fun, positive mood music',
  'thai-traditional': 'Thai traditional music, cultural, ethnic instruments',
  'horror': 'Horror ambient, eerie, creepy, unsettling sound design',
  'corporate': 'Corporate promotional, upbeat, professional, ad-friendly',
  'custom': 'User-defined music style'
};

// --- Aspect Ratio Descriptions ---
const storyAspectDescriptions = {
  '9:16': '9:16 vertical portrait, for TikTok/Reels/YouTube Shorts',
  '16:9': '16:9 landscape widescreen, for YouTube/Facebook',
  '1:1': '1:1 square, for Instagram/Facebook feed'
};

// --- Setup ---
function storySetupUI() {
  console.log("📖 Setting up Storytelling UI...");
  
  // Story style cards
  document.querySelectorAll('.story-style-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.story-style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const wrapper = document.getElementById('story-custom-style-wrapper');
      if (wrapper) wrapper.style.display = card.dataset.value === 'custom' ? 'block' : 'none';
    });
  });

  // Image style cards
  document.querySelectorAll('.story-img-style-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.story-img-style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const wrapper = document.getElementById('story-custom-img-style-wrapper');
      if (wrapper) wrapper.style.display = card.dataset.value === 'custom' ? 'block' : 'none';
    });
  });

  // Aspect ratio cards
  document.querySelectorAll('.story-aspect-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.story-aspect-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hidden = document.getElementById('story-aspect-ratio');
      if (hidden) hidden.value = card.dataset.value;
    });
  });

  // Script structure cards
  document.querySelectorAll('.story-structure-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.story-structure-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hidden = document.getElementById('story-script-structure');
      if (hidden) hidden.value = card.dataset.value;
      const wrapper = document.getElementById('story-custom-structure-wrapper');
      if (wrapper) wrapper.style.display = card.dataset.value === 'custom' ? 'block' : 'none';
    });
  });

  // Background music cards
  document.querySelectorAll('.story-music-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.story-music-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hidden = document.getElementById('story-music-style');
      if (hidden) hidden.value = card.dataset.value;
      const wrapper = document.getElementById('story-custom-music-wrapper');
      if (wrapper) wrapper.style.display = card.dataset.value === 'custom' ? 'block' : 'none';
    });
  });

  // Voice buttons
  document.querySelectorAll('.story-voice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const value = btn.dataset.value;
      document.querySelectorAll(`.story-voice-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hiddenId = type === 'dialect' ? 'story-voice-select' : 'story-voice-gender-select';
      const hidden = document.getElementById(hiddenId);
      if (hidden) hidden.value = value;
    });
  });

  // Scene count segments
  document.querySelectorAll('#story-seg-scenes .segment-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#story-seg-scenes .segment-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.value;
      document.getElementById('story-scene-count').value = val;
      const customInput = document.getElementById('story-custom-scene-input');
      if (val === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
      }
    });
  });

  // Duration segments
  document.querySelectorAll('#story-seg-duration .segment-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#story-seg-duration .segment-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('story-scene-duration').value = btn.dataset.value;
    });
  });

  // Custom scene input
  const customSceneInput = document.getElementById('story-custom-scene-input');
  if (customSceneInput) {
    customSceneInput.addEventListener('input', () => {
      const val = parseInt(customSceneInput.value);
      if (!isNaN(val) && val > 0) {
        document.getElementById('story-scene-count').value = val;
      }
    });
  }

  // Event listeners for buttons
  const generateBtn = document.getElementById('story-btn-generate');
  const autoBtn = document.getElementById('story-btn-automation');
  const stopBtn = document.getElementById('story-btn-stop');
  const copyBtn = document.getElementById('story-copy-script');
  const logClearBtn = document.getElementById('story-log-clear');

  if (generateBtn) generateBtn.addEventListener('click', storyHandleGenerate);
  if (autoBtn) autoBtn.addEventListener('click', storyRunAutomation);
  if (stopBtn) stopBtn.addEventListener('click', storyStopAutomation);
  if (copyBtn) copyBtn.addEventListener('click', storyCopyScript);
  if (logClearBtn) logClearBtn.addEventListener('click', () => { storyLogs = []; storyUpdateLogDisplay(); });
}

// --- Helper Functions ---
function storyGetSceneCount() {
  const select = document.getElementById('story-scene-count');
  const custom = document.getElementById('story-custom-scene-input');
  if (!select) return 'auto';
  if (select.value === 'auto') return 'auto';
  if (select.value === 'custom' && custom && custom.style.display === 'block') {
    const val = parseInt(custom.value);
    return (!isNaN(val) && val > 0 && val <= 20) ? val : 5;
  }
  const val = parseInt(select.value);
  return (!isNaN(val) && val > 0 && val <= 20) ? val : 5;
}

function storyGetDuration() {
  const el = document.getElementById('story-scene-duration');
  const val = parseInt(el ? el.value : '5');
  return (!isNaN(val) && val >= 3 && val <= 15) ? val : 5;
}

function storyGetStyle() {
  const active = document.querySelector('.story-style-card.active');
  if (!active) return 'mystery';
  if (active.dataset.value === 'custom') {
    return document.getElementById('story-custom-style-input')?.value || 'mystery';
  }
  return active.dataset.value;
}

function storyGetImgStyle() {
  const active = document.querySelector('.story-img-style-card.active');
  if (!active) return 'cinematic';
  if (active.dataset.value === 'custom') {
    return document.getElementById('story-custom-img-style-input')?.value || 'cinematic';
  }
  return active.dataset.value;
}

function storyGetAspectRatio() {
  const el = document.getElementById('story-aspect-ratio');
  return el ? el.value : '9:16';
}

function storyGetScriptStructure() {
  const el = document.getElementById('story-script-structure');
  const val = el ? el.value : 'hook-twist-cta';
  if (val === 'custom') {
    return document.getElementById('story-custom-structure-input')?.value || 'hook-twist-cta';
  }
  return val;
}

function storyGetMusicStyle() {
  const el = document.getElementById('story-music-style');
  const val = el ? el.value : 'none';
  if (val === 'custom') {
    return document.getElementById('story-custom-music-input')?.value || 'none';
  }
  return val;
}

function storyGetVoiceDialect() {
  const el = document.getElementById('story-voice-select');
  return el ? el.value : 'central';
}

function storyGetVoiceGender() {
  const el = document.getElementById('story-voice-gender-select');
  return el ? el.value : 'female';
}

function storySleep(ms) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (storyShouldStop) { clearInterval(interval); reject(new Error('STOPPED')); }
      else { clearInterval(interval); resolve(); }
    }, Math.min(ms, 100));
  });
}

function storyAddLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('th-TH');
  storyLogs.push({ time: timestamp, message, type });
  if (storyLogs.length > 500) storyLogs = storyLogs.slice(-500);
  storyUpdateLogDisplay();
  console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](`[${timestamp}] ${message}`);
}

function storyUpdateLogDisplay() {
  const container = document.getElementById('story-log-container');
  if (!container) return;
  if (storyLogs.length === 0) {
    container.innerHTML = '<div class="log-empty">ยังไม่มี log</div>';
    return;
  }
  const logHTML = storyLogs.map(log => {
    let cls = 'log-entry-info';
    if (log.type === 'error') cls = 'log-entry-error';
    else if (log.type === 'success') cls = 'log-entry-success';
    else if (log.type === 'step') cls = 'log-entry-step';
    return `<div class="log-entry ${cls}"><span class="log-entry-time">[${log.time}]</span><span class="log-entry-message">${log.message}</span></div>`;
  }).join('');
  container.innerHTML = logHTML;
  container.scrollTop = container.scrollHeight;
}

function storyUpdateStatus(message, persistent = false) {
  const el = document.getElementById('story-status-text');
  if (el) el.textContent = message;
  storyAddLog(message, persistent ? 'step' : 'info');
}

function storyRenderScenes() {
  const container = document.getElementById('story-scenes-container');
  const statusEl = document.getElementById('story-scene-status');
  if (!container) return;
  if (storyScenes.length === 0) {
    container.innerHTML = '<div style="color:#666; font-size:12px; padding:10px;">ฉากจะปรากฏที่นี่หลัง generate story...</div>';
    if (statusEl) statusEl.textContent = '';
    return;
  }
  const doneCount = storyScenes.filter(s => s.status === 'done').length;
  if (statusEl) statusEl.textContent = `${doneCount}/${storyScenes.length} เสร็จ`;
  
  container.innerHTML = storyScenes.map((scene, i) => {
    let statusCls = 'pending';
    let statusText = 'รอ';
    if (scene.status === 'generating') { statusCls = 'generating'; statusText = 'กำลังสร้าง...'; }
    else if (scene.status === 'done') { statusCls = 'done'; statusText = '✅ เสร็จ'; }
    else if (scene.status === 'error') { statusCls = 'error'; statusText = '❌ ผิดพลาด'; }
    
    const itemCls = scene.status === 'done' ? 'scene-done' : scene.status === 'error' ? 'scene-error' : '';
    
    return `<div class="scene-item ${itemCls}">
      <div class="scene-header">
        <span class="scene-number">ฉากที่ ${i + 1}</span>
        <span class="scene-status ${statusCls}">${statusText}</span>
      </div>
      <div class="scene-text">${scene.narration || ''}</div>
      ${scene.imagePrompt ? `<div class="scene-prompt">🎨 ${scene.imagePrompt.substring(0, 100)}...</div>` : ''}
    </div>`;
  }).join('');
}

// --- Gemini API Call for Story Generation ---
async function storyCallGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('กรุณาตั้งค่า Gemini API Key ใน Settings');
  }
  const model = getStoryAIModel(); const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 }
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${err}`);
  }
  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error('ไม่ได้รับ response จาก Gemini');
}

// --- Generate Story Script ---
async function storyHandleGenerate() {
  const topic = document.getElementById('story-topic-input')?.value?.trim();
  if (!topic) {
    showToast('กรุณาใส่หัวข้อเรื่อง', 'error');
    return;
  }

  const detail = document.getElementById('story-detail-input')?.value?.trim() || '';
  const sceneCount = storyGetSceneCount();
  const duration = storyGetDuration();
  const storyStyle = storyGetStyle();
  const voiceDialect = storyGetVoiceDialect();
  const voiceGender = storyGetVoiceGender();
  const imgStyle = storyGetImgStyle();
  const aspectRatio = storyGetAspectRatio();
  const scriptStructure = storyGetScriptStructure();
  const musicStyle = storyGetMusicStyle();

  const styleDesc = storyStyleDescriptions[storyStyle] || storyStyle;
  const dialectDesc = storyVoiceDialects[voiceDialect] || voiceDialect;
  const genderDesc = storyVoiceGenders[voiceGender] || voiceGender;
  const imgStyleDesc = storyImgStyleDescriptions[imgStyle] || imgStyle;
  const aspectDesc = storyAspectDescriptions[aspectRatio] || aspectRatio;
  const structureDesc = storyStructureDescriptions[scriptStructure] || scriptStructure;
  const musicDesc = storyMusicDescriptions[musicStyle] || musicStyle;

  // Auto scene count - let AI decide
  const sceneCountSetting = storyGetSceneCount();
  const sceneCountPrompt = sceneCountSetting === 'auto' 
    ? 'ให้ AI วิเคราะห์เนื้อหาแล้วแบ่งจำนวนฉากให้เหมาะสมเอง (แนะนำ 3-10 ฉาก)'
    : `แบ่งเป็น ${sceneCountSetting} ฉาก`;

  const systemPrompt = `คุณคือนักเล่าเรื่องมืออาชีพชาวไทยและครีเอทีฟไดเรกเตอร์ สร้างเรื่องราวที่น่าสนใจ

ข้อกำหนด:
- เขียน narration เป็นภาษาไทยเท่านั้น (NO English in narration text)
- imagePrompt เขียนเป็นภาษาอังกฤษเท่านั้น
- สไตล์การเล่าเรื่อง: ${styleDesc}
- โครงสร้างบท: ${structureDesc}
- ใช้ภาษา${dialectDesc} โดย ${genderDesc} เป็นผู้เล่า
- ${sceneCountPrompt} แต่ละฉากมีความยาวประมาณ ${duration} วินาที
- สไตล์ภาพ: ${imgStyleDesc}
- สัดส่วนภาพ: ${aspectDesc}
- ดนตรีประกอบ: ${musicDesc}

รูปแบบ output ที่ต้องการ (JSON array):
[
  {
    "scene_number": 1,
    "narration": "บทพากย์ภาษาไทยสำหรับฉากนี้",
    "imagePrompt": "English image generation prompt, ${imgStyleDesc} style, ${aspectRatio} aspect ratio, highly detailed",
    "imagePromptThai": "คำอธิบายภาพภาษาไทย (สำหรับตรวจสอบ)",
    "mood": "อารมณ์ของฉากนี้ (เช่น: suspenseful, warm, dramatic)",
    "cameraAngle": "มุมกล้อง (เช่น: close-up, wide shot, over-the-shoulder)"
  },
  ...
]

ตอบกลับเป็น JSON array เท่านั้น ไม่มีข้อความอื่น`;

  const userPrompt = `หัวข้อ: ${topic}
${detail ? 'รายละเอียดเพิ่มเติม: ' + detail : ''}
สไตล์: ${styleDesc}
จำนวนฉาก: ${sceneCount}
ความยาวต่อฉาก: ${duration} วินาที
เสียงพากย์: ${dialectDesc} โดย ${genderDesc}
สไตล์ภาพ: ${imgStyleDesc}`;

  storyUpdateStatus('กำลังสร้างเรื่อง...');
  storyAddLog(`📝 สร้างเรื่อง: "${topic}" (${sceneCount} ฉาก)`, 'step');

  try {
    const result = await storyCallGemini(systemPrompt + '\n\n' + userPrompt);
    
    // Parse JSON from response
    let scenes;
    try {
      // Try to extract JSON from the response
      let jsonStr = result.trim();
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      // Find JSON array
      const startIdx = jsonStr.indexOf('[');
      const endIdx = jsonStr.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }
      scenes = JSON.parse(jsonStr);
    } catch (parseErr) {
      storyAddLog(`⚠️ Parse JSON ล้มเหลว: ${parseErr.message}`, 'warning');
      // Fallback: show raw result
      storyGeneratedScript = result;
      const preview = document.getElementById('story-script-preview');
      if (preview) preview.textContent = result;
      storyUpdateStatus('สร้างเสร็จ (format ไม่ตรง - แสดง raw)', 'persistent');
      return;
    }

    storyScenes = scenes.map(s => ({
      scene_number: s.scene_number || 1,
      narration: s.narration || '',
      imagePrompt: s.imagePrompt || s.image_prompt || '',
      status: 'pending',
      imageDataUrl: null,
      voiceBlobUrl: null
    }));

    // Show script preview
    storyGeneratedScript = storyScenes.map((s, i) => `ฉาก ${i + 1}:\n${s.narration}`).join('\n\n---\n\n');
    const preview = document.getElementById('story-script-preview');
    if (preview) preview.textContent = storyGeneratedScript;

    storyRenderScenes();
    storyUpdateStatus(`สร้างเรื่องเสร็จ! ${storyScenes.length} ฉาก`, 'persistent');
    storyAddLog(`✅ สร้างเรื่องเสร็จ ${storyScenes.length} ฉาก`, 'success');

  } catch (err) {
    storyAddLog(`❌ สร้างเรื่องล้มเหลว: ${err.message}`, 'error');
    storyUpdateStatus(`Error: ${err.message}`, 'persistent');
    showToast('สร้างเรื่องล้มเหลว', 'error');
  }
}

// --- Copy Story Script ---
function storyCopyScript() {
  if (!storyGeneratedScript) {
    showToast('ยังไม่มีบทให้คัดลอก', 'error');
    return;
  }
  navigator.clipboard.writeText(storyGeneratedScript)
    .then(() => showToast('คัดลอกบทแล้ว!', 'success'))
    .catch(() => showToast('ไม่สามารถคัดลอกได้', 'error'));
}

// --- Voice Generation (Edge TTS via Web Speech API as fallback) ---
function storyGenerateVoice(text, sceneIndex) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser ไม่รองรับ Speech Synthesis'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;

    // Try to find a Thai voice
    const voices = speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang.startsWith('th'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    // Convert to audio blob - Web Speech API doesn't directly support this
    // For Level 1, we'll use a workaround: use Edge TTS API via fetch if available
    // Otherwise, just play the voice without saving
    
    utterance.onend = () => {
      // For Level 1, we don't save the audio file yet
      // This is a preview-only voice generation
      resolve(null);
    };
    utterance.onerror = (e) => reject(new Error('Voice error: ' + e.error));
    
    speechSynthesis.speak(utterance);
  });
}

// --- Stop Automation ---
function storyStopAutomation() {
  if (storyIsRunning) {
    storyShouldStop = true;
    storyUpdateStatus('กำลังหยุด...');
    showToast('กำลังหยุด Automation...', 'error');
    // Also stop speech synthesis
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}

// --- Run Full Automation ---
async function storyRunAutomation() {
  if (!_0x99f) { return; }
  const isCorrect = await checkCorrectWebsite();
  if (!isCorrect) return;

  if (storyScenes.length === 0) {
    showToast('กรุณา Generate Story ก่อน', 'error');
    return;
  }

  if (storyIsRunning) {
    showToast('กำลังรันอยู่แล้ว กรุณารอสักครู่', 'error');
    return;
  }

  storyIsRunning = true;
  storyShouldStop = false;
  
  const autoBtn = document.getElementById('story-btn-automation');
  const stopBtn = document.getElementById('story-btn-stop');
  if (autoBtn) { autoBtn.disabled = true; autoBtn.innerHTML = '<span class="loading"></span> <span>กำลังรัน Story...</span>'; }
  if (stopBtn) stopBtn.style.display = 'flex';
  
  await toggleWebPageLock(true);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const actionDelay = getActionDelay ? getActionDelay() : 2500;
    const sleep = (ms) => storySleep(ms).catch(() => {});

    // Switch to Image mode on the website first
    storyUpdateStatus('กำลังตั้งค่าโหมด Image...');
    storyAddLog('⚙️ Step 1: ตั้งค่าโหมด...', 'step');

    // For each scene: generate image, then voice
    for (let i = 0; i < storyScenes.length; i++) {
      if (storyShouldStop) throw new Error('STOPPED');
      
      const scene = storyScenes[i];
      scene.status = 'generating';
      storyRenderScenes();
      storyUpdateStatus(`ฉาก ${i + 1}/${storyScenes.length}: กำลังสร้างภาพ...`);
      storyAddLog(`🎨 ฉาก ${i + 1}: กำลังสร้างภาพ...`, 'step');

      // Step 1: Fill image prompt into website
      if (scene.imagePrompt) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async (prompt) => {
            const sleep = (ms) => new Promise(r => setTimeout(r, ms));
            const editor = document.querySelector('[data-slate-editor="true"]') || document.querySelector('[role="textbox"]');
            if (!editor) return { success: false, msg: 'ไม่พบช่องกรอกข้อความ' };
            
            editor.focus();
            editor.click();
            await sleep(200);
            
            // Clear existing content
            editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
            document.execCommand('delete', false, null);
            await sleep(100);
            
            // Paste new prompt
            const dt = new DataTransfer();
            dt.setData('text/plain', prompt);
            dt.setData('text/html', `<p>${prompt}</p>`);
            const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
            editor.dispatchEvent(pasteEvent);
            await sleep(300);
            editor.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: prompt, bubbles: true }));
            
            return { success: true, msg: 'ใส่ prompt สำเร็จ' };
          },
          args: [scene.imagePrompt]
        });
        await sleep(1000);
      }

      // Step 2: Click create/generate
      storyUpdateStatus(`ฉาก ${i + 1}/${storyScenes.length}: กำลังกดสร้าง...`);
      await sleep(500);

      // Find and click the submit button (same logic as video tab)
      const createResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: () => {
          const allBtns = Array.from(document.querySelectorAll('button'));
          let targetBtn = null;
          for (let i = allBtns.length - 1; i >= 0; i--) {
            const btn = allBtns[i];
            const html = (btn.innerHTML || '').toLowerCase();
            const text = (btn.textContent || '').toLowerCase().trim();
            const style = window.getComputedStyle(btn);
            if (btn.disabled || style.pointerEvents === 'none' || style.opacity === '0') continue;
            if (text.includes('nano') || text.includes('pro') || text.includes('อัปเกรด')) continue;
            if (html.includes('add_circle') || html.includes('add ')) continue;
            if (html.includes('arrow_forward') || html.includes('send') || text === 'สร้าง' || text === 'create') {
              targetBtn = btn;
              break;
            }
          }
          if (!targetBtn) return { success: false, msg: 'หาปุ่มส่งคำสั่งไม่เจอ' };
          
          targetBtn.click();
          return { success: true, msg: 'กดปุ่มสร้างสำเร็จ' };
        }
      });

      if (!createResult[0]?.result?.success) {
        throw new Error(createResult[0]?.result?.msg || 'กดสร้างล้มเหลว');
      }
      storyAddLog(`🖱️ ฉาก ${i + 1}: ส่งคำสั่งสร้าง`, 'success');

      // Step 3: Wait for generation
      storyUpdateStatus(`ฉาก ${i + 1}/${storyScenes.length}: กำลังเรนเดอร์...`);
      const getOldImgs = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src && src.startsWith('http'));
        }
      });
      const oldImgSrcs = getOldImgs[0]?.result || [];
      
      let isFinished = false;
      for (let w = 0; w < 180; w++) {
        if (storyShouldStop) throw new Error('STOPPED');
        
        const checkResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (oldSrcs) => {
            const currentImgs = Array.from(document.querySelectorAll('img'))
              .filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.width > 100 && rect.height > 100 && img.src.startsWith('http');
              })
              .map(img => img.src);
            const newImgs = currentImgs.filter(src => !oldSrcs.includes(src));
            
            const hasLoading = document.querySelector('[role="progressbar"], [class*="loading"], [class*="progress"]') !== null;
            return { newImgs: newImgs.length, loading: hasLoading };
          },
          args: [oldImgSrcs]
        });
        
        const status = checkResult[0]?.result;
        if (status && status.newImgs > 0 && !status.loading) {
          storyUpdateStatus(`✅ เจอภาพใหม่! รอสักครู่...`);
          await sleep(3000);
          isFinished = true;
          
          // Get the new image URL and capture it
          const imgResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (oldSrcs) => {
              const currentImgs = Array.from(document.querySelectorAll('img'))
                .filter(img => {
                  const rect = img.getBoundingClientRect();
                  return rect.width > 100 && rect.height > 100 && img.src.startsWith('http');
                });
              const newImgs = currentImgs.filter(img => !oldSrcs.includes(img.src));
              if (newImgs.length > 0) return newImgs[0].src;
              return null;
            },
            args: [oldImgSrcs]
          });
          
          if (imgResult[0]?.result) {
            scene.imageDataUrl = imgResult[0].result;
            storyAddLog(`📸 ฉาก ${i + 1}: จับภาพสำเร็จ`, 'success');
          }
          break;
        }
        if (w % 20 === 0) storyUpdateStatus(`⏳ กำลังเรนเดอร์... (${w}s)`);
        await sleep(1000);
      }

      if (!isFinished) {
        storyAddLog(`⚠️ ฉาก ${i + 1}: เรนเดอร์ timeout`, 'warning');
        scene.status = 'error';
      } else {
        scene.status = 'done';
        storyAddLog(`✅ ฉาก ${i + 1}: เสร็จสิ้น`, 'success');
      }
      
      storyRenderScenes();
      await sleep(actionDelay);
    }

    storyUpdateStatus('สร้าง Story เสร็จสิ้น!', 'persistent');
    storyAddLog('🎉 สร้างเรื่องทั้งหมดเสร็จสิ้น!', 'success');
    showToast('สร้าง Story เสร็จ!', 'success');

  } catch (err) {
    if (err.message === 'STOPPED') {
      storyUpdateStatus('หยุดโดยผู้ใช้', 'persistent');
      storyAddLog('⛔ หยุด Automation โดยผู้ใช้', 'warning');
    } else {
      storyAddLog(`❌ Automation ล้มเหลว: ${err.message}`, 'error');
      storyUpdateStatus(`Error: ${err.message}`, 'persistent');
      showToast('Automation ล้มเหลว', 'error');
    }
  } finally {
    storyIsRunning = false;
    storyShouldStop = false;
    const autoBtn = document.getElementById('story-btn-automation');
    if (autoBtn) { autoBtn.disabled = false; autoBtn.innerHTML = '▶️ START FULL AUTO'; }
    const stopBtn = document.getElementById('story-btn-stop');
    if (stopBtn) stopBtn.style.display = 'none';
    try { await toggleWebPageLock(false); } catch(e) {}
  }
}

// Story tab initialization
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('story-topic-input')) {
    storySetupUI();
    console.log("📖 Storytelling tab initialized");
  }
});
