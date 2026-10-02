from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np,subprocess,wave,json,math
from pathlib import Path
P=Path(__file__).resolve().parent;W,H,FPS,D=720,960,30,12.
F=str(P / 'fonts/NotoSansCJK-Bold.ttc');R=str(P / 'fonts/NotoSansCJK-Regular.ttc');EN=str(P / 'fonts/NimbusSans-Regular.otf')
cream=(247,243,221);yellow=(247,212,42)
def font(n,b=True):return ImageFont.truetype(F if b else R,n,index=2)
def text(im,s,xy,n,col=cream,center=False,english=False):
 d=ImageDraw.Draw(im);fo=ImageFont.truetype(EN,n) if english else font(n);box=d.textbbox((0,0),s,font=fo);x,y=xy
 if center:x-=(box[2]-box[0])/2
 d.text((x,y),s,font=fo,fill=col)
def ease(x):x=max(0,min(1,x));return 1-(1-x)**3
def fit(im,size):
 im=im.copy();im.thumbnail(size,Image.Resampling.LANCZOS);return im
def paste(im,asset,xy):im.paste(asset,(int(xy[0]),int(xy[1])),asset if asset.mode=='RGBA' else None)
board=Image.open(str(P / 'assets/storyboard.png')).convert('RGB');bw,bh=board.size
cells=[board.crop((3,3,bw//2-3,bh//2-3)),board.crop((bw//2+3,3,bw-3,bh//2-3)),board.crop((bw//2+3,bh//2+3,bw-3,bh-3))];cells=[a.resize((W,H),Image.Resampling.LANCZOS)for a in cells]
mark=Image.open(str(P / 'assets/bb-brand-candidate.png')).convert('RGBA');mark=mark.crop(mark.getbbox());mark=fit(mark,(330,325));mxy=((W-mark.width)//2,(H-mark.height)//2)
oai=fit(Image.open(str(P / 'assets/openai-wordmark.png')).convert('RGBA'),(280,125))
gh=Image.open(str(P / 'assets/github-lockup.png')).convert('RGBA');gh=fit(gh,(195,100))
codex=fit(Image.open(P/'codex-icon.png').convert('RGBA'),(68,68));claude=fit(Image.open(P/'claude-symbol.png').convert('RGBA'),(48,48))
ref=Image.open(str(P / 'assets/reference-logo.png')).convert('RGB').crop((150,140,620,430));ref=fit(ref,(180,112))
def mic(im,x,y,a=0):
 m=Image.new('RGBA',(66,110));d=ImageDraw.Draw(m);d.rounded_rectangle((20,8,46,65),radius=13,outline=cream,width=3)
 for yy in (22,30,38,46):d.line((27,yy,39,yy),fill=cream,width=2)
 d.arc((13,40,53,80),0,180,fill=cream,width=3);d.line((33,80,33,99),fill=cream,width=3);d.line((18,99,48,99),fill=cream,width=3)
 m=m.rotate(a,Image.Resampling.BICUBIC,expand=True);paste(im,m,(x-m.width/2,y-m.height/2))
def frame(t):
 im=Image.new('RGB',(W,H),'black')
 if t<6:
  i=0 if t<2.1 else 1 if t<3.8 else 2;start=[0,2.1,3.8][i];u=t-start;z=1+.016*u
  if t>5.5:z+=.09*ease((t-5.5)/.5)
  ww,hh=int(W*z),int(H*z);a=cells[i].resize((ww,hh),Image.Resampling.BICUBIC);xx=(ww-W)//2;yy=(hh-H)//2;im=a.crop((xx,yy,xx+W,yy+H))
  if t>5.65:im=im.filter(ImageFilter.GaussianBlur((t-5.65)*4))
 if 5.5<=t<6.5:
  paste(im,mark,mxy)
 elif 6.5<=t<8.2:
  u=t-6.5
  # The microphone group is the graphic subject, not decorative UI chrome
  for i in range(6):
   p=ease((u-i*.026)/.2);mic(im,135+i*90,226+(1-p)*72,[-18,-11,-4,4,11,18][i])
  text(im,'4–6人',(W//2,339+int(25*(1-ease(u/.15)))),96,cream,True)
  text(im,'聊天喜剧',(W//2,453),83,yellow,True)
  text(im,'什么都能聊，聊着就跑题。',(W//2,602),27,cream,True)
 elif 8.2<=t<10.3:
  u=t-8.2
  # A compact two-beat scale settle, then a stable readable invitation
  layer=Image.new('RGBA',(W,H));text(layer,'深圳南山',(W//2,280),42,yellow,True);text(layer,'来一起录',(W//2,377),88,cream,True)
  text(layer,'筹备中 · 找聊天搭子和制作伙伴',(W//2,530),28,cream,True);text(layer,'全网同名：BB箱子',(W//2,633),28,cream,True)
  sc=1.045-.045*ease(u/.16);sz=(int(W*sc),int(H*sc));layer=layer.resize(sz,Image.Resampling.BICUBIC);paste(im,layer,((W-sz[0])/2,(H-sz[1])/2))
 else:
  if t>=10.3:
   # One quiet board: brand + tool marks + reference marks; no process boasting
   small=fit(mark,(170,165));paste(im,small,((W-small.width)//2,158))
   paste(im,oai,(78,384));paste(im,codex,(403,410));text(im,'Codex',(480,426),37,cream,False,True)
   paste(im,gh,(94,530));paste(im,claude,(409,538));text(im,'Claude Code',(475,543),28,cream,False,True)
   text(im,'Reference',(W//2,679),18,(145,145,140),True,True);paste(im,ref,((W-ref.width)//2,714))
 return im
p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p',str(P/'silent.mp4')],stdin=subprocess.PIPE)
for j in range(int(D*FPS)):p.stdin.write(frame(j/FPS).tobytes())
p.stdin.close();assert p.wait()==0
sr=48000;out=np.zeros((int(D*sr),2));rng=np.random.default_rng(8119)
def add(t,a,g=1,pan=0):
 i=int(t*sr);n=min(len(a),len(out)-i)
 if i<0 or n<=0:return
 out[i:i+n,0]+=a[:n]*g*(1-max(0,pan)*.6);out[i:i+n,1]+=a[:n]*g*(1+min(0,pan)*.6)
def kick():
 tt=np.arange(int(.31*sr))/sr;env=np.exp(-tt*14);return (np.sin(2*np.pi*(49*tt+5.2*(1-np.exp(-tt*44))))+.22*np.sin(2*np.pi*98*tt))*env
def clap():
 tt=np.arange(int(.16*sr))/sr;n=rng.normal(0,1,len(tt));hp=n-np.convolve(n,np.ones(16)/16,'same');env=np.exp(-tt*24)+.55*np.exp(-np.maximum(tt-.013,0)*40)*(tt>.013)+.28*np.exp(-np.maximum(tt-.027,0)*42)*(tt>.027);return hp*env*.35
beat=60/108
for k in range(22):
 t=k*beat
 add(t,kick(),.25)
 if k%2:add(t,clap(),.21)
 if k%4 in [2,3]:add(t+.75*beat,kick(),.13)
 for off in [0,.5,.75] if k%4==3 else [0,.5]:
  tt=np.arange(int(.038*sr))/sr;n=rng.normal(0,1,len(tt));add(t+off*beat,(n-np.convolve(n,np.ones(10)/10,'same'))*np.exp(-tt*155),.026,(-1)**k*.4)
 # Phone-audible bass harmonics with short, syncopated notes
 tt=np.arange(int(.22*sr))/sr;freq=[49,49,58.27,43.65][k%4];b=(np.sin(2*np.pi*freq*tt)+.3*np.sin(2*np.pi*freq*2*tt)+.15*np.sin(2*np.pi*freq*3*tt))*np.exp(-tt*10);add(t+.25*beat,b,.10)
# An actual reduction before impact creates contrast; not merely more loudness
for a,b in [(5.40,5.5),(6.39,6.5),(8.10,8.2),(10.20,10.3)]:out[int(a*sr):int(b*sr)]*=.14
for t in [2.1,3.8,5.5,6.,6.5,8.2,10.3]:add(t,kick(),.24);add(t,clap(),.08)
# Transition sweep and toolbox-like restrained metal strike, original synthesis
for t in [6.5,8.2]:
 tt=np.arange(int(.18*sr))/sr;add(t-.18,rng.normal(0,1,len(tt))*np.linspace(0,.07,len(tt)),1)
tt=np.arange(int(.65*sr))/sr;metal=sum(np.sin(2*np.pi*f*tt)*np.exp(-tt*d) for f,d in [(740,16),(1147,20),(1685,23)])*.033;add(10.3,metal);add(10.47,metal,.2)
# keep final board quieter and end cleanly
out[int(10.45*sr):]*=.6
fade=np.minimum(1,np.maximum(0,(D-np.arange(len(out))/sr)/.32));out*=fade[:,None];out=np.tanh(out*1.25);peak=np.max(np.abs(out));out*=.78/max(peak,1e-8)
with wave.open(str(P/'original_mix.wav'),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i',str(P/'silent.mp4'),'-i',str(P/'original_mix.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',str(P/'BB箱子_V7_末段与片尾12秒预演.mp4')],check=True)
sh=Image.new('RGB',(1800,530),(18,18,18));d=ImageDraw.Draw(sh)
for i,(t,label)in enumerate([(5.7,'末景叠标'),(6.2,'底图切黑'),(7.3,'节目是什么'),(9.1,'在哪 · 找谁'),(11.1,'标识与Reference同屏')]):
 sh.paste(frame(t).resize((360,480)),(i*360,0));d.text((i*360+10,491),label,font=font(19),fill='white')
sh.save(P/'V7_五个关键画面.jpg',quality=95)
for t,n in [(7.3,'programme'),(9.1,'invite'),(11.1,'credits')]:frame(t).save(P/(n+'.png'))
(P/'QA.json').write_text(json.dumps({'duration':D,'body_context':6,'new_tail':6,'logo_overlap':.5,'black_logo':.5,'programme':1.7,'invite':2.1,'credits':1.7,'audio':'original synthetic stereo 108 BPM; not final music; no voice','direct_reference_programme_name':False,'all_marks_one_frame':True,'claude_mark':'community vector for reference, not claimed as official press download or actual execution','source_action':'still frames with edit-camera motion only','approved':False},ensure_ascii=False,indent=2))
print('rendered')
