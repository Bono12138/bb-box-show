"""Original instrumental edit test C. No samples, voices, or external dependencies."""
import math, random, array, wave, pathlib, json, csv
P=pathlib.Path(__file__).parent; SR=32000; BPM=106; BEAT=60/BPM
DUR=40*BEAT; SEED=930106; rng=random.Random(SEED)
n=round(DUR*SR); L=array.array('f',[0])*n; R=array.array('f',[0])*n; events=[]
def hit(kind,beat,level=1,pan=0,freq=46.249,length=.2):
 t=beat*BEAT; events.append(dict(sound=kind,beat=beat,time_seconds=round(t,6),level=level,frequency=freq,length_seconds=length))
 start=round(t*SR); phase=0; smooth=0; hp=0
 for i in range(round(length*SR)):
  j=start+i
  if j>=n: break
  x=i/SR; noise=rng.uniform(-1,1); attack=min(1,x/.0015); release=min(1,(length-x)/.014)
  smooth+=.32*(noise-smooth)
  if kind=='kick':
   phase+=2*math.pi*(47+150*math.exp(-x*55))/SR
   v=.8*math.sin(phase)*math.exp(-x*17)+smooth*.13*math.exp(-x*140)
  elif kind=='snare':
   v=(smooth*.7+math.sin(2*math.pi*176*x)*.25)*math.exp(-x*27)
  elif kind=='hat':
   v=(noise-smooth)*.095*math.exp(-x*90)
  elif kind=='bass':
   phase+=2*math.pi*freq/SR
   raw=math.sin(phase)+.27*math.sin(phase*2)+.12*math.sin(phase*3)
   v=.32*math.tanh(1.4*raw)*math.exp(-x*1.4)
  elif kind=='scratch':
   # Band limited noise under a moving resonant envelope; no voice/sample.
   sweep=850+2200*(.5+.5*math.sin(2*math.pi*x/length))
   phase+=2*math.pi*sweep/SR
   v=smooth*.32*(.55+.45*math.sin(phase))*math.sin(math.pi*x/length)**1.5
  elif kind=='stab':
   # Short low chord, no high electronic notification motif.
   v=.1*sum(math.sin(2*math.pi*freq*r*x) for r in [1,1.189207,1.498307])*math.exp(-x*19)
  v*=attack*release*level
  L[j]+=v*math.sqrt((1-pan)/2); R[j]+=v*math.sqrt((1+pan)/2)
for bar in range(10):
 b=bar*4; root=[46.249,46.249,41.203,43.654][bar%4]
 kicks=[[0,.75,2,2.75],[0,1.5,2.25,3.5],[0,.5,1.75,2.5],[0,.75,2,3.25]][bar%4]
 if bar==9: kicks=[0,1.5,2]
 for k in kicks: hit('kick',b+k,1.05,length=.25); hit('bass',b+k,.95,freq=root*(1.4983 if k==2.75 else 1),length=.20 if k%1 else .30)
 for k in [1,3]:
  if bar==9 and k==3: continue
  hit('snare',b+k,.95,length=.17)
 if bar in [1,5,7]: hit('snare',b+2.75,.3,length=.09)
 hats=[.5,1.5,2.5,3.5] if bar%2==0 else [.25,.75,1.5,2.5,3.25,3.5]
 if bar==9: hats=[.5,1.75]
 for k in hats: hit('hat',b+k+.018,.65 if k%1==.5 else .42,pan=.22 if k<2 else -.22,length=.055)
 if bar in [0,2,4,6,8]: hit('stab',b,.7,pan=-.12,freq=root*2,length=.23)
 if bar in [1,3,5,7,8]:
  for k in [2.5,2.875]: hit('scratch',b+k,.65,pan=.28 if k==2.5 else -.28,length=.115)
# Two actual short rests, with 6ms fade edges before accented re-entry.
rests=[(15.25,16),(27.5,28)]
for i in range(n):
 t=i/SR; bt=t/BEAT; env=min(1,t/.002,max(0,(DUR-t)/.32))
 for a,b in rests:
  if a<=bt<b: env=0
  elif a-.006/BEAT<=bt<a: env*=max(0,(a-bt)*BEAT/.006)
  elif b<=bt<b+.002/BEAT: env*=min(1,(bt-b)*BEAT/.002)
 L[i]*=env; R[i]*=env
peak=max(max(abs(v) for v in L),max(abs(v) for v in R)); gain=10**(-2/20)/peak
pcm=array.array('h',(round(v*gain*32767) for pair in zip(L,R) for v in pair))
def save(path,samples,sr):
 with wave.open(str(path),'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(samples.tobytes())
save(P/'C_106BPM_master.wav',pcm,SR)
# Small playback WAV: 16kHz stereo 16bit, anti-alias with a windowed sinc FIR.
taps=[]
for k in range(-24,25):
 taps.append((.44 if k==0 else math.sin(math.pi*.44*k)/(math.pi*k))*(.54+.46*math.cos(math.pi*k/24)))
norm=sum(taps); taps=[v/norm for v in taps]
preview=array.array('h')
for i in range(0,n,2):
 for ch in [0,1]:
  v=sum(pcm[min(n-1,max(0,i+k))*2+ch]*w for k,w in zip(range(-24,25),taps))
  preview.append(max(-32768,min(32767,round(v))))
save(P/'C_106BPM_preview.wav',preview,SR//2)
qa=[]
for file in ['C_106BPM_master.wav','C_106BPM_preview.wav']:
 with wave.open(str(P/file),'rb') as w:
  data=array.array('h',w.readframes(w.getnframes())); peak=max(abs(v) for v in data)
  report=dict(file=file,duration_seconds=w.getnframes()/w.getframerate(),sample_rate=w.getframerate(),channels=w.getnchannels(),bits=w.getsampwidth()*8,peak_dbfs=20*math.log10(peak/32768),clipped_samples=sum(abs(v)>=32767 for v in data),first_samples=list(data[:8]),last_samples=list(data[-8:]),size_bytes=(P/file).stat().st_size)
  assert report['channels']==2 and report['clipped_samples']==0
  qa.append(report)
params=dict(bpm=BPM,seed=SEED,beats=40,bar_seconds=4*BEAT,duration_seconds=DUR,peak_target_dbfs=-2,rests_beats=rests,events=events,technical_qa=qa,listening_status='NOT AUDITIONED')
(P/'C_parameters_QA.json').write_text(json.dumps(params,ensure_ascii=False,indent=2))
with (P/'C_events.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(events[0])); w.writeheader(); w.writerows(events)
print(json.dumps(qa,indent=2))
